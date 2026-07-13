# 위키드스톰 소식 게시판 관리 API — 배포 런북

`lambda/admin-api/index.mjs`를 Node 20 Lambda + Function URL로 배포하는 절차.
이 디렉토리는 정적 사이트(S3+CloudFront) 배포 대상이 **아니다** — Lambda 전용.

전제:
- AWS CLI v2 설치·구성 완료 (`aws configure` 또는 SSO), 대상 계정/리전에 권한 있는 프로파일.
- `node`/`npm`, `zip`, `openssl`, `curl`, `jq`가 로컬에 설치되어 있음(`jq`는 7절
  presigned POST 스모크 테스트에서 `upload.fields`를 curl 폼 인자로 변환하는 데 사용).
- 정적 사이트가 이미 올라간 S3 버킷(`<BUCKET>`)과 CloudFront 배포(`<DIST_ID>`)가 존재.

아래 명령은 위에서부터 순서대로 실행한다. `<BUCKET>`, `<DIST_ID>`는 실제 값으로 치환.

---

## 0. 변수 설정

```bash
export REGION=ap-northeast-2                 # 리전 (필요 시 변경)
export BUCKET=<BUCKET>                        # 정적 사이트 S3 버킷명
export DIST_ID=<DIST_ID>                      # CloudFront 배포 ID
export FUNCTION_NAME=wickedstorm-admin-api
export ROLE_NAME=wickedstorm-admin-api-role
export POLICY_NAME=wickedstorm-admin-api-policy
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ALLOWED_ORIGIN=https://wickedstorm.kr  # 운영 도메인 (프로토콜 포함, 트레일링 슬래시 없이)
```

---

## 1. 배포 패키지 준비 (index.mjs + AWS SDK v3 의존성)

Lambda Node 20 관리형 런타임에는 AWS SDK v3 일부가 내장돼 있지만, 버전 고정과
`@aws-sdk/s3-presigned-post`(런타임 미보장) 때문에 의존성을 직접 번들링한다.

```bash
cd "lambda/admin-api"

cat > package.json <<'EOF'
{
  "name": "wickedstorm-admin-api",
  "version": "1.0.0",
  "type": "module",
  "private": true
}
EOF

npm install \
  @aws-sdk/client-s3@^3 \
  @aws-sdk/client-cloudfront@^3 \
  @aws-sdk/s3-presigned-post@^3

zip -r ../admin-api.zip index.mjs package.json node_modules -x '*.DS_Store'
cd -
```

`/upload-url`은 `@aws-sdk/s3-presigned-post`의 `createPresignedPost`로 S3
presigned **POST**(폼 업로드)를 발급한다 — 이전의 `@aws-sdk/s3-request-presigner`
기반 presigned **PUT**은 더 이상 쓰지 않으므로 의존성 목록에서 제외했다.

결과물: `lambda/admin-api.zip` (Lambda 업로드용). 코드를 수정할 때마다 `zip`을 다시 만든다.

---

## 2. IAM 역할 생성 (최소 권한)

### 2-1. 신뢰 정책 (Lambda가 이 역할을 assume)

```bash
cat > /tmp/admin-api-trust.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
EOF

aws iam create-role \
  --role-name "$ROLE_NAME" \
  --assume-role-policy-document file:///tmp/admin-api-trust.json
```

### 2-2. 권한 정책 (해당 버킷 `data/*`·`img/uploads/*`의 Get/PutObject + CloudFront invalidation만)

```bash
cat > /tmp/admin-api-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PostsAndUploadsObjectAccess",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": [
        "arn:aws:s3:::${BUCKET}/data/*",
        "arn:aws:s3:::${BUCKET}/img/uploads/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${DIST_ID}"
    },
    {
      "Sid": "Logs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:${REGION}:${ACCOUNT_ID}:log-group:/aws/lambda/${FUNCTION_NAME}*"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "$POLICY_NAME" \
  --policy-document file:///tmp/admin-api-policy.json
```

