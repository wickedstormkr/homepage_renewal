#!/usr/bin/env node

import { readFile, readdir, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderNewsArtifacts } from '../lambda/admin-api/news-artifacts.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(SCRIPT_DIR, '..');
const CHECK_MODE = process.argv.includes('--check');
const unknownArgs = process.argv.slice(2).filter((arg) => arg !== '--check');

if (unknownArgs.length) {
  throw new TypeError(`Unknown argument(s): ${unknownArgs.join(', ')}`);
}

async function readPosts() {
  const source = await readFile(path.join(SITE_ROOT, 'data/posts.json'), 'utf8');
  return JSON.parse(source);
}

async function existingArticlePaths() {
  const newsDirectory = path.join(SITE_ROOT, 'news');
  try {
    const entries = await readdir(newsDirectory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
      .map((entry) => `news/${entry.name}`)
      .sort();
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function checkArtifacts(artifacts) {
  const differences = [];

  for (const [relativePath, expected] of artifacts.files) {
    try {
      const actual = await readFile(path.join(SITE_ROOT, relativePath), 'utf8');
      if (actual !== expected) differences.push(`${relativePath}: content differs`);
    } catch (error) {
      if (error.code === 'ENOENT') differences.push(`${relativePath}: missing`);
      else throw error;
    }
  }

  const expectedArticles = new Set(artifacts.articlePaths);
  for (const relativePath of await existingArticlePaths()) {
    if (!expectedArticles.has(relativePath)) differences.push(`${relativePath}: stale`);
  }

  if (differences.length) {
    for (const difference of differences) console.error(difference);
    process.exitCode = 1;
    return;
  }

  console.log(`News artifacts are current (${artifacts.articlePaths.length} articles).`);
}

async function writeArtifacts(artifacts) {
  // renderNewsArtifacts completes every document in memory before this function runs.
  await mkdir(path.join(SITE_ROOT, 'news'), { recursive: true });

  await Promise.all(
    Array.from(artifacts.files, ([relativePath, contents]) =>
      writeFile(path.join(SITE_ROOT, relativePath), contents, 'utf8')
    )
  );

  const expectedArticles = new Set(artifacts.articlePaths);
  const staleArticles = (await existingArticlePaths()).filter(
    (relativePath) => !expectedArticles.has(relativePath)
  );
  await Promise.all(staleArticles.map((relativePath) => rm(path.join(SITE_ROOT, relativePath))));

  console.log(`Generated ${artifacts.articlePaths.length} articles and sitemap.xml.`);
}

const payload = await readPosts();
const artifacts = renderNewsArtifacts(payload);

if (CHECK_MODE) await checkArtifacts(artifacts);
else await writeArtifacts(artifacts);
