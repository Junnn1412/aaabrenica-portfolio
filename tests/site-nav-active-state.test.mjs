// Header/nav visual-polish task — proves the new active-route indicator
// and the header-scoped underline removal, resolved against the real
// compiled stylesheet, not by presence alone. `[aria-current='page']` is an
// attribute selector tests/helpers/cascade-resolver.mjs's generic resolver
// can't model (it only matches on tag + class, the same limitation
// project-card-layout.test.mjs already worked around for
// `:focus-visible`) — so this file matches the exact compiled rule block
// directly, the same pattern used there.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import { resolveProperty } from './helpers/cascade-resolver.mjs';

const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

test('resolved cascade: .site-header__brand has text-decoration: none, not the inherited global underline', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'a', classes: ['site-header__brand'] },
    'text-decoration',
  );
  assert.equal(resolved, 'none', `expected "none", got "${resolved}"`);
});

test('sanity check: an unrelated plain <a> still resolves to the global underline (proves the resolver reflects real cascade behavior, not a vacuous pass)', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'a', classes: ['unrelated-probe-class'] },
    'text-decoration',
  );
  assert.equal(resolved, 'underline');
});

test('the compiled .site-nav a:not(.btn) rule sets text-decoration: none and reserves a transparent border-bottom (no layout shift when a link becomes active)', () => {
  const matches = [...css.matchAll(/\.site-nav a:not\(\.btn\)\s*\{([^}]*)\}/g)];
  assert.ok(
    matches.length > 0,
    'expected at least one .site-nav a:not(.btn) rule',
  );
  const baseRule = matches[0][1];
  assert.match(baseRule, /text-decoration:\s*none;/);
  assert.match(
    baseRule,
    /border-bottom:\s*var\(--focus-ring-width\)\s*solid\s*transparent;/,
    'expected every link (not just the active one) to reserve the indicator space',
  );
});

test('the compiled .site-nav a[aria-current="page"] rule sets a real accent-colored border-bottom, not text-decoration: underline', () => {
  // Dart Sass emits attribute-selector values unquoted whenever the value
  // is already a valid CSS identifier (e.g. `page`) — confirmed by
  // compiling this file directly and inspecting the output; matching a
  // literal quote here would never match the real compiled CSS.
  const matches = [
    ...css.matchAll(/\.site-nav a\[aria-current=page\]\s*\{([^}]*)\}/g),
  ];
  assert.equal(
    matches.length,
    1,
    `expected exactly one .site-nav a[aria-current=page] rule, found ${matches.length}`,
  );
  const rule = matches[0][1];
  assert.match(rule, /color:\s*var\(--color-accent-text\);/);
  assert.match(rule, /font-weight:\s*600;/);
  assert.match(rule, /border-bottom-color:\s*var\(--color-accent\);/);
  assert.doesNotMatch(
    rule,
    /text-decoration:\s*underline/,
    'the active state must not rely on the default text underline',
  );
});

test('.site-brand__mark is bounded and preserves aspect ratio: fixed height, capped width, object-fit: contain', () => {
  const match = css.match(/\.site-brand__mark\s*\{([^}]*)\}/);
  assert.ok(match, '.site-brand__mark rule not found');
  const rule = match[1];
  assert.match(rule, /height:\s*2\.25rem;/);
  assert.match(rule, /width:\s*auto;/);
  assert.match(rule, /max-width:\s*3rem;/);
  assert.match(rule, /object-fit:\s*contain;/);
});
