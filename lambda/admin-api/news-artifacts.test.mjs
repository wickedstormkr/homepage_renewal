import assert from 'node:assert/strict';
import test from 'node:test';

import {
  escapeHtml,
  isValidPostId,
  newsArtifactPath,
  normalizeDate,
  normalizePostId,
  renderArticle,
  renderNewsArtifacts,
  renderSitemap,
  sanitizeArticleBody,
  stripHtml,
} from './news-artifacts.mjs';

function samplePost(overrides = {}) {
  return {
    id: '2026-07-sample',
    category: 'insight',
    date: '2026.07.13',
    title: '학습 데이터 표준 기술 노트',
    summary: '정적 뉴스 URL과 메타데이터를 검증합니다.',
    body: '<p>본문 <strong>강조</strong></p>',
    thumb: './img/feed-img01.webp',
    externalUrl: null,
    pinned: false,
    ...overrides,
  };
}

test('post ids are normalized and path traversal is rejected', () => {
  assert.equal(normalizePostId('  2026-NEWS  '), '2026-news');
  assert.equal(isValidPostId('  2026-NEWS  '), false);
  assert.equal(isValidPostId('2026-news'), true);
  assert.equal(newsArtifactPath('2026-news'), 'news/2026-news.html');
  assert.throws(() => newsArtifactPath('2026-NEWS'), /Invalid post id/);
  assert.equal(isValidPostId('../secrets'), false);
  assert.equal(isValidPostId('bad/id'), false);
  assert.throws(() => newsArtifactPath('../secrets'), /Invalid post id/);
});

test('HTML helpers escape metadata and produce plain descriptions', () => {
  assert.equal(escapeHtml('<a "x">&</a>'), '&lt;a &quot;x&quot;&gt;&amp;&lt;/a&gt;');
  assert.equal(stripHtml('<p>학습&nbsp;<strong>데이터</strong></p>'), '학습 데이터');
});

test('dates are normalized and invalid calendar dates are rejected', () => {
  assert.equal(normalizeDate('2026.07.13'), '2026-07-13');
  assert.equal(normalizeDate('2026-02-29'), null);
  assert.equal(normalizeDate('13/07/2026'), null);
});

test('article bodies keep allowlisted markup, harden links, and rewrite local images', () => {
  const body = sanitizeArticleBody(
    '<p onclick="bad()">안녕 <strong>세계</strong></p>' +
    '<a href="https://example.com" onclick="bad()">출처</a>' +
    '<img src="./img/feed-img01.webp" alt="예시" onerror="bad()">' +
    '<script>alert(1)</script>'
  );

  assert.match(body, /&lt;p onclick=/);
  assert.match(body, /<strong>세계<\/strong>/);
  assert.match(body, /href="https:\/\/example\.com" rel="noopener noreferrer" target="_blank"/);
  assert.match(body, /src="\.\.\/img\/feed-img01\.webp" alt="예시" loading="lazy"/);
  assert.doesNotMatch(body, /<script>/);
  assert.doesNotMatch(body, /onerror=/);
});

test('renderArticle emits canonical SEO metadata, JSON-LD, H1, and nested relative assets', () => {
  const post = samplePost({ title: '표준 <기술> & 인사이트' });
  const html = renderArticle(post, { updated: '2026-07-14' });

  assert.match(html, /<link rel="canonical" href="https:\/\/wickedstorm\.kr\/news\/2026-07-sample\.html">/);
  assert.match(html, /<meta property="og:type" content="article">/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/css\/style\.css">/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/fonts\/pretendard\//);
  assert.match(html, /<img src="\.\.\/img\/feed-img01\.webp"/);
  assert.doesNotMatch(html, /\n\+\s*<(figure|img)/);
  assert.match(html, /<h1[^>]*>\uD45C준 &lt;기술&gt; &amp; 인사이트<\/h1>/);
  assert.doesNotMatch(html, /<h1[^>]*>표준 <기술>/);

  const jsonLdSource = html.match(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/)?.[1];
  assert.ok(jsonLdSource);
  const jsonLd = JSON.parse(jsonLdSource);
  assert.equal(jsonLd['@type'], 'NewsArticle');
  assert.equal(jsonLd.mainEntityOfPage['@id'], 'https://wickedstorm.kr/news/2026-07-sample.html');
  assert.equal(jsonLd.datePublished, '2026-07-13');
  assert.equal(jsonLd.dateModified, '2026-07-14');
});

test('sitemap includes internal articles and excludes external posts and privacy', () => {
  const internal = samplePost();
  const external = samplePost({
    id: '2026-07-external',
    externalUrl: 'https://example.com/news',
  });
  const sitemap = renderSitemap([internal, external], { updated: '2026-07-14' });

  assert.match(sitemap, /https:\/\/wickedstorm\.kr\/news\/2026-07-sample\.html/);
  assert.doesNotMatch(sitemap, /2026-07-external/);
  assert.doesNotMatch(sitemap, /privacy\.html/);
});

test('all artifacts are rendered to a Map before callers write them', () => {
  const internal = samplePost();
  const external = samplePost({ id: 'external', externalUrl: 'https://example.com' });
  const artifacts = renderNewsArtifacts({
    version: 1,
    updated: '2026-07-14',
    posts: [internal, external],
  });

  assert.ok(artifacts.files instanceof Map);
  assert.deepEqual(artifacts.articlePaths, ['news/2026-07-sample.html']);
  assert.equal(artifacts.files.has('news/2026-07-sample.html'), true);
  assert.equal(artifacts.files.has('sitemap.xml'), true);
  assert.equal(artifacts.internalPosts.length, 1);
});

test('normalized duplicate ids and malformed records fail the whole render', () => {
  assert.throws(
    () => renderNewsArtifacts({
      updated: '2026-07-14',
      posts: [samplePost({ id: 'same' }), samplePost({ id: 'same' })],
    }),
    /Duplicate post id/
  );
  assert.throws(
    () => renderArticle(samplePost({ date: 'not-a-date' })),
    /invalid date/
  );
});
