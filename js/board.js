/* WICKED STORM — board.js
 * 소식 게시판 공용 렌더러.
 *  - news.html: 전체 목록 + 탭 필터 + 딥링크(#p=<id>) + 헤더/드로어 크롬
 *  - index.html: #news 그리드를 pinned 상위 3건으로 프로그레시브 재렌더
 * main.js/GSAP에 의존하지 않는다. 상시 rAF 루프 없음(드로어 open은 1회성 rAF).
 */
(function () {
  'use strict';

  var doc = document, win = window;
  var REDUCE = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IO = ('IntersectionObserver' in win);
  var POSTS_URL = './data/posts.json';
  var CAT_LABEL = { news: 'NEWS', story: 'STORY', insight: 'INSIGHT' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  /* 날짜 문자열 "YYYY.M.D" ~ "YYYY.MM.DD"를 숫자 튜플로 파싱해 비교(제로패딩 불필요).
   * 빈/비정상 날짜는 가장 작은 키를 받아 내림차순 정렬에서 항상 맨 뒤로 밀린다. */
  function parseDateKey(s) {
    var m = /^(\d{1,4})\.(\d{1,2})\.(\d{1,2})$/.exec(String(s == null ? '' : s).trim());
    if (!m) return -1;
    var y = +m[1], mo = +m[2], d = +m[3];
    if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return -1;
    return y * 10000 + mo * 100 + d;
  }
  function byDateDesc(a, b) {
    return parseDateKey(b.date) - parseDateKey(a.date);
  }

  /* externalUrl 렌더 가드: http/https 절대 URL만 링크 카드로 승격, 그 외는 텍스트 카드로 강등 */
  function safeExternalUrl(raw) {
    if (!raw) return null;
    try {
      var u = new URL(String(raw).trim());
      return (u.protocol === 'http:' || u.protocol === 'https:') ? raw : null;
    } catch (e) {
      return null;
    }
  }

  var uid = 0;
  function cardEl(post) {
    uid++;
    var pid = 'np' + uid, hid = 'nh' + uid;
    var tag = CAT_LABEL[post.category] || 'NEWS';
    var img = post.thumb
      ? '<div class="nimg"><img src="' + esc(post.thumb) + '" alt="' + esc(post.title) + '" loading="lazy"></div>'
      : '';
    var meta = '<div class="nbody"><div class="nmeta"><span class="ntag">' + esc(tag) + '</span> ' + esc(post.date) + '</div>';

    var extUrl = safeExternalUrl(post.externalUrl);
    var el;
    if (extUrl) {
      el = doc.createElement('a');
      el.className = 'ncard rv';
      el.href = extUrl;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
      el.setAttribute('aria-label', post.title + ' (새 창)');
      el.innerHTML = img + meta + '<h3>' + esc(post.title) + '</h3>' +
        '<span class="nmore">바로가기 <i>↗</i></span></div>';
    } else {
      el = doc.createElement('article');
      el.className = 'ncard rv';
      var body = post.body || ('<p>' + esc(post.summary || '') + '</p>');
      el.innerHTML =
        '<button class="nhead" aria-expanded="false" aria-controls="' + pid + '">' + img + meta +
        '<h3 id="' + hid + '">' + esc(post.title) + '</h3>' +
        '<span class="nmore">자세히 보기 <i>+</i></span></div></button>' +
        '<div class="npanel" id="' + pid + '" role="region" aria-labelledby="' + hid + '"><div class="npanel-inner">' + body + '</div></div>';
    }
    el.setAttribute('data-cat', post.category || 'news');
    el.setAttribute('data-id', post.id || '');
    return el;
  }

  /* news.html 게시판용 카드 — 아코디언 대신 상세 화면 링크(#p=<id>).
   * externalUrl 글은 기존과 동일하게 새 탭 링크로 강등. */
  function boardCardEl(post) {
    var tag = CAT_LABEL[post.category] || 'NEWS';
    var img = post.thumb
      ? '<div class="nimg"><img src="' + esc(post.thumb) + '" alt="' + esc(post.title) + '" loading="lazy"></div>'
      : '';
    var meta = '<div class="nbody"><div class="nmeta"><span class="ntag">' + esc(tag) + '</span> ' + esc(post.date) + '</div>';
    var el = doc.createElement('a');
    el.className = 'ncard rv';
    var extUrl = safeExternalUrl(post.externalUrl);
    if (extUrl) {
      el.href = extUrl;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
      el.setAttribute('aria-label', post.title + ' (새 창)');
      el.innerHTML = img + meta + '<h3>' + esc(post.title) + '</h3>' +
        '<span class="nmore">바로가기 <i>↗</i></span></div>';
    } else {
      el.href = '#p=' + encodeURIComponent(post.id || '');
      el.innerHTML = img + meta + '<h3>' + esc(post.title) + '</h3>' +
        '<span class="nmore">자세히 보기 <i>→</i></span></div>';
    }
    el.setAttribute('data-cat', post.category || 'news');
    el.setAttribute('data-id', post.id || '');
    return el;
  }

  /* 아코디언(한 번에 하나만 열림) — main.js는 개별 바인딩이라 동적 카드는 여기서 바인딩 */
  function bindAccordion(container) {
    var cards = [].slice.call(container.querySelectorAll('.ncard'));
    function close(card) {
      var b = card.querySelector('.nhead'), p = card.querySelector('.npanel');
      if (!b || !p) return;
      card.classList.remove('open');
      b.setAttribute('aria-expanded', 'false');
      p.style.height = '0px';
    }
    cards.forEach(function (card) {
      var btn = card.querySelector('.nhead'), panel = card.querySelector('.npanel');
      if (!btn || !panel) return; // 외부 링크 카드는 아코디언 아님
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
  }

  /* 최소 IO 리빌 (없거나 reduced-motion이면 즉시 표시) */
  function reveal(list) {
    var els = [].slice.call(list);
    if (REDUCE || !IO) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    els.forEach(function (e, i) { e.style.transitionDelay = ((i % 6) * 0.06) + 's'; io.observe(e); });
  }

  function fetchPosts() {
    return fetch(POSTS_URL, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function quiet(msg, err) {
    if (win.console && console.debug) console.debug('[board] ' + msg, err && err.message ? err.message : '');
  }

  /* ---------- index.html: pinned 상위 3건 재렌더 ---------- */
  function initIndexNews(grid) {
    fetchPosts().then(function (data) {
      var posts = (data && data.posts || [])
        .filter(function (p) { return p && p.pinned; })
        .sort(byDateDesc)
        .slice(0, 3);
      if (!posts.length) return; // 데이터 없으면 정적 3카드 유지
      var frag = doc.createDocumentFragment(), made = [];
      posts.forEach(function (p) { var el = cardEl(p); frag.appendChild(el); made.push(el); });
      grid.innerHTML = '';
      grid.appendChild(frag);
      bindAccordion(grid);
      reveal(made);
    }).catch(function (err) {
      quiet('feed fetch 실패 — 정적 카드 유지', err); // file:// 포함, 조용히
    });
  }

  /* ---------- news.html: 전체 게시판(목록 ↔ 상세 라우팅) ---------- */
  function initBoardPage(grid) {
    var tabs = [].slice.call(doc.querySelectorAll('.board-tab'));
    var statusEl = doc.getElementById('boardStatus');
    var listView = doc.getElementById('boardList');
    var detailView = doc.getElementById('boardDetail');
    var filter = 'all';
    var allPosts = [];
    var loaded = false;

    // 라우팅 상태
    var view = 'list';          // 'list' | 'detail'
    var listScrollY = 0;        // 목록 → 상세 진입 시점의 스크롤 위치(복귀 시 복원)
    var navFromCard = false;     // 카드 클릭으로 상세에 진입했는지(뒤로가기 판단용)
    var detailFromList = false;  // 현재 상세가 목록에서 진입한 것인지

    reveal(doc.querySelectorAll('.sec-head.rv, .board-tabs.rv'));

    function updateStatus(count) {
      if (!statusEl) return;
      var activeTab = null;
      tabs.forEach(function (t) { if (t.getAttribute('data-cat') === filter) activeTab = t; });
      var label = activeTab ? activeTab.textContent : '전체';
      statusEl.textContent = label + ' · ' + count + '건';
    }

    function renderGrid() {
      var list = (filter === 'all')
        ? allPosts
        : allPosts.filter(function (p) { return (p.category || 'news') === filter; });
      grid.innerHTML = '';
      updateStatus(list.length);
      if (!list.length) {
        var ph = doc.createElement('p');
        ph.className = 'board-empty';
        ph.textContent = '곧 소식을 전해드릴게요.';
        grid.appendChild(ph);
        return;
      }
      var frag = doc.createDocumentFragment(), made = [];
      list.forEach(function (p) { var el = boardCardEl(p); frag.appendChild(el); made.push(el); });
      grid.appendChild(frag);
      reveal(made);
    }

    function setFilter(cat) {
      filter = cat;
      tabs.forEach(function (t) {
        t.setAttribute('aria-pressed', t.getAttribute('data-cat') === cat ? 'true' : 'false');
      });
      renderGrid();
    }

    tabs.forEach(function (t) {
      t.addEventListener('click', function () { setFilter(t.getAttribute('data-cat')); });
    });

    // 내부 카드(#p=…) 클릭을 뒤로가기 판단용으로 표시 — 해시 변경 자체는 <a> 기본 동작이 처리
    grid.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a.ncard') : null;
      if (a && /#p=/.test(a.getAttribute('href') || '')) navFromCard = true;
    });

    function findById(id) {
      for (var i = 0; i < allPosts.length; i++) if ((allPosts[i].id || '') === id) return allPosts[i];
      return null;
    }

    function renderDetail(post) {
      var tag = CAT_LABEL[post.category] || 'NEWS';
      var thumb = post.thumb
        ? '<div class="detail-thumb"><img src="' + esc(post.thumb) + '" alt="' + esc(post.title) + '"></div>'
        : '';
      var body = post.body || ('<p>' + esc(post.summary || '') + '</p>');
      detailView.innerHTML =
        '<div class="detail-eyebrow"><span class="ntag">' + esc(tag) + '</span> ' + esc(post.date) + '</div>' +
        '<h2 tabindex="-1">' + esc(post.title) + '</h2>' +
        thumb +
        '<div class="detail-body">' + body + '</div>' +
        '<p class="detail-back"><a href="#" class="detail-back-link">← 목록으로</a></p>';
      var back = detailView.querySelector('.detail-back-link');
      if (back) back.addEventListener('click', function (e) {
        e.preventDefault();
        if (detailFromList) win.history.back();   // 목록에서 왔으면 히스토리 되감기(스크롤·탭 유지)
        else win.location.hash = '';              // 딥링크/직접 진입이면 해시만 비워 목록 표시
      });
      var h2 = detailView.querySelector('h2');
      if (h2) { try { h2.focus({ preventScroll: true }); } catch (_) { h2.focus(); } }
    }

    function showDetail(post) {
      if (view === 'list') { listScrollY = win.scrollY || win.pageYOffset || 0; detailFromList = navFromCard; }
      navFromCard = false;
      view = 'detail';
      if (listView) listView.hidden = true;
      renderDetail(post);
      if (detailView) detailView.hidden = false;
      win.scrollTo(0, 0);
    }

    function showList() {
      var wasDetail = (view === 'detail');
      view = 'list';
      if (detailView) { detailView.hidden = true; detailView.innerHTML = ''; }
      if (listView) listView.hidden = false;
      if (wasDetail) win.scrollTo(0, listScrollY);
    }

    function route() {
      if (!loaded) return; // 데이터 준비 전에는 렌더 후 재호출됨
      var m = /#p=([^&]+)/.exec(win.location.hash || '');
      // decodeURIComponent는 `#p=100%`·`#p=%`처럼 깨진 시퀀스에서 URIError를 던진다.
      // hashchange 경로도 이 함수를 타므로 여기서 가드해 실패 시 목록으로 폴백한다.
      var id = null;
      if (m) { try { id = decodeURIComponent(m[1]); } catch (e) { id = null; } }
      var post = id ? findById(id) : null;
      if (post && !safeExternalUrl(post.externalUrl)) showDetail(post);
      else showList();
    }

    win.addEventListener('hashchange', route);

    function boot(posts, viaFallback, err) {
      allPosts = posts.slice().sort(byDateDesc);
      loaded = true;
      renderGrid();
      route();
      if (viaFallback) quiet('board fetch 실패 — 정적 스냅샷으로 렌더', err);
    }

    // .then(onFulfilled, onRejected) 2인자 형태: onRejected는 fetch 거부만 잡는다.
    // .catch였다면 onFulfilled 안의 boot()/route() 예외까지 fetch 실패로 오인해
    // 정적 스냅샷으로 강등 + 거짓 로그를 남긴다. boot 예외는 여기서 삼키지 않는다.
    fetchPosts().then(function (data) {
      boot((data && data.posts) || [], false);
    }, function (err) {
      // fetch 실패(file:// 열람·오프라인 등): news.html 인라인 정적 스냅샷이 있으면 정상 렌더
      var fb = win.WS_POSTS_FALLBACK;
      if (fb && fb.posts && fb.posts.length) { boot(fb.posts, true, err); return; }
      grid.innerHTML = '<p class="board-empty">소식을 불러오지 못했어요. ' +
        '<a href="./index.html#news">메인 페이지</a>에서 확인해 주세요.</p>';
      if (statusEl) statusEl.textContent = '소식을 불러오지 못했습니다.';
      quiet('board load 실패', err);
    });
  }

  /* ---------- news.html 헤더/드로어 크롬 (main.js 미로드 대비) ---------- */
  function initChrome() {
    var root = doc.documentElement;

    var hdr = doc.getElementById('hdr');
    if (hdr) {
      var lastY = win.scrollY || 0;
      win.addEventListener('scroll', function () {
        var y = win.scrollY || 0;
        hdr.classList.toggle('scrolled', y > 20);
        if (!root.classList.contains('nav-open')) {
          if (y > lastY && y > 220) hdr.classList.add('hide');
          else hdr.classList.remove('hide');
        }
        lastY = y;
      }, { passive: true });
    }

    var btn = doc.getElementById('menuBtn'), drawer = doc.getElementById('drawer');
    if (btn && drawer) {
      var open = false, hideTimer = null;
      var set = function (next) {
        open = next;
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
        if (open) {
          clearTimeout(hideTimer);
          drawer.hidden = false;
          win.requestAnimationFrame(function () { drawer.classList.add('open'); }); // 1회성
          root.classList.add('nav-open');
          doc.body.style.overflow = 'hidden';
        } else {
          drawer.classList.remove('open');
          root.classList.remove('nav-open');
          doc.body.style.overflow = '';
          hideTimer = setTimeout(function () { if (!open) drawer.hidden = true; }, 420);
        }
      };
      btn.addEventListener('click', function () { set(!open); });
      drawer.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { set(false); });
      });
      win.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) set(false); });
    }

    var bar = doc.querySelector('.progress');
    if (bar) {
      var onScroll = function () {
        var h = doc.documentElement.scrollHeight - win.innerHeight;
        bar.style.transform = 'scaleX(' + (h > 0 ? (win.scrollY / h) : 0) + ')';
      };
      win.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  /* ---------- 페이지 분기 ---------- */
  var boardGrid = doc.getElementById('boardGrid');
  if (boardGrid) {
    initChrome();
    initBoardPage(boardGrid);
  } else {
    var grid = doc.querySelector('#news .news-grid');
    if (grid) initIndexNews(grid);
  }
})();
