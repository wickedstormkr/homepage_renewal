// 위키드스톰 소식 게시판 관리 API — Lambda (Node 20 / AWS SDK v3)
//
// 단일 핸들러, Lambda Function URL(AuthType NONE) 전제.
// 실제 인증은 이 파일 안에서 Authorization: Bearer <ADMIN_TOKEN>을
// timingSafeEqual로 비교해 처리한다 (Function URL 자체는 공개 엔드포인트).
//
// 라우팅
//   OPTIONS *          CORS preflight
//   GET     /posts     인증 필요 → S3 data/posts.json 반환 (admin.js 로그인 검증 겸용)
//   PUT     /posts     인증 필요 → 검증(+정화) 후 S3 data/posts.json 저장 + CloudFront invalidation
//   POST    /upload-url 인증 필요 → presigned POST 발급 (img/uploads/*, 최대 5MB)
//
// 필요 env: BUCKET, DISTRIBUTION_ID, ADMIN_TOKEN, ALLOWED_ORIGIN
// 선택 env: ALLOW_LOCALHOST (개발 편의 — 미설정 시 localhost Origin 차단)
// 배포 방법은 DEPLOY.md 참조.

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

// ---------------------------------------------------------------------------
// 설정
// ---------------------------------------------------------------------------

const REGION = process.env.AWS_REGION || 'ap-northeast-2';
const BUCKET = process.env.BUCKET;
const DISTRIBUTION_ID = process.env.DISTRIBUTION_ID;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const DEFAULT_ALLOWED_ORIGIN = 'https://wickedstorm.kr';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN;

const POSTS_KEY = 'data/posts.json';
const UPLOAD_PREFIX = 'img/uploads/';
const MAX_BODY_BYTES = 1024 * 1024; // 1MB
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB — presigned POST content-length-range와 동일
const PRESIGN_EXPIRES_SECONDS = 300; // 5분
const ALLOWED_CATEGORIES = new Set(['news', 'story', 'insight']);
const UPLOAD_CONTENT_TYPES = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};
const LOCALHOST_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
// 기본값은 "미설정=차단". 로컬 개발 시에만 env로 명시적으로 켠다(옵트인).
const ALLOW_LOCALHOST = /^(1|true|yes)$/i.test(process.env.ALLOW_LOCALHOST || '');

// posts 필드별 길이 상한(문자 수) — 초과 시 400. 저장 전 allowlist 재구성과 함께 적용된다.
const MAX_LENGTHS = {
  id: 100,
  title: 300,
  summary: 1000,
  date: 20,
  thumb: 500,
  externalUrl: 500,
  body: 20000,
};

const s3 = new S3Client({ region: REGION });
const cloudfront = new CloudFrontClient({ region: REGION });

// ---------------------------------------------------------------------------
// 핸들러
// ---------------------------------------------------------------------------

export const handler = async (event) => {
  const method = (
    event?.requestContext?.http?.method ||
    event?.httpMethod ||
    'GET'
  ).toUpperCase();
  const rawPath = event?.rawPath || event?.requestContext?.http?.path || event?.path || '/';
  const path = normalizePath(rawPath);

  const originHeader = getHeader(event, 'origin');
  const allowOrigin = resolveAllowOrigin(originHeader);
  const cors = buildCorsHeaders(allowOrigin);

  // CORS preflight — 인증 불필요
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }

  try {
    if (path === '/posts' && method === 'GET') {
      if (!isAuthorized(event)) return errorResponse(401, 'Unauthorized', cors);
      return await handleGetPosts(cors);
    }

    if (path === '/posts' && method === 'PUT') {
      if (!isAuthorized(event)) return errorResponse(401, 'Unauthorized', cors);
      return await handlePutPosts(event, cors);
    }

    if (path === '/upload-url' && method === 'POST') {
      if (!isAuthorized(event)) return errorResponse(401, 'Unauthorized', cors);
      return await handleUploadUrl(event, cors);
    }

    return errorResponse(404, 'Not Found', cors);
  } catch (err) {
    console.error('Unhandled error:', err);
    return errorResponse(500, 'Internal Server Error', cors);
  }
};

// ---------------------------------------------------------------------------
// 라우트 구현
// ---------------------------------------------------------------------------

