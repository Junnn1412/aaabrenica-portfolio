// PF-050 — proves the .home-section -> .page-section extraction
// (src/styles/components/_hero.scss -> src/styles/objects/_page-section.scss)
// is a strict class rename with zero computed-value change: no old
// selector left behind, and the two declarations resolve to exactly what
// .home-section used to declare. Same sass.compile()-on-main.scss method
// as tests/page-shell-layout.test.mjs/tests/design-tokens.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import { resolveProperty } from './helpers/cascade-resolver.mjs';

const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

test('.home-section no longer appears anywhere in the compiled stylesheet', () => {
  assert.doesNotMatch(css, /\.home-section/);
});

test('.page-section carries the same padding-block the old .home-section rule declared', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'section', classes: ['page-section'] },
    'padding-block',
  );
  assert.equal(resolved, 'var(--space-8)');
});

test('.page-section + .page-section carries the same divider border-top the old .home-section + .home-section rule declared', () => {
  const match = css.match(/\.page-section \+ \.page-section\s*\{([^}]*)\}/);
  assert.ok(match, 'expected a ".page-section + .page-section" rule');
  assert.match(
    match[1],
    /border-top:\s*var\(--border-width\)\s*solid\s*var\(--color-border\)/,
  );
});
