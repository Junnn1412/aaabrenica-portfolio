// PF-051 — compiled-CSS coverage for the Process-page-only structural hooks
// in src/styles/pages/_process.scss: the ol/li/h3/dl/dd cascade-leak fixes,
// the sibling-divider rule, the forced-colors badge boundary, and the
// mobile-stack/desktop-grid responsive contract for .process-facts. Same
// sass.compile() + resolveProperty() method as
// tests/solutions-page-layout.test.mjs/tests/process-steps-layout.test.mjs.
//
// resolveProperty() is only used for properties with no media-conditional
// counterpart in this file (it resolves the whole cascade — including rules
// nested inside a @media block — by ordinary specificity/source-order,
// without modeling whether the media condition is actually true; a property
// declared both at the base level and inside @media (min-width: ...) would
// resolve to whichever one appears later in source, not "the base value").
// .process-facts__term/.process-facts__detail's margin is exactly that case
// (declared once at the base level, reset again inside the media block), so
// both values are asserted via direct regex against the compiled CSS text
// instead — same reasoning tests/solutions-page-layout.test.mjs's own
// header comment documents for its sticky-anchor rule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import { resolveProperty } from './helpers/cascade-resolver.mjs';

const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

test('resolved cascade: .process-detail (an <ol>) has max-width: none, margin: 0, padding: 0, list-style: none', () => {
  assert.equal(
    resolveProperty(
      css,
      { tag: 'ol', classes: ['process-detail'] },
      'max-width',
    ),
    'none',
  );
  assert.equal(
    resolveProperty(css, { tag: 'ol', classes: ['process-detail'] }, 'margin'),
    '0',
  );
  assert.equal(
    resolveProperty(css, { tag: 'ol', classes: ['process-detail'] }, 'padding'),
    '0',
  );
  assert.equal(
    resolveProperty(
      css,
      { tag: 'ol', classes: ['process-detail'] },
      'list-style',
    ),
    'none',
  );
});

test('resolved cascade: .process-detail__stage (a <li>) has margin: 0, not the inherited margin-bottom from the generic li rule', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'li', classes: ['process-detail__stage'] },
    'margin',
  );
  assert.equal(resolved, '0');
});

test('resolved cascade: .process-detail__heading (an <h3>) has margin: 0, not the inherited h1-h4 margin', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'h3', classes: ['process-detail__heading'] },
    'margin',
  );
  assert.equal(resolved, '0');
});

test('.process-detail__heading-row resolves to align-items: center', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'div', classes: ['process-detail__heading-row'] },
    'align-items',
  );
  assert.equal(resolved, 'center');
});

test(".process-detail__heading-row never reuses .section-header — PF-050's icon/heading margin-trap defect class cannot recur here", () => {
  assert.doesNotMatch(
    css,
    /\.process-detail__heading-row \.section-header/,
    'expected no ".process-detail__heading-row .section-header" rule to exist at all',
  );
});

test('resolved cascade: .process-facts (a <dl>, base/mobile) has margin and max-width set explicitly, resetting the browser default', () => {
  assert.equal(
    resolveProperty(css, { tag: 'dl', classes: ['process-facts'] }, 'margin'),
    'var(--space-6) 0 0',
  );
  assert.equal(
    resolveProperty(
      css,
      { tag: 'dl', classes: ['process-facts'] },
      'max-width',
    ),
    'none',
  );
});

test("base/mobile: .process-facts__term and .process-facts__detail carry their authored stacked-layout margins (asserted via direct regex — both properties are also touched inside the desktop media query, outside resolveProperty()'s documented scope)", () => {
  const termMatch = css.match(/\.process-facts__term\s*\{([^}]*)\}/);
  assert.ok(termMatch, 'expected a base ".process-facts__term" rule');
  assert.match(
    termMatch[1],
    /margin:\s*var\(--space-5\)\s*0\s*var\(--space-2\);/,
  );

  const detailMatch = css.match(/\.process-facts__detail\s*\{([^}]*)\}/);
  assert.ok(detailMatch, 'expected a base ".process-facts__detail" rule');
  assert.match(detailMatch[1], /margin:\s*0\s*0\s*var\(--space-4\);/);
});

test('desktop (min-width: 48em / spacing.$bp-md): .process-facts switches to a 2-column term/detail grid, and both term/detail margins reset to 0', () => {
  // Multiple unrelated @media (min-width: 48em) blocks exist in this
  // compiled stylesheet (_site-header.scss, _site-nav.scss both use the
  // same spacing.$bp-md token) — matchAll + find the one that actually
  // contains .process-facts, rather than a plain (first-match-wins) .match().
  // Terminator allows end-of-file as well as a trailing newline — this
  // block is the last rule in the compiled stylesheet, so its closing
  // brace has no following newline to match against.
  const blocks = [
    ...css.matchAll(/@media \(min-width:\s*48em\)\s*\{([\s\S]*?)\n\}(?:\n|$)/g),
  ];
  const block = blocks.find((b) => /\.process-facts\b/.test(b[1]));
  assert.ok(
    block,
    'expected a "@media (min-width: 48em)" block containing .process-facts',
  );
  const body = block[1];

  const factsRule = body.match(/\.process-facts\s*\{([^}]*)\}/);
  assert.ok(factsRule, 'expected ".process-facts" inside the media block');
  assert.match(factsRule[1], /display:\s*grid;/);
  assert.match(
    factsRule[1],
    /grid-template-columns:\s*minmax\(12rem,\s*16rem\)\s*1fr;/,
  );

  const termRule = body.match(/\.process-facts__term\s*\{([^}]*)\}/);
  assert.ok(termRule, 'expected ".process-facts__term" inside the media block');
  assert.match(termRule[1], /margin:\s*0;/);

  const detailRule = body.match(/\.process-facts__detail\s*\{([^}]*)\}/);
  assert.ok(
    detailRule,
    'expected ".process-facts__detail" inside the media block',
  );
  assert.match(detailRule[1], /margin:\s*0;/);
});

test('.process-detail__stage + .process-detail__stage carries the inter-stage divider border-top', () => {
  const match = css.match(
    /\.process-detail__stage \+ \.process-detail__stage\s*\{([^}]*)\}/,
  );
  assert.ok(
    match,
    'expected a ".process-detail__stage + .process-detail__stage" rule',
  );
  assert.match(
    match[1],
    /border-top:\s*var\(--border-width\)\s*solid\s*var\(--color-border\)/,
  );
});

test('forced-colors mode preserves the .process-detail__number badge boundary via an explicit border', () => {
  const blocks = [
    ...css.matchAll(/@media \(forced-colors: active\)\s*\{([\s\S]*?)\n\}\n/g),
  ];
  const badgeBlock = blocks.find((b) =>
    /\.process-detail__number\b/.test(b[1]),
  );
  assert.ok(
    badgeBlock,
    '.process-detail__number forced-colors block not found',
  );
  assert.match(
    badgeBlock[1],
    /border:\s*1px solid CanvasText;/,
    'expected the forced-colors block to supply an explicit badge boundary border',
  );
});
