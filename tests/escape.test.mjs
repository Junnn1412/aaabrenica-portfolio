import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml } from '../src/pages/escape.js';

test('escapeHtml escapes every special character', () => {
  assert.equal(escapeHtml('&<>"\''), '&amp;&lt;&gt;&quot;&#39;');
});

test('escapeHtml leaves plain text unchanged', () => {
  assert.equal(escapeHtml('Foundation placeholder'), 'Foundation placeholder');
});

test('escapeHtml escapes a script tag rather than passing it through', () => {
  assert.equal(
    escapeHtml('<script>alert(1)</script>'),
    '&lt;script&gt;alert(1)&lt;/script&gt;',
  );
});

test('escapeHtml coerces non-string input via String()', () => {
  assert.equal(escapeHtml(42), '42');
  assert.equal(escapeHtml(null), 'null');
});
