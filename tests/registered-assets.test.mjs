import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { routes } from '../src/config/routes.js';
import { contentByKey } from '../src/content/pages/index.js';
import { site } from '../src/config/site.js';
import {
  collectRegisteredAssetEntries,
  findRegisteredAssetProblems,
  normalizeAndDedupeAssetEntries,
} from '../scripts/registered-assets.mjs';

const fesPath =
  '/images/case-studies/fes-challenger/gallery/homepage-hero-desktop.png';
const fesCarouselPaths = [
  fesPath,
  '/images/case-studies/fes-challenger/gallery/services-page-desktop.png',
  '/images/case-studies/fes-challenger/gallery/projects-page-desktop.png',
];

function withRoots(run) {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'registered-assets-'));
  const publicRoot = path.join(parent, 'public');
  const distRoot = path.join(parent, 'dist');
  fs.mkdirSync(publicRoot);
  fs.mkdirSync(distRoot);
  try {
    run({ publicRoot, distRoot });
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
}

test('the shared FES gallery/project-card path normalizes to one filesystem check', () => {
  const entries = collectRegisteredAssetEntries({ routes, contentByKey, site });
  const fesEntries = entries.filter((entry) => entry.assetPath === fesPath);
  assert.ok(fesEntries.length > 1, 'fixture must include both consumer types');

  const unique = normalizeAndDedupeAssetEntries('C:/asset-root', fesEntries);
  assert.equal(unique.length, 1);
  assert.equal(unique[0].assetPath, fesPath);
  assert.ok(unique[0].sources.some((source) => source.startsWith('route:')));
  assert.ok(unique[0].sources.includes('project-card'));
});

test('all three FES carousel paths are registered once after cross-consumer de-duplication', () => {
  const entries = collectRegisteredAssetEntries({ routes, contentByKey, site });
  const unique = normalizeAndDedupeAssetEntries('C:/asset-root', entries);
  for (const assetPath of fesCarouselPaths) {
    assert.equal(
      unique.filter((entry) => entry.assetPath === assetPath).length,
      1,
    );
  }
});

test('two different missing physical paths produce two findings', () => {
  withRoots(({ publicRoot }) => {
    const entries = [
      { assetPath: '/images/one.png', source: 'one' },
      { assetPath: '/images/one.png', source: 'duplicate-one' },
      { assetPath: '/images/two.png', source: 'two' },
    ];
    const problems = findRegisteredAssetProblems(publicRoot, entries);
    assert.equal(problems.length, 2);
    assert.match(problems[0], /\/images\/one\.png/);
    assert.match(problems[1], /\/images\/two\.png/);
  });
});

test('exact-case mismatch detection survives combined de-duplication', () => {
  withRoots(({ publicRoot }) => {
    const dir = path.join(publicRoot, 'images');
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'Actual.PNG'), 'fixture');
    const problems = findRegisteredAssetProblems(publicRoot, [
      { assetPath: '/images/actual.png', source: 'first' },
      { assetPath: '/images/actual.png', source: 'duplicate' },
    ]);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /incorrect casing/);
    assert.match(problems[0], /Actual\.PNG/);
  });
});

test('public and dist roots produce identical de-duplicated findings', () => {
  withRoots(({ publicRoot, distRoot }) => {
    const entries = [
      { assetPath: '/images/shared.png', source: 'gallery' },
      { assetPath: '/images/shared.png', source: 'project-card' },
      { assetPath: '/images/other.png', source: 'brand' },
    ];
    const publicProblems = findRegisteredAssetProblems(publicRoot, entries);
    const distProblems = findRegisteredAssetProblems(distRoot, entries);
    assert.deepEqual(publicProblems, distProblems);
    assert.equal(publicProblems.length, 2);
  });
});
