# WICKED STORM 리뉴얼 — 프로덕션 구현 설계서 (v1)

작성: Fable 5 (설계) / 구현: Opus 4.8 / 검증: Sonnet 5
목표: **wickedstorm.kr을 대체할 실제 운영 수준의 정적 원페이지 사이트.**
빌드 스텝 없음(S3 그대로 배포). 스택: HTML + CSS + vanilla JS + GSAP/ScrollTrigger/Lenis(로컬 vendor).

## 0. 절대 원칙 (성능 헌법 — 위반 시 렉 재발)

이전 프로토타입에서 레티나 Mac 렉의 원인이 "상시 rAF로 매 프레임 갱신되는 풀스크린 캔버스"였음이 측정으로 확인됨. 따라서:

1. **자유 실행(free-running) rAF 루프 금지.** 허용되는 상시 루프는 Lenis의 rAF 단 하나.
   모든 연출은 (a) 스크롤에 의해서만 구동(ScrollTrigger scrub/트리거), (b) 1회성(bounded, 시간 제한),
   (c) 컴포지터 전용 CSS 애니메이션(transform/opacity만) 중 하나여야 함.
2. **캔버스는 히어로 내부 absolute 배치**(fixed 금지), 그리는 시점은 오직:
   로드 인트로(1회, ≤2.5s) / 핀-스크럽 onUpdate(스크롤 중에만) / 디바운스된 resize.
   캔버스 DPR ≤ 1.5.
3. **backdrop-filter 전면 금지.** 반투명이 필요하면 불투명에 가까운 rgba 단색.
4. CSS 상시 애니메이션(글로우 오브, 도트 펄스 등)은 transform/opacity만 사용하고,
   `.hero`가 뷰포트 밖이면 IntersectionObserver로 `animation-play-state: paused` 처리.
5. 이미지: hero 패널 제외 전부 `loading="lazy"`, width/height 속성 명시(CLS 방지).
6. `prefers-reduced-motion: reduce`: Lenis 미기동, 핀/스크럽 미생성, 인트로/티커 정지(정적 4행),
   모든 콘텐츠는 애니메이션 없이도 완전하게 보여야 함(reveal 초기 상태가 숨김이면 안 됨 → JS 미실행 시에도 보이도록 `.rv`는 JS가 붙인 클래스로만 숨김 전환).

## 1. 파일 구조 (이 폴더에 이미 자산 준비됨)

```
renewal/
  index.html            ← 원페이지 본체
  privacy.html          ← 개인정보처리방침 (동일 헤더/푸터, 간소)
  css/style.css
  js/main.js
  js/vendor/gsap.min.js, ScrollTrigger.min.js, lenis.min.js
  img/  fonts/  favicon.ico  robots.txt  sitemap.xml
```

- 폰트: 한글 `Pretendard Variable`(로컬 woff2, preload + font-display:swap),
  영문/숫자 `Sora`(Google Fonts, preconnect). 숫자는 `font-variant-numeric: tabular-nums`.
