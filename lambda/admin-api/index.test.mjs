import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validatePostsPayload, sanitizeBody } from './index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const POSTS_JSON = path.resolve(HERE, '../../data/posts.json');

function samplePost(overrides = {}) {
  return {
    id: '2026-07-sample',
    category: 'news',
    date: '2026.07.13',
    title: '유효한 제목',
    summary: '유효한 요약입니다.',
    body: '<p>본문</p>',
    thumb: null,
    externalUrl: null,
    pinned: false,
    ...overrides,
  };
}

function samplePayload(post) {
  return { version: 1, updated: '2026-07-13', posts: [post] };
}

test('valid title/summary payload passes', () => {
  assert.equal(validatePostsPayload(samplePayload(samplePost())), null);
});

test('title containing "<" or ">" is rejected', () => {
  assert.match(
    validatePostsPayload(samplePayload(samplePost({ title: '제목 <b>굵게</b>' }))),
    /title must not contain/
  );
  assert.match(
    validatePostsPayload(samplePayload(samplePost({ title: '5 > 3 인 부등호' }))),
    /title must not contain/
  );
});

test('summary containing "<" or ">" is rejected', () => {
  assert.match(
    validatePostsPayload(samplePayload(samplePost({ summary: '요약 <script>' }))),
    /summary must not contain/
  );
});

test('body markup is still allowed (sanitizeBody handles it)', () => {
  assert.equal(validatePostsPayload(samplePayload(samplePost({ body: '<p>본문 <strong>강조</strong></p>' }))), null);
  assert.match(sanitizeBody('<p>본문 <strong>강조</strong></p>'), /<strong>강조<\/strong>/);
});

test('existing data/posts.json (8 posts) passes validation and has no "<"/">" in title/summary', async () => {
  const payload = JSON.parse(await readFile(POSTS_JSON, 'utf8'));
  assert.equal(validatePostsPayload(payload), null);
  for (const post of payload.posts) {
    assert.doesNotMatch(post.title, /[<>]/, `title of ${post.id}`);
    assert.doesNotMatch(post.summary, /[<>]/, `summary of ${post.id}`);
  }
});
