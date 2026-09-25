# Wicked Storm Homepage Renewal

## 웹사이트 바로가기

- [메인 홈페이지 (GitHub Pages)](https://wickedstormkr.github.io/homepage_renewal/)
- [v2 페이지](https://wickedstormkr.github.io/homepage_renewal/v2.html)

## 운영 메모

- 소식 추가: `data/posts.json`에 글을 넣고 `node scripts/generate-news.mjs` → `news/<id>.html`·`sitemap.xml` 생성 (`--check`로 최신 여부 확인)
- 인스타그램·블로그 연결: `js/site-config.js`의 `SOCIAL` 채우기, 운영 기준은 [docs/SNS_채널_연계_가이드.md](docs/SNS_채널_연계_가이드.md)
- 인스타그램 프로필 링크: `links.html`
- 파이프라인 루프: 영상이 아니라 HTML/CSS 애니메이션(`#pipeLoop`, 12초 주기·transform/opacity만 사용). 글자가 HTML이라 다국어 빌드가 그대로 번역하고, 화면에 들어오면 재생·벗어나면 멈춘다(`js/main.js`). 단계 화면은 `img/pipe-{collect,store,analyze}.webp`
- 색: 글자 그라디언트는 브랜드 그라디언트(`--grad`, 마젠타→보라→파랑) 하나. 제품 색은 새 색 없이 그 두 조각만 쓴다. `--grad-lec`(마젠타 쪽) = Lecognizer·Lecognizer AI, `--grad-lhb`(파랑 쪽) = LearnHubble AI. 선순환 알약·제품 제목·LearnHubble 섹션에만 쓰고, 표준 카드 제품 줄은 중립색
- 다국어(영·일·베): 국문 `index.html`이 원본. 문구를 고친 뒤
  `python3 scripts/build_i18n.py extract`(번역 단위 → `i18n/ko.json`) → `i18n/{en,ja,vi}.json`에 빠진 키 번역 →
  `python3 scripts/build_i18n.py build`(→ `en/ ja/ vi/index.html`). `check`는 빠진 번역만 보고한다.
  용어는 카탈로그 다국어판 기준(`i18n/*_terms.md`), 원어민 검수·카탈로그 확인 필요 사항은 `i18n/*_notes.md`
- 다국어 레이아웃 점검: 저장소 루트에서 `python3 -m http.server 8123`을 띄우고 `node scripts/qa/layout-check.cjs [--shots=390,820,1440]` → `scripts/qa/out/report.txt`(넘침·겹침·고아 단어·두 줄 배지·11px 미만)와 스크린샷 (playwright는 `npm i -D playwright` 또는 전역 설치 + `NODE_PATH=$(npm root -g)`)