- GA4: `G-0Y5QD1HBGN` (기존 속성 유지, async gtag).
- SEO: title/description/canonical(https://wickedstorm.kr/)/OG(og-image.png)/twitter card/
  JSON-LD Organization(주소·전화·이메일)/robots.txt/sitemap.xml(index, privacy 2개 URL).
- 파비콘: favicon.ico + `<link rel="apple-touch-icon" href="./img/favicon.png">`.

## 2. 시각 언어 (승인된 프로토타입 계승 — 반드시 프로토 파일을 읽고 이식)

기준 파일(읽을 것): `/private/tmp/claude-501/-Users-jostar2-----10------05---------/c82b0d4f-7300-40b4-823c-275a14ab42c1/scratchpad/proto/index.html`
- 팔레트/타이포/컴포넌트(캡처 패널, 칩, frame 브라우저 목업, std-card, ref-card, ncard, feature, cform 등)는
  프로토의 CSS를 기반으로 정리·이식한다(변수명 유지 가능). 다크 배경 #06070e, 그라디언트 #e930b0→#7c4dff→#2f7cff.
- **로고 심볼**: 모든 아이브로우/배지에 `img/symbol.png` (`.sym`, 높이 16px). CSS 막대(.bars) 금지.
- 뉴스 썸네일: `aspect-ratio 4/3` + `object-fit: contain` + 패딩 16px (문서/제품 전체가 보여야 함).

## 3. 섹션 구성 (순서 고정)

header(고정) → ① hero(+핀 스크럽) → ② pipeline → ③ product(LRS/LAP feature ×2) →
④ references(4) → ⑤ standards/1EdTech(8카드) → ⑥ GROWA → ⑦ news(3) → ⑧ company(스탯 4) →
⑨ contact(폼) → footer

콘텐츠 텍스트는 프로토 그대로 사용하되 아래 수정:
- 뉴스 1번 제목: "위키드스톰, 학습자 프로파일링 방법 특허 **등록**" (본문에 등록번호 10-2767110 포함).
- 뉴스 카드는 클릭 시 카드 아래로 본문이 펼쳐지는 아코디언(1개만 열림, aria-expanded, height 트랜지션).
  본문 텍스트는 현행 사이트 문안(특허/조달/KOLAS 뉴스 — 프로토 이전 대화에서 쓰던 원문 유지, 조달 뉴스에는
  디지털서비스몰 링크 없이 전화·문의 유도만).
- 클레임 게이트(위반 금지): ADL/KOLAS 로고·마크 사용 금지, "국내 최초/유일/1위" 금지,
  85만 명 수치는 뉴스 본문 안에서만, GROWA는 "개발 중 프로토타입" 라벨 유지,
  1EdTech는 "함께 이끌며 / powered by Wicked Storm"("설립사" 단어 금지),
  Trust 팩트는 GS 1등급(24-0016)·특허 등록(10-2767110)·특허 출원(출원 표기)만.

## 4. 스크롤 연출 설계 (이번 요구의 핵심 — "스크롤하면 살아있는 페이지")

전역: Lenis(duration 1.1) + ScrollTrigger 연동(lenis rAF 루프에서 ScrollTrigger.update).
`matchMedia('(min-width: 961px)')`에서만 핀/스크럽 활성(모바일은 reveal만). reduced-motion 시 전부 비활성.
**상단 스크롤 프로그레스 바**: fixed 2px 그라디언트, `transform: scaleX(progress)` (ScrollTrigger onUpdate).

### 씬 1 — 히어로 인트로 (로드 1회)
- h1 라인 마스크 리빌(각 라인 `.line > .line-inner`, translateY 110%→0, stagger 0.1, power4.out 0.9s)
- 태그라인/리드/CTA/트러스트라인 fade-up stagger 0.08
- 캡처 패널: y 40→0, opacity 0→1, delay 0.45
- 캔버스: 어셈블 인트로(입자가 사방에서 날아와 별자리로, 2.2s ease-out cubic, 1회)

### 씬 2 — 시그니처: Chaos → Structure 핀 스크럽 (데스크톱만)
- `.hero`를 pin: start 'top top', end '+=130%', scrub 0.6, anticipatePin 1.
- 진행도 p(0→1)가 구동하는 것:
  - **캔버스 scrub 렌더**: 상태 A(어셈블된 무질서 별자리) → 상태 B(정돈된 도트 그리드 + 우상향 추세 폴리라인).
    입자별 (ax,ay)→(bx,by) 선형 보간, 연결선 알파는 (1-p)로 감쇠, 추세선은 p 0.45→1에서 드로우-인
    (마지막 점까지 점진 그리기 + 끝점 글로우 도트). 그리기는 오직 scrub onUpdate에서.
  - 히어로 카피(.hero-copy): p 0→0.4에서 opacity 1→0, y 0→-40.
  - 캡처 패널: p 0.15→0.75에서 opacity 1→0, y 0→-60, scale 1→0.96.
  - **오버레이 캡션**(.hero-overlay, 히어로 중앙, 초기 숨김): p 0.5→0.8에서 페이드-인.
    카피: "흩어진 기록이 **구조**가 되는 순간" + 서브 "위키드스톰은 이 변환을 자동화합니다".
    p 0.9→1에서 다시 살짝 페이드-아웃(다음 섹션과 자연 연결).
- 상태 B의 도트 그리드는 build 시 1회 계산(그리드 6×N 정렬 + 지터 약간).

### 씬 3 — 파이프라인 (scrub)
- 섹션 뒤 배경에 가로 프로그레스 라인(그라디언트): 섹션이 뷰포트 통과하는 동안 scaleX 0→1 (scrub).
- 4개 step: p 0.2/0.45/0.7/0.95 시점에 `.lit` 토글(숫자·제목이 그라디언트로 점화, CSS transition).
- 라인 위를 달리는 데이터 도트 1개: translateX 0→100% (같은 scrub, transform만).

### 씬 4 — 제품 feature ×2
- 진입 시 카피 자식들 stagger reveal(기존 .rv 방식).
- `.frame`(스크린샷): 섹션 통과 동안 y +36→-36 패럴랙스(scrub, transform만).
- LRS/LAP frame에 hover: translateY(-4px) (CSS).

### 씬 5 — 레퍼런스
- 카드 4개 stagger 0.08 reveal + 각 카드 좌측 그라디언트 스파인 scaleY 0→1 (transform-origin top, 진입 1회).

### 씬 6 — 표준/1EdTech
- powered 배지: x +32→0 + fade (진입 1회).
- 8개 카드 웨이브 stagger(행 우선 0.05s). '적용' 4개는 진입 시 보더 글로우 1회 펄스(CSS keyframe 1회).

### 씬 7 — GROWA
- 메인 대시보드 frame: 진입 시 perspective 틸트 정착(rotateX 5deg, y 48, opacity 0 → 0/0/1, 0.9s)
  + 섹션 통과 패럴랙스 y ±24 (scrub). 서브 frame 2개는 stagger 리빌.

### 씬 8 — 뉴스: 카드 3개 stagger 리빌(그 외 정적).
### 씬 9 — 컴퍼니: 숫자 스탯(2021, 30, 3) 진입 1회 카운트업 1.2s(tabular-nums, IO once). "xAPI"는 카운트 없음.
### 씬 10 — 컨택트: 좌측 정보/우측 폼 자식 cascade 리빌.

리빌 공통: `.rv`는 **JS가 `js` 클래스를 html에 붙인 뒤에만** 초기 숨김이 적용되도록
`html.js .rv{opacity:0;transform:translateY(26px)}` + `.rv.in{...}` 구조(무JS/리더 안전).
IntersectionObserver threshold 0.12, 등장 후 unobserve.

## 5. xAPI 캡처 티커 v2 (부드러움이 생명)

마크업:
```
.capture
  .cap-top (배지 + 실시간 수집 표시)
  .stream-viewport   ← height: 고정(4행+간격), overflow:hidden,
                        mask-image: linear-gradient(180deg, transparent 0, #000 18px)
    .stream-track    ← flex column, gap 9px, will-change: transform
      .xrow × n
  .cap-foot (AI INSIGHT + sparkline + insight chip)
```
동작(push, 2.4s 간격 setInterval):
1. 새 `.xrow`를 track **맨 아래 append**. 행 진입은 CSS: opacity 0 / translateY(12px) → 가시화 0.45s.
   행 내부 칩 4개는 `animation-delay` 0/60/120/180ms 마이크로 스태거.
2. 행 수가 4를 초과하면 **FLIP 방식으로 트랙을 밀어올린다**:
   - `rowH = firstRow.offsetHeight + gap` 측정
   - 첫 행에 `.leaving`(opacity→0, 0.4s) 부여 **동시에**
     `track.style.transition='transform .55s cubic-bezier(.3,.7,.25,1)'; track.style.transform=translateY(-rowH)`
   - `transitionend`(transform)에서: 첫 행 remove → 같은 프레임에서 `transition='none'; transform='none'`
     → 다음 프레임에 transition 복구. (레이아웃 점프 0 — 아래 행들이 개별로 움직이지 않고 트랙이 통째로 슬라이드)
3. 인사이트 칩 텍스트 교체는 크로스페이드(opacity 0 → 텍스트 스왑 → opacity 1, 각 0.2s).
4. 스파크라인: 새 포인트 추가 시 300ms 동안만 rAF 보간(bounded) 후 정지.
5. 일시정지 조건: `.hero` 뷰포트 밖(IO) 또는 `document.hidden` → interval 정지, 복귀 시 재개.
6. Statement 데이터: 동사-객체-결과가 논리적으로 짝지어진 이벤트 풀(프로토의 events 배열 재사용).
7. reduced-motion: 정적 4행 렌더, interval 없음.

## 6. 헤더/내비/폼 (운영 품질)

- 헤더: 위로 스크롤 시 표시/아래로 스크롤 시 숨김(translateY(-100%), 현행 사이트 UX 계승) + 20px 이후 불투명 배경.
- 모바일(≤960px): 햄버거 → 풀폭 드로어(링크 탭 시 닫힘, aria-expanded, ESC 닫힘, 열림 중 body 스크롤 잠금).
- 앵커 이동: Lenis.scrollTo(부드럽게), reduced-motion 시 기본 점프.
- 문의 폼: POST `https://v6pa5eyigfdkbuzm2rskahdf6y0xfsre.lambda-url.ap-northeast-2.on.aws`
  payload `{name, affiliation, email, inquiry, userTraffic, userTrafficEtc?, subject}`
  subject = `Contact Us 문의 접수: {name}님 (소속: {affiliation})`.
  honeypot(name="website") / 유입경로 direct·etc 선택 시 추가 입력란 표시(+required, 라벨 전환) /
  인라인 상태 메시지(role=status) / 전송 중 버튼 disabled / 성공 시 reset.
  개인정보 동의 체크(라벨에 privacy.html 링크).
- privacy.html: 이전 초안(수집 항목: 이름·소속·이메일·문의내용·유입경로 / 보유 1년 / AWS 위탁 /
  권리행사 연락처) + "법무 검토 전 초안" HTML 주석 TODO.
- 푸터: 주소/전화/팩스/이메일 + privacy 링크 + "AI Insight, Empowered Education." + © 2026.
  사업자등록번호는 HTML 주석 TODO로 자리만.

## 7. 완료 기준 (Definition of Done)

- [ ] 데스크톱(1440) 스크롤 시: 프로그레스바·히어로 핀 스크럽(카오스→구조)·파이프라인 점화·
      feature 패럴랙스·각 섹션 리빌이 전부 동작
- [ ] 티커: 5번째 행 진입 시 트랙 슬라이드로 부드럽게 밀려나고 레이아웃 점프 없음
- [ ] 상시 rAF는 Lenis 1개뿐(코드 검색으로 확인 가능해야 함), backdrop-filter 0건
- [ ] 모바일(390): 핀 없음, 모든 콘텐츠 접근 가능, 햄버거 동작
- [ ] reduced-motion: 모든 콘텐츠 정적 표시, 콘솔 에러 0
- [ ] 폼: 유효성/직접입력 토글/honeypot/전송(엔드포인트 호출) 동작
- [ ] 클레임 게이트 위반 0건, 뉴스 썸네일 전체 노출(contain)
- [ ] 콘솔 에러/404 자산 0건

---

## v1.1 개정 (2026-07-08, 오너 피드백 라운드 — Fable 설계 / Sonnet·Opus 구현)

### 변경 사항
1. **히어로 캔버스 상태 B 교체**: 도트 그리드+대각선 폴리라인 폐기 → **"구조화된 기록 레저"**.
   중앙 56%×48% 영역에 기록 행 6개(actor 도트 + 필 3개 + 시안 체크 도트), 세로 컬럼 가이드 3개,
   파티클이 행별 스태거(p∈[0.12+i*0.11, …])로 필 안에 착지. 전부 build() 사전계산 + scrub() 순수 draw.
2. **티커**: 정적 5행(무JS/reduced-motion 완전 노출, viewport height:auto). JS 모드는 빈 트랙에서
   700ms 간격 1행씩 스택업 → 5행 도달 후 2400ms 슬라이드(임계 >5). viewport 높이는 JS가 5행 기준 계산, resize 재계산.
3. **오버레이 캡션**: 레저와 겹치지 않도록 히어로 하단 배치(justify-content:flex-end + padding-bottom clamp(64px,14vh,130px)).
4. **파이프라인**: 각 step에 .step-detail 추가 — .lit 시 grid-rows 0fr→1fr 확장(1회성 트랜지션).
   reduced-motion에서는 항상 펼침.
5. **영상 루프 2개** (`media/`, 총 ~260KB):
   - pipeline-loop.mp4: exhibition-landscape-v3.mp4 44.5~57.0s ("수집·저장·분석을 하나로"), 1280w/24fps/무음.
   - company-loop.mp4: company-film-landscape.mp4 33.5~42.5s 팔린드롬.
   - IO 25%에서 play/pause, visibilitychange pause, play() reject는 catch. REDUCE 시 autoplay 안 함+controls.
   - **영상 소스 주의**: exhibition-landscape-v3의 140s 부근은 ADL/KOLAS/218만/1위 문구 포함 — 어떤 용도로도 사용 금지.
     새 구간 사용 시 반드시 프레임 추출해 클레임 게이트 검수.
6. **이미지 비율 규칙 강화**: `.frame img`에 height:auto 필수. 모든 img의 width/height 속성은 실제
   픽셀 비율과 일치(sips로 측정). growa-sub는 aspect-ratio 1200/866 크롭 통일.
7. **뉴스 카드**: 데스크톱에서 h3 min-height 2줄 고정으로 카드 높이 균일화(.news-grid align-items:start 유지).
8. **co-stat**: 단위 표기는 `<span class="unit">`(18px), 인라인 스타일 금지. `.co-stat>span` 직계 셀렉터 사용.

### DoD 추가 항목
- [x] 티커: 5행 전부 노출 + 1행씩 스택업 시작, 이후 슬라이드 점프 없음
- [x] 캔버스 상태 B가 "기록 행으로 저장"으로 읽힘 (p 진행 시 단조 증가 검증)
- [x] 파이프라인 상세설명이 단계 점등과 함께 확장, reduced-motion 시 항상 노출
- [x] 영상: 뷰포트 인/아웃 play/pause, 클레임 프레임 검수 통과, 각 ≤2.5MB
- [x] 모든 img 선언 비율 = 실측 비율

### 백로그 (오너 요청, 미착수)
- 뉴스 섹션 "더보기"/아카이브 확장: 1EdTech Korea 출범식 기사 등 아티클 계속 게시,
  메인 노출 뉴스 고정(pin) 기능. 정적 사이트 구조에서의 구현 방식 별도 스코핑 필요.

---

## v1.2 개정 (2026-07-18, 히어로 배경 고품질화 라운드 — Fable 설계·구현)

오너 피드백: "배경 데이터가 흩어지고 구조화되는 그림을 레퍼런스급 고퀄리티로." 성능 헌법(§0) 불변.

### 변경 사항
1. **파티클 필드 재설계 (46 → ~470)**: 역할 3종 — dust(원경 성운, 구조 불참, 스크럽 중
   후퇴·감광 1→0.5), flyer(필 수용량 비례 '지정 좌석'으로 비행하는 기록, 데이터가 곧 잉크),
   spark(행 끝 체크 도트 주변 시안 신호, 대기 중 α0.12로 숨죽임). z 심도(크기·알파 계조 +
   최원경 보케 8), 무질서 분포 = 균일 50% + 성운 클러스터 50%, 좌측 카피 존 감광 zm 0.4(점·선 동일).
2. **렌더링**: 색×3급 스프라이트 아틀라스(s 코어/m 글로우/l 보케, 백색 코어+색 폴오프) +
   `globalCompositeOperation:'lighter'` — 광원 누적 발광. arc+fill 폐기, drawImage 단일 경로.
3. **scrub 3막 코레오그래피**: 수집(비행은 행 구조보다 p .20 선행) → 정렬(행 스태거
   s0=.34+i*.08, 폭 .24; 구조 스트로크는 카피 소멸 후에만) → 커밋(p .9~1 수평 광 밴드 플래시
   + settle + 체크 팝). 필 = 외곽선 .25+.6rp + 채움 .3 + 바이트 틱(14px) + 스윕 헤드(코어+글로우+도트).
4. **핀 타임라인 1:1 매핑 (버그 수정)**: ScrollTrigger 스크럽은 핀 progress를 타임라인
   총길이로 재매핑한다. 총길이가 0.72라서 카피가 의도(p.40) 대신 p.56까지 잔류, 오버레이는
   p1.0에야 완전 등장했다(실측 copyOp 0.1@p0.5). duration:1 무동작 스페이서로 고정.
   **이후 이 타임라인의 position/duration은 곧 핀 progress 비율이다 — 스페이서 제거 금지.**
5. **앰비언트 드리프트 레이어**: 더스트 정적 캔버스 2장(buildDrift, 리사이즈 시 재생성)을
   CSS 키프레임 driftA/B(70s/110s, 컴포지터 전용)로 상시 표류. JS 루프 0. `.hero.out` 시
   pause(.orbs 규약), reduced-motion은 전역 animation:none이 커버, 핀 스크럽 p.08~.58에서
   opacity 0. 인트로는 2.4s(§0-2 ≤2.5s 내), 원경(z낮음)부터 z-스태거 등장, dust는 근거리 응결.

### 측정 (2026-07-18, 1440×900 headless Chromium)
- 시뮬 스크럽(0→720px, 150프레임) 프레임 델타: avg 8.3ms / p95 9.5ms / max 10.3ms — 60fps 예산 내.
- 콘솔 에러/경고 0 (index 전 구간 스크롤 스윕, news.html, news/*.html, 모바일 390).
- 미검증: WebKit(로컬 미설치). 사용 API는 전부 광범위 지원(drawImage/lighter/radialGradient).

### DoD 추가 항목
- [x] 정지 화면(로드 후 무입력)에서도 배경이 미세하게 살아 있음 (드리프트, JS 루프 0)
- [x] p<.3 구간에 구조 스트로크 없음(사라지는 카피와 구조 겹침 머드 제거)
- [x] p=1 레저가 "입자가 채운 데이터 바"로 읽힘(빈 외곽선 금지) + 원경 절반 잔존
- [x] 커밋 플래시·리플·팝 전부 p의 결정론 함수(역방향 스크럽 자연 재생)
