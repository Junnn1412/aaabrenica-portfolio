import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import homeContent from '../src/content/pages/home.js';
import workContent from '../src/content/pages/work/index.js';
import { routes } from '../src/config/routes.js';
import { validateContent } from '../src/pages/content-schema.js';
import {
  collectProjectCardAssetPaths,
  findMissingProjectCardAssets,
} from '../scripts/project-card-assets.mjs';

const expectedPaths = [
  '/images/case-studies/fes-challenger/gallery/homepage-hero-desktop.png',
  '/images/case-studies/fes-challenger/gallery/services-page-desktop.png',
  '/images/case-studies/fes-challenger/gallery/projects-page-desktop.png',
];

test('project-card asset collection includes all shared FES carousel images once and omits text-only/deferred cards', () => {
  const paths = collectProjectCardAssetPaths([
    ...homeContent.projects.items,
    ...workContent.projects.items,
  ]);
  assert.deepEqual(paths, expectedPaths);
});

test('every production Home and Work project card declares an explicit schema-valid presentation', () => {
  const allowedKinds = new Set(['image', 'carousel', 'text-only', 'deferred']);
  for (const content of [homeContent, workContent]) {
    for (const item of content.projects.items) {
      assert.ok(item.presentation);
      assert.ok(allowedKinds.has(item.presentation.kind));
    }
  }
  for (const key of ['home', 'work']) {
    const route = routes.find((candidate) => candidate.key === key);
    const content = key === 'home' ? homeContent : workContent;
    assert.deepEqual(validateContent(route, content), []);
  }
});

test('the configured FES carousel images exist at exact case under public/', () => {
  const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));
  assert.deepEqual(findMissingProjectCardAssets(publicRoot, expectedPaths), []);
});

test('project-card exact-case validation fails independently of host filesystem case sensitivity', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'project-card-assets-'));
  try {
    const assetDir = path.join(root, 'images', 'projects');
    fs.mkdirSync(assetDir, { recursive: true });
    fs.writeFileSync(path.join(assetDir, 'Thumbnail.PNG'), 'fixture');
    const problems = findMissingProjectCardAssets(root, [
      '/images/projects/thumbnail.png',
    ]);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /incorrect casing/);
    assert.match(problems[0], /Thumbnail\.PNG/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('pre-build and post-build validators use the combined registered-asset boundary', () => {
  const validateSource = fs.readFileSync(
    fileURLToPath(new URL('../scripts/validate-routes.mjs', import.meta.url)),
    'utf8',
  );
  const verifySource = fs.readFileSync(
    fileURLToPath(
      new URL('../scripts/verify-build-output.mjs', import.meta.url),
    ),
    'utf8',
  );
  assert.match(validateSource, /checkRegisteredAssetsExist\(\);/);
  assert.match(validateSource, /checked under public\//);
  assert.match(verifySource, /checkRegisteredAssetsInDist\(\);/);
  assert.match(verifySource, /checked under dist\//);
});
