#!/usr/bin/env node
/* 다국어 레이아웃 점검: 폭 × 언어별로 넘침·겹침·고아 단어·작은 글자를 측정한다.
 *
 *   python3 -m http.server 8123 &            # 저장소 루트에서
 *   node scripts/qa/layout-check.cjs [옵션]
 *
 * 옵션
 *   --base=http://localhost:8123   서버 주소
 *   --langs=ko,en,vi,ja            언어
 *   --widths=360,390,...           폭(기본: 360 390 430 768 820 1024 1280 1440 1920)
 *   --out=scripts/qa/out           결과(report.json, report.txt, 스크린샷) 폴더
 *   --shots=390,820,1440           이 폭에서 전체 페이지 스크린샷(reduced-motion으로 핀·리빌을 풀어 찍는다)
 *   --shots-only                   측정 없이 스크린샷만
 *
 * playwright는 저장소에 넣지 않는다. `npm i -D playwright`(node_modules는 .gitignore)나
 * 전역 설치 + NODE_PATH=$(npm root -g) 로 실행한다.
 * 폰 폭(≤430)은 모바일 에뮬레이션(isMobile·hasTouch)으로도 한 번 더 본다.
 * 모바일에서 레이아웃 뷰포트가 기기 폭보다 넓어지면(innerWidth > 폭) 가로 넘침이다.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const arg = (k, d) => {
  const a = process.argv.find(s => s.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : d;
};
const BASE = arg('base', 'http://localhost:8123');
const LANGS = arg('langs', 'ko,en,vi,ja').split(',');
const WIDTHS = arg('widths', '360,390,430,768,820,1024,1280,1440,1920').split(',').map(Number);
const OUT = arg('out', path.join(__dirname, 'out'));
const SHOTS = arg('shots', '').split(',').filter(Boolean).map(Number);
const SHOTS_ONLY = process.argv.includes('--shots-only');
const URL = { ko: '/index.html', en: '/en/index.html', vi: '/vi/index.html', ja: '/ja/index.html' };
const HEIGHT = w => (w <= 430 ? 844 : w <= 1024 ? 1180 : 900);

/* 브라우저 안에서 도는 측정. 결과는 사람이 읽을 수 있는 짧은 문자열 목록 */
function measure(lang) {
  const out = [];
  const W = document.documentElement.clientWidth;
  const vis = el => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[hidden],.drawer,.hp,.sr-only,.skip-link');
  };
  const name = el => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (el.classList.length) s += '.' + [...el.classList].slice(0, 2).join('.');
    const sec = el.closest('section,header,footer');
    const where = sec ? (sec.id || (sec.querySelector('h2') || {}).id || sec.tagName.toLowerCase()) : '';
    return `${where}> ${s}`;
  };
  const txt = el => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  // 줄 수: 글자 사각형을 세로 중심으로 묶는다(크기가 다른 인라인 요소가 섞여도 한 줄로 센다)
  const lineCount = el => {
    const range = document.createRange(); range.selectNodeContents(el);
    const cs = [...range.getClientRects()].filter(r => r.width > 1 && r.height > 1);
    const L = [];
    for (const r of cs) {
      const c = (r.top + r.bottom) / 2;
      if (!L.some(l => Math.abs(l - c) < Math.min(r.height, 14) * .6)) L.push(c);
    }
    return L.length;
  };
  const clipped = el => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p);
      if (/auto|scroll/.test(o.overflowX)) return true; // 가로 스크롤 묶음 안(의도된 것)
    }
    return false;
  };

  // 1. 문서 가로 넘침
  if (document.documentElement.scrollWidth > innerWidth + 1)
    out.push(`[문서넘침] scrollWidth ${document.documentElement.scrollWidth} > innerWidth ${innerWidth}`);

  // 2. 자기 칸 밖으로 나가는 글자
  const hasText = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  for (const el of document.querySelectorAll('body *')) {
    if (!vis(el) || /^(svg|path|img|video|canvas|select|input|textarea|option)$/i.test(el.tagName)) continue;
    if (!hasText(el) && !el.matches('.btn,.pill,.feat-badge,.cta,.lang-switch,nav.main,.powered,.st,.ntag,.rtags span,.cap-badge,.ins-chip,.chip')) continue;
    const cs = getComputedStyle(el);
    // .hist-year는 ::after 점이 레일 위로 나가도록 만든 것이라 제외
    if (el.scrollWidth > el.clientWidth + 1 && !el.matches('.hist-year') && cs.display !== 'inline' && !/auto|scroll/.test(cs.overflowX))
      out.push(`[칸넘침] ${name(el)} ${el.scrollWidth}>${el.clientWidth}${cs.whiteSpace === 'nowrap' ? ' nowrap' : ''} "${txt(el)}"`);
    const r = el.getBoundingClientRect();
    if ((r.right > W + 1 || r.left < -1) && !clipped(el) && !el.closest('.hero .orbs,.stream-viewport'))
      out.push(`[화면밖] ${name(el)} left ${Math.round(r.left)} right ${Math.round(r.right)} / ${W} "${txt(el)}"`);
    // 7. 11px 미만
    const fs = parseFloat(cs.fontSize);
    if (hasText(el) && fs < 10.95 && !el.closest('.pl-bar'))
      out.push(`[작은글자] ${name(el)} ${fs.toFixed(1)}px "${txt(el)}"`);
  }

  // 6. 한 줄이어야 하는 것이 두 줄이 됨(버튼·배지·알약·메뉴)
  for (const el of document.querySelectorAll('.btn,.feat-badge,.pill,nav.main a,.lang-switch,.st,.ntag,.rtags span,.cap-badge,.ins-chip,.powered,.sec-more,.chip,.pl-lab,.board-tab,.res-links a,.hero-trust>span,.std-card .k')) {
    if (!vis(el)) continue;
    if (lineCount(el) > 1) out.push(`[두줄] ${name(el)} "${txt(el)}"`);
  }
  // 헤더 메뉴가 한 줄인지
  const nav = document.querySelector('nav.main');
  if (nav && vis(nav) && nav.getBoundingClientRect().height > 50) out.push(`[두줄] 헤더 메뉴 높이 ${Math.round(nav.getBoundingClientRect().height)}`);
  const hw = document.querySelector('.hwrap');
  if (hw && hw.scrollWidth > hw.clientWidth + 1) out.push(`[칸넘침] 헤더 ${hw.scrollWidth}>${hw.clientWidth}`);

  // 3. 선순환 라벨
  const stage = document.querySelector('.loop-stage');
  if (stage && getComputedStyle(document.querySelector('.loop-notes li')).position === 'absolute') {
    const S = stage.getBoundingClientRect();
    const lis = [...stage.querySelectorAll('.loop-notes li')];
    const R = lis.map(li => {
      // li 박스가 아니라 실제 글자 영역(자식들의 합)
      const rs = [...li.children].map(c => c.getBoundingClientRect());
      return { left: Math.min(...rs.map(r => r.left)), right: Math.max(...rs.map(r => r.right)), top: Math.min(...rs.map(r => r.top)), bottom: Math.max(...rs.map(r => r.bottom)) };
    });
    R.forEach((r, i) => {
      const l = txt(lis[i].firstElementChild);
      if (r.left < S.left - 1 || r.right > S.right + 1 || r.top < S.top - 1 || r.bottom > S.bottom + 1)
        out.push(`[선순환] "${l}" 그림 밖 (${Math.round(r.left - S.left)},${Math.round(r.top - S.top)})-(${Math.round(r.right - S.left)},${Math.round(r.bottom - S.top)}) / ${Math.round(S.width)}x${Math.round(S.height)}`);
      R.forEach((q, j) => {
        if (j <= i) return;
        if (r.left < q.right && q.left < r.right && r.top < q.bottom && q.top < r.bottom)
          out.push(`[선순환] "${l}" ↔ "${txt(lis[j].firstElementChild)}" 겹침`);
      });
      for (const c of lis[i].querySelectorAll('.ln-desc,.pill,b'))
        if (c.scrollWidth > c.clientWidth + 1) out.push(`[선순환] "${l}" ${c.className || c.tagName} 칸넘침`);
      // 라벨 박스 기록(스크린샷으로 가림 여부 확인용)
      out.push(`[선순환·박스] "${l}" x ${((r.left - S.left) / S.width * 100).toFixed(1)}~${((r.right - S.left) / S.width * 100).toFixed(1)}% y ${((r.top - S.top) / S.height * 100).toFixed(1)}~${((r.bottom - S.top) / S.height * 100).toFixed(1)}%`);
    });
  }

  // 4. 파이프라인 무대
  const pl = document.querySelector('#pipeLoop .pl-stage');
  if (pl) {
    const P = pl.getBoundingClientRect();
    for (const el of pl.querySelectorAll('.pl-title,.pl-sub,.pl-idx,.pl-lab,.pl-note,.pl-arc-text')) {
      if (!vis(el)) continue;
      const range = document.createRange(); range.selectNodeContents(el);
      const r = range.getBoundingClientRect();
      if (el.scrollWidth > el.clientWidth + 1) out.push(`[파이프라인] ${el.className} 칸넘침 ${el.scrollWidth}>${el.clientWidth} "${txt(el)}"`);
      if (r.left < P.left - 1 || r.right > P.right + 1) out.push(`[파이프라인] ${el.className} 무대 밖 "${txt(el)}"`);
      const step = el.closest('.pl-step');
      if (step && getComputedStyle(pl).containerType === 'inline-size') {
        // 데스크톱: 노트·라벨이 창(.pl-win) 폭을 넘는지
        const win = step.querySelector('.pl-win').getBoundingClientRect();
        if (r.width > win.width + 1) out.push(`[파이프라인] ${el.className} 글자폭 ${Math.round(r.width)} > 창 ${Math.round(win.width)} "${txt(el)}"`);
      }
      const nl = lineCount(el);
      if (/pl-note|pl-lab|pl-arc-text|pl-title/.test(el.className) && nl > 1 && getComputedStyle(pl).containerType === 'inline-size')
        out.push(`[파이프라인] ${el.className} ${nl}줄 "${txt(el)}"`);
    }
  }

  // 글자 사각형으로 줄을 복원한다: [{top, l, r, s}] (s는 그 줄 글자, 공백은 원문 기준으로 복원)
  const charLines = el => {
    const lines = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let n;
    while ((n = walker.nextNode())) {
      if (!n.parentElement || !vis(n.parentElement)) continue;
      const t = n.textContent;
      for (let i = 0; i < t.length; i++) {
        if (/\s/.test(t[i])) continue;
        range.setStart(n, i); range.setEnd(n, i + 1);
        const r = range.getClientRects()[0];
        if (!r || !r.width) continue;
        let line = lines.find(L => Math.abs(L.top - r.top) < r.height * .5);
        if (!line) { line = { top: r.top, l: r.left, r: r.right, s: '' }; lines.push(line); }
        line.l = Math.min(line.l, r.left); line.r = Math.max(line.r, r.right);
        if (line.s && line.last && t[i - 1] && /\s/.test(t[i - 1])) line.s += ' ';
        line.s += t[i]; line.last = true;
      }
      lines.forEach(L => (L.last = false));
    }
    return lines.sort((a, b) => a.top - b.top);
  };
  // 히어로 스크롤 캡션은 961px 이상 핀 구간에서만 보인다(그 아래는 숨은 채라 재지 않는다)
  const shown = el => vis(el) && !(el.closest('.hero-overlay') && innerWidth < 961);
  const spaced = lang === 'en' || lang === 'vi';
  const words = s => s.trim().split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w));

  // 5. 제목·리드 마지막 줄 한 단어
  for (const el of document.querySelectorAll('h1,h2,h3,.sec-lead,.hero-lead,.ho-main,.ho-sub,.pl-title,.pl-sub,.lhub-principle,.co-slogan,.hist-title,.ch-title,.note,.loop-notes .ln-desc,.feat-copy>p,.lhub-points span,.ref-card p,.std-card p')) {
    if (!shown(el)) continue;
    const lines = charLines(el);
    if (lines.length < 2) continue;
    const last = lines[lines.length - 1].s;
    const full = txt(el);
    let lone = false;
    if (spaced) {
      // 줄 안 공백 복원이 불완전해서 단어 수는 원문 기준으로 센다: 원문에서 마지막 줄 글자 수만큼 뒤를 잘라 센다
      const flat = el.textContent.replace(/\s+/g, ' ').trim();
      const nosp = last.replace(/\s/g, '');
      let k = flat.length, cnt = 0;
      while (k > 0 && cnt < nosp.length) { k--; if (!/\s/.test(flat[k])) cnt++; }
      lone = words(flat.slice(k)).length === 1;
    } else {
      lone = last.replace(/[\s.,。、．·:：!?）)」』]/g, '').length <= 3;
    }
    if (lone) out.push(`[고아] ${name(el)} 끝줄 "${last}" ← "${full}"`);
  }

  // 8. 제목·캡션: 본문 폭 끝까지 늘어진 한 줄, 가운데·첫 줄에 한 단어만 있는 줄, 그라디언트 강조 구절(.g/.gc)이 줄바꿈으로 쪼개짐
  for (const el of document.querySelectorAll('.hero h1,.sec-head h2,.hist-title,.ho-main,.ho-sub,.pl-title')) {
    if (!shown(el)) continue;
    const lines = charLines(el);
    if (!lines.length) continue;
    const area = (el.closest('.hero-overlay,.hero-grid,.wrap') || document.body).getBoundingClientRect().width;
    const widest = Math.max(...lines.map(L => L.r - L.l));
    if (area >= 600 && widest >= area * .88) out.push(`[긴줄] ${name(el)} ${Math.round(widest)}/${Math.round(area)}px "${txt(el)}"`);
    if (lines.length > 1) lines.slice(0, -1).forEach(L => {
      if (spaced ? words(L.s).length === 1 && L.s.replace(/[^\p{L}\p{N}]/gu, '').length <= 12 : L.s.replace(/[\s.,。、．·:：!?）)」』]/g, '').length <= 2)
        out.push(`[한단어줄] ${name(el)} "${L.s}" ← "${txt(el)}"`);
    });
  }
  // 강조 구절: 제목 안에서 공백만 사이에 두고 이어지는 .g/.gc 글자를 한 구절로 묶어 센다
  // (예: <span class="gc">Nền tảng giảng dạy</span> <span class="gc">và học tập</span>, 히어로 제목의 줄별 .g)
  for (const el of document.querySelectorAll('h1,h2,h3,.ho-main,.ho-sub,.pl-title,.hist-title,.lhub-name,.co-slogan')) {
    if (!shown(el)) continue;
    const groups = []; let cur = null;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const g = n.parentElement.closest('.g,.gc');
      const inG = g && el.contains(g) && getComputedStyle(g).display === 'inline';
      if (!n.textContent.trim()) continue;          // 공백만 있는 글자는 구절을 끊지 않는다
      if (inG) { if (!cur) { cur = []; groups.push(cur); } cur.push(n); } else cur = null;
    }
    for (const grp of groups) {
      const range = document.createRange(); range.setStart(grp[0], 0); range.setEnd(grp[grp.length - 1], grp[grp.length - 1].length);
      const L = [];
      for (const r of range.getClientRects()) {
        if (r.width < 2 || r.height < 2) continue;
        const c = (r.top + r.bottom) / 2;
        if (!L.some(l => Math.abs(l - c) < Math.min(r.height, 24) * .6)) L.push(c);
      }
      if (L.length > 1) out.push(`[강조쪼개짐] ${name(el)} "${range.toString().replace(/\s+/g, ' ').trim()}" ${L.length}줄 ← "${txt(el)}"`);
    }
  }

  // 6. 카드 높이: 같은 줄 카드 중 가장 높은 카드(= 그 줄 높이를 정한 카드)를 기록해 KO와 비교한다
  for (const sel of ['.std-card', '.ref-card', '.co-stat', '.res-card', '.pipe .step', '.ncard .nbody', '.lhub-points li']) {
    const els = [...document.querySelectorAll(sel)].filter(vis);
    const rows = {};
    els.forEach(e => { const r = e.getBoundingClientRect(); (rows[Math.round(r.top)] = rows[Math.round(r.top)] || []).push(Math.round(r.height)); });
    const hs = Object.values(rows).map(r => Math.max(...r));
    if (hs.length) out.push(`[카드높이] ${sel} 줄별 ${hs.join('/')}px`);
  }
  return out;
}

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const report = {};
  const variants = [];
  for (const w of WIDTHS) {
    variants.push({ w, mobile: false });
    if (w <= 430) variants.push({ w, mobile: true });
  }
  if (!SHOTS_ONLY) for (const lang of LANGS) for (const v of variants) {
    const ctx = await browser.newContext({
      viewport: { width: v.w, height: HEIGHT(v.w) }, isMobile: v.mobile, hasTouch: v.mobile, deviceScaleFactor: v.mobile ? 3 : 1,
    });
    const page = await ctx.newPage();
    await page.goto(BASE + URL[lang], { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => document.querySelectorAll('.rv').forEach(e => e.classList.add('in')));
    // 핀·지연 로딩을 풀기 위해 끝까지 한 번 내려갔다 올라온다
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 700) { await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(25); }
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);
    const key = `${lang} ${v.w}${v.mobile ? ' mobile' : ''}`;
    const res = await page.evaluate(measure, lang);
    const iw = await page.evaluate(() => innerWidth);
    if (iw > v.w) res.unshift(`[문서넘침] 레이아웃 뷰포트 ${iw}px > 기기 폭 ${v.w}px`);
    // 1024 이상: 핀 구간 안에서도 한 번 더(히어로 스크럽 중간, 파이프라인 핀 중간)
    if (v.w >= 1024) {
      for (const f of [0.3, 0.6]) {
        await page.evaluate(f => scrollTo(0, innerHeight * f), f);
        await page.waitForTimeout(300);
        const r2 = await page.evaluate(measure, lang);
        r2.filter(s => s.startsWith('[문서넘침]') || s.startsWith('[화면밖]')).forEach(s => res.push(`${s} (히어로 핀 ${f})`));
      }
    }
    report[key] = [...new Set(res)];
    const issues = report[key].filter(s => !/^\[(선순환·박스|카드높이)\]/.test(s));
    console.log(`${key.padEnd(16)} ${issues.length ? issues.length + '건' : 'OK'}`);
    await ctx.close();
  }
  if (!SHOTS_ONLY) {
    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
    fs.writeFileSync(path.join(OUT, 'report.txt'), Object.entries(report).map(([k, v]) => `## ${k}\n` + v.map(s => '  ' + s).join('\n')).join('\n\n'));
  }

  for (const w of SHOTS) for (const lang of LANGS) {
    const mobile = w <= 430;
    const ctx = await browser.newContext({ viewport: { width: w, height: HEIGHT(w) }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(BASE + URL[lang], { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => document.querySelectorAll('.rv').forEach(e => e.classList.add('in')));
    await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => (i.loading = 'eager')));
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, `${lang}-${w}.png`), fullPage: true });
    // 섹션별로도 따로(KO와 나란히 비교), 선순환 그림·파이프라인 무대는 라벨이 오브젝트를 가리는지 보기
    const parts = [['.hero-copy', 'hero'], ['.loop-figure', 'loop'], ['#pipeLoop', 'pipe'], ['footer', 'footer']];
    // 섹션 캡처에 고정 헤더가 겹치지 않게 숨긴다(헤더는 'header' 캡처에서 따로 본다)
    await page.screenshot({ path: path.join(OUT, `${lang}-${w}-header.png`), clip: { x: 0, y: 0, width: w, height: 80 } });
    await page.addStyleTag({ content: 'header#hdr{visibility:hidden!important}' });
    const secs = await page.$$('main > section');
    for (let i = 0; i < secs.length; i++) {
      const id = await secs[i].evaluate((e, i) => e.id || (i === 1 ? 'pipeline' : 'sec' + i), i);
      await secs[i].screenshot({ path: path.join(OUT, `${lang}-${w}-s-${id}.png`) });
    }
    for (const [sel, nm] of parts) {
      const el = await page.$(sel);
      if (el) await el.screenshot({ path: path.join(OUT, `${lang}-${w}-${nm}.png`) });
    }
    console.log(`shot ${lang} ${w}`);
    await ctx.close();
  }
  await browser.close();
}
run().catch(e => { console.error(e); process.exit(1); });
