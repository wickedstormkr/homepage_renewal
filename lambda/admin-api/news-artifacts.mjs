const SITE_NAME = 'WICKED STORM';
const ORGANIZATION_NAME = '주식회사 위키드스톰';
const FALLBACK_IMAGE_PATH = '/img/og-image.png';

export const DEFAULT_BASE_URL = 'https://wickedstorm.kr';
export const POST_ID_RE = /^[a-z0-9][a-z0-9-]{0,99}$/;

const CATEGORY_LABELS = {
  news: '뉴스',
  story: '스토리',
  insight: '인사이트',
};

const SIMPLE_BODY_TAGS = ['p', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li'];

export function normalizePostId(value) {
  if (typeof value !== 'string') return '';
  return value.normalize('NFKC').trim().toLowerCase();
}

export function isValidPostId(value) {
  return typeof value === 'string' && POST_ID_RE.test(value);
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeXml(value) {
  return escapeHtml(value);
}

function decodeEntities(value) {
  return String(value)
    .replace(/&#(\d+);/g, (entity, code) => decodeCodePoint(entity, Number(code)))
    .replace(/&#x([\da-f]+);/gi, (entity, code) => decodeCodePoint(entity, Number.parseInt(code, 16)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&');
}

function decodeCodePoint(entity, codePoint) {
  if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return entity;
  return String.fromCodePoint(codePoint);
}

export function stripHtml(value) {
  return decodeEntities(
    String(value ?? '')
      .replace(/<\s*br\s*\/?\s*>/gi, ' ')
      .replace(/<\s*\/\s*(p|li|h[1-6]|blockquote)\s*>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeDate(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})[.-](\d{2})[.-](\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function assertPostId(value) {
  const id = normalizePostId(value);
  // Artifacts must match the ID stored in posts.json exactly. normalizePostId is
  // exported for callers that intentionally canonicalize input before validation.
  if (value !== id || !isValidPostId(id)) {
    throw new TypeError(`Invalid post id: ${String(value)}`);
  }
  return id;
}

export function newsArtifactPath(id) {
  return `news/${assertPostId(id)}.html`;
}

function normalizeBaseUrl(value) {
  let url;
  try {
    url = new URL(value || DEFAULT_BASE_URL);
  } catch {
    throw new TypeError(`Invalid base URL: ${String(value)}`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new TypeError(`Invalid base URL protocol: ${url.protocol}`);
  }
  return url.origin;
}

function absoluteUrl(pathname, baseUrl) {
  return new URL(pathname, `${normalizeBaseUrl(baseUrl)}/`).href;
}

function truncate(value, maxLength) {
  const characters = Array.from(value);
  if (characters.length <= maxLength) return value;
  return `${characters.slice(0, Math.max(0, maxLength - 1)).join('')}…`;
}

function isHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function localImagePath(value) {
  if (typeof value !== 'string' || !value.startsWith('./img/')) return null;
  if (value.includes('\\') || value.includes('//') || value.split('/').includes('..')) return null;
  return value.slice(1);
}

function resolveImage(value, baseUrl) {
  if (isHttpUrl(value)) {
    return { publicUrl: value.trim(), articleSrc: value.trim(), hasThumbnail: true };
  }

  const localPath = localImagePath(value);
  if (localPath) {
    return {
      publicUrl: absoluteUrl(localPath, baseUrl),
      articleSrc: `..${localPath}`,
      hasThumbnail: true,
    };
  }

  if (value !== null && value !== undefined && value !== '') {
    throw new TypeError(`Invalid post thumbnail: ${String(value)}`);
  }

  return {
    publicUrl: absoluteUrl(FALLBACK_IMAGE_PATH, baseUrl),
    articleSrc: null,
    hasThumbnail: false,
  };
}

function unescapeSanitizedAttribute(value) {
  return decodeEntities(value);
}

export function sanitizeArticleBody(html) {
  if (typeof html !== 'string') return '';

  let output = escapeHtml(html);
  output = output.replace(/&lt;br\s*\/?\s*&gt;/gi, '<br>');

  for (const tag of SIMPLE_BODY_TAGS) {
    output = output
      .replace(new RegExp(`&lt;${tag}\\s*&gt;`, 'gi'), `<${tag}>`)
      .replace(new RegExp(`&lt;\\/${tag}\\s*&gt;`, 'gi'), `</${tag}>`);
  }

  output = output.replace(
    /&lt;a\s+((?:(?!&gt;)[\s\S])*?)&gt;([\s\S]*?)&lt;\/a\s*&gt;/gi,
    (full, attributes, inner) => {
      const hrefMatch = /href\s*=\s*&quot;((?:(?!&quot;)[\s\S])*?)&quot;/i.exec(attributes);
      if (!hrefMatch) return full;
      const href = unescapeSanitizedAttribute(hrefMatch[1]).trim();
      if (!isHttpUrl(href)) return full;
      return `<a href="${escapeHtml(href)}" rel="noopener noreferrer" target="_blank">${inner}</a>`;
    }
  );

  output = output.replace(
    /&lt;img\s+((?:(?!&gt;)[\s\S])*?)\s*\/?&gt;/gi,
    (full, attributes) => {
      const srcMatch = /src\s*=\s*&quot;((?:(?!&quot;)[\s\S])*?)&quot;/i.exec(attributes);
      if (!srcMatch) return full;
      const source = unescapeSanitizedAttribute(srcMatch[1]).trim();
      const path = localImagePath(source);
      if (!path) return full;

      const altMatch = /alt\s*=\s*&quot;((?:(?!&quot;)[\s\S])*?)&quot;/i.exec(attributes);
      const alt = altMatch ? unescapeSanitizedAttribute(altMatch[1]) : '';
      return `<img src="..${escapeHtml(path)}" alt="${escapeHtml(alt)}" loading="lazy">`;
    }
  );

  return output;
}

// 상세 이미지(썸네일·본문)를 새 탭 원본 링크로 감싼다. 화면에서는 60vh로 축소돼도
// 클릭하면 원본 파일을 새 창에서 볼 수 있게 한다. rel/aria "(새 창)"은 board.js의
// 외부 앵커 주입 패턴과 일관.
function wrapImageLink(src, imgTag) {
  return `<a class="img-orig" href="${escapeHtml(src)}" target="_blank" rel="noopener noreferrer" aria-label="원본 이미지 새 창에서 보기">${imgTag}</a>`;
}

function linkifyBodyImages(html) {
  return String(html).replace(/<img\s+src="([^"]+)"[^>]*>/gi, (match, src) => wrapImageLink(src, match));
}

function safeJsonLd(value) {
  return JSON.stringify(value, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function categoryLabel(category) {
  return CATEGORY_LABELS[category] || '소식';
}

function validateRenderablePost(post) {
  if (!post || typeof post !== 'object' || Array.isArray(post)) {
    throw new TypeError('Post must be an object');
  }

  const id = assertPostId(post.id);
  const title = typeof post.title === 'string' ? post.title.trim() : '';
  if (!title) throw new TypeError(`Post "${id}" requires a title`);

  const published = normalizeDate(post.date);
  if (!published) throw new TypeError(`Post "${id}" has an invalid date`);

  const summarySource = typeof post.summary === 'string' && post.summary.trim()
    ? post.summary
    : post.body;
  const description = truncate(stripHtml(summarySource), 160);
  const body = typeof post.body === 'string' ? post.body : '';

  return { id, title, published, description, body };
}

export function renderArticle(post, options = {}) {
  if (typeof post?.externalUrl === 'string' && post.externalUrl.trim()) {
    throw new TypeError('External posts do not have local article artifacts');
  }

  const baseUrl = normalizeBaseUrl(options.baseUrl || DEFAULT_BASE_URL);
  const { id, title, published, description, body } = validateRenderablePost(post);
  const updated = normalizeDate(options.updated);
  const modified = updated && updated > published ? updated : published;
  const canonicalUrl = absoluteUrl(`/news/${id}.html`, baseUrl);
  const image = resolveImage(post.thumb, baseUrl);
  const label = categoryLabel(post.category);
  const pageTitle = `${title} — 위키드스톰`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    image: [image.publicUrl],
    datePublished: published,
    dateModified: modified,
    articleSection: label,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    author: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
      url: `${baseUrl}/`,
    },
    publisher: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl(FALLBACK_IMAGE_PATH, baseUrl),
      },
    },
  };

  const thumbnailMarkup = image.hasThumbnail
    ? `\n      <figure class="detail-thumb">\n        ${wrapImageLink(image.articleSrc, `<img src="${escapeHtml(image.articleSrc)}" alt="${escapeHtml(title)}">`)}\n      </figure>`
    : '';

  return `<!doctype html>
<html lang="ko" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.className="js";</script>
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(canonicalUrl)}">
<meta name="theme-color" content="#06070e">

<meta property="og:type" content="article">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(canonicalUrl)}">
<meta property="og:image" content="${escapeHtml(image.publicUrl)}">
<meta property="og:locale" content="ko_KR">
<meta property="article:published_time" content="${published}">
<meta property="article:modified_time" content="${modified}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image.publicUrl)}">

<link rel="icon" href="../favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="../img/favicon.png">

<link rel="stylesheet" href="../css/style.css">

<!-- GA4 (기존 속성 유지) -->
<link rel="preconnect" href="https://www.googletagmanager.com">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-0Y5QD1HBGN"></script>
<script>
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
gtag('js',new Date());
gtag('config','G-0Y5QD1HBGN');
</script>

<script type="application/ld+json">
${safeJsonLd(jsonLd)}
</script>
</head>
<body>
<a class="skip-link" href="#article">본문 바로가기</a>
<div class="progress" aria-hidden="true"></div>

<header id="hdr">
  <div class="hwrap">
    <a class="brand" href="../index.html" aria-label="WICKED STORM 홈"><img src="../img/logo-white.svg" alt="WICKED STORM" width="208" height="26"></a>
    <nav class="main" aria-label="주요 메뉴">
      <a href="../index.html#product">Product</a>
      <a href="../index.html#standards">Standards</a>
      <a href="../index.html#growa">GROWA</a>
      <a href="../news.html" aria-current="page">News</a>
      <a href="https://www.saramin.co.kr/zf_user/company-info/view-inner-recruit?csn=dVFVWDFVV1Rab2VlaHo1NFV1Z1RsZz09" target="_blank" rel="noopener noreferrer" aria-label="채용 정보 (새 창)">Recruit</a>
      <a class="cta" href="../index.html#contact">도입 문의</a>
    </nav>
    <button class="menu-btn" id="menuBtn" aria-label="메뉴 열기" aria-expanded="false" aria-controls="drawer">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<nav class="drawer" id="drawer" aria-label="모바일 메뉴" hidden>
  <a href="../index.html#product">Product</a>
  <a href="../index.html#standards">Standards</a>
  <a href="../index.html#growa">GROWA</a>
  <a href="../news.html">News</a>
  <a href="../index.html#company">Company</a>
  <a href="https://www.saramin.co.kr/zf_user/company-info/view-inner-recruit?csn=dVFVWDFVV1Rab2VlaHo1NFV1Z1RsZz09" target="_blank" rel="noopener noreferrer" aria-label="채용 정보 (새 창)">Recruit</a>
  <a class="cta" href="../index.html#contact">도입 문의 →</a>
</nav>

<main id="top" tabindex="-1">
  <section class="band" id="article">
    <div class="wrap">
      <article class="board-detail" aria-labelledby="article-title">
        <p class="detail-back detail-top"><a href="../news.html"><span aria-hidden="true">←</span> 소식 목록으로</a></p>
        <div class="detail-eyebrow"><span class="ntag">${escapeHtml(label)}</span> ${escapeHtml(post.date)}</div>
        <h1 class="h-lg" id="article-title" style="font-size:clamp(24px,3.4vw,40px);line-height:1.24;margin-bottom:26px">${escapeHtml(title)}</h1>${thumbnailMarkup}
        <div class="detail-body">${linkifyBodyImages(sanitizeArticleBody(body)) || `<p>${escapeHtml(description)}</p>`}</div>
        <p class="detail-back"><a href="../news.html"><span aria-hidden="true">←</span> 소식 목록으로</a></p>
      </article>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <img src="../img/logo-white.svg" alt="WICKED STORM" width="208" height="26" loading="lazy">
        <p>주식회사 위키드스톰&nbsp;· 대표 이정준&nbsp;· 사업자등록번호 <span style="white-space:nowrap">135-88-02020</span></p>
        <p>서울시 강서구 마곡중앙로 161-8, A동 901~905호</p>
        <p>Tel 02-2205-1470&nbsp;· Fax 02-6956-1473&nbsp;· manager@wickedstorm.kr</p>
      </div>
      <nav class="foot-nav" aria-label="푸터 메뉴">
        <a href="../index.html#product">Product</a><a href="../index.html#standards">Standards</a><a href="../index.html#growa">GROWA</a><a href="../news.html">News</a><a href="https://www.saramin.co.kr/zf_user/company-info/view-inner-recruit?csn=dVFVWDFVV1Rab2VlaHo1NFV1Z1RsZz09" target="_blank" rel="noopener noreferrer" aria-label="채용 정보 (새 창)">Recruit</a><a href="../privacy.html">개인정보처리방침</a>
      </nav>
    </div>
    <p class="legal">AI Insight, Empowered Education. — © 2026 Wicked Storm Inc.</p>
  </div>
</footer>

<script src="../js/main.js" defer></script>
</body>
</html>
`;
}

function internalPosts(posts) {
  if (!Array.isArray(posts)) throw new TypeError('posts must be an array');
  return posts.filter(
    (post) => !(typeof post?.externalUrl === 'string' && post.externalUrl.trim())
  );
}

function newestPostDate(posts) {
  const dates = posts.map((post) => normalizeDate(post?.date)).filter(Boolean).sort();
  return dates.at(-1) || null;
}

export function renderSitemap(posts, options = {}) {
  const baseUrl = normalizeBaseUrl(options.baseUrl || DEFAULT_BASE_URL);
  const includedPosts = internalPosts(posts);
  const updated = normalizeDate(options.updated) || newestPostDate(includedPosts);
  if (!updated) throw new TypeError('A valid sitemap updated date is required');

  const defaultStaticEntries = [
    { path: '/', lastmod: updated, changefreq: 'monthly', priority: '1.0' },
    { path: '/news.html', lastmod: updated, changefreq: 'weekly', priority: '0.7' },
    { path: '/privacy.html', lastmod: '2026-07-08', changefreq: 'yearly', priority: '0.3' },
  ];
  const staticEntries = options.staticEntries || defaultStaticEntries;

  const entries = staticEntries.map((entry) => ({
    loc: absoluteUrl(entry.path, baseUrl),
    lastmod: normalizeDate(entry.lastmod) || updated,
    changefreq: entry.changefreq,
    priority: entry.priority,
  }));

  for (const post of includedPosts) {
    const { id, published } = validateRenderablePost(post);
    entries.push({
      loc: absoluteUrl(`/news/${id}.html`, baseUrl),
      lastmod: updated > published ? updated : published,
      changefreq: 'yearly',
      priority: '0.6',
    });
  }

  const urlMarkup = entries.map((entry) => {
    const optionalChangefreq = entry.changefreq
      ? `\n    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`
      : '';
    const optionalPriority = entry.priority
      ? `\n    <priority>${escapeXml(entry.priority)}</priority>`
      : '';
    return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>\n    <lastmod>${entry.lastmod}</lastmod>${optionalChangefreq}${optionalPriority}\n  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlMarkup}\n</urlset>\n`;
}

export function renderNewsArtifacts(payload, options = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('Payload must be an object');
  }

  const posts = internalPosts(payload.posts);
  const updated = normalizeDate(payload.updated);
  if (!updated) throw new TypeError('Payload requires a valid updated date');

  const files = new Map();
  const articlePaths = [];
  const seenIds = new Set();

  for (const post of posts) {
    const id = assertPostId(post?.id);
    if (seenIds.has(id)) throw new TypeError(`Duplicate post id: ${id}`);
    seenIds.add(id);

    const path = newsArtifactPath(id);
    const html = renderArticle(post, { ...options, updated });
    files.set(path, html);
    articlePaths.push(path);
  }

  files.set('sitemap.xml', renderSitemap(posts, { ...options, updated }));

  return { files, articlePaths, internalPosts: posts };
}
