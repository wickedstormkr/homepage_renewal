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
    function set(next) {
      open = next;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      if (open) {
        clearTimeout(hideTimer);
        drawer.hidden = false;
        win.requestAnimationFrame(function () { drawer.classList.add('open'); });
        root.classList.add('nav-open');
        doc.body.style.overflow = 'hidden';
        if (lenis) lenis.stop();
      } else {
        drawer.classList.remove('open');
        root.classList.remove('nav-open');
        doc.body.style.overflow = '';
        if (lenis) lenis.start();
        hideTimer = setTimeout(function () { if (!open) drawer.hidden = true; }, 420);
      }
    }
    btn.addEventListener('click', function () { set(!open); });
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    win.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) set(false); });
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
    var COL = [[34, 224, 214], [124, 77, 255], [233, 48, 176]];
    var BLUE = [47, 124, 255], PURPLE = [124, 77, 255], MAGENTA = [233, 48, 176], CYAN = [34, 224, 214];
    var sprites = COL.map(function (rgb) {
      var s = doc.createElement('canvas'); s.width = s.height = 40;
      var q = s.getContext('2d'); var g = q.createRadialGradient(20, 20, 0, 20, 20, 20);
      g.addColorStop(0, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',.95)');
      g.addColorStop(.4, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',.45)');
      g.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
      q.fillStyle = g; q.fillRect(0, 0, 40, 40); return s;
    });
    var W = 0, H = 0, DPR = 1, P = [], edges = [], rows = [], guides = [];
    var guideTop = 0, guideBot = 0, introId = null;
    var MD = 170, ROWS = 6;

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
      var PC = [PURPLE, MAGENTA, BLUE];                             // verb · object · (extra)
      var px0 = ox + 22, px1 = ox + gw - 26;                        // 필 영역(오른쪽 끝은 체크 도트 여백)
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
      // 3개의 희미한 세로 컬럼 가이드(표 구조 암시)
      guides = [];
      for (var g = 0; g < 3; g++) guides.push(px0 + (px1 - px0) * (0.28 + g * 0.30));
      guideTop = oy + rowGap * 0.12; guideBot = oy + gh - rowGap * 0.12;

      // 파티클: 상태 A(무질서) → 필 내부의 목표 좌표(상태 B)
      var N = Math.min(46, Math.round(W * H / 24000));
      P = [];
      for (var k = 0; k < N; k++) {
        var ax = Math.random() * W, ay = Math.random() * H;        // 상태 A: 무질서
        var row = rows[k % ROWS];                                  // 6행에 고르게 분배
        var pill = row.pills[Math.floor(k / ROWS) % 3];
        var bx = pill.x + (0.12 + Math.random() * 0.76) * pill.w;  // 상태 B: 필 내부 랜덤 좌표
        var by = row.y + (Math.random() - 0.5) * pillH * 0.7;
        P.push({ ax: ax, ay: ay, bx: bx, by: by, x: ax, y: ay, r: Math.random() * 1.5 + .9, ci: k % 3, node: Math.random() < .3, s0: row.s0, s1: row.s1 });
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
        var ph = row.pillH, py = row.y - ph / 2, last = row.pills[2];
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
    // actor 도트 + 저장됨(check) 시안 도트 — 파티클 위에 얹는 액센트
    function drawAccents(p) {
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i], rp = clamp01((p - row.s0) / (row.s1 - row.s0));
        if (rp <= 0.001) continue;
        ctx.fillStyle = 'rgba(47,124,255,' + rp + ')';
        ctx.beginPath(); ctx.arc(row.actorX, row.y, 3.2, 0, 6.283); ctx.fill();
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
            trigger: '.hero', start: 'top top', end: '+=55%', scrub: .6, pin: true, anticipatePin: 1,
            onUpdate: function (self) { if (canvas) canvas.scrub(self.progress); }
          }
        });
        pinTl.to('.hero-copy', { opacity: 0, y: -40, ease: 'none', duration: .4 }, 0)
          .to('.capture', { opacity: 0, y: -60, scale: .96, ease: 'none', duration: .6 }, .15)
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
          trigger: pw, start: 'top 78%', end: 'bottom 24%', scrub: true,
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
    // 마크업은 무JS 안전을 위해 실제 값을 담고 있으므로, 애니메이션 전에 0으로 초기화
    nums.forEach(function (n) { n.textContent = '0'; });
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
    function close(card) {
      card.classList.remove('open');
      card.querySelector('.nhead').setAttribute('aria-expanded', 'false');
      card.querySelector('.npanel').style.height = '0px';
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
    function visibleRows() {
      if (win.innerWidth <= 560) return 2;
      if (win.innerWidth <= 960) return 3;
      return 5;
    }
    function setViewportH() {                                       // 화면 폭에 맞춰 2/3/5행 높이 예약
      if (!viewport) return;
      var first = track.querySelector('.xrow');
      if (!first) return;
      var rh = first.offsetHeight;
      var rows = visibleRows();
      if (rh > 0) viewport.style.height = (rows * rh + (rows - 1) * GAP) + 'px';
    }

    var sliding = false;
    function pushRow() {
      track.appendChild(makeRow());
      if (track.children.length > visibleRows() && !sliding) {
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
    if (REDUCE) return;                                             // 정적 행 유지(모바일은 CSS로 2/3행 노출)

    // JS 모션 모드: 정적 행 제거 → 1행씩 쌓아올리기 시작
    while (track.firstChild) track.removeChild(track.firstChild);
    track.appendChild(makeRow());
    setViewportH();                                                 // 반응형 행 높이를 미리 예약(레이아웃 점프 방지)

    var timer = null, visible = true, heroIn = true;
    // 필 단계(<노출행): 700ms 간격 append / 정상 단계: 2400ms 슬라이드
    function scheduleNext() {
      var rowLimit = visibleRows();
      var delay = track.children.length < rowLimit ? 700 : 2400;
      timer = setTimeout(function () {
        timer = null;
        if (visible && heroIn) {
          if (track.children.length < visibleRows()) {              // 필 단계: 슬라이드 없이 한 행 추가
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
    // 디바운스 resize: 행 수 정리 + viewport 높이 재계산(상시 루프 아님)
    var vrt = null;
    win.addEventListener('resize', function () {
      clearTimeout(vrt);
      vrt = setTimeout(function () {
        var limit = visibleRows();
        while (!sliding && track.children.length > limit) track.removeChild(track.lastElementChild);
        setViewportH();
      }, 200);
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
    var ENDPOINT = 'https://v6pa5eyigfdkbuzm2rskahdf6y0xfsre.lambda-url.ap-northeast-2.on.aws';

    sel.addEventListener('change', function () {
      var n = NEED.indexOf(sel.value) >= 0;
      etc.hidden = !n; etcIn.required = n;
      if (n) { etcLab.textContent = sel.value === 'direct' ? '유입 경로 직접 입력 *' : '기타 내용 *'; etcIn.focus(); }
      else etcIn.value = '';
    });
    function set(m, t) { status.textContent = m; status.className = 'status ' + (t || ''); }

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (f.website.value) return;                                  // honeypot
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var name = f.userName.value.trim(), aff = f.userCompany.value.trim();
      var payload = {
        name: name, affiliation: aff, email: f.userEmail.value.trim(), inquiry: f.userMemo.value.trim(),
        userTraffic: f.userTraffic.value, subject: 'Contact Us 문의 접수: ' + name + '님 (소속: ' + aff + ')'
      };
      if (NEED.indexOf(f.userTraffic.value) >= 0 && f.userTrafficEtc.value.trim()) payload.userTrafficEtc = f.userTrafficEtc.value.trim();
      btn.disabled = true; set('전송 중입니다…');
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
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
