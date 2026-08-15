import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSafeInternalPath } from '../src/pages/link-safety.js';

test('accepts a plain internal path', () => {
  assert.equal(isSafeInternalPath('/work/fes-challenger/'), true);
  assert.equal(isSafeInternalPath('/'), true);
});

test('rejects javascript: URLs', () => {
  assert.equal(isSafeInternalPath('javascript:alert(1)'), false);
});

test('rejects external http(s) URLs', () => {
  assert.equal(isSafeInternalPath('http://example.com'), false);
  assert.equal(isSafeInternalPath('https://example.com'), false);
});

test('rejects mailto: URLs', () => {
  assert.equal(isSafeInternalPath('mailto:test@example.com'), false);
});

test('rejects protocol-relative URLs', () => {
  assert.equal(isSafeInternalPath('//evil.com'), false);
});

test('rejects non-string and empty-string input', () => {
  assert.equal(isSafeInternalPath(''), false);
  assert.equal(isSafeInternalPath(null), false);
  assert.equal(isSafeInternalPath(undefined), false);
  assert.equal(isSafeInternalPath(42), false);
});
