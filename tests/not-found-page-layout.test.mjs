// PF-055 visual correction — same cascade-resolver method as
// tests/contact-page-layout.test.mjs (docs/DECISION_LOG.md's PF-032/033
// ul/li-reset defect class): proves the real cascade-winning declaration,
// not just that a reset rule exists somewhere in the file.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import { resolveProperty } from './helpers/cascade-resolver.mjs';

const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

test('resolved cascade: .not-found__links (a <ul>) has max-width: none, not the inherited ~68ch prose-reading-width', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'ul', classes: ['not-found__links'] },
    'max-width',
  );
  assert.equal(resolved, 'none');
});

test('resolved cascade: .not-found__links (a <ul>) has margin: var(--space-6) 0 0, not the inherited margin', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'ul', classes: ['not-found__links'] },
    'margin',
  );
  assert.equal(resolved, 'var(--space-6) 0 0');
});

// .not-found__link-item is a real, explicit class on the <li> itself (not
// a `.not-found__links li` descendant selector) specifically so this is
// resolvable: tests/helpers/cascade-resolver.mjs only matches single
// simple/compound selectors (bare tag, single class, or a tag+class/
// class+class compound with no combinator) — a descendant selector like
// `.not-found__links li` would get misparsed as a compound selector on
// class "not-found__links" alone, which not only fails to prove the <li>
// reset but pollutes resolution of the real `.not-found__links` block rule
// too (confirmed directly: it made this file's own <ul> margin test above
// report the <li>'s "0" instead of the block rule's actual value, before
// this fix).
test('resolved cascade: .not-found__link-item (a <li>) has margin: 0, not the inherited margin-bottom', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'li', classes: ['not-found__link-item'] },
    'margin',
  );
  assert.equal(resolved, '0');
});

test('resolved cascade: .not-found__link (the anchor) has a real border, radius, and background-color distinct from a bare <a>', () => {
  const border = resolveProperty(
    css,
    { tag: 'a', classes: ['not-found__link'] },
    'border',
  );
  const radius = resolveProperty(
    css,
    { tag: 'a', classes: ['not-found__link'] },
    'border-radius',
  );
  const background = resolveProperty(
    css,
    { tag: 'a', classes: ['not-found__link'] },
    'background-color',
  );
  const textDecoration = resolveProperty(
    css,
    { tag: 'a', classes: ['not-found__link'] },
    'text-decoration',
  );
  assert.equal(
    border,
    'var(--border-width) solid var(--color-border-interactive)',
  );
  assert.equal(radius, 'var(--radius-md)');
  assert.equal(background, 'transparent');
  assert.equal(
    textDecoration,
    'none',
    'expected the bare <a> rule\'s "underline" to be overridden, not just co-present',
  );
});