주의: 이 정책은 버킷 전체가 아니라 `data/*`·`img/uploads/*` 프리픽스에만, 그리고
지정된 CloudFront 배포 하나에만 권한을 준다. 버킷 목록(`ListBucket`), 다른 오브젝트
삭제 권한 등은 의도적으로 부여하지 않는다.

**presigned POST와 IAM 권한**: `/upload-url`은 `createPresignedPost`로 S3
presigned **POST**(폼 업로드) 자격 증명을 발급하지만, S3 쪽에서 실제로 수행되는
API 액션은 여전히 `PutObject`다(HTTP 메서드/폼 방식만 다를 뿐, IAM 액션은 PUT
presign과 동일하게 `s3:PutObject`). 즉 위 정책의 `PostsAndUploadsObjectAccess`
Statement(`s3:GetObject`, `s3:PutObject` on `img/uploads/*`)로 충분하며, 이번
변경으로 **IAM 정책을 추가로 수정할 필요는 없다**. ACL 지정 등 별도 조건을 쓰지
않는 한 `s3:PutObjectAcl` 같은 추가 권한도 필요 없다.

IAM은 전파에 수 초~수십 초 걸릴 수 있다. 다음 단계에서 `create-function`이
`InvalidParameterValueException`(role not assumable)로 실패하면 몇 초 후 재시도.

---

## 3. Lambda 함수 생성

```bash
export ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
export ADMIN_TOKEN=$(openssl rand -base64 32)

echo "발급된 ADMIN_TOKEN (안전한 곳에 보관 — 이후 다시 조회 불가):"
echo "$ADMIN_TOKEN"

aws lambda create-function \
  --function-name "$FUNCTION_NAME" \
  --runtime nodejs20.x \
  --role "$ROLE_ARN" \
  --handler index.handler \
  --timeout 15 \
  --memory-size 256 \
  --zip-file fileb://lambda/admin-api.zip \
  --region "$REGION" \
  --environment "Variables={BUCKET=$BUCKET,DISTRIBUTION_ID=$DIST_ID,ADMIN_TOKEN=$ADMIN_TOKEN,ALLOWED_ORIGIN=$ALLOWED_ORIGIN}"
```

env 4개 확인:

```bash
aws lambda get-function-configuration \
  --function-name "$FUNCTION_NAME" \
  --query 'Environment.Variables' --output json
```

env 변수 정리:

| env | 필수 | 설명 |
|---|---|---|
| `BUCKET` | 필수 | 정적 사이트 S3 버킷명 |
| `DISTRIBUTION_ID` | 필수 | CloudFront 배포 ID |
| `ADMIN_TOKEN` | 필수 | 관리자 Bearer 토큰 |
| `ALLOWED_ORIGIN` | 필수 | 운영 도메인 (예: `https://wickedstorm.kr`) |
| `ALLOW_LOCALHOST` | 선택 (개발 시에만) | `1`/`true`/`yes` 중 하나로 설정하면 `http://localhost:*`, `http://127.0.0.1:*` Origin의 CORS를 허용한다. **운영 함수에는 설정하지 않는다** — 미설정(기본값)이면 localhost Origin은 차단된다. |

로컬 개발 편의를 위해 별도 개발용 Lambda(또는 로컬 테스트 환경)에만 한시적으로
켜고 싶다면:

```bash
aws lambda update-function-configuration \
  --function-name "$FUNCTION_NAME" \
  --environment "Variables={BUCKET=$BUCKET,DISTRIBUTION_ID=$DIST_ID,ADMIN_TOKEN=$ADMIN_TOKEN,ALLOWED_ORIGIN=$ALLOWED_ORIGIN,ALLOW_LOCALHOST=1}"
```

---

## 4. Function URL 생성 (AuthType NONE — 인증은 코드가 담당)

Function URL 자체 인증은 끄고(`NONE`), 실제 인증은 `index.mjs`의 Bearer 토큰
`timingSafeEqual` 비교로 수행한다. **Function URL의 내장 CORS 설정은 사용하지
않는다** — 코드가 OPTIONS/CORS를 직접 처리하므로 `--cors` 옵션을 주지 않는다.

