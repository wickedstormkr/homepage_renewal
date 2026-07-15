/* WICKED STORM 리뉴얼 — main.js
 * 성능 헌법(SPEC §0): 상시 rAF 루프는 Lenis 하나뿐.
 * 그 외 rAF는 전부 bounded(시간 제한: 인트로 2.2s / 스파크 300ms / 카운트업 1.2s).
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
   *  히어로 캔버스: 상태 A(무질서 별자리) → 상태 B(구조화된 기록 레저)
   *  흩어진 파티클이 "정돈된 기록 행(record row)"으로 저장되는 그림.
   *  지오메트리는 build()에서 사전 계산, scrub(p)는 순수 draw(rAF 없음).
   * ============================================================ */
  var canvas = (function () {
    var c = doc.getElementById('field');
    if (!c) return null;
    var ctx = c.getContext('2d');
    var BLUE = [47, 124, 255], PURPLE = [124, 77, 255], MAGENTA = [233, 48, 176];
    // 기록 슬롯 = 심볼 3색(파랑·보라·마젠타). 캡처 패널의 .chip.actor/.verb/.object와
    // 같은 순서·같은 색이라 한 행이 곧 우리 심볼로 읽힌다.
    // CYAN은 슬롯이 아니다 — 행 끝 점으로만 쓰는 '신호'(기록이 인사이트가 되는 지점).
    // 파티클은 자기가 착지할 슬롯의 색을 가지므로, 정돈될수록 색이 컬럼별로 분류된다.
    var SLOT = [BLUE, PURPLE, MAGENTA];
    var COL = SLOT;
    var NSLOT = SLOT.length;
    var sprites = COL.map(function (rgb) {
      var s = doc.createElement('canvas'); s.width = s.height = 40;
      var q = s.getContext('2d'); var g = q.createRadialGradient(20, 20, 0, 20, 20, 20);
      g.addColorStop(0, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',.95)');
      g.addColorStop(.4, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',.45)');
      g.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
      q.fillStyle = g; q.fillRect(0, 0, 40, 40); return s;
    });
    var W = 0, H = 0, DPR = 1, P = [], edges = [], rows = [], guides = [];
    var guideTop = 0, guideBot = 0, introId = null, headGrad = null;
    var MD = 170, ROWS = 6;
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

      // 기록 레저 영역: 가로 ~56%, 세로 ~48% 중앙 정렬
      var gw = W * 0.56, gh = H * 0.48, ox = (W - gw) / 2, oy = (H - gh) / 2;
      var rowGap = gh / ROWS, GAP = 9;
      var pillH = Math.max(7, Math.min(rowGap * 0.5, 13));
      var PC = SLOT;                                                // actor · verb · object
      var px0 = ox + 22, px1 = ox + gw - 26;                        // 필 영역(오른쪽 끝은 신호 도트 여백)
      rows = [];
      for (var i = 0; i < ROWS; i++) {
        var rowY = oy + (i + 0.5) * rowGap;
        var avail = px1 - px0 - 2 * GAP;
        var f0 = 0.18 + Math.random() * 0.10, f1 = 0.30 + Math.random() * 0.14; // 행마다 결정론적 폭
        var w0 = avail * f0, w1 = avail * f1, w2 = avail - w0 - w1;
        var x1p = px0 + w0 + GAP, x2p = x1p + w1 + GAP;
        var pills = [
          { x: px0, w: w0, ci: PC[0] },
          { x: x1p, w: w1, ci: PC[1] },
          { x: x2p, w: w2, ci: PC[2] }
        ];
        // 행 스태거: 행 i는 p ∈ [0.12+i*0.11, 0.42+i*0.11]에서 조립
        var s0 = 0.12 + i * 0.11, s1 = 0.42 + i * 0.11;
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

      // 파티클: 상태 A(무질서) → 필 내부의 목표 좌표(상태 B)
      var N = Math.min(46, Math.round(W * H / 24000));
      P = [];
      for (var k = 0; k < N; k++) {
        var ax = Math.random() * W, ay = Math.random() * H;        // 상태 A: 무질서
        var row = rows[k % ROWS];                                  // 6행에 고르게 분배
        var si = Math.floor(k / ROWS) % NSLOT;                     // 착지할 슬롯(actor·verb·object·extension)
        var pill = row.pills[si];
        var bx = pill.x + (0.12 + Math.random() * 0.76) * pill.w;  // 상태 B: 필 내부 랜덤 좌표
        var by = row.y + (Math.random() - 0.5) * pillH * 0.7;
        // 색은 슬롯에서 온다 — 이전엔 ci를 k%3으로 따로 매겨 착지 슬롯과 색이 어긋났다.
        P.push({ ax: ax, ay: ay, bx: bx, by: by, x: ax, y: ay, r: Math.random() * 1.5 + .9, ci: si, node: Math.random() < .3, s0: row.s0, s1: row.s1 });
      }
      // 연결선은 상태 A 근접쌍으로 1회 계산 → 스크럽마다 O(N²) 재계산 방지
      edges = [];
      for (var a = 0; a < P.length; a++) for (var b = a + 1; b < P.length; b++) {
        var d = Math.hypot(P[a].ax - P[b].ax, P[a].ay - P[b].ay);
        if (d < MD) edges.push([a, b, 1 - d / MD]);
      }
    }

    // 파티클별 조립 진행도(스태거)로 위치 보간
    function setPos(p) {
      for (var i = 0; i < P.length; i++) {
        var q = P[i];
        var lt = clamp01((p - q.s0) / (q.s1 - q.s0));
        var e = lt * lt * (3 - 2 * lt);                            // smoothstep
        q.x = q.ax + (q.bx - q.ax) * e; q.y = q.ay + (q.by - q.ay) * e;
      }
    }

    function drawLines(alpha) {
      if (alpha <= 0.01) return;
      ctx.lineWidth = .7;
      for (var e = 0; e < edges.length; e++) {
        var a = P[edges[e][0]], b = P[edges[e][1]];
        ctx.strokeStyle = 'rgba(148,164,255,' + (edges[e][2] * 0.22 * alpha) + ')';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    function drawDots() {
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (p.node) ctx.drawImage(sprites[p.ci], p.x - 9, p.y - 9, 18, 18);
        else { var rgb = COL[p.ci]; ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',.6)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
      }
    }
    function drawGuides(p) {
      var gA = Math.min(1, p * 1.3) * 0.13;
      if (gA <= 0.004) return;
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(150,164,255,' + gA + ')';
      for (var g = 0; g < guides.length; g++) {
        ctx.beginPath(); ctx.moveTo(guides[g], guideTop); ctx.lineTo(guides[g], guideBot); ctx.stroke();
      }
    }
    // 필 배경 + 행 완성 글로우(스크럽 중에만 그림 → rAF 불필요)
    function drawPills(p) {
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i], rp = clamp01((p - row.s0) / (row.s1 - row.s0));
        if (rp <= 0.001) continue;
        var ph = row.pillH, py = row.y - ph / 2, last = row.pills[row.pills.length - 1];
        var gl = clamp01((rp - 0.72) / 0.28);                      // 완성 근처에서 램프인
        if (gl > 0.01) {                                           // 1회성 행 글로우
          ctx.save();
          ctx.globalAlpha = gl * 0.16;
          ctx.fillStyle = 'rgba(124,120,255,1)';
          rr(row.pills[0].x - 6, py - 4, (last.x + last.w) - row.pills[0].x + 12, ph + 8, (ph + 8) / 2);
          ctx.fill();
          ctx.restore();
        }
        for (var j = 0; j < row.pills.length; j++) {
          var pl = row.pills[j], col = pl.ci;
          rr(pl.x, py, pl.w, ph, ph / 2);
          ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (rp * 0.2) + ')';
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (rp * 0.6) + ')';
          ctx.stroke();
        }
      }
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
          ctx.fillStyle = 'rgba(34,224,214,' + cA + ')';
          ctx.beginPath(); ctx.arc(row.checkX, row.y, 3.4, 0, 6.283); ctx.fill();
          ctx.strokeStyle = 'rgba(34,224,214,' + (cA * 0.5) + ')';
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(row.checkX, row.y, 5.8, 0, 6.283); ctx.stroke();
        }
      }
    }

    return {
      build: build,
      staticA: function () { setPos(0); ctx.clearRect(0, 0, W, H); drawLines(1); drawDots(); },
      intro: function () {                                          // bounded ≤ 2.2s, 1회
        win.cancelAnimationFrame(introId);
        var pts = P, off = [];                                      // 이 인트로가 애니메이트할 파티클 배열 스냅샷
        for (var i = 0; i < pts.length; i++) {
          var ang = Math.random() * 6.283, dist = Math.max(W, H) * (.4 + Math.random() * .45);
          off.push([pts[i].ax + Math.cos(ang) * dist, pts[i].ay + Math.sin(ang) * dist]);
        }
        var t0 = performance.now(), DUR = 2200;
        (function step(now) {
          if (P !== pts) return;                                    // 인트로 도중 build()로 P가 교체되면(리사이즈 등) 중단
          var t = Math.min(1, (now - t0) / DUR), e = 1 - Math.pow(1 - t, 3);
          for (var j = 0; j < pts.length; j++) { pts[j].x = off[j][0] + (pts[j].ax - off[j][0]) * e; pts[j].y = off[j][1] + (pts[j].ay - off[j][1]) * e; }
          ctx.clearRect(0, 0, W, H); drawLines(e); drawDots();
          if (t < 1) introId = win.requestAnimationFrame(step);
        })(performance.now());
      },
      scrub: function (p) {                                         // 스크롤 중에만 호출(순수 draw)
        // 인트로 rAF는 매 프레임 clearRect 후 상태 A를 다시 그린다. 로드 2.2초 안에
        // 스크롤하면 스크럽이 그린 레저를 그대로 덮어써 심볼이 아예 안 보였다.
        // 스크럽이 시작되면 캔버스 소유권을 넘겨받는다. 임계값이 필요하다 — 스크롤이 0이어도
        // 핀 progress가 8e-7 같은 부동소수점 잔여값으로 들어와, p>0으로 두면 로드 즉시 인트로가 죽는다.
        if (p > .001 && introId) { win.cancelAnimationFrame(introId); introId = null; }
        setPos(p);
        ctx.clearRect(0, 0, W, H);
        drawGuides(p);
        drawLines(Math.max(0, 1 - p * 1.5));                       // 무질서 연결선 페이드아웃
        drawPills(p);                                              // 필 배경 + 완성 글로우
        drawDots();                                                // 파티클이 필 안으로 착지
        drawAccents(p);                                            // actor · check 도트
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
        pinTl.to('.hero-copy', { opacity: 0, y: -40, ease: 'none', duration: .4 }, 0)
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
