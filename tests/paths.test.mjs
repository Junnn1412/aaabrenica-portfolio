import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePath, resolveEntryPath } from '../src/pages/paths.js';

test('normalizePath converts backslashes to forward slashes', () => {
  assert.equal(
    normalizePath('D:\\Projects\\aaabrenica-portfolio\\src'),
    'd:/Projects/aaabrenica-portfolio/src',
  );
});

test('normalizePath lowercases a leading Windows drive letter', () => {
  assert.equal(normalizePath('D:/Projects/foo'), 'd:/Projects/foo');
  assert.equal(normalizePath('d:/Projects/foo'), 'd:/Projects/foo');
});

test('normalizePath leaves an already-normalized POSIX path unchanged', () => {
  assert.equal(
    normalizePath('/home/user/project/src'),
    '/home/user/project/src',
  );
});

test('resolveEntryPath resolves a relative entry against a synthetic root URL', () => {
  const root = new URL('file:///D:/Projects/aaabrenica-portfolio/');
  assert.equal(
    resolveEntryPath(root, 'solutions/index.html'),
    'd:/Projects/aaabrenica-portfolio/solutions/index.html',
  );
});

test('resolveEntryPath is consistent regardless of the root URL case', () => {
  const upper = new URL('file:///D:/Projects/aaabrenica-portfolio/');
  const lower = new URL('file:///d:/Projects/aaabrenica-portfolio/');
  assert.equal(
    resolveEntryPath(upper, 'index.html'),
    resolveEntryPath(lower, 'index.html'),
  );
});
