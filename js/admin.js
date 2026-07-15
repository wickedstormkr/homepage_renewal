/* WICKED STORM — admin.js
 * 소식 관리자 프론트. 정적 호스팅 + 관리 API(Function URL) 조합.
 *  - 토큰 로그인(sessionStorage), GET /posts 로 검증
 *  - 목록 / 작성 / 수정 / 삭제 / 핀 토글
 *  - 본문 textarea: 빈 줄 기준 <p> 변환 (인라인 HTML은 관리자 신뢰 콘텐츠로 허용)
 *  - 이미지: POST /upload-url → presigned POST(S3) → publicPath를 thumb에 기록
 *  - 저장: PUT /posts (전체 JSON)
 * API 계약:
 *  GET  /posts        → {"version":1,"updated":"...","posts":[...]}
 *  PUT  /posts        → {"ok":true}
 *  POST /upload-url   {"filename","contentType","size"} → {"upload":{"url","fields":{...}},"publicPath"}
 *  오류               → {"error":"..."}
 */
(function () {
  'use strict';

  var doc = document, win = window;
  var CFG = win.WS_CONFIG || {};
  var API = String(CFG.ADMIN_API || '').replace(/\/+$/, '');
  var TOKEN_KEY = 'ws_admin_token';
  var CATS = [['news', '뉴스'], ['story', '스토리'], ['insight', '인사이트']];
  // 서버 UPLOAD_CONTENT_TYPES(lambda/admin-api/index.mjs)와 동일 집합을 유지할 것 — 한쪽만 바꾸면 업로드가 400으로 거부된다.
  var IMG_TYPES = ['image/webp', 'image/jpeg', 'image/png'];
  var MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB — 서버 MAX_UPLOAD_BYTES(index.mjs)와 짝, 클라이언트 사전 체크용

  var state = { version: 1, updated: '', posts: [] };
  var editing = null;        // 편집 중인 post (신규는 임시 객체)
  var editingIsNew = false;
  var persisting = false;    // persist 진행 중 플래그(중복 클릭 방지)

  function $(id) { return doc.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function token() { try { return win.sessionStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; } }
  function setToken(t) { try { if (t) win.sessionStorage.setItem(TOKEN_KEY, t); else win.sessionStorage.removeItem(TOKEN_KEY); } catch (e) {} }

  /* 날짜 문자열 "YYYY.M.D" ~ "YYYY.MM.DD"를 숫자 튜플로 파싱해 비교(제로패딩 불필요).
   * 빈/비정상 날짜는 가장 작은 키를 받아 내림차순 정렬에서 항상 맨 뒤로 밀린다. board.js와 동일 로직. */
  function parseDateKey(s) {
    var m = /^(\d{1,4})\.(\d{1,2})\.(\d{1,2})$/.exec(String(s == null ? '' : s).trim());
    if (!m) return -1;
    var y = +m[1], mo = +m[2], d = +m[3];
    if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return -1;
    return y * 10000 + mo * 100 + d;
  }

  function todayDotted() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '.' + p(d.getMonth() + 1) + '.' + p(d.getDate());
  }
  function todayISO() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  /* ---------- 본문 <-> 텍스트 변환 ----------
   * 규칙: 빈 줄 = 문단 경계. 각 문단은 <p>…</p>. 단, 블록이 <img> 하나뿐이면
   * <p>로 감싸지 않고 단독 <img>로 저장(문단 이미지). 인라인 태그(<a>·<strong>·
   * <em>·<img> 등)는 텍스트로 그대로 보존해 편집 왕복 후에도 소실되지 않는다.
   * 서버가 최종 정화하므로 클라이언트는 보존에 집중. */
  var ONLY_IMG_RE = /^<img\b[^>]*>$/i;

  function textToBody(text) {
    return String(text || '').replace(/\r\n?/g, '\n').split(/\n\s*\n/)
      .map(function (b) { return b.trim(); })
      .filter(Boolean)
      .map(function (b) {
        if (ONLY_IMG_RE.test(b)) return b;                 // 단독 이미지 블록: 그대로
        return '<p>' + b.replace(/\n+/g, ' ') + '</p>';     // 일반 문단: 개행→공백
      })
      .join('');
  }

  /* body(HTML) → textarea 텍스트. <p>…</p> 문단과 단독 <img>를 블록으로 뽑아
   * 빈 줄로 잇는다(단독 img 안전). 구조가 없으면 태그만 느슨히 제거해 폴백. */
  function bodyToText(body) {
    if (!body) return '';
    var s = String(body).replace(/\r/g, '');
    var blocks = [], re = /<p\b[^>]*>([\s\S]*?)<\/p>|<img\b[^>]*>/gi, m, any = false;
    while ((m = re.exec(s))) {
      any = true;
      if (m[1] !== undefined) blocks.push(m[1].replace(/<br\s*\/?>/gi, '\n').trim());
      else blocks.push(m[0].trim());                        // 단독 <img>
    }
    if (!any) {
      return s.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?p[^>]*>/gi, '').trim();
    }
    return blocks.filter(function (b) { return b !== ''; }).join('\n\n');
  }

  /* ---------- API ---------- */
  function api(path, opts) {
    opts = opts || {};
    var headers = opts.headers || {};
    headers['Authorization'] = 'Bearer ' + token();
    opts.headers = headers;
    // 15초 타임아웃: 무응답 시 abort→reject되어 각 호출부 .catch로 넘어간다(pending 고착 방지).
    if (opts.signal == null) opts.signal = AbortSignal.timeout(15000);
    return fetch(API + path, opts).then(function (r) {
      return r.text().then(function (txt) {
        var data = null;
        try { data = txt ? JSON.parse(txt) : null; } catch (e) { data = null; }
        if (!r.ok) {
          var msg = (data && data.error) || ('HTTP ' + r.status);
          var err = new Error(msg); err.status = r.status; throw err;
        }
        return data;
      });
    });
  }

  /* ---------- 인증 ---------- */
  function apiConfigured() { return !!API; }

  function login(tok) {
    setToken(tok);
    setLoginStatus('확인 중…', '');
    return api('/posts', { method: 'GET' }).then(function (data) {
      if (!data || !Array.isArray(data.posts)) throw new Error('응답 형식 오류');
      state = { version: data.version || 1, updated: data.updated || '', posts: data.posts };
      showApp();
      renderList();
    }).catch(function (err) {
      setToken('');
      // TypeError = fetch 자체 실패(네트워크 단절·CORS 차단·타임아웃) — 힌트 제공
      var msg = err.status === 401 ? '토큰이 올바르지 않습니다.'
        : (err instanceof TypeError) ? '네트워크 또는 CORS 설정을 확인하세요.'
        : ('로그인 실패: ' + err.message);
      setLoginStatus(msg, 'err');
    });
  }

  function logout() {
    setToken('');
    editing = null;
    $('appView').hidden = true;
    $('appTop').hidden = true;
    $('loginView').hidden = false;
    $('f-token').value = '';
    setLoginStatus('', '');
  }

  /* ---------- 렌더 ---------- */
  function catLabel(c) { for (var i = 0; i < CATS.length; i++) if (CATS[i][0] === c) return CATS[i][1]; return c || '뉴스'; }

  function renderList() {
    var wrap = $('postList');
    var posts = state.posts.slice().sort(function (a, b) {
      return parseDateKey(b.date) - parseDateKey(a.date);
    });
    if (!posts.length) { wrap.innerHTML = '<p class="muted">등록된 소식이 없습니다. “새 글”로 추가하세요.</p>'; return; }
    wrap.innerHTML = posts.map(function (p) {
      return '<div class="prow">' +
        '<div class="prow-main">' +
          '<div class="prow-meta">' +
            '<span class="badge cat-' + esc(p.category) + '">' + esc(catLabel(p.category)) + '</span>' +
            '<span class="pdate">' + esc(p.date) + '</span>' +
            (p.pinned ? '<span class="badge pin">PIN</span>' : '') +
            (p.externalUrl ? '<span class="badge ext">LINK</span>' : '') +
          '</div>' +
          '<div class="ptitle">' + esc(p.title) + '</div>' +
        '</div>' +
        '<div class="prow-act">' +
          '<button class="mini" data-act="pin" data-id="' + esc(p.id) + '">' + (p.pinned ? '핀 해제' : '핀 설정') + '</button>' +
          '<button class="mini" data-act="edit" data-id="' + esc(p.id) + '">수정</button>' +
          '<button class="mini danger" data-act="del" data-id="' + esc(p.id) + '">삭제</button>' +
        '</div>' +
      '</div>';
    }).join('');

    [].slice.call(wrap.querySelectorAll('button[data-act]')).forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-id'), act = b.getAttribute('data-act');
        if (act === 'edit') openEditor(findPost(id));
        else if (act === 'del') deletePost(id);
        else if (act === 'pin') togglePin(id);
      });
    });
  }

  function findPost(id) { for (var i = 0; i < state.posts.length; i++) if (state.posts[i].id === id) return state.posts[i]; return null; }

  /* ---------- 에디터 ---------- */
  function buildCatOptions(sel) {
    return CATS.map(function (c) {
      return '<option value="' + c[0] + '"' + (c[0] === sel ? ' selected' : '') + '>' + c[1] + '</option>';
    }).join('');
  }

  function openEditor(post) {
    editingIsNew = !post;
    editing = post || {
      id: '', category: 'news', date: todayDotted(), title: '', summary: '',
      body: '', thumb: null, externalUrl: null, pinned: false
    };
    $('f-title').value = editing.title || '';
    $('f-category').innerHTML = buildCatOptions(editing.category || 'news');
    $('f-date').value = editing.date || todayDotted();
    $('f-summary').value = editing.summary || '';
    $('f-body').value = bodyToText(editing.body || '');
    $('f-external').value = editing.externalUrl || '';
    $('f-pinned').checked = !!editing.pinned;
    setThumb(editing.thumb || '');
    $('editorTitle').textContent = editingIsNew ? '새 글' : '글 수정';
    setEditorStatus('', '');
    $('listView').hidden = true;
    $('editorView').hidden = false;
    $('f-title').focus();
  }

  function closeEditor() {
    editing = null;
    $('editorView').hidden = true;
    $('listView').hidden = false;
  }

  function setThumb(path) {
    $('f-thumb').value = path || '';
    var prev = $('thumbPreview');
    if (path) { prev.innerHTML = '<img src="' + esc(path) + '" alt="썸네일 미리보기"><code>' + esc(path) + '</code>'; }
    else { prev.innerHTML = '<span class="muted">썸네일 없음</span>'; }
  }

  function slugId(date) {
    var base = String(date || todayDotted()).replace(/\./g, '-');
    return base + '-' + Math.random().toString(36).slice(2, 6);
  }

  function collectEditor() {
    var title = $('f-title').value.trim();
    var date = $('f-date').value.trim();
    if (!title) { setEditorStatus('제목을 입력하세요.', 'err'); return null; }
    if (!/^\d{4}\.\d{2}\.\d{2}$/.test(date)) { setEditorStatus('날짜 형식은 YYYY.MM.DD 입니다.', 'err'); return null; }
    var ext = $('f-external').value.trim();
    var post = {
      id: editing.id || slugId(date),
      category: $('f-category').value,
      date: date,
      title: title,
      summary: $('f-summary').value.trim(),
      body: textToBody($('f-body').value),
      thumb: $('f-thumb').value.trim() || null,
      externalUrl: ext || null,
      pinned: $('f-pinned').checked
    };
    return post;
  }

  function saveEditor() {
    if (persisting) return;
    if (!apiConfigured()) { setEditorStatus('API가 배포되지 않아 저장할 수 없습니다.', 'err'); return; }
    var post = collectEditor();
    if (!post) return;
    // upsert
    var idx = -1;
    for (var i = 0; i < state.posts.length; i++) if (state.posts[i].id === post.id) { idx = i; break; }
    var prev = snapshot();
    if (idx >= 0) state.posts[idx] = post; else state.posts.push(post);
    persist('게시 완료 (캐시 반영 1~2분)', function () { closeEditor(); renderList(); }, prev);
  }

  function deletePost(id) {
    if (persisting) return;
    if (!apiConfigured()) { alert('API가 배포되지 않아 삭제할 수 없습니다.'); return; }
    var p = findPost(id);
    if (!p) return;
    if (!win.confirm('“' + p.title + '” 글을 삭제할까요?')) return;
    var prev = snapshot();
    state.posts = state.posts.filter(function (x) { return x.id !== id; });
    persist('삭제 완료 (캐시 반영 1~2분)', renderList, prev);
  }

  function togglePin(id) {
    if (persisting) return;
    if (!apiConfigured()) { alert('API가 배포되지 않아 변경할 수 없습니다.'); return; }
    var p = findPost(id);
    if (!p) return;
    var prev = snapshot();
    p.pinned = !p.pinned;
    persist(p.pinned ? '핀 설정됨' : '핀 해제됨', renderList, prev);
  }

  /* 낙관적 변경 전 state 스냅샷(깊은 복사) — persist 실패 시 롤백에 사용 */
  function snapshot() { return JSON.parse(JSON.stringify(state)); }

  /* persist 진행 중 저장/삭제/핀 버튼 비활성(중복 클릭·중복 요청 방지) */
  function setBusy(b) {
    persisting = b;
    var els = doc.querySelectorAll('#postList button[data-act], #editorForm button');
    [].slice.call(els).forEach(function (x) { x.disabled = b; });
  }

  /* PUT /posts 전체 저장.
   * prev: 낙관적 변경 직전의 state 스냅샷. 저장 실패 시 이 값으로 복원 후 재렌더해
   * 화면이 서버(확정되지 않은) 상태와 어긋난 채 남지 않도록 한다. */
  function persist(okMsg, done, prev) {
    state.updated = todayISO();
    setToolStatus('저장 중…', '');
    setBusy(true);
    api('/posts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: state.version || 1, updated: state.updated, posts: state.posts })
    }).then(function (res) {
      if (res && res.ok === false) throw new Error(res.error || '저장 실패');
      setToolStatus(okMsg, 'ok');
      if (done) done();
    }).catch(function (err) {
      if (prev) { state = prev; renderList(); }               // 낙관적 변경 롤백 + 화면 동기화
      setToolStatus('저장 실패: ' + err.message, 'err');
    }).then(function () { setBusy(false); });                  // 성공·실패 모두 버튼 복구
  }

  /* ---------- 이미지 업로드 (S3 presigned POST) ----------
   * 공통 업로더: 성공 시 publicPath를 onDone에 전달(썸네일·본문 삽입이 공유). */
  function uploadImage(file, okMsg, onDone) {
    if (!apiConfigured()) { setEditorStatus('API가 배포되지 않아 업로드할 수 없습니다.', 'err'); return; }
    if (IMG_TYPES.indexOf(file.type) < 0) { setEditorStatus('이미지 형식은 WebP · JPEG · PNG만 가능합니다.', 'err'); return; }
    if (file.size > MAX_UPLOAD_SIZE) { setEditorStatus('이미지 용량은 5MB를 초과할 수 없습니다.', 'err'); return; }
    setEditorStatus('업로드 중…', '');
    api('/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size })
    }).then(function (res) {
      if (!res || !res.upload || !res.upload.url || !res.upload.fields || !res.publicPath) {
        throw new Error('업로드 URL 발급 실패');
      }
      var fd = new FormData();
      var fields = res.upload.fields;
      Object.keys(fields).forEach(function (k) { fd.append(k, fields[k]); });
      fd.append('file', file); // S3 presigned POST 규약: file 필드는 반드시 마지막
      return fetch(res.upload.url, { method: 'POST', body: fd })
        .then(function (r) {
          if (!r.ok) throw new Error('업로드 전송 실패 (HTTP ' + r.status + ')');
          if (onDone) onDone(res.publicPath);
          setEditorStatus(okMsg, 'ok');
        });
    }).catch(function (err) {
      setEditorStatus('업로드 실패: ' + err.message, 'err');
    });
  }

  function uploadThumb(file) { uploadImage(file, '이미지 업로드 완료.', setThumb); }

  /* 본문 이미지: textarea 커서 위치에 단독 <img> 라인 삽입(빈 줄로 문단 분리, 다중 삽입 가능) */
  function insertBodyImage(path) {
    var ta = $('f-body');
    var snippet = '<img src="' + path + '" alt="">';
    var val = ta.value;
    var start = (typeof ta.selectionStart === 'number') ? ta.selectionStart : val.length;
    var end = (typeof ta.selectionEnd === 'number') ? ta.selectionEnd : val.length;
    var before = val.slice(0, start), after = val.slice(end);
    var ins = '';
    if (before && !/\n\n$/.test(before)) ins += /\n$/.test(before) ? '\n' : '\n\n';
    ins += snippet;
    if (after && !/^\n\n/.test(after)) ins += /^\n/.test(after) ? '\n' : '\n\n';
    ta.value = before + ins + after;
    var pos = before.length + ins.length;
    try { ta.focus(); ta.setSelectionRange(pos, pos); } catch (e) {}
  }
  function uploadBodyImage(file) { uploadImage(file, '본문에 이미지를 삽입했습니다.', insertBodyImage); }

  /* ---------- 상태 표시 ---------- */
  function setStatus(el, msg, kind) {
    if (!el) return;
    el.textContent = msg || '';
    el.className = 'status' + (kind ? ' ' + kind : '');
  }
  function setLoginStatus(m, k) { setStatus($('loginStatus'), m, k); }
  function setEditorStatus(m, k) { setStatus($('editorStatus'), m, k); }
  function setToolStatus(m, k) { setStatus($('toolStatus'), m, k); }

  function showApp() { $('loginView').hidden = true; $('appView').hidden = false; $('appTop').hidden = false; }

  /* ---------- 초기화 ---------- */
  function init() {
    // API 미배포 배너 + 저장 계열 비활성
    if (!apiConfigured()) {
      $('apiBanner').hidden = false;
    }

    $('loginForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var t = $('f-token').value.trim();
      if (!t) { setLoginStatus('토큰을 입력하세요.', 'err'); return; }
      if (!apiConfigured()) { setLoginStatus('API가 배포되지 않았습니다. DEPLOY.md를 참조하세요.', 'err'); return; }
      login(t);
    });

    $('btnLogout').addEventListener('click', logout);
    $('btnNew').addEventListener('click', function () { openEditor(null); });
    $('btnReload').addEventListener('click', function () { if (token()) login(token()); });

    $('editorForm').addEventListener('submit', function (e) { e.preventDefault(); saveEditor(); });
    $('btnCancel').addEventListener('click', closeEditor);

    $('f-thumb-file').addEventListener('change', function () {
      if (this.files && this.files[0]) uploadThumb(this.files[0]);
      this.value = '';
    });
    $('btnThumbClear').addEventListener('click', function () { setThumb(''); });

    // 본문에 이미지 삽입
    $('btnBodyImg').addEventListener('click', function () { $('f-body-file').click(); });
    $('f-body-file').addEventListener('change', function () {
      if (this.files && this.files[0]) uploadBodyImage(this.files[0]);
      this.value = '';
    });

    // 세션에 토큰이 있으면 자동 재검증
    if (apiConfigured() && token()) login(token());
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
