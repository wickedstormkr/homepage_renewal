/* WICKED STORM 리뉴얼 — main.js
 * 성능 헌법(SPEC §0): 상시 rAF 루프는 Lenis 하나뿐.
 * 그 외 rAF는 전부 bounded(시간 제한: 인트로 2.6s / 스파크 300ms / 카운트업 1.2s).
 * 캔버스는 인트로 1회 + 핀-스크럽 onUpdate + 디바운스 resize 에서만 그린다.
 */
(function () {
  'use strict';

  var doc = document, root = doc.documentElement, win = window;
  var REDUCE = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = (typeof win.gsap !== 'undefined') && (typeof win.ScrollTrigger !== 'undefined');
  var hasLenis = (typeof win.Lenis !== 'undefined');
  var IO = ('IntersectionObserver' in win);

  if (!hasGSAP) root.classList.add('nogsap');
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ============================================================
   *  Lenis — 유일하게 허용된 상시 rAF 루프
   * ============================================================ */
  var lenis = null;
  if (!REDUCE && hasLenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });
    if (hasGSAP) lenis.on('scroll', ScrollTrigger.update);
    (function raf(t) { lenis.raf(t); win.requestAnimationFrame(raf); })(0); // ← 상시 루프(단 하나)
  }

  /* ============================================================
   *  상단 스크롤 프로그레스 바 (transform:scaleX)
   * ============================================================ */
  (function () {
    var bar = doc.querySelector('.progress');
    if (!bar) return;
    if (hasGSAP && !REDUCE) {
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: function (self) { bar.style.transform = 'scaleX(' + self.progress + ')'; }
      });
    } else {
      var onScroll = function () {
        var h = doc.documentElement.scrollHeight - win.innerHeight;
        bar.style.transform = 'scaleX(' + (h > 0 ? win.scrollY / h : 0) + ')';
      };
      win.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  })();

  /* ============================================================
   *  헤더: 아래로 스크롤 숨김 / 위로 표시 + 20px 이후 불투명
   * ============================================================ */
  (function () {
    var hdr = doc.getElementById('hdr');
    if (!hdr) return;
    var lastY = win.scrollY || 0;
    var onScroll = function () {
      var y = win.scrollY || 0;
      hdr.classList.toggle('scrolled', y > 20);
      if (!root.classList.contains('nav-open')) {
        if (y > lastY && y > 220) hdr.classList.add('hide');
        else hdr.classList.remove('hide');
      }
      lastY = y;
    };
    win.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ============================================================
   *  모바일 드로어
   * ============================================================ */
  (function () {
    var btn = doc.getElementById('menuBtn'), drawer = doc.getElementById('drawer');
    if (!btn || !drawer) return;
    var open = false, hideTimer = null;
    // 포커스 트랩 대상: 토글 버튼 + 드로어 내 링크/버튼. 순환은 이 배열 안에서만 돈다.
    function focusables() {
      return [btn].concat([].slice.call(drawer.querySelectorAll('a[href],button:not([disabled])')));
    }
    function set(next) {
      open = next;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      if (open) {
        clearTimeout(hideTimer);
        drawer.hidden = false;
        win.requestAnimationFrame(function () {
          drawer.classList.add('open');
          var firstLink = drawer.querySelector('a[href]');
          if (firstLink) firstLink.focus();                          // 열면 첫 링크로 포커스 진입
        });
        root.classList.add('nav-open');
        doc.body.style.overflow = 'hidden';
        if (lenis) lenis.stop();
      } else {
        drawer.classList.remove('open');
        root.classList.remove('nav-open');
        doc.body.style.overflow = '';
        if (lenis) lenis.start();
        btn.focus();                                                 // 닫으면 토글 버튼으로 포커스 복귀
        hideTimer = setTimeout(function () { if (!open) drawer.hidden = true; }, 420);
      }
    }
    btn.addEventListener('click', function () { set(!open); });
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    win.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); set(false); return; }
      if (e.key !== 'Tab') return;
      var items = focusables(), first = items[0], last = items[items.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (items.indexOf(doc.activeElement) < 0) { e.preventDefault(); first.focus(); }
    });
  })();

  /* ============================================================
   *  앵커 부드러운 이동 (Lenis / 폴백)
   * ============================================================ */
  (function () {
    doc.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#' || id.length < 2) return;
        var el = doc.querySelector(id);
        if (!el) return;
        e.preventDefault();
        // 접근성: 시각 스크롤과 함께 대상으로 포커스를 옮긴다. 이렇게 해야 스킵링크·앵커가
        // 키보드 사용자에게도 실제 '이동'이 되어(다음 Tab이 대상 본문에서 이어짐) 기능한다.
        // 네이티브로 포커스 불가한 대상(<main>/<section> 등)엔 tabindex="-1"을 1회 부여한다.
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
        try { el.focus({ preventScroll: true }); } catch (_) { el.focus(); }
        if (lenis) lenis.scrollTo(el, { offset: -76 });
        else el.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
      });
    });
  })();

  /* ============================================================
   *  히어로 캔버스: 상태 A(데이터 성운 — 원경 더스트 + 근경 기록) → 상태 B(구조화된 기록 레저)
   *  흩어진 기록 입자가 "정돈된 기록 행(record row)"의 잉크로 저장되는 그림.
   *  지오메트리는 build()에서 사전 계산, scrub(p)는 순수 draw(rAF 없음).
   * ============================================================ */
  var canvas = (function () {
    var c = doc.getElementById('field');
    if (!c) return null;
    var ctx = c.getContext('2d');
    var BLUE = [47, 124, 255], PURPLE = [124, 77, 255], MAGENTA = [233, 48, 176];
    // 기록 슬롯 = 심볼 3색(파랑·보라·마젠타). 캡처 패널의 .chip.actor/.verb/.object와
    // 같은 순서·같은 색이라 한 행이 곧 우리 심볼로 읽힌다.
    // CYAN은 슬롯이 아니다 — 행 끝 '신호'(기록이 인사이트가 되는 지점) 전용.
    // DUST는 구조에 참여하지 않는 원경 성운의 잔광색(채도 낮은 인디고).
    var CYAN = [34, 224, 214], DUST = [126, 146, 228];
    var SLOT = [BLUE, PURPLE, MAGENTA];
    var NSLOT = SLOT.length;
    var COL = [BLUE, PURPLE, MAGENTA, CYAN, DUST];                 // 파티클 ci 0..4
    // 스프라이트 아틀라스: 색 × 3급(s 코어 / m 글로우 / l 보케). arc+fill 대신 drawImage 1회 —
    // 파티클 10배 증량(46→~460)에도 draw 비용이 선형·예측 가능해 스크럽 예산을 지킨다.
    // 코어를 백색으로 두는 이유: 'lighter' 합성에서 겹칠수록 중심 발광이 누적돼
    // 평면 점이 아니라 광원으로 읽힌다(고밀도 필드 톤의 핵심).
    function makeSprite(rgb, size, coreA, midA) {
      var s = doc.createElement('canvas'); s.width = s.height = size;
      var q = s.getContext('2d'), h = size / 2, g = q.createRadialGradient(h, h, 0, h, h, h);
      g.addColorStop(0, 'rgba(255,255,255,' + coreA + ')');
      g.addColorStop(.22, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + midA + ')');
      g.addColorStop(.58, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (midA * .32) + ')');
      g.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
      q.fillStyle = g; q.fillRect(0, 0, size, size); return s;
    }
    function makeBokeh(rgb, size) {                                // 최원경 보케: 백색 코어 없는 소프트 디스크
      var s = doc.createElement('canvas'); s.width = s.height = size;
      var q = s.getContext('2d'), h = size / 2, g = q.createRadialGradient(h, h, 0, h, h, h);
      g.addColorStop(0, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',.4)');
      g.addColorStop(.7, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',.22)');
      g.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
      q.fillStyle = g; q.fillRect(0, 0, size, size); return s;
    }
    var SPR = COL.map(function (rgb) {
      return { s: makeSprite(rgb, 16, .9, .78), m: makeSprite(rgb, 36, .85, .62), l: makeBokeh(rgb, 72) };
    });
    var W = 0, H = 0, DPR = 1, P = [], edges = [], rows = [], guides = [];
    var guideTop = 0, guideBot = 0, ledgerX0 = 0, ledgerX1 = 0, introId = null, headGrad = null;
    var MD = 150, ROWS = 6;
    var HEAD_R = 4.5;                                               // 패널 .xrow .dot의 9px와 동일

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

    // 라운드 필(pill) 경로 (ctx.roundRect 미지원 브라우저 대비 arcTo 구현)
    function rr(x, y, w, h, rad) {
      rad = Math.min(rad, h / 2, w / 2);
      ctx.beginPath();
      ctx.moveTo(x + rad, y);
      ctx.arcTo(x + w, y, x + w, y + h, rad);
      ctx.arcTo(x + w, y + h, x, y + h, rad);
      ctx.arcTo(x, y + h, x, y, rad);
      ctx.arcTo(x, y, x + w, y, rad);
      ctx.closePath();
    }

    function build() {
      var r = c.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      DPR = Math.min(1.5, win.devicePixelRatio || 1);              // DPR ≤ 1.5 (SPEC §0-2)
      c.width = Math.round(W * DPR); c.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      // 기록 레저 영역: 가로 ~60%, 세로 ~44% 중앙 정렬
      var gw = W * 0.60, gh = H * 0.44, ox = (W - gw) / 2, oy = (H - gh) / 2;
      var rowGap = gh / ROWS, GAP = 9;
      var pillH = Math.max(7, Math.min(rowGap * 0.5, 13));
      var px0 = ox + 22, px1 = ox + gw - 26;                        // 필 영역(오른쪽 끝은 신호 도트 여백)
      rows = [];
      for (var i = 0; i < ROWS; i++) {
        var rowY = oy + (i + 0.5) * rowGap;
        var avail = px1 - px0 - 2 * GAP;
        var f0 = 0.18 + Math.random() * 0.10, f1 = 0.30 + Math.random() * 0.14; // 행마다 결정론적 폭
        var w0 = avail * f0, w1 = avail * f1, w2 = avail - w0 - w1;
        var x1p = px0 + w0 + GAP, x2p = x1p + w1 + GAP;
        // pill.ci는 SLOT 인덱스(0..2) — 파티클 ci와 같은 색 공간을 쓴다.
        var pills = [
          { x: px0, w: w0, ci: 0 },
          { x: x1p, w: w1, ci: 1 },
          { x: x2p, w: w2, ci: 2 }
        ];
        // 필 수용량: 폭 비례(좁은 필 4 ~ 넓은 필 14). 파티클이 '잉크'가 되어 필 안에
        // 정렬-착지하므로, 완성 필이 빈 외곽선이 아니라 밀도 있는 데이터 바로 읽힌다.
        for (var pj = 0; pj < pills.length; pj++) pills[pj].cap = Math.max(4, Math.min(14, Math.round(pills[pj].w / 18)));
        // 행 스태거: 구조 스트로크는 p 0.34부터 — 카피(~0.4)·캡처 패널(~0.42)이 물러난
        // 뒤에야 필·가이드가 그려져, 사라지는 DOM 위로 구조가 겹치는 머드를 없앤다.
        var s0 = 0.34 + i * 0.08, s1 = s0 + 0.24;
        rows.push({ y: rowY, actorX: ox + 7, pills: pills, checkX: ox + gw - 10, pillH: pillH, s0: s0, s1: s1 });
      }
      // 행머리 점: 패널 .xrow .dot과 동일하게 맞춘다 — 9px(r=4.5) + 심볼 그라디언트
      // (--grad, 92deg 마젠타→보라→파랑) + 마젠타 글로우(box-shadow 0 0 12px).
      // 모든 행의 actorX가 같아 1회만 만들어 재사용한다(투명도는 globalAlpha로 준다).
      headGrad = ctx.createLinearGradient(ox + 7 - HEAD_R, 0, ox + 7 + HEAD_R, 0);
      headGrad.addColorStop(0, 'rgb(233,48,176)');
      headGrad.addColorStop(.52, 'rgb(124,77,255)');
      headGrad.addColorStop(1, 'rgb(47,124,255)');
      // 희미한 세로 컬럼 가이드(표 구조 암시) — 슬롯 사이 경계에 NSLOT-1개
      guides = [];
      for (var g = 1; g < NSLOT; g++) guides.push(px0 + (px1 - px0) * (g / NSLOT));
      guideTop = oy + rowGap * 0.12; guideBot = oy + gh - rowGap * 0.12;
      ledgerX0 = ox; ledgerX1 = ox + gw;                            // 커밋 플래시의 x 경계

      // ── 파티클 생성. 역할 3종:
      //  role 0 dust — 구조에 참여하지 않는 원경 성운. 스크럽 동안 바깥으로 살짝 물러나며
      //                감광해, 완성 화면이 빈 검정이 아니라 깊이 있는 필드로 남는다.
      //  role 1 flyer — 자기 슬롯 필 안의 '지정 좌석'으로 비행하는 기록. 데이터가 곧 잉크.
      //  role 2 spark — 행 끝 체크 도트 주변으로 모이는 시안 신호. 대기 중엔 숨죽인다.
      // 무질서 좌표는 균일 50% + 성운 클러스터 50% — 완전 균일 랜덤은 벽지처럼 읽힌다.
      // 좌측 카피 존에 놓인 파티클은 zm(0.4)으로 감광해 글자 사이 얼룩을 막는다.
      P = [];
      var cx = W / 2, cy = H / 2;
      var CC = [[.24, .30], [.78, .26], [.60, .78]];
      function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }
      function chaosPt() {
        if (Math.random() < .5) return [Math.random() * W, Math.random() * H];
        var cc = CC[(Math.random() * CC.length) | 0];
        return [cc[0] * W + gauss() * W * .20, cc[1] * H + gauss() * H * .26];
      }
      function zoneMul(x, y) { return (x < W * .56 && y > H * .16 && y < H * .68) ? 0.4 : 1; }
      function push(o) { o.x = o.ax; o.y = o.ay; o.lt = 0; o.ka = 1; P.push(o); }

      // 최원경 보케 8개 — 심도(depth of field)의 가장 뒤 층
      for (var b = 0; b < 8; b++) {
        var bp = chaosPt();
        push({ role: 0, ci: (b % 3 === 0) ? 1 : 4, spr: 'l', d: 24 + Math.random() * 34,
               a: .07 + Math.random() * .07, z: 0, zm: 1,
               ax: bp[0], ay: bp[1], bx: bp[0] + (bp[0] - cx) * .06, by: bp[1] + (bp[1] - cy) * .06,
               cpx: bp[0], cpy: bp[1], ry: bp[1], s0: 0, s1: 1, node: false });
      }
      // 원경 더스트 성운
      var nDust = Math.min(300, Math.round(W * H / 4300));
      for (var k = 0; k < nDust; k++) {
        var dp = chaosPt(), dz = Math.pow(Math.random(), 1.35);
        var dbx = dp[0] + (dp[0] - cx) * .09, dby = dp[1] + (dp[1] - cy) * .09;
        push({ role: 0, ci: Math.random() < .68 ? 4 : (Math.random() < .7 ? 0 : 1), spr: 's',
               d: 2.5 + dz * 5.5, a: .2 + dz * .45, z: dz, zm: zoneMul(dp[0], dp[1]),
               ax: dp[0], ay: dp[1], bx: dbx, by: dby,
               cpx: (dp[0] + dbx) / 2, cpy: (dp[1] + dby) / 2, ry: dby, s0: 0, s1: 1, node: false });
      }
      // 기록(flyer): 필 수용량만큼, 필 내부 등간격 좌석으로. 곡선 비행 제어점은
      // 시작-도착 중점에서 법선 방향 결정론적 오프셋(2차 베지어), 부호 교대로 결이 엇갈린다.
      var fc = 0;
      for (i = 0; i < ROWS; i++) {
        var row = rows[i];
        for (var si = 0; si < NSLOT; si++) {
          var pill = row.pills[si];
          for (var t = 0; t < pill.cap; t++) {
            var fp = chaosPt(), fz = .45 + Math.random() * .55;
            var fbx = pill.x + pill.w * (.05 + .90 * ((t + .5) / pill.cap)) + (Math.random() - .5) * 4;
            var fby = row.y + (Math.random() - .5) * pillH * .56;
            var dxk = fbx - fp[0], dyk = fby - fp[1], dk = Math.hypot(dxk, dyk) || 1;
            var nx = -dyk / dk, ny = dxk / dk, sgn = (fc % 2 ? -1 : 1);
            var mag = dk * (0.15 + Math.random() * 0.15);
            var isNode = fz > .88;
            push({ role: 1, ci: si, spr: isNode ? 'm' : 's',
                   d: isNode ? 13 + (fz - .88) * 46 : 5.5 + fz * 5,
                   a: .5 + fz * .4, z: fz, zm: zoneMul(fp[0], fp[1]),
                   ax: fp[0], ay: fp[1], bx: fbx, by: fby,
                   cpx: (fp[0] + fbx) / 2 + nx * mag * sgn, cpy: (fp[1] + fby) / 2 + ny * mag * sgn,
                   // 비행은 행 구조보다 0.20 먼저 출발(수집 단계) — 구조가 그려지기 전
                   // 입자들이 먼저 흘러들기 시작해, 스크럽 초반이 죽은 구간이 되지 않는다.
                   ry: row.y, s0: Math.max(.06, row.s0 - .20 + si * .02), s1: Math.min(.99, row.s1 + si * .02), node: isNode });
            fc++;
          }
        }
        // 신호 스파크: 행 완성 무렵 체크 도트 주변에 점화되는 시안 입자 3개
        for (var sp = 0; sp < 3; sp++) {
          var sq = chaosPt(), sz2 = .6 + Math.random() * .4;
          var sbx = row.checkX + 5 + Math.random() * 15, sby = row.y + (Math.random() - .5) * 12;
          var sdx = sbx - sq[0], sdy = sby - sq[1], sdk = Math.hypot(sdx, sdy) || 1;
          var smag = sdk * (0.15 + Math.random() * 0.15), ssgn = (sp % 2 ? -1 : 1);
          push({ role: 2, ci: 3, spr: 'm', d: 8 + sz2 * 6, a: .5 + sz2 * .35, z: sz2, zm: 1,
                 ax: sq[0], ay: sq[1], bx: sbx, by: sby,
                 cpx: (sq[0] + sbx) / 2 + (-sdy / sdk) * smag * ssgn,
                 cpy: (sq[1] + sby) / 2 + (sdx / sdk) * smag * ssgn,
                 ry: sby, s0: Math.min(.9, row.s0 + .18), s1: Math.min(.99, row.s1 + .08), node: false });
        }
      }
      // 연결선: 밝은 입자(z≥.55, 기록·신호)끼리 근접쌍 1회 계산 → 스크럽마다 O(N²) 방지.
      // 상위 130개만 남긴다 — 전량 잇는 순간 거미줄(구식 파티클 배경)로 되돌아간다.
      edges = [];
      var bright = [];
      for (var e1 = 0; e1 < P.length; e1++) if (P[e1].role > 0 && P[e1].z >= .55) bright.push(e1);
      for (var a = 0; a < bright.length; a++) for (var b2 = a + 1; b2 < bright.length; b2++) {
        var d = Math.hypot(P[bright[a]].ax - P[bright[b2]].ax, P[bright[a]].ay - P[bright[b2]].ay);
        // 카피 존에 걸친 선은 0.35로 감쇠 — 점은 zm으로 감광되는데 선만 남으면
        // 글자 위에 선 무늬만 뜬 거미줄이 된다(점·선 위계 일치).
        if (d < MD) edges.push([bright[a], bright[b2], (1 - d / MD) * ((P[bright[a]].zm < 1 || P[bright[b2]].zm < 1) ? .35 : 1)]);
      }
      edges.sort(function (u, v) { return v[2] - u[2]; });
      if (edges.length > 130) edges.length = 130;
    }

    // 착지 이징: smootherstep(6t⁵-15t⁴+10t³) — 양끝이 더 평평해 감속감이 큰 5차 곡선.
    function ease(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    // 파티클 lt에서의 2차 베지어 좌표(제어점 cpx/cpy). 본체·궤적이 같은 식을 공유한다.
    function posAt(q, lt) {
      var e = ease(clamp01(lt)), m = 1 - e, k = 2 * m * e;
      return { x: m * m * q.ax + k * q.cpx + e * e * q.bx, y: m * m * q.ay + k * q.cpy + e * e * q.by };
    }
    // 파티클별 조립 진행도(스태거)로 곡선 위치 보간 + 최종 정돈(settle)
    function setPos(p) {
      var st = clamp01((p - 0.9) / 0.1); st = st * st * (3 - 2 * st);   // p 0.9→1.0 정돈 램프
      for (var i = 0; i < P.length; i++) {
        var q = P[i];
        var lt = clamp01((p - q.s0) / (q.s1 - q.s0));
        q.lt = lt;
        var pt = posAt(q, lt);
        // settle: 기록(flyer)만 — 착지한 y를 자기 행 중심선으로 50% 추가 수렴(x는 유지)해
        // 완성 기하가 칼같이 정렬. ease(lt)를 곱해 아직 비행 중인 파티클은 왜곡하지 않는다.
        q.x = pt.x;
        q.y = (q.role === 1) ? pt.y + (q.ry - pt.y) * 0.5 * st * ease(lt) : pt.y;
      }
    }

    function drawLines(alpha) {
      if (alpha <= 0.01) return;
      ctx.lineWidth = .6;
      for (var e = 0; e < edges.length; e++) {
        var a = P[edges[e][0]], b = P[edges[e][1]];
        ctx.strokeStyle = 'rgba(148,164,255,' + (edges[e][2] * 0.16 * alpha) + ')';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    // 비행 궤적: 비행 중(0.08<lt<0.92)에만 현재·lt-0.05·lt-0.10 시점 위치를 잇는 테이퍼 선분 2개.
    // 기록(flyer) 중 근경(z≥.5)만 — 전 입자에 궤적을 주면 유성우가 아니라 소음이 된다.
    function drawTrails() {
      ctx.lineCap = 'round';
      for (var i = 0; i < P.length; i++) {
        var q = P[i], lt = q.lt;
        if (q.role !== 1 || q.z < .5) continue;
        if (lt <= 0.08 || lt >= 0.92) continue;
        var rgb = COL[q.ci];
        var a0 = posAt(q, lt), a1 = posAt(q, lt - 0.05), a2 = posAt(q, lt - 0.10);
        var tz = .55 + .45 * q.z;                                  // 원경 궤적일수록 옅게(심도 유지)
        ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (0.22 * tz) + ')';
        ctx.lineWidth = Math.max(0.6, q.d * 0.12);
        ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke();
        ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (0.10 * tz) + ')';
        ctx.lineWidth = Math.max(0.4, q.d * 0.08);
        ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(a2.x, a2.y); ctx.stroke();
      }
      ctx.lineCap = 'butt';
    }
    // 파티클 본체 — 'lighter' 합성: 겹치는 광원이 발광을 누적한다(스프라이트 주석 참조).
    // 역할별 알파 드라마: dust는 스크럽에 따라 물러나며 감광(1→0.45, 원경은 남긴다),
    // flyer는 착지할수록 점등(0.7→1.0), spark는 대기 중 0.12로 숨죽였다 착지하며 점화.
    // zm(카피 존 감광)은 비행이 진행되면 해제된다 — 존을 떠나는 입자가 다시 밝아진다.
    function drawParticles(p) {
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < P.length; i++) {
        var q = P[i], e = ease(q.lt), a = q.a * q.ka;
        if (q.role === 0) {
          // 원경 후퇴: 구조가 형성되는 p .15~.85 동안만 부드럽게 감광(1→0.5) —
          // 초반은 성운이 온전하고, 완성 화면에도 절반의 깊이가 남는다.
          var rf = clamp01((p - .15) / .7); rf = rf * rf * (3 - 2 * rf);
          a *= 1 - 0.5 * rf;
        }
        else if (q.role === 1) a *= 0.7 + 0.3 * e;
        else a *= Math.max(0.12, e);
        a *= q.zm + (1 - q.zm) * e;
        if (a <= 0.008) continue;
        ctx.globalAlpha = a > 1 ? 1 : a;
        ctx.drawImage(SPR[q.ci][q.spr], q.x - q.d / 2, q.y - q.d / 2, q.d, q.d);
        if (q.node) {
          // 착지 리플: node 파티클 착지 구간 lt 0.88→1.0에서 반지름 2→7px, 알파 0.3→0 링 1개.
          // p의 결정론적 함수라 스크럽 역방향에서도 자연스럽게 재생된다.
          var rl = (q.lt - 0.88) / 0.12;
          if (rl > 0 && rl < 1) {
            var rgb = COL[q.ci];
            ctx.globalAlpha = 1;
            ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (0.3 * (1 - rl)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(q.x, q.y, 2 + rl * 5, 0, 6.283); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    function drawGuides(p) {
      ctx.lineWidth = 1;
      // 완성 후(p>0.9) 가이드·헤어라인을 절반으로 감쇠 → 완성된 레저가 주인공이 되게 한다.
      var fade = 1 - 0.5 * clamp01((p - 0.9) / 0.1);
      // 세로 컬럼 가이드: 첫 행 조립(p .34)에 살짝 앞서 p .30부터 페이드인 —
      // 카피가 사라지기 전(p<.3)에는 아무 구조 스트로크도 화면에 없다.
      var gA = clamp01((p - .30) / .20) * 0.13 * fade;
      if (gA > 0.004) {
        ctx.strokeStyle = 'rgba(150,164,255,' + gA + ')';
        ctx.fillStyle = 'rgba(150,164,255,' + Math.min(1, gA * 1.6) + ')';
        for (var g = 0; g < guides.length; g++) {
          ctx.beginPath(); ctx.moveTo(guides[g], guideTop); ctx.lineTo(guides[g], guideBot); ctx.stroke();
          // 컬럼 캡: 가이드 양끝 6px 세리프 — 선이 아니라 표의 해부학으로 읽히게 한다
          ctx.fillRect(guides[g] - 3, guideTop - 1.5, 6, 1);
          ctx.fillRect(guides[g] - 3, guideBot + 0.5, 6, 1);
        }
      }
      // 행 헤어라인(레저 밑줄): 그 행 조립 시작 직전(s0-0.06)부터 페이드인, 알파≤0.08.
      // 표가 먼저 자리잡는 앤티시페이션 — 파티클 도착 전에 행의 자리를 예고한다.
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var ha = clamp01((p - (row.s0 - 0.06)) / 0.10) * 0.08 * fade;
        if (ha <= 0.004) continue;
        var last = row.pills[row.pills.length - 1], hy = row.y + row.pillH / 2 + 3;
        ctx.strokeStyle = 'rgba(150,164,255,' + ha + ')';
        ctx.beginPath(); ctx.moveTo(row.pills[0].x, hy); ctx.lineTo(last.x + last.w, hy); ctx.stroke();
      }
    }
    // 필 배경 + 행 완성 글로우(스크럽 중에만 그림 → rAF 불필요)
    function drawPills(p) {
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i], rp = clamp01((p - row.s0) / (row.s1 - row.s0));
        if (rp <= 0.001) continue;
        var ph = row.pillH, py = row.y - ph / 2, last = row.pills[row.pills.length - 1];
        var fillStart = row.pills[0].x, fillEnd = last.x + last.w;
        var sweepX = fillStart + (fillEnd - fillStart) * rp;        // 기록 헤드 x(좌→우)
        var gl = clamp01((rp - 0.72) / 0.28);                      // 완성 근처에서 램프인
        if (gl > 0.01) {                                           // 1회성 행 글로우
          ctx.save();
          ctx.globalAlpha = gl * 0.2;
          ctx.fillStyle = 'rgba(124,120,255,1)';
          rr(fillStart - 6, py - 4, fillEnd - fillStart + 12, ph + 8, (ph + 8) / 2);
          ctx.fill();
          ctx.restore();
        }
        for (var j = 0; j < row.pills.length; j++) {
          var pl = row.pills[j], col = SLOT[pl.ci];
          // 외곽선: 행 시작부터 옅게 자리잡고(0.25) 조립되며 선명해진다(→0.85)
          rr(pl.x, py, pl.w, ph, ph / 2);
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (0.25 + rp * 0.6) + ')';
          ctx.stroke();
          // 채움: 스윕 헤드 뒤로 좌→우로만 채워진다("기록이 써진다"). 채움 위 바이트 틱
          // (14px 간격 1px 세로선)이 빈 유리가 아니라 데이터 텍스처로 읽히게 한다.
          var fw = clamp01((sweepX - pl.x) / pl.w) * pl.w;
          if (fw > 0.5) {
            ctx.save();
            rr(pl.x, py, pl.w, ph, ph / 2); ctx.clip();
            ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.3)';
            ctx.fillRect(pl.x, py, fw, ph);
            ctx.fillStyle = 'rgba(255,255,255,0.09)';
            for (var tx = pl.x + 7; tx < pl.x + fw - 3; tx += 14) ctx.fillRect(tx, py + 2.5, 1, ph - 5);
            ctx.restore();
          }
        }
        // 기록 헤드 스윕: 수직 코어 라인 + 넓은 글로우 + 중심선 헤드 도트 — '지금 쓰는 중'의
        // 초점. 가이드색 세로 그라디언트, rp 0.1~0.9 구간에서만(양끝 페이드).
        var swWin = Math.min(1, (rp - 0.1) / 0.15, (0.9 - rp) / 0.15);
        if (swWin > 0.01) {
          var sy0 = py - 5, sy1 = py + ph + 5;
          var lg = ctx.createLinearGradient(0, sy0, 0, sy1);
          lg.addColorStop(0, 'rgba(170,185,255,0)');
          lg.addColorStop(0.5, 'rgba(170,185,255,' + (0.5 * swWin) + ')');
          lg.addColorStop(1, 'rgba(170,185,255,0)');
          ctx.fillStyle = lg;
          ctx.fillRect(sweepX - 1, sy0, 2, sy1 - sy0);
          var wg = ctx.createLinearGradient(0, sy0, 0, sy1);
          wg.addColorStop(0, 'rgba(170,185,255,0)');
          wg.addColorStop(0.5, 'rgba(170,185,255,' + (0.12 * swWin) + ')');
          wg.addColorStop(1, 'rgba(170,185,255,0)');
          ctx.fillStyle = wg;
          ctx.fillRect(sweepX - 4, sy0, 8, sy1 - sy0);
          ctx.fillStyle = 'rgba(220,228,255,' + (0.65 * swWin) + ')';
          ctx.beginPath(); ctx.arc(sweepX, row.y, 2, 0, 6.283); ctx.fill();
        }
      }
    }
    // 커밋 플래시: p 0.90→1.0에서 옅은 수평 광 밴드가 레저를 위→아래로 1회 훑는다 —
    // 정돈(settle)·체크 점등과 겹치는 "저장 완료"의 결정적 순간. p의 결정론 함수라
    // 역방향 스크럽에서도 자연스럽게 되감긴다. 구간 밖에서는 아무것도 그리지 않는다.
    function drawFlash(p) {
      var cf = clamp01((p - 0.9) / 0.1);
      if (cf <= 0.001 || cf >= 0.999) return;
      var e = cf * cf * (3 - 2 * cf);
      var y = (guideTop - 70) + (guideBot + 140 - guideTop) * e;
      var pk = Math.sin(cf * Math.PI);                             // 양끝 페이드
      var g2 = ctx.createLinearGradient(0, y - 55, 0, y + 55);
      g2.addColorStop(0, 'rgba(165,180,255,0)');
      g2.addColorStop(.5, 'rgba(165,180,255,' + (0.055 * pk) + ')');
      g2.addColorStop(1, 'rgba(165,180,255,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(ledgerX0 - 30, y - 55, ledgerX1 - ledgerX0 + 60, 110);
    }
    // 행머리 actor 도트 + 행 끝 시안 '신호' 도트(기록이 인사이트가 되는 지점) — 파티클 위 액센트
    function drawAccents(p) {
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i], rp = clamp01((p - row.s0) / (row.s1 - row.s0));
        if (rp <= 0.001) continue;
        ctx.save();
        ctx.globalAlpha = rp;
        // 글로우: 패널 .dot의 box-shadow 0 0 12px rgba(233,48,176,.8)에 대응.
        // canvas shadowBlur은 같은 수치를 줘도 CSS만큼 퍼지지 않아 방사형으로 직접 그린다
        // (파티클 스프라이트와 같은 방식).
        var hg = ctx.createRadialGradient(row.actorX, row.y, HEAD_R * .6, row.actorX, row.y, HEAD_R + 12);
        hg.addColorStop(0, 'rgba(233,48,176,.8)');
        hg.addColorStop(.34, 'rgba(233,48,176,.4)');
        hg.addColorStop(1, 'rgba(233,48,176,0)');
        ctx.fillStyle = hg;
        ctx.beginPath(); ctx.arc(row.actorX, row.y, HEAD_R + 12, 0, 6.283); ctx.fill();
        // 점 본체: 심볼 그라디언트
        ctx.fillStyle = headGrad;
        ctx.beginPath(); ctx.arc(row.actorX, row.y, HEAD_R, 0, 6.283); ctx.fill();
        ctx.restore();
        var cA = clamp01((rp - 0.7) / 0.3);                        // 행 완성 시 등장
        if (cA > 0.01) {
          // 팝: 알파 페이드가 아니라 반지름 1.3배→1.0배로 ease-out 수축하며 등장(cA의 함수).
          // 알파는 빠르게 불투명으로 올려 "찍힌다"는 인상을 준다. 글로우 추가 없음.
          var pop = 1 - (1 - cA) * (1 - cA), sc = 1.3 - 0.3 * pop, aa = Math.min(1, cA * 2.4);
          ctx.fillStyle = 'rgba(34,224,214,' + aa + ')';
          ctx.beginPath(); ctx.arc(row.checkX, row.y, 3.4 * sc, 0, 6.283); ctx.fill();
          ctx.strokeStyle = 'rgba(34,224,214,' + (aa * 0.5) + ')';
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(row.checkX, row.y, 5.8 * sc, 0, 6.283); ctx.stroke();
        }
      }
    }

    return {
      build: build,
      staticA: function () { setPos(0); ctx.clearRect(0, 0, W, H); drawLines(1); drawParticles(0); },
      intro: function () {                                          // bounded ≤ 2.6s, 1회
        win.cancelAnimationFrame(introId);
        var pts = P, off = [], dl = [];                             // 이 인트로가 애니메이트할 파티클 배열 스냅샷
        for (var i = 0; i < pts.length; i++) {
          var q = pts[i], ang = Math.random() * 6.283;
          // dust는 제자리 근처에서 응결(멀리서 날아오면 성운이 아니라 곤충떼가 된다),
          // 기록·신호는 화면 밖 링에서 쓸려 들어온다. 등장 지연은 원경(z 낮음)부터 —
          // 배경이 먼저 자리잡고 밝은 기록이 그 위로 늦게 휩쓸려 들어오는 층위.
          var dist = q.role === 0 ? Math.max(W, H) * .06 * (.4 + Math.random()) : Math.max(W, H) * (.4 + Math.random() * .45);
          off.push([q.ax + Math.cos(ang) * dist, q.ay + Math.sin(ang) * dist]);
          dl.push(q.z * 0.22 + Math.random() * 0.12);
        }
        var t0 = performance.now(), DUR = 2600;
        (function step(now) {
          if (P !== pts) return;                                    // 인트로 도중 build()로 P가 교체되면(리사이즈 등) 중단
          var t = Math.min(1, (now - t0) / DUR);
          for (var j = 0; j < pts.length; j++) {
            var q = pts[j], tt = clamp01((t - dl[j]) / (1 - dl[j]));
            var e = 1 - Math.pow(1 - tt, 3);
            q.x = off[j][0] + (q.ax - off[j][0]) * e;
            q.y = off[j][1] + (q.ay - off[j][1]) * e;
            q.ka = tt;                                              // 등장 페이드(스크럽 인계 시 1로 복원)
          }
          ctx.clearRect(0, 0, W, H);
          drawLines(1 - Math.pow(1 - t, 3));
          drawParticles(0);
          if (t < 1) introId = win.requestAnimationFrame(step);
        })(performance.now());
      },
      scrub: function (p) {                                         // 스크롤 중에만 호출(순수 draw)
        // 인트로 rAF는 매 프레임 clearRect 후 상태 A를 다시 그린다. 로드 직후 스크롤하면
        // 스크럽이 그린 레저를 그대로 덮어써 심볼이 안 보이므로, 스크럽이 시작되면 캔버스
        // 소유권을 넘겨받는다. 임계값이 필요하다 — 스크롤이 0이어도 핀 progress가 8e-7 같은
        // 부동소수점 잔여값으로 들어와, p>0으로 두면 로드 즉시 인트로가 죽는다.
        if (p > .001 && introId) {
          win.cancelAnimationFrame(introId); introId = null;
          for (var i = 0; i < P.length; i++) P[i].ka = 1;           // 인트로 등장 페이드 잔여값 제거
        }
        setPos(p);
        ctx.clearRect(0, 0, W, H);
        drawGuides(p);
        drawLines(Math.max(0, 1 - p / .55));                       // 무질서 연결선: 구조 시작 전(~.55)까지 잔류
        drawPills(p);                                              // 필 배경(스윕 좌→우 채움) + 완성 글로우
        drawTrails();                                              // 비행 궤적(필 위, 파티클 아래)
        drawParticles(p);                                          // 파티클이 필 안으로 착지 + 착지 리플
        drawAccents(p);                                            // actor · check 도트
        drawFlash(p);                                              // 커밋 플래시(p .9~1)
      }
    };
  })();

  if (canvas) {
    canvas.build();
    canvas.staticA();
    if (!REDUCE) canvas.intro();
  }

  /* ============================================================
   *  히어로 인트로 카피 리빌 (GSAP, 로드 1회)
   * ============================================================ */
  if (hasGSAP && !REDUCE && doc.querySelector('.hero h1 .line-inner')) {
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    // CSS 초기 translateY(110%)를 GSAP이 px 단위 y로 파싱하므로, y:0으로 중화 + yPercent로만 구동
    tl.fromTo('.hero h1 .line-inner', { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: .9, stagger: .1 }, 0)
      .from('.hero-copy .eyebrow', { y: 18, opacity: 0, duration: .7 }, .12)
      .from('.hero-lead', { y: 18, opacity: 0, duration: .7 }, '-=.52')
      .from('.hero-cta', { y: 18, opacity: 0, duration: .7 }, '-=.55')
      .from('.hero-trust', { y: 18, opacity: 0, duration: .7 }, '-=.55')
      .from('.capture', { y: 40, opacity: 0, duration: .9 }, .45); // 캡처 패널 진입(SPEC 씬1)
  }

  /* ============================================================
   *  데스크톱 전용 스크럽/핀 씬 (min-width:961px)
   * ============================================================ */
  if (hasGSAP && !REDUCE) {
    var mm = gsap.matchMedia();
    mm.add('(min-width: 961px)', function () {

      /* 씬2 — 히어로 Chaos→Structure 핀 스크럽 */
      if (doc.querySelector('.hero')) {
        var pinTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.hero', start: 'top top', end: '+=80%', scrub: .6, pin: true, anticipatePin: 1,
            onUpdate: function (self) { if (canvas) canvas.scrub(self.progress); },
            // ScrollTrigger.refresh()는 .hero-copy/.capture를 "핀 생성 시점의 기준 상태"로
            // 되돌린다. 핀은 인트로(.capture는 0.45s에 진입)보다 먼저 만들어지므로 그 기준이
            // '숨김'으로 박히고, 인트로는 1회성이라 되살려주지 않아 패널이 영구히 사라진다.
            // (리사이즈·폰트 스왑이 refresh를 부른다.) 스크럽 시작점에서는 정지 상태를 복원한다.
            onRefresh: function (self) {
              if (self.progress < .001) gsap.set('.hero-copy, .capture', { clearProps: 'opacity,transform' });
            }
          }
        });
        // 스페이서(무동작 트윈): 타임라인 총길이를 1로 고정한다. ScrollTrigger 스크럽은
        // 핀 progress를 "타임라인 총길이"에 재매핑하므로, 스페이서가 없으면 총길이가
        // 0.72(최장 트윈 끝)가 되어 아래 duration/position 값들이 핀 비율 그대로가 아니라
        // ÷0.72로 늘어져 재생된다(카피가 p .40이 아닌 .56까지 남고, 오버레이는 p 1.0에야
        // 완전 등장). 캔버스 scrub(p)는 raw progress를 쓰므로 이 어긋남은 캔버스-DOM
        // 시퀀싱을 깨뜨린다. 스페이서로 1:1 매핑을 보장한다.
        pinTl.to({}, { duration: 1 }, 0)
          .to('.hero-copy', { opacity: 0, y: -40, ease: 'none', duration: .4 }, 0)
          // 카피와 같은 속도(.4)로 사라진다. 이전엔 .6 동안(=.75까지) 걸려 카피가 사라진
          // 뒤에도 남고 오버레이 카피(.42~)와 겹쳐 잔상처럼 보였다.
          // 위치를 0이 아닌 .02로 두는 이유: 위치 0이면 핀 셋업 때(인트로 전, 패널이 아직
          // 숨김) 렌더되어 시작값을 0으로 기록해 "0 -> 0" 트윈이 된다. 시작 전인 트윈은
          // 렌더되지 않으므로, 작은 오프셋이 시작값을 인트로 완료 후(=보임)에 잡히게 한다.
          // 시각적으로는 카피와 동시에 사라진다(.02는 핀 구간의 3% 미만).
          .to('.capture', { opacity: 0, y: -60, scale: .96, ease: 'none', duration: .4 }, .02)
          .fromTo('.hero-overlay', { opacity: 0 }, { opacity: 1, ease: 'none', duration: .3 }, .42);
      }

      /* 씬3 — 파이프라인 점화 + 주행 도트 */
      var pw = doc.getElementById('pipeWrap'), line = doc.getElementById('pipeLine'), dot = doc.getElementById('pipeDot');
      var rail = pw ? pw.querySelector('.pipe-rail') : null;
      var steps = pw ? [].slice.call(pw.querySelectorAll('.step')) : [];
      var thr = [.18, .42, .66, .88];
      var pipeST = null;
      if (pw) {
        pw.classList.add('armed');
        pipeST = ScrollTrigger.create({
          trigger: pw, start: 'center center', end: '+=130%',
          pin: true, anticipatePin: 1, scrub: true,
          onUpdate: function (self) {
            var p = self.progress, rw = rail ? rail.clientWidth : 0;
            line.style.transform = 'scaleX(' + p + ')';
            dot.style.transform = 'translateX(' + (p * rw) + 'px)';
            for (var i = 0; i < steps.length; i++) steps[i].classList.toggle('lit', p >= thr[i]);
          }
        });
      }

      /* 씬4 — 제품 feature 프레임 패럴랙스(transform:y만) */
      var frameTweens = [];
      doc.querySelectorAll('.feature .frame').forEach(function (fr) {
        frameTweens.push(gsap.fromTo(fr, { y: 36 }, {
          y: -36, ease: 'none',
          scrollTrigger: { trigger: fr, start: 'top bottom', end: 'bottom top', scrub: true }
        }));
      });

      /* 씬7 — GROWA 메인 틸트 정착 + 이미지 패럴랙스 */
      var gm = doc.querySelector('.growa-main'), gEnter = null, gPar = null;
      if (gm) {
        gEnter = gsap.from(gm, {
          rotateX: 5, y: 48, opacity: 0, transformPerspective: 900, transformOrigin: 'center top',
          duration: .9, ease: 'power3.out', scrollTrigger: { trigger: gm, start: 'top 82%' }
        });
        var gimg = gm.querySelector('img');
        if (gimg) gPar = gsap.fromTo(gimg, { y: 22 }, {
          y: -22, ease: 'none', scrollTrigger: { trigger: '.growa', start: 'top bottom', end: 'bottom top', scrub: true }
        });
      }

      // 미디어 이탈(모바일 폭으로 리사이즈) 시 정리
      return function () {
        if (canvas) { canvas.build(); canvas.staticA(); }
        // 파이프라인 소등·유령 도트 제거: .armed 해제(도트 opacity 0) + line/dot 트랜스폼 리셋
        if (pw) pw.classList.remove('armed');
        if (line) line.style.transform = '';
        if (dot) dot.style.transform = '';
        steps.forEach(function (s) { s.classList.remove('lit'); });
        gsap.set('.hero-copy, .capture, .hero-overlay', { clearProps: 'all' });
        if (gm) gsap.set(gm, { clearProps: 'all' });
      };
    });

    /* 씬3 폴백 — 모바일 폭(≤960px): 컨텍스트 진입 시마다 IO로 스텝 (재)점등.
       데스크톱→모바일 크로싱 후에도 min-width 컨텍스트 cleanup이 소등한 스텝이 여기서 복원된다. */
    mm.add('(max-width: 960px)', function () {
      var pwm = doc.getElementById('pipeWrap');
      if (!pwm) return;
      var mSteps = [].slice.call(pwm.querySelectorAll('.step'));
      var mio = null;
      if (!IO) {
        mSteps.forEach(function (s) { s.classList.add('lit'); });
      } else {
        mio = new IntersectionObserver(function (ents) {
          ents.forEach(function (en) {
            if (en.isIntersecting) { mSteps.forEach(function (s) { s.classList.add('lit'); }); mio.disconnect(); }
          });
        }, { threshold: 0.3 });
        mio.observe(pwm);
      }
      // 모바일→데스크톱 크로싱 시: IO 해제 + 스텝 소등(데스크톱 스크럽이 progress로 다시 칠함)
      return function () {
        if (mio) mio.disconnect();
        mSteps.forEach(function (s) { s.classList.remove('lit'); });
      };
    });
  }

  /* ============================================================
   *  리빌 / 스태거 (단일 IntersectionObserver, 등장 후 unobserve)
   * ============================================================ */
  (function () {
    var all = [].slice.call(doc.querySelectorAll('.rv'));
    if (REDUCE || !IO) { all.forEach(function (e) { e.classList.add('in'); }); return; }
    var solo = all.filter(function (e) { return !e.closest('.stag'); });
    var groups = [].slice.call(doc.querySelectorAll('.stag'));
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        if (t.classList.contains('stag')) {
          [].slice.call(t.querySelectorAll('.rv')).forEach(function (c, i) {
            c.style.transitionDelay = (i * 0.07) + 's';
            c.classList.add('in');
          });
        } else {
          t.classList.add('in');
        }
        io.unobserve(t);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    solo.forEach(function (e) { io.observe(e); });
    groups.forEach(function (g) { io.observe(g); });
  })();

  /* 파이프라인: 스크럽이 없는 환경(reduced-motion / 무GSAP)에서는 진입 시 전부 점화.
     GSAP 모션 경로(데스크톱 스크럽 · 모바일 IO)는 위 gsap.matchMedia 컨텍스트가 전담하며,
     컨텍스트 진입마다 (재)실행돼 데스크톱↔모바일 크로싱 후 재점등을 보장한다. */
  (function () {
    var pw = doc.getElementById('pipeWrap');
    if (!pw) return;
    if (hasGSAP && !REDUCE) return;   // matchMedia(min-width:961px 스크럽 / max-width:960px IO)가 담당
    var steps = [].slice.call(pw.querySelectorAll('.step'));
    if (REDUCE || !IO) { steps.forEach(function (s) { s.classList.add('lit'); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { steps.forEach(function (s) { s.classList.add('lit'); }); io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(pw);
  })();

  /* ============================================================
   *  카운트업 (bounded rAF 1.2s, IO once)
   * ============================================================ */
  (function () {
    var nums = [].slice.call(doc.querySelectorAll('[data-count]'));
    if (!nums.length) return;
    function count(el) {
      var target = parseInt(el.getAttribute('data-count'), 10), t0 = performance.now(), DUR = 1200;
      (function step(now) {
        var p = Math.min(1, (now - t0) / DUR), e = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * e));
        if (p < 1) win.requestAnimationFrame(step);
      })(performance.now());
    }
    if (REDUCE || !IO) { nums.forEach(function (n) { n.textContent = n.getAttribute('data-count'); }); return; }
    // 마크업은 무JS 안전을 위해 실제 값을 담고 있으므로, 애니메이션 전에 0으로 초기화.
    // 카운트업 중 중간값이 낭독되지 않도록 애니메이션 요소는 aria-hidden 처리하고,
    // 최종값을 sr-only 텍스트로 병기해 스크린리더가 실제 수치를 읽게 한다.
    nums.forEach(function (n) {
      n.setAttribute('aria-hidden', 'true');
      var sr = doc.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = n.getAttribute('data-count');
      n.parentNode.insertBefore(sr, n.nextSibling);
      n.textContent = '0';
    });
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { count(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  })();

  /* ============================================================
   *  뉴스 아코디언 (1개만 열림, aria-expanded, height 트랜지션)
   * ============================================================ */
  (function () {
    var cards = [].slice.call(doc.querySelectorAll('.ncard'));
    function label(card, txt) { var m = card.querySelector('.nmore'); if (m && m.firstChild) m.firstChild.nodeValue = txt; }
    function close(card) {
      card.classList.remove('open');
      card.querySelector('.nhead').setAttribute('aria-expanded', 'false');
      card.querySelector('.npanel').style.height = '0px';
      label(card, '자세히 보기 ');
    }
    cards.forEach(function (card) {
      var btn = card.querySelector('.nhead'), panel = card.querySelector('.npanel');
      btn.addEventListener('click', function () {
        var isOpen = card.classList.contains('open');
        cards.forEach(function (c) { if (c !== card) close(c); });
        if (isOpen) { close(card); }
        else {
          card.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          panel.style.height = panel.querySelector('.npanel-inner').offsetHeight + 'px';
          label(card, '접기 ');
        }
      });
    });
  })();

  /* ============================================================
   *  히어로 오브: 뷰포트 밖이면 애니메이션 정지 (SPEC §0-4)
   * ============================================================ */
  (function () {
    var orbs = doc.querySelector('.orbs'), hero = doc.getElementById('hero');
    if (!hero || !IO) return;
    new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (orbs) orbs.classList.toggle('paused', !en.isIntersecting);
        hero.classList.toggle('out', !en.isIntersecting); // 도트/라이브 점멸도 함께 정지(SPEC §0-4)
      });
    }, { threshold: 0 }).observe(hero);
  })();

  /* ============================================================
   *  xAPI 캡처 티커 v2 — FLIP 트랙-슬라이드
   * ============================================================ */
  (function () {
    var track = doc.getElementById('streamTrack');
    if (!track) return;
    var GAP = 9;
    var actors = ['학습자', '수강생', 'A반 학생', '튜티'];
    var events = [
      { v: '완료함', o: ['도형 퀴즈', '단원평가', '확인 학습'], r: ['92점', '정답률 85%', '정답률 78%'] },
      { v: '제출함', o: ['서술형 과제', '프로젝트 보고서', '실습 과제'], r: ['제출 완료', '기한 내', '1회 수정'] },
      { v: '시청함', o: ['개념 강의 04', '해설 영상', '보충 강의'], r: ['진도 100%', '3분 12초', '2회 시청'] },
      { v: '풀이함', o: ['오답 노트', '연습 문제', '도형 퀴즈'], r: ['8 / 10', '정답', '정답률 78%'] },
      { v: '응답함', o: ['토론 활동', '실시간 퀴즈', '수업 설문'], r: ['참여', '답변 3', '정답'] }
    ];
    var insights = ['진단 · 도형 취약', '추천 · 유사 문항', '패턴 · 야간 학습', '개입 · 미제출 알림'];
    var rnd = function (a) { return a[Math.floor(Math.random() * a.length)]; };
    var chip = doc.getElementById('insChip'), sl = doc.getElementById('sparkline');
    var spark = [8, 10, 9, 12, 14, 13, 17, 16, 20, 19, 24];

    function makeRow() {
      var d = doc.createElement('div'); d.className = 'xrow'; var e = rnd(events);
      d.innerHTML = '<span class="dot"></span><span class="chip actor">' + rnd(actors) + '</span><span class="arrow">→</span>' +
        '<span class="chip verb">' + e.v + '</span><span class="arrow">→</span><span class="chip object">' + rnd(e.o) + '</span>' +
        '<span class="chip result">' + rnd(e.r) + '</span>';
      return d;
    }
    function drawSpark(arr) {
      var pts = arr.map(function (v, i) { return (i / (arr.length - 1) * 240).toFixed(1) + ',' + (34 - v / 26 * 30).toFixed(1); }).join(' ');
      if (sl) sl.setAttribute('points', pts);
    }
    var sparkId = null;
    function pushSpark() {
      var from = spark.slice();
      spark.push(6 + Math.random() * 20); if (spark.length > 11) spark.shift();
      var to = spark.slice();
      var t0 = performance.now(), DUR = 300;
      win.cancelAnimationFrame(sparkId);
      (function step(now) {                                          // bounded 300ms
        var t = Math.min(1, (now - t0) / DUR);
        drawSpark(to.map(function (v, i) { var f = (from[i] != null) ? from[i] : v; return f + (v - f) * t; }));
        if (t < 1) sparkId = win.requestAnimationFrame(step);
      })(performance.now());
    }
    function swapInsight() {
      if (!chip) return;
      chip.style.opacity = '0';
      setTimeout(function () { chip.textContent = rnd(insights); chip.style.opacity = '1'; }, 200);
    }

    var viewport = track.parentNode;                               // .stream-viewport
    function setViewportH() {                                       // JS 모션 모드에서만 고정 높이(5행)
      if (!viewport) return;
      var first = track.querySelector('.xrow');
      if (!first) return;
      var rh = first.offsetHeight;
      if (rh > 0) viewport.style.height = (5 * rh + 4 * GAP) + 'px';
    }

    var sliding = false;
    function pushRow() {
      track.appendChild(makeRow());
      if (track.children.length > 5 && !sliding) {
        sliding = true;
        var first = track.children[0];
        var rowH = first.offsetHeight + GAP;
        first.classList.add('leaving');
        track.style.transition = 'transform .55s cubic-bezier(.3,.7,.25,1)';
        track.style.transform = 'translateY(-' + rowH + 'px)';
        var done = false;
        var cleanup = function () {                                 // 1회만 실행(idempotent)
          if (done) return; done = true;
          track.removeEventListener('transitionend', onEnd);
          clearTimeout(fallback);
          if (first.parentNode === track) track.removeChild(first);
          track.style.transition = 'none';
          track.style.transform = 'none';
          void track.offsetHeight;                                  // 리플로우: 점프 없이 리셋
          win.requestAnimationFrame(function () { track.style.transition = ''; sliding = false; });
        };
        var onEnd = function (ev) {
          if (ev.propertyName !== 'transform') return;             // opacity transitionend 무시
          cleanup();
        };
        track.addEventListener('transitionend', onEnd);
        var fallback = setTimeout(cleanup, 650);                    // transitionend 미발생(예: 세션 중 reduced-motion) 대비 안전망
      }
      if (Math.random() < 0.55) swapInsight();
      pushSpark();
    }

    drawSpark(spark);
    if (REDUCE) return;                                             // 정적 5행 유지(타이머 미기동)

    // JS 모션 모드: 정적 행 제거 → 1행씩 쌓아올리기 시작
    while (track.firstChild) track.removeChild(track.firstChild);
    track.appendChild(makeRow());
    setViewportH();                                                 // 5행 높이를 미리 예약(레이아웃 점프 방지)

    var timer = null, visible = true, heroIn = true;
    // 필 단계(<5행): 700ms 간격 append / 정상 단계: 2400ms 슬라이드 — bounded setTimeout 체인
    function scheduleNext() {
      var delay = track.children.length < 5 ? 700 : 2400;
      timer = setTimeout(function () {
        timer = null;
        if (visible && heroIn) {
          if (track.children.length < 5) {                          // 필 단계: 슬라이드 없이 한 행 추가
            track.appendChild(makeRow());
            if (Math.random() < 0.55) swapInsight();
            pushSpark();
          } else {
            pushRow();                                              // 정상 단계: 6행째부터 슬라이드
          }
        }
        if (visible && heroIn) scheduleNext();
      }, delay);
    }
    function start() { if (!timer) scheduleNext(); }
    function stop() { if (timer) { clearTimeout(timer); timer = null; } }
    var hero = doc.getElementById('hero');
    if (IO && hero) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { heroIn = e.isIntersecting; if (heroIn && visible) start(); else stop(); });
      }, { threshold: 0 }).observe(hero);
    }
    doc.addEventListener('visibilitychange', function () { visible = !doc.hidden; if (visible && heroIn) start(); else stop(); });
    // 디바운스 resize: viewport 높이 재계산(상시 루프 아님)
    var vrt = null;
    win.addEventListener('resize', function () {
      clearTimeout(vrt);
      vrt = setTimeout(setViewportH, 200);
    }, { passive: true });
    start();
  })();

  /* ============================================================
   *  문의 폼 (Lambda · honeypot · 직접입력 토글)
   * ============================================================ */
  (function () {
    var f = doc.getElementById('cform');
    if (!f) return;
    var status = f.querySelector('[data-status]'), btn = f.querySelector('[data-submit]');
    var sel = f.querySelector('select[name="userTraffic"]'), etc = f.querySelector('[data-etc]');
    var etcIn = etc.querySelector('input'), etcLab = etc.querySelector('[data-etc-label]');
    var NEED = ['direct', 'etc'];
    // 엔드포인트는 site-config.js의 WS_CONFIG.CONTACT_API로 외부화. 미설정 배포에서도
    // 동작이 바뀌지 않도록 기존 URL을 폴백 기본값으로 유지한다.
    var ENDPOINT = (win.WS_CONFIG && win.WS_CONFIG.CONTACT_API) || 'https://v6pa5eyigfdkbuzm2rskahdf6y0xfsre.lambda-url.ap-northeast-2.on.aws';

    // 인라인 검증: novalidate 폼에서 제출 시 필수 항목을 일괄 검사해 각 필드 아래
    // 한국어 오류를 붙인다(네이티브 말풍선은 로케일 종속 + 첫 필드만 알림). required·
    // type=email 속성은 그대로 두고 el.validity로 판정 → 서버측 검증 계약 불변.
    var FIELD_MSG = {
      userName: '이름을 입력해 주세요.', userCompany: '소속을 입력해 주세요.',
      userEmail: '이메일을 입력해 주세요.', userTraffic: '유입 경로를 선택해 주세요.',
      userTrafficEtc: '유입 경로를 입력해 주세요.', userMemo: '문의사항을 입력해 주세요.',
      checkPrivacy: '개인정보 수집·이용에 동의해 주세요.'
    };
    var FIELDS = ['userName', 'userCompany', 'userEmail', 'userTraffic', 'userTrafficEtc', 'userMemo', 'checkPrivacy'];
    function msgFor(el) {
      if (el.validity.typeMismatch && el.type === 'email') return '이메일 형식을 확인해 주세요.';
      return FIELD_MSG[el.name] || '필수 항목입니다.';
    }
    function errHost(el) { return el.closest('label') || el.parentNode; }
    function showErr(el) {
      var host = errHost(el), e = host.querySelector('.field-err');
      if (!e) { e = doc.createElement('span'); e.className = 'field-err'; e.id = 'err-' + el.name; host.appendChild(e); }
      e.textContent = msgFor(el);
      el.setAttribute('aria-invalid', 'true');
      el.setAttribute('aria-describedby', e.id);
    }
    function clearErr(el) {
      var host = errHost(el), e = host.querySelector('.field-err');
      if (e) e.parentNode.removeChild(e);
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    }

    sel.addEventListener('change', function () {
      var n = NEED.indexOf(sel.value) >= 0;
      etc.hidden = !n; etcIn.required = n;
      if (n) { etcLab.textContent = sel.value === 'direct' ? '유입 경로 직접 입력 *' : '기타 내용 *'; etcIn.focus(); }
      else { etcIn.value = ''; clearErr(etcIn); }                   // 숨김 전환 시 잔여 오류 정리
    });
    function set(m, t) { status.textContent = m; status.className = 'status ' + (t || ''); }

    // 입력·변경 즉시 해당 필드 오류 해제
    ['userName', 'userCompany', 'userEmail', 'userTrafficEtc', 'userMemo'].forEach(function (n) {
      if (f[n]) f[n].addEventListener('input', function () { clearErr(f[n]); });
    });
    f.userTraffic.addEventListener('change', function () { clearErr(f.userTraffic); });
    f.checkPrivacy.addEventListener('change', function () { clearErr(f.checkPrivacy); });

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (f.website.value) return;                                  // honeypot
      var firstInvalid = null;
      FIELDS.forEach(function (n) {
        var el = f[n]; if (!el) return;
        if (el.willValidate && !el.checkValidity()) { showErr(el); if (!firstInvalid) firstInvalid = el; }
        else clearErr(el);
      });
      if (firstInvalid) { firstInvalid.focus(); return; }           // 첫 오류 필드로 포커스
      var name = f.userName.value.trim(), aff = f.userCompany.value.trim();
      var payload = {
        name: name, affiliation: aff, email: f.userEmail.value.trim(), inquiry: f.userMemo.value.trim(),
        userTraffic: f.userTraffic.value, subject: 'Contact Us 문의 접수: ' + name + '님 (소속: ' + aff + ')'
      };
      if (NEED.indexOf(f.userTraffic.value) >= 0 && f.userTrafficEtc.value.trim()) payload.userTrafficEtc = f.userTrafficEtc.value.trim();
      btn.disabled = true; set('전송 중입니다…');
      // 15초 타임아웃: 서버 무응답 시 abort → catch 폴백으로 넘어가 버튼이 영구 비활성되지 않는다.
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15000) })
        .then(function (r) {
          if (!r.ok) throw new Error('bad');
          set('문의가 접수되었습니다. 빠른 시일 내 답변드리겠습니다.', 'ok');
          f.reset(); etc.hidden = true; etcIn.required = false;
        })
        .catch(function () { set('전송에 실패했습니다. manager@wickedstorm.kr로 보내주세요.', 'err'); })
        .then(function () { btn.disabled = false; });
    });
  })();

  /* ============================================================
   *  영상 루프 재생 제어 (파이프라인/컴퍼니) — IO 25% + visibilitychange
   *  상시 rAF 없음: 재생 여부는 전부 IntersectionObserver/이벤트로 결정.
   * ============================================================ */
  (function () {
    var vids = [].slice.call(doc.querySelectorAll('.media-frame video'));
    if (!vids.length) return;
    if (REDUCE) {                                                   // reduced-motion: 자동재생 안 함, 수동 재생만
      vids.forEach(function (v) { v.setAttribute('controls', ''); });
      return;
    }
    if (!IO) return;
    function safePlay(v) {
      var p = v.play();
      if (p && p.catch) p.catch(function () {});                    // play() reject 무시(콘솔 에러 0 원칙)
    }
    var inView = new WeakMap();
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        var v = en.target;
        inView.set(v, en.isIntersecting);
        if (en.isIntersecting) { if (!doc.hidden) safePlay(v); }
        else v.pause();
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { io.observe(v); });
    doc.addEventListener('visibilitychange', function () {          // 탭 hidden 시 일괄 정지
      if (doc.hidden) { vids.forEach(function (v) { v.pause(); }); }
      else { vids.forEach(function (v) { if (inView.get(v)) safePlay(v); }); }
    });
  })();

  /* ============================================================
   *  디바운스 resize: 캔버스 재빌드 + 정적 재그리기 (상시 루프 아님)
   * ============================================================ */
  (function () {
    var rt = null;
    win.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (canvas) { canvas.build(); canvas.staticA(); }
        if (hasGSAP && !REDUCE) ScrollTrigger.refresh();
      }, 200);
    }, { passive: true });
  })();

})();
