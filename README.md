# Wicked Storm Homepage Renewal

## 웹사이트 바로가기

- [메인 홈페이지 (GitHub Pages)](https://wickedstormkr.github.io/homepage_renewal/)
- [v2 페이지](https://wickedstormkr.github.io/homepage_renewal/v2.html)

## 운영 메모

- 소식 추가: `data/posts.json`에 글을 넣고 `node scripts/generate-news.mjs` → `news/<id>.html`·`sitemap.xml` 생성 (`--check`로 최신 여부 확인)
- 인스타그램·블로그 연결: `js/site-config.js`의 `SOCIAL` 채우기, 운영 기준은 [docs/SNS_채널_연계_가이드.md](docs/SNS_채널_연계_가이드.md)
- 인스타그램 프로필 링크: `links.html`
- 파이프라인 루프 영상 원본: Remotion 프로젝트 `영상제작_Remotion/video/src/compositions/web-pipeline-loop/` (`npx remotion render src/web-pipeline-loop-entry.tsx WebPipelineLoop out/web-pipeline-loop.mp4 --crf=16 --muted` 후 1280×720으로 재인코딩)
- 다국어(영·일·베): 국문 `index.html`이 원본. 문구를 고친 뒤
  `python3 scripts/build_i18n.py extract`(번역 단위 → `i18n/ko.json`) → `i18n/{en,ja,vi}.json`에 빠진 키 번역 →
  `python3 scripts/build_i18n.py build`(→ `en/ ja/ vi/index.html`). `check`는 빠진 번역만 보고한다.
  용어는 카탈로그 다국어판 기준(`i18n/*_terms.md`), 원어민 검수·카탈로그 확인 필요 사항은 `i18n/*_notes.md`
- 언어별 파이프라인 영상: `WebPipelineLoop-{en,ja,vi}` 컴포지션을 렌더해 `media/pipeline-loop-{lang}.mp4`로 두면 빌드가 자동으로 연결