```bash
aws lambda create-function-url-config \
  --function-name "$FUNCTION_NAME" \
  --auth-type NONE

# AuthType NONE으로 만든 Function URL은 익명 호출을 허용하려면
# 리소스 기반 정책도 별도로 열어줘야 한다.
aws lambda add-permission \
  --function-name "$FUNCTION_NAME" \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --function-url-auth-type NONE

export FUNCTION_URL=$(aws lambda get-function-url-config \
  --function-name "$FUNCTION_NAME" \
  --query 'FunctionUrl' --output text)

echo "Function URL: $FUNCTION_URL"
```

`FunctionUrl`은 끝에 `/`가 붙는다 (예: `https://xxxx.lambda-url.ap-northeast-2.on.aws/`).
프론트에서 호출할 때는 `/posts`, `/upload-url`을 이어붙인다.

---

## 5. 프론트 연동 — `js/site-config.js`

`renewal/js/site-config.js`를 열어 `ADMIN_API`에 Function URL을 넣는다
(끝의 슬래시는 있어도 없어도 되지만, 아래처럼 슬래시 없이 맞추는 것을 권장):

```js
window.WS_CONFIG = {
  ADMIN_API: "https://xxxx.lambda-url.ap-northeast-2.on.aws"
};
```

이 값이 비어 있으면 `admin.html`은 "API 미배포 — DEPLOY.md 참조" 배너를 띄우고
저장 기능을 비활성화한다 (Phase D 프론트 구현 참조).

---

## 6. 정적 사이트 반영 순서 (robots.txt / posts.json / site-config.js)

관리자 페이지가 검색엔진에 노출되지 않도록, **`robots.txt`(Disallow: /admin.html)를
`admin.html` 자체보다 먼저 또는 같이** 업로드한다. 권장 순서:

```bash
# 1) robots.txt — admin.html 비공개 규칙을 가장 먼저 반영
aws s3 cp robots.txt "s3://${BUCKET}/robots.txt" --cache-control "max-age=3600"

# 2) 시드 데이터 (Phase D에서 만든 data/posts.json)
aws s3 cp data/posts.json "s3://${BUCKET}/data/posts.json" \
  --content-type "application/json; charset=utf-8" --cache-control "max-age=60"

# 3) site-config.js (Function URL 반영본) 포함, 나머지 정적 파일 동기화
aws s3 sync . "s3://${BUCKET}/" \
  --exclude "lambda/*" --exclude ".git/*" --exclude "*.DS_Store"

# 4) CloudFront 캐시 무효화 (robots.txt, admin.html, site-config.js, posts.json)
aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/robots.txt" "/admin.html" "/js/site-config.js" "/data/posts.json"
```

이후 게시판 저장(`PUT /posts`)은 Lambda가 자체적으로
`/data/posts.json`을 무효화하므로 수동 invalidation은 불필요하다.

---

## 7. 배포 후 curl 스모크 테스트

