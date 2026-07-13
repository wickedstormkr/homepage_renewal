/* WICKED STORM — board.js
 * 소식 게시판 공용 렌더러.
 *  - news.html: 전체 목록 + 탭 필터 + 레거시 #p=<id> 정적 URL 이동 + 헤더/드로어 크롬
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

  function articleUrl(post) {
    var id = String(post && post.id || '');
    return /^[a-z0-9][a-z0-9-]{0,99}$/.test(id) ? './news/' + id + '.html' : './news.html';
  }

  function cardEl(post) {
    var tag = CAT_LABEL[post.category] || 'NEWS';
    var img = post.thumb
      ? '<div class="nimg"><img src="' + esc(post.thumb) + '" alt="" loading="lazy"></div>'
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
      el = doc.createElement('a');
      el.className = 'ncard rv';
      el.href = articleUrl(post);
      el.innerHTML = img + meta + '<h3>' + esc(post.title) + '</h3>' +
        '<span class="nmore">자세히 보기 <i>→</i></span></div>';
    }
    el.setAttribute('data-cat', post.category || 'news');
    el.setAttribute('data-id', post.id || '');
    return el;
  }

  /* news.html 게시판용 카드 — 내부 글은 검색 가능한 정적 HTML로 연결.
   * externalUrl 글은 기존과 동일하게 새 탭 링크로 강등. */
  function boardCardEl(post) {
    var tag = CAT_LABEL[post.category] || 'NEWS';
    var img = post.thumb
      ? '<div class="nimg"><img src="' + esc(post.thumb) + '" alt="" loading="lazy"></div>'
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
      el.href = articleUrl(post);
      el.innerHTML = img + meta + '<h3>' + esc(post.title) + '</h3>' +
        '<span class="nmore">자세히 보기 <i>→</i></span></div>';
    }
    el.setAttribute('data-cat', post.category || 'news');
    el.setAttribute('data-id', post.id || '');
    return el;
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
      reveal(made);
    }).catch(function (err) {
      quiet('feed fetch 실패 — 정적 카드 유지', err); // file:// 포함, 조용히
    });
  }

  /* ---------- news.html: 전체 게시판 + 레거시 해시 호환 ---------- */
  function initBoardPage(grid) {
    var tabs = [].slice.call(doc.querySelectorAll('.board-tab'));
    var statusEl = doc.getElementById('boardStatus');
    var filter = 'all';
    var allPosts = [];
    var loaded = false;

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

    function findById(id) {
      for (var i = 0; i < allPosts.length; i++) if ((allPosts[i].id || '') === id) return allPosts[i];
      return null;
    }

    /* 인라인 스냅샷과 원격 JSON이 같으면 DOM을 다시 만들지 않는다.
     * 첫 페인트 전에 스냅샷을 동기 렌더해 footer 밀림(CLS)을 막고,
     * 관리자가 갱신한 원격 데이터가 다를 때만 목록을 교체한다. */
    function postsSignature(posts) {
      return JSON.stringify((posts || []).slice().sort(byDateDesc).map(function (p) {
        return [p.id, p.category, p.date, p.title, p.summary, p.body, p.thumb, p.externalUrl, !!p.pinned];
      }));
    }

    function redirectLegacyHash() {
      if (!loaded) return false;
      var m = /#p=([^&]+)/.exec(win.location.hash || '');
      var id = m ? decodeURIComponent(m[1]) : null;
      var post = id ? findById(id) : null;
      if (!post || safeExternalUrl(post.externalUrl)) return false;
      win.location.replace(articleUrl(post));
      return true;
    }

    win.addEventListener('hashchange', redirectLegacyHash);

    function boot(posts, viaFallback, err) {
      allPosts = posts.slice().sort(byDateDesc);
      loaded = true;
      if (redirectLegacyHash()) return;
      renderGrid();
      if (viaFallback) quiet('board fetch 실패 — 정적 스냅샷으로 렌더', err);
    }

    var fallbackPosts = win.WS_POSTS_FALLBACK && win.WS_POSTS_FALLBACK.posts;
    if (fallbackPosts && fallbackPosts.length) boot(fallbackPosts, false);

    fetchPosts().then(function (data) {
      var remotePosts = (data && data.posts) || [];
      if (!loaded || postsSignature(remotePosts) !== postsSignature(allPosts)) boot(remotePosts, false);
    }).catch(function (err) {
      // fetch 실패(file:// 열람·오프라인 등): 이미 렌더한 스냅샷을 그대로 유지
      if (loaded) { quiet('board fetch 실패 — 정적 스냅샷 유지', err); return; }
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
      win.addEventListener('scroll', function () {
        var y = win.scrollY || 0;
        hdr.classList.toggle('scrolled', y > 20);
      }, { passive: true });
    }

    var btn = doc.getElementById('menuBtn'), drawer = doc.getElementById('drawer');
    if (btn && drawer) {
      var open = false, hideTimer = null;
      var desktopMq = win.matchMedia ? win.matchMedia('(min-width: 961px)') : null;
      var brand = doc.querySelector('.brand');
      var focusables = function () {
        return [btn].concat([].slice.call(drawer.querySelectorAll('a[href],button:not([disabled])')));
      };
      var set = function (next, restoreFocus) {
        open = next;
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
        if (open) {
          clearTimeout(hideTimer);
          drawer.hidden = false;
          win.requestAnimationFrame(function () {
            drawer.classList.add('open');
            var firstLink = drawer.querySelector('a[href]');
            if (firstLink) firstLink.focus();
          }); // 1회성
          root.classList.add('nav-open');
          doc.body.style.overflow = 'hidden';
        } else {
          drawer.classList.remove('open');
          root.classList.remove('nav-open');
          doc.body.style.overflow = '';
          if (restoreFocus !== false) btn.focus();
          hideTimer = setTimeout(function () { if (!open) drawer.hidden = true; }, 420);
        }
      };
      btn.addEventListener('click', function () { set(!open); });
      drawer.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { set(false); });
      });
      win.addEventListener('keydown', function (e) {
        if (!open) return;
        if (e.key === 'Escape') { e.preventDefault(); set(false); return; }
        if (e.key !== 'Tab') return;
        var items = focusables(), first = items[0], last = items[items.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (items.indexOf(doc.activeElement) < 0) { e.preventDefault(); first.focus(); }
      });
      var closeAtDesktop = function (e) {
        if (!e.matches || !open) return;
        set(false, false);
        if (brand) brand.focus();
      };
      if (desktopMq) {
        if (desktopMq.addEventListener) desktopMq.addEventListener('change', closeAtDesktop);
        else if (desktopMq.addListener) desktopMq.addListener(closeAtDesktop);
      }
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