async function handleGetPosts(cors) {
  if (!BUCKET) {
    console.error('BUCKET env not configured');
    return errorResponse(500, 'Server misconfigured', cors);
  }
  try {
    const out = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: POSTS_KEY }));
    const text = await out.Body.transformToString('utf-8');
    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
      body: text,
    };
  } catch (err) {
    console.error('GET /posts failed:', err);
    return errorResponse(500, 'Failed to read posts.json', cors);
  }
}

async function handlePutPosts(event, cors) {
  if (!BUCKET) {
    console.error('BUCKET env not configured');
    return errorResponse(500, 'Server misconfigured', cors);
  }

  const raw = getBody(event);
  if (raw === null) return errorResponse(400, 'Missing request body', cors);

  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    return errorResponse(413, 'Payload too large (max 1MB)', cors);
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return errorResponse(400, 'Invalid JSON body', cors);
  }

  const validationError = validatePostsPayload(payload);
  if (validationError) return errorResponse(400, validationError, cors);

  // 검증 통과 후 알려진 필드만으로 재구성해 저장(잉여 필드 폐기) + body는 XSS 정화.
  const cleanPayload = buildCleanPayload(payload);
  const body = JSON.stringify(cleanPayload);

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: POSTS_KEY,
        Body: body,
        ContentType: 'application/json; charset=utf-8',
        CacheControl: 'max-age=60',
      })
    );
  } catch (err) {
    console.error('S3 PutObject failed:', err);
    return errorResponse(500, 'Failed to save posts.json', cors);
  }

  // 캐시 무효화는 부가 작업 — 실패해도 저장 자체는 성공 처리(max-age=60이라 곧 자연 만료됨).
  try {
    await invalidatePaths(['/' + POSTS_KEY]);
  } catch (err) {
    console.error('CloudFront invalidation failed (non-fatal):', err);
  }

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ ok: true }),
  };
}

async function handleUploadUrl(event, cors) {
  if (!BUCKET) {
    console.error('BUCKET env not configured');
    return errorResponse(500, 'Server misconfigured', cors);
  }

  const raw = getBody(event);
  if (raw === null) return errorResponse(400, 'Missing request body', cors);

  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    return errorResponse(413, 'Payload too large (max 1MB)', cors);
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return errorResponse(400, 'Invalid JSON body', cors);
  }

  const filename = payload && payload.filename;
  const contentType = payload && payload.contentType;
  const size = payload && payload.size;

  if (typeof filename !== 'string' || !filename.trim()) {
    return errorResponse(400, '"filename" is required', cors);
  }
  if (typeof contentType !== 'string' || !UPLOAD_CONTENT_TYPES[contentType]) {
    return errorResponse(
      400,
      `"contentType" must be one of: ${Object.keys(UPLOAD_CONTENT_TYPES).join(', ')}`,
      cors
    );
  }
  if (!Number.isInteger(size) || size <= 0 || size > MAX_UPLOAD_BYTES) {
    return errorResponse(400, `"size" must be an integer between 1 and ${MAX_UPLOAD_BYTES} bytes`, cors);
  }

  const finalName = buildUploadFilename(filename, contentType);
  if (!finalName) return errorResponse(400, 'Invalid filename', cors);

  const key = `${UPLOAD_PREFIX}${finalName}`;

  try {
    const { url, fields } = await createPresignedPost(s3, {
      Bucket: BUCKET,
      Key: key,
      Conditions: [
        ['content-length-range', 0, MAX_UPLOAD_BYTES],
        { 'Content-Type': contentType },
      ],
      Fields: {
        'Content-Type': contentType,
      },
      Expires: PRESIGN_EXPIRES_SECONDS,
    });
    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ upload: { url, fields }, publicPath: `./${key}` }),
    };
  } catch (err) {
    console.error('Presign failed:', err);
    return errorResponse(500, 'Failed to create upload URL', cors);
  }
}

// ---------------------------------------------------------------------------
// 인증
// ---------------------------------------------------------------------------

function isAuthorized(event) {
  if (!ADMIN_TOKEN) {
    console.error('ADMIN_TOKEN env not configured');
    return false;
  }
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader) return false;

  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  if (!match) return false;

  const provided = match[1].trim();
  if (!provided) return false;

  // 길이가 다른 문자열끼리 비교하면 timingSafeEqual이 예외를 던지므로,
  // 고정 길이 해시로 변환한 뒤 비교한다(비교 자체는 여전히 timing-safe).
  const a = createHash('sha256').update(provided, 'utf8').digest();
  const b = createHash('sha256').update(ADMIN_TOKEN, 'utf8').digest();

  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 검증
