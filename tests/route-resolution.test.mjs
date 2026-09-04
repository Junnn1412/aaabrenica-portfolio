import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveHtmlRequest } from '../src/pages/route-resolution.js';

const previewEntryPath = 'd:/project/dev/design-system/index.html';
const homeRoute = { key: 'home', path: '/' };
const routesByFile = new Map([['d:/project/index.html', homeRoute]]);
const context = { routesByFile, previewEntryPath };

test('a registered route resolves to kind "route" with the matching route object', () => {
  const result = resolveHtmlRequest('d:/project/index.html', context);
  assert.equal(result.kind, 'route');
  assert.equal(result.route, homeRoute);
});

test('the exact approved preview file resolves to kind "preview"', () => {
  const result = resolveHtmlRequest(previewEntryPath, context);
  assert.equal(result.kind, 'preview');
});

test('an unregistered root HTML file resolves to kind "unregistered"', () => {
  const result = resolveHtmlRequest('d:/project/random.html', context);
  assert.equal(result.kind, 'unregistered');
});

test('a different file under dev/ (not the exact preview file) resolves to "unregistered"', () => {
  assert.equal(
    resolveHtmlRequest('d:/project/dev/design-system/other.html', context).kind,
    'unregistered',
  );
  assert.equal(
    resolveHtmlRequest('d:/project/dev/other-page/index.html', context).kind,
    'unregistered',
  );
});

test('a similarly-prefixed sibling path does not bypass the exact-match boundary', () => {
  assert.equal(
    resolveHtmlRequest('d:/project/dev/design-system-2/index.html', context)
      .kind,
    'unregistered',
  );
  assert.equal(
    resolveHtmlRequest(`${previewEntryPath}.evil`, context).kind,
    'unregistered',
  );
});
