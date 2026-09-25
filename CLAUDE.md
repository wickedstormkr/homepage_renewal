# CLAUDE.md

위키드스톰 홈페이지(`wickedstormkr/homepage_renewal`) 작업 규칙. `main` 브랜치 루트가 GitHub Pages로 바로 공개되므로 `main`에 직접 올리거나 병합하지 않고, 새 브랜치와 PR로만 결과를 낸다.

## 규칙

**문구**
- 보이는 문구에 긴 줄표(—)를 쓰지 않는다. 쉼표, 가운뎃점(·), 콜론으로 대신한다.
- "(개발 중)" 같은 표기를 쓰지 않는다. 화면 속 시연용 수치를 성과처럼 쓰지 않는다.
- 제품명은 Lecognizer, Lecognizer AI, LearnHubble AI. GROWA·LXP를 제품명처럼 쓰지 않는다.
- 주체는 운영자·교수자·학습자. "기록"보다 "학습데이터".
- AI는 찾고, 분석하고, 제안한다. 판단과 적용은 사람이 한다.
- 1EdTech 표기는 "1EdTech Korea 설립 이사회 · 1EdTech Contributing Member". Caliper는 "적용".

**색**
- 글자 그라디언트는 브랜드 그라디언트 하나: 마젠타 #e930b0 → 보라 #7c4dff → 파랑 #2f7cff.
- 제품 색은 그 조각을 쓴다. Lecognizer 계열은 마젠타 쪽(`--grad-lec`), LearnHubble AI는 파랑 쪽(`--grad-lhb`). 청록은 쓰지 않는다.

**줄바꿈**
- 의미·단어 단위로 끊는다. 마지막 줄에 한 단어만 남기지 않는다.
- 한국어는 keep-all. 일본어는 keep-all 금지(글자 단위 + 금칙 처리, Chrome은 auto-phrase), 긴 구는 칸 안에서 줄바꿈을 허용한다.

**다국어**
- 국문 `index.html` → `python3 scripts/build_i18n.py extract` → `i18n/<lang>.json` 번역 → `build`.
- 생성물 `en/` `ja/` `vi/index.html`은 직접 고치지 않는다.
- 용어는 `i18n/*_terms.md`, 확인이 필요한 사항은 `i18n/*_notes.md`.

**화면**
- 섹션은 머리말(eyebrow·제목·리드)이 먼저, 내용이 뒤.
- 글자는 칸을 채우고, 오른쪽에 어색한 빈 공간을 남기지 않는다.
- 지적받은 한 곳만 고치지 말고, 같은 원인을 전체에서 찾아 고친다.

**코드**
- 움직임은 transform·opacity만 쓰고, prefers-reduced-motion을 따른다.
- `js/main.js`는 한 IIFE라 블록 하나가 오류를 던지면 뒤가 전부 멈춘다. 블록마다 방어적으로 짠다.
- 소식은 `data/posts.json` → `node scripts/generate-news.mjs`.
- 공개 저장소다. 병합(곧 공개)은 사람이 정한다.

## 참고
- 언어별 레이아웃 보정은 `css/style.css` 끝의 `html:lang(..)` 블록에 모여 있다. 국문 화면은 바꾸지 않는다.
- 레이아웃 점검: `python3 -m http.server 8123` 후 `node scripts/qa/layout-check.cjs` (README 운영 메모 참고).