// ---------------------------------------------------------------------------

function validatePostsPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return 'Payload must be a JSON object';
  }
  if (typeof payload.version !== 'number' || !Number.isFinite(payload.version)) {
    return '"version" must be a number';
  }
  if (payload.updated !== undefined && typeof payload.updated !== 'string') {
    return '"updated" must be a string';
  }
  if (!Array.isArray(payload.posts)) {
    return '"posts" must be an array';
  }

  const seenIds = new Set();

  for (let i = 0; i < payload.posts.length; i++) {
    const post = payload.posts[i];
    const prefix = `posts[${i}]`;

    if (!post || typeof post !== 'object' || Array.isArray(post)) {
      return `${prefix} must be an object`;
    }
    if (typeof post.id !== 'string' || !post.id.trim()) {
      return `${prefix}.id is required`;
    }
    if (post.id.length > MAX_LENGTHS.id) {
      return `${prefix}.id exceeds ${MAX_LENGTHS.id} characters`;
    }
    if (seenIds.has(post.id)) {
      return `${prefix}.id "${post.id}" is duplicated`;
    }
    seenIds.add(post.id);

    if (!ALLOWED_CATEGORIES.has(post.category)) {
      return `${prefix}.category must be one of: news, story, insight`;
    }
    if (typeof post.date !== 'string' || !post.date.trim()) {
      return `${prefix}.date is required`;
    }
    if (post.date.length > MAX_LENGTHS.date) {
      return `${prefix}.date exceeds ${MAX_LENGTHS.date} characters`;
    }
    if (typeof post.title !== 'string' || !post.title.trim()) {
      return `${prefix}.title is required`;
    }
    if (post.title.length > MAX_LENGTHS.title) {
      return `${prefix}.title exceeds ${MAX_LENGTHS.title} characters`;
    }
    if (typeof post.summary !== 'string') {
      return `${prefix}.summary must be a string`;
    }
    if (post.summary.length > MAX_LENGTHS.summary) {
      return `${prefix}.summary exceeds ${MAX_LENGTHS.summary} characters`;
    }
    if (typeof post.body !== 'string') {
      return `${prefix}.body must be a string`;
    }
    if (post.body.length > MAX_LENGTHS.body) {
      return `${prefix}.body exceeds ${MAX_LENGTHS.body} characters`;
    }
    if (!isValidThumb(post.thumb)) {
      return `${prefix}.thumb must be null, a "./img/..." path (no ".."), or an http(s) URL`;
    }
    if (post.thumb !== null && post.thumb.length > MAX_LENGTHS.thumb) {
      return `${prefix}.thumb exceeds ${MAX_LENGTHS.thumb} characters`;
    }
    if (!isValidExternalUrl(post.externalUrl)) {
      return `${prefix}.externalUrl must be null or an http(s) URL`;
    }
    if (post.externalUrl !== null && post.externalUrl.length > MAX_LENGTHS.externalUrl) {
      return `${prefix}.externalUrl exceeds ${MAX_LENGTHS.externalUrl} characters`;
    }
    if (typeof post.pinned !== 'boolean') {
      return `${prefix}.pinned must be a boolean`;
    }
  }

  return null;
}