```bash
# 7-1. CORS preflight — 204 + Access-Control-Allow-Origin 헤더 확인
curl -i -X OPTIONS "$FUNCTION_URL/posts" \
  -H "Origin: $ALLOWED_ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization"

# 7-2. 토큰 없이 GET /posts — 401 기대
curl -i "$FUNCTION_URL/posts"

# 7-3. 토큰으로 GET /posts — 200 + {"version":1,...} 기대 (로그인 검증 겸용)
curl -i "$FUNCTION_URL/posts" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 7-4. PUT /posts — 스키마 검증 통과 시 200 {"ok":true}
curl -i -X PUT "$FUNCTION_URL/posts" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"version":1,"updated":"2026-07-11","posts":[]}'

# 7-5. 잘못된 스키마 — 400 {"error":"..."} 기대
curl -i -X PUT "$FUNCTION_URL/posts" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"posts":"not-an-array"}'

# 7-6. [신규] XSS 페이로드 정화 확인 — 200 {"ok":true} 기대 후, 재조회한
# posts.json에서 <script>가 텍스트로 이스케이프되고 <p>만 살아있는지 확인한다.
curl -i -X PUT "$FUNCTION_URL/posts" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"version":1,"posts":[{"id":"smoke-xss","category":"news","date":"2026-07-11","title":"t","summary":"s","body":"<script>alert(1)</script><p>ok</p>","thumb":null,"externalUrl":null,"pinned":false}]}'

curl -s "$FUNCTION_URL/posts" -H "Authorization: Bearer $ADMIN_TOKEN" | \
  grep -o '"body":"[^"]*ok</p>"' # &lt;script&gt;...&lt;/script&gt;<p>ok</p> 형태여야 정상

# 7-6b. [신규] <img> 정화 확인 — 허용 상대 경로 + onerror는 소멸, 외부 URL은 이스케이프.
# 200 {"ok":true} 기대 후, 재조회한 posts.json에서 body가 아래 기대값과 일치하는지 확인한다.
curl -i -X PUT "$FUNCTION_URL/posts" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"version":1,"posts":[{"id":"smoke-img","category":"news","date":"2026-07-11","title":"t","summary":"s","body":"<img src=\"./img/uploads/ws-1.webp\" alt=\"워크샵\" onerror=\"alert(1)\"><img src=\"https://evil.com/x.png\">","thumb":null,"externalUrl":null,"pinned":false}]}'

curl -s "$FUNCTION_URL/posts" -H "Authorization: Bearer $ADMIN_TOKEN" | \
  jq -r '.posts[] | select(.id=="smoke-img") | .body' # 아래 기대값과 비교:
# 기대: <img src="./img/uploads/ws-1.webp" alt="워크샵" loading="lazy">&lt;img src=&quot;https://evil.com/x.png&quot;&gt;
# (onerror는 사라지고, loading="lazy"가 붙고, 외부 URL img는 텍스트로 이스케이프되어야 정상)

# 7-7. [신규] javascript: externalUrl — 400 {"error":"..."} 기대
curl -i -X PUT "$FUNCTION_URL/posts" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"version":1,"posts":[{"id":"smoke-url","category":"news","date":"2026-07-11","title":"t","summary":"s","body":"b","thumb":null,"externalUrl":"javascript:alert(1)","pinned":false}]}'

# 7-8. POST /upload-url — presigned POST(폼 업로드) 자격 증명 발급
UPLOAD_JSON=$(curl -s -X POST "$FUNCTION_URL/upload-url" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename":"테스트 썸네일.webp","contentType":"image/webp","size":12345}')
echo "$UPLOAD_JSON"

# 7-9. [신규] size 초과(5MB 초과) — 400 {"error":"..."} 기대
curl -i -X POST "$FUNCTION_URL/upload-url" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename":"big.webp","contentType":"image/webp","size":6291456}'

# 7-10. 7-8 응답의 upload.url/upload.fields로 실제 업로드 (폼 방식 — PUT이 아니라 POST,
# Authorization 헤더 없이 S3에 직접 전송한다). fields 객체의 모든 키를 그대로 -F로
# 추가한 뒤, 반드시 "file" 필드를 마지막에 추가한다(S3 presigned POST 요구사항).
UPLOAD_URL=$(echo "$UPLOAD_JSON" | jq -r '.upload.url')
FIELD_ARGS=$(echo "$UPLOAD_JSON" | jq -r '.upload.fields | to_entries[] | "-F " + (.key + "=" + .value | @sh)')
eval curl -i -X POST "\"$UPLOAD_URL\"" $FIELD_ARGS -F "file=@thumb.webp;type=image/webp"

# 성공 시 S3가 204(또는 201) 반환. 이후 publicPath(예: ./img/uploads/xxx.webp)로 접근 가능.
```

기대 결과 요약:

