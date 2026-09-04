import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MARKERS,
  getMarkerProblems,
  composePage,
} from '../src/pages/compose.js';

const route = { key: 'test-route', entry: 'test/index.html' };

const validSkeleton = `<!doctype html>
<html>
  <head><!--@head--></head>
  <body data-page="__PAGE_KEY__">
    <!--@header-->
    <main><!--@content--></main>
    <!--@footer-->
  </body>
</html>`;

const parts = {
  head: '<title>Test</title>',
  header: '<header>H</header>',
  main: '<p>C</p>',
  footer: '<footer>F</footer>',
};

test('getMarkerProblems reports nothing for a well-formed skeleton', () => {
  assert.deepEqual(getMarkerProblems(validSkeleton, route), []);
});

test('getMarkerProblems reports a missing marker with count 0', () => {
  const broken = validSkeleton.replace(MARKERS.head, '');
  const problems = getMarkerProblems(broken, route);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /marker "<!--@head-->".*found 0/);
});

test('getMarkerProblems reports a duplicated marker with count 2', () => {
  const broken = validSkeleton.replace(
    MARKERS.footer,
    `${MARKERS.footer}${MARKERS.footer}`,
  );
  const problems = getMarkerProblems(broken, route);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /marker "<!--@footer-->".*found 2/);
});

test('composePage throws on a skeleton with invalid markers', () => {
  const broken = validSkeleton.replace(MARKERS.head, '');
  assert.throws(
    () => composePage(broken, route, parts),
    /invalid skeleton markers/,
  );
});

test('composePage replaces every marker and leaves none behind', () => {
  const result = composePage(validSkeleton, route, parts);
  assert.match(result, /<title>Test<\/title>/);
  assert.match(result, /data-page="test-route"/);
  assert.match(result, /<header>H<\/header>/);
  assert.match(result, /<p>C<\/p>/);
  assert.match(result, /<footer>F<\/footer>/);
  for (const marker of Object.values(MARKERS)) {
    assert.equal(
      result.includes(marker),
      false,
      `marker ${marker} should not remain`,
    );
  }
});
