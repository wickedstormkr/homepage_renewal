/* WICKED STORM — social.js
 * 채널 링크(인스타그램·블로그). site-config.js의 WS_CONFIG.SOCIAL에서 주소를 읽는다.
 * 주소가 빈 채널은 숨긴 채 두고, 하나라도 있으면 [data-social-group]을 연다.
 * 모든 페이지에서 site-config.js 다음에 불러온다(defer 순서 유지).
 */
(function () {
  'use strict';
  var doc = document, win = window;
  var cfg = (win.WS_CONFIG && win.WS_CONFIG.SOCIAL) || {};
  var any = false;
  [].forEach.call(doc.querySelectorAll('[data-social]'), function (a) {
    var c = cfg[a.getAttribute('data-social')];
    var url = c && (typeof c === 'string' ? c : c.url);
    if (!url || !/^https:\/\//.test(url)) return;
    a.href = url; a.hidden = false; any = true;
    var h = a.querySelector('[data-social-handle]');
    if (h && c.label) h.textContent = c.label;
  });
  if (any) [].forEach.call(doc.querySelectorAll('[data-social-group]'), function (g) { g.hidden = false; });
})();