| 테스트 | 기대 상태 |
|---|---|
| OPTIONS preflight | 204, `Access-Control-Allow-Origin` 존재 |
| 토큰 없는 GET /posts | 401 `{"error":"Unauthorized"}` |
| 토큰 있는 GET /posts | 200, posts.json 그대로 |
| 정상 PUT /posts | 200 `{"ok":true}` |
| 스키마 불량 PUT /posts | 400 `{"error":"..."}` |
| 1MB 초과 PUT /posts | 413 `{"error":"..."}` |
| **[신규] XSS 페이로드 PUT /posts** | 200 저장, 재조회 시 `body`가 `&lt;script&gt;...&lt;/script&gt;<p>ok</p>` 형태로 정화됨 |
| **[신규] `<img>` 정화 PUT /posts** | 200 저장, 재조회 시 허용 상대 경로 img만 `<img src="./img/uploads/ws-1.webp" alt="워크샵" loading="lazy">`로 재구성되고(onerror 소멸), 외부 URL img는 텍스트로 이스케이프됨 |
| **[신규] javascript: externalUrl PUT /posts** | 400 `{"error":"...externalUrl..."}` |
| 정상 POST /upload-url | 200 `{"upload":{"url":"...","fields":{...}},"publicPath":"./img/uploads/..."}` |
| 잘못된 contentType | 400 `{"error":"..."}` |
| **[신규] size 5MB 초과 POST /upload-url** | 400 `{"error":"...size..."}` |
| upload.url/fields로 실제 폼 업로드 | 204/201 (S3), 이후 publicPath로 파일 접근 가능 |

---

## 8. 토큰 로테이션 및 보안 주의사항

- **HTTPS만 사용**: Lambda Function URL은 항상 HTTPS이므로 별도 설정 불요. 프론트에서
  절대 `ADMIN_API`에 `http://`(개발용 localhost 제외)를 넣지 않는다.
- **토큰 유출 시 즉시 교체**:
  ```bash
  export NEW_ADMIN_TOKEN=$(openssl rand -base64 32)
  aws lambda update-function-configuration \
    --function-name "$FUNCTION_NAME" \
    --environment "Variables={BUCKET=$BUCKET,DISTRIBUTION_ID=$DIST_ID,ADMIN_TOKEN=$NEW_ADMIN_TOKEN,ALLOWED_ORIGIN=$ALLOWED_ORIGIN}"
  ```
  교체 즉시 이전 토큰은 401 처리된다. `sessionStorage`에 저장된 예전 토큰을 쓰던
  admin.html 세션은 재로그인이 필요해진다 — 관리자에게 새 토큰을 안전한 채널(직접 전달,
  비밀번호 관리자 등)로 공유한다. 절대 슬랙/이메일 평문, git 커밋에 남기지 않는다.
- **정기 로테이션 권장**: 3~6개월 주기로 위 명령을 재실행.
- **ALLOWED_ORIGIN은 운영 도메인 하나로 고정, localhost는 기본 차단**: `localhost`/
  `127.0.0.1` Origin은 더 이상 항상 허용되지 않는다 — `ALLOW_LOCALHOST` env를
  명시적으로 켠 경우에만 허용되는 옵트인이다(2절 env 표 참조). **운영 Lambda에는
  `ALLOW_LOCALHOST`를 설정하지 않는다.** 스테이징 도메인이 추가로 필요하면 코드의
  `resolveAllowOrigin`을 수정해야 한다(이번 범위 아님).
- **최소 권한 유지**: IAM 정책은 `data/*`·`img/uploads/*`와 지정된 CloudFront 배포
  하나로 한정돼 있다. 버킷/배포를 교체하면 정책의 ARN도 함께 갱신할 것.
- **모니터링**: CloudWatch Logs(`/aws/lambda/wickedstorm-admin-api`)에서 401이
  비정상적으로 반복되면 토큰 무차별 대입 시도일 수 있다 — 필요 시 CloudFront/WAF
  레이트 리미팅 추가 검토(이번 범위 밖).

---

## 9. 코드 변경 후 재배포

```bash
cd "lambda/admin-api"
rm -f ../admin-api.zip
zip -r ../admin-api.zip index.mjs package.json node_modules -x '*.DS_Store'
cd -

aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file fileb://lambda/admin-api.zip
```

env 값만 바꿀 때는 `update-function-code`가 아니라 3단계의
`update-function-configuration`을 사용한다.