// externalUrl: null 또는 http/https URL만 허용(프로토콜 화이트리스트).
function isValidExternalUrl(value) {
  if (value === null) return true;
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// thumb: null 또는 "./img/..." 상대 경로(".." 금지) 또는 http/https URL만 허용.
function isValidThumb(value) {
  if (value === null) return true;
  if (typeof value !== 'string' || !value.trim()) return false;
  if (/^https?:\/\//i.test(value)) {
    try {
      const u = new URL(value);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }
  if (value.startsWith('./img/')) {
    return !value.split('/').includes('..');
  }
  return false;
}

// 검증 통과 후 알려진 필드만으로 payload/post를 재구성한다(잉여 필드는 저장하지 않음).
// body는 sanitizeBody로 정화한 값을 저장한다. title/summary는 원문 그대로 저장한다
// (렌더링 시 board.js가 escape 처리하므로 여기서는 정화하지 않는다).
function buildCleanPayload(payload) {
  const clean = {
    version: payload.version,
    posts: payload.posts.map((post) => ({
      id: post.id,
      category: post.category,
      date: post.date,
      title: post.title,
      summary: post.summary,
      body: sanitizeBody(post.body),
      thumb: post.thumb,
      externalUrl: post.externalUrl,
      pinned: post.pinned,
    })),
  };
  if (typeof payload.updated === 'string') clean.updated = payload.updated;
  return clean;
}

// ---------------------------------------------------------------------------
// body 정화 (XSS 방지)
//
// 전략: 전체 HTML을 이스케이프한 뒤, 화이트리스트 태그(속성 없는 형태)만
// 이스케이프된 텍스트에서 되돌려 실제 태그로 복원한다. <a href="http(s)://...">는
// href만 검증 후 복원하고 rel/target을 강제 부여한다. <img src="./img/...">는
// src만 검증 후 alt와 함께 재구성하고(loading="lazy" 부여), 그 외 속성(onerror= 등)은
// 전부 폐기한다. 그 외 모든 마크업(onerror=, <script>, <svg onload>, javascript: 등)은
// 텍스트로 남아 무력화된다.
// ---------------------------------------------------------------------------

const SANITIZE_SIMPLE_TAGS = ['p', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li'];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescapeEntities(str) {
  return String(str)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

export function sanitizeBody(html) {
  if (typeof html !== 'string') return '';

  let out = escapeHtml(html);

  // <br> / <br/> / <br /> → <br> (속성 없는 형태만)
  out = out.replace(/&lt;br\s*\/?\s*&gt;/gi, '<br>');

  // 속성 없는 단순 태그 복원 (여는/닫는 태그 모두 정확히 그 형태일 때만)
  for (const tag of SANITIZE_SIMPLE_TAGS) {
    out = out
      .replace(new RegExp(`&lt;${tag}\\s*&gt;`, 'gi'), `<${tag}>`)
      .replace(new RegExp(`&lt;\\/${tag}\\s*&gt;`, 'gi'), `</${tag}>`);
  }

  // <a href="http(s)://...">...</a> — 여는/닫는 태그를 쌍으로 함께 처리한다(한쪽만
  // 복원되는 비대칭 방지). href만 검증 후 복원, 다른 속성은 폐기하고
  // rel="noopener noreferrer" target="_blank"를 강제 부여한다. href가 없거나
  // http/https가 아니면 여는/닫는 태그 모두 이스케이프된 텍스트로 남겨 무력화한다.
  // 이스케이프된 텍스트 안에서 "&gt;"(닫는 꺾쇠)가 나오기 전까지를 여는 태그로 본다.
  out = out.replace(
    /&lt;a\s+((?:(?!&gt;)[\s\S])*?)&gt;([\s\S]*?)&lt;\/a\s*&gt;/gi,
    (full, attrs, inner) => {
      const hrefMatch = /href\s*=\s*&quot;((?:(?!&quot;)[\s\S])*?)&quot;/i.exec(attrs);
      if (!hrefMatch) return full; // href 없음 → 무력화(그대로 텍스트)
      const url = unescapeEntities(hrefMatch[1]).trim();
      if (!/^https?:\/\//i.test(url)) return full; // http/https 아님 → 무력화
      const safeUrl = escapeHtml(url);
      return `<a href="${safeUrl}" rel="noopener noreferrer" target="_blank">${inner}</a>`;
    }
  );

  // <img src="./img/..."> — 상대 경로("./img/"로 시작, ".."/스킴/"//"/백슬래시 금지)만
  // 허용한다. src만 검증 후 alt(있으면)와 함께 재구성하고, 그 외 속성(onerror= 등)은
  // 전부 폐기한다. 자기 닫힘 요소라 <a>와 달리 닫는 태그 쌍 처리는 불필요 — 여는 태그
  // 하나만 매치해 통째로 교체한다. 조건 불충족이면 이스케이프된 텍스트로 남겨 무력화한다.
  out = out.replace(
    /&lt;img\s+((?:(?!&gt;)[\s\S])*?)\s*\/?&gt;/gi,
    (full, attrs) => {
      const srcMatch = /src\s*=\s*&quot;((?:(?!&quot;)[\s\S])*?)&quot;/i.exec(attrs);
      if (!srcMatch) return full; // src 없음 → 무력화(그대로 텍스트)
      const src = unescapeEntities(srcMatch[1]).trim();
      if (!isValidImgSrc(src)) return full; // 조건 불충족 → 무력화

      const altMatch = /alt\s*=\s*&quot;((?:(?!&quot;)[\s\S])*?)&quot;/i.exec(attrs);
      const alt = altMatch ? unescapeEntities(altMatch[1]) : '';

      const safeSrc = escapeHtml(src);
      const safeAlt = escapeHtml(alt);
      return `<img src="${safeSrc}" alt="${safeAlt}" loading="lazy">`;
    }
  );

  return out;
}

// img src: "./img/"로 시작하는 상대 경로만 허용한다. 스킴(예: https:, javascript:,
// data:)이나 프로토콜 상대 URL(//host/...)은 "./img/" 리터럴 시작 조건 자체로
// 걸러지고, 이중 슬래시·".."·백슬래시는 아래에서 별도로 차단한다.
function isValidImgSrc(value) {
  if (typeof value !== 'string' || !value) return false;
  if (value.includes('\\')) return false; // 백슬래시 금지
  if (!value.startsWith('./img/')) return false; // 상대 경로("./img/")만 허용
  if (value.includes('//')) return false; // "//"(프로토콜 상대 URL 등) 금지
  if (value.split('/').includes('..')) return false; // 상위 디렉터리 이동(..) 금지
  return true;
}

function buildUploadFilename(rawName, contentType) {
  const base = String(rawName).split(/[\\/]/).pop() || '';

  let clean = base
    .normalize('NFKC')
    .replace(/[^a-zA-Z0-9._-]/g, '-') // 공백/한글/특수문자 등은 안전한 URL 문자로 치환
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');

  if (!clean) return null;
  if (clean.length > 100) clean = clean.slice(clean.length - 100);

  const dotIdx = clean.lastIndexOf('.');
  const stem = (dotIdx > 0 ? clean.slice(0, dotIdx) : clean).toLowerCase() || 'upload';
  const currentExt = dotIdx > 0 ? clean.slice(dotIdx + 1).toLowerCase() : '';

  const wantExt = UPLOAD_CONTENT_TYPES[contentType];
  const allowedExts = contentType === 'image/jpeg' ? ['jpg', 'jpeg'] : [wantExt];
  const finalExt = allowedExts.includes(currentExt) ? currentExt : wantExt;

  const unique = `${Date.now().toString(36)}${randomBytes(3).toString('hex')}`;

  return `${stem}-${unique}.${finalExt}`;
}

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

function resolveAllowOrigin(originHeader) {
  if (!originHeader) return ALLOWED_ORIGIN;
  if (originHeader === ALLOWED_ORIGIN) return originHeader;
  // localhost는 기본 차단 — ALLOW_LOCALHOST env를 명시적으로 켠 개발 환경에서만 허용.
  if (ALLOW_LOCALHOST && LOCALHOST_ORIGIN_RE.test(originHeader)) return originHeader;
  return null; // 허용되지 않은 Origin — 헤더 생략(브라우저가 차단)
}

function buildCorsHeaders(allowOrigin) {
  const headers = {
    'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization,Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (allowOrigin) headers['Access-Control-Allow-Origin'] = allowOrigin;
  return headers;
}

// ---------------------------------------------------------------------------
// CloudFront
// ---------------------------------------------------------------------------

async function invalidatePaths(paths) {
  if (!DISTRIBUTION_ID) {
    console.warn('DISTRIBUTION_ID env not configured — skipping invalidation');
    return;
  }
  await cloudfront.send(
    new CreateInvalidationCommand({
      DistributionId: DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `admin-api-${Date.now()}-${randomBytes(4).toString('hex')}`,
        Paths: { Quantity: paths.length, Items: paths },
      },
    })
  );
}

// ---------------------------------------------------------------------------
// 유틸
// ---------------------------------------------------------------------------

function normalizePath(rawPath) {
  const noQuery = String(rawPath).split('?')[0];
  if (noQuery.length > 1 && noQuery.endsWith('/')) {
    return noQuery.slice(0, -1);
  }
  return noQuery || '/';
}

function getHeader(event, name) {
  const headers = (event && event.headers) || {};
  const lower = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lower) return headers[key];
  }
  return undefined;
}

function getBody(event) {
  if (!event || event.body == null) return null;
  if (event.isBase64Encoded) {
    try {
      return Buffer.from(event.body, 'base64').toString('utf8');
    } catch {
      return null;
    }
  }
  return typeof event.body === 'string' ? event.body : JSON.stringify(event.body);
}

function errorResponse(statusCode, message, cors = {}) {
  return {
    statusCode,
    headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ error: message }),
  };
}
