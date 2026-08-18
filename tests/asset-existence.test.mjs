// Header/nav visual-polish task — direct coverage for the generic
// scripts/asset-existence.mjs module, extracted out of
// scripts/case-study-assets.mjs so a non-case-study caller (the site-wide
// header brand mark) doesn't have to import a case-study-named module for
// genuinely generic path-existence logic. tests/case-study-assets.test.mjs
// already exercises this same logic thoroughly via the
// `findMissingCaseStudyAssets` re-export — these are minimal sanity checks
// proving the extracted module itself works standalone, not a duplicate of
// that suite.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { findMissingAssets } from '../scripts/asset-existence.mjs';

function withFixtureDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'asset-existence-'));
  try {
    fs.mkdirSync(path.join(dir, 'images'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'images', 'present.png'), 'fake-bytes');
    fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('findMissingAssets reports nothing for a path that exists on disk', () => {
  withFixtureDir((dir) => {
    assert.deepEqual(findMissingAssets(dir, ['/images/present.png']), []);
  });
});

test('findMissingAssets fails clearly for a path that does not exist on disk', () => {
  withFixtureDir((dir) => {
    const problems = findMissingAssets(dir, ['/images/missing.png']);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /does not exist on disk/);
  });
});

test('findMissingAssets rejects a path that would resolve outside the root directory', () => {
  withFixtureDir((dir) => {
    const problems = findMissingAssets(dir, ['/../outside-the-root.png']);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /resolves outside the expected root directory/);
  });
});
