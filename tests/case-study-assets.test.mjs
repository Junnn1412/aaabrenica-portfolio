// PF-060 logo-integration follow-up — scripts/case-study-assets.mjs's pure
// helpers, exercised both against isolated fixture files (deterministic,
// no dependency on real repo state) and against the real repository (proves
// the actual configured FES logo path resolves for real, not just in
// theory — the same "assert against real output, not just a synthetic
// fixture" standard tests/case-study-render.test.mjs already applies to
// the rendered markup).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectCaseStudyAssetPaths,
  findMissingCaseStudyAssets,
} from '../scripts/case-study-assets.mjs';
import { routes } from '../src/config/routes.js';
import { contentByKey } from '../src/content/pages/index.js';

// --- collectCaseStudyAssetPaths --------------------------------------------

test('collectCaseStudyAssetPaths returns an empty array when no case-study media is present', () => {
  assert.deepEqual(collectCaseStudyAssetPaths({}), []);
  assert.deepEqual(collectCaseStudyAssetPaths({ heading: 'X' }), []);
});

test('collectCaseStudyAssetPaths collects logo, hero, and every gallery item src', () => {
  const content = {
    logo: { src: '/images/case-studies/example/logo.png', alt: '' },
    heroMedia: { src: '/images/case-studies/example/hero.webp' },
    gallery: {
      items: [
        { src: '/images/case-studies/example/one.webp' },
        { src: '/images/case-studies/example/two.webp' },
      ],
    },
  };
  assert.deepEqual(collectCaseStudyAssetPaths(content), [
    '/images/case-studies/example/logo.png',
    '/images/case-studies/example/hero.webp',
    '/images/case-studies/example/one.webp',
    '/images/case-studies/example/two.webp',
  ]);
});

// --- findMissingCaseStudyAssets, against an isolated fixture directory ----

function withFixtureDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'case-study-assets-'));
  try {
    fs.mkdirSync(path.join(dir, 'images'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'images', 'present.png'), 'fake-bytes');
    fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('findMissingCaseStudyAssets reports nothing for a path that exists on disk', () => {
  withFixtureDir((dir) => {
    const problems = findMissingCaseStudyAssets(dir, ['/images/present.png']);
    assert.deepEqual(problems, []);
  });
});

test('findMissingCaseStudyAssets fails clearly for a path that does not exist on disk', () => {
  withFixtureDir((dir) => {
    const problems = findMissingCaseStudyAssets(dir, ['/images/missing.png']);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /does not exist on disk/);
    assert.match(problems[0], /\/images\/missing\.png/);
  });
});

test('findMissingCaseStudyAssets rejects a path that would resolve outside the root directory', () => {
  withFixtureDir((dir) => {
    const problems = findMissingCaseStudyAssets(dir, [
      '/../outside-the-root.png',
    ]);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /resolves outside the expected root directory/);
  });
});

test('findMissingCaseStudyAssets returns no problems for an empty asset list', () => {
  withFixtureDir((dir) => {
    assert.deepEqual(findMissingCaseStudyAssets(dir, []), []);
  });
});

// --- Real repository state --------------------------------------------------

const publicRootPath = fileURLToPath(new URL('../public/', import.meta.url));

test("the real FES Challenger content module's configured logo resolves to a real file under public/", () => {
  const content = contentByKey['work-fes-challenger'];
  const assetPaths = collectCaseStudyAssetPaths(content);
  assert.ok(
    assetPaths.includes(
      '/images/case-studies/fes-challenger/fes-challenger-logo.png',
    ),
    'expected the real content module to configure the approved logo path',
  );
  assert.deepEqual(
    findMissingCaseStudyAssets(publicRootPath, assetPaths),
    [],
    'the configured logo must exist on disk under public/',
  );
});

test('every case-study route with no logo/gallery configured has nothing to check (clean omission)', () => {
  for (const route of routes) {
    if (route.template !== 'case-study') continue;
    if (route.key === 'work-fes-challenger') continue; // has a real logo
    const content = contentByKey[route.content];
    assert.deepEqual(
      collectCaseStudyAssetPaths(content),
      [],
      `expected route "${route.key}" (no logo/gallery yet) to have no assets to check`,
    );
  }
});
