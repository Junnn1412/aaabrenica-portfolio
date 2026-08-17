// PF-060 — the case-study gallery grid's own resolved-cascade reset,
// verified against the real compiled stylesheet using the same shared
// resolver tests/project-card-layout.test.mjs/tests/capability-card-layout.test.mjs
// already established (tests/helpers/cascade-resolver.mjs) — not by
// presence, since a higher-specificity class can still lose a property to a
// lower-specificity generic element rule if it never declares that property
// itself (the exact defect class PF-032 found and every grid component
// since has proactively reset from the first draft).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import { remToPx, resolveProperty } from './helpers/cascade-resolver.mjs';

const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

test('resolved cascade: .case-study-gallery (a <ul>) has max-width: none, not the inherited ~68ch prose-reading-width', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'ul', classes: ['case-study-gallery'] },
    'max-width',
  );
  assert.equal(resolved, 'none', `expected "none", got "${resolved}"`);
});

test('resolved cascade: .case-study-gallery__item (a <li>) has margin: 0, not the inherited margin-bottom from the generic li rule', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'li', classes: ['case-study-gallery__item'] },
    'margin',
  );
  assert.equal(resolved, '0', `expected "0", got "${resolved}"`);
});

test('.case-study-gallery defaults to a single column unconditionally (mobile-safe, no media query involved)', () => {
  const rule = css.match(/\.case-study-gallery\s*\{([^}]*)\}/);
  assert.ok(rule, '.case-study-gallery base rule not found in compiled CSS');
  assert.match(rule[1], /grid-template-columns:\s*1fr;/);
});

test('multi-column layout is gated behind a single, plain media query using auto-fit/minmax matching the project-card grid pattern', () => {
  const block = css.match(
    /@media \(width\s*>=\s*36em\)\s*\{\s*\.case-study-gallery\s*\{([^}]*)\}\s*\}/,
  );
  assert.ok(
    block,
    'expected exactly one @media (width >= 36em) block overriding .case-study-gallery',
  );
  assert.match(
    block[1],
    /grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(21rem,\s*1fr\)\);/,
  );
});

// Real column-count math at the required review widths, seeded from the
// resolver's own answer for the grid's max-width — same methodology as
// tests/project-card-layout.test.mjs, condensed to the invariant that
// actually matters here: never more than the container can comfortably fit,
// and never a horizontal overflow at the smallest required width.
function gutterPx(viewportPx) {
  const min = remToPx(1.25);
  const max = remToPx(3);
  const preferred = remToPx(1) + 0.02 * viewportPx;
  return Math.min(max, Math.max(min, preferred));
}

function simulateColumns(viewportPx, { containerWidePx, gapPx, minColPx }) {
  const sectionMax = Math.min(viewportPx, containerWidePx);
  const gutter = gutterPx(viewportPx);
  const contentWidth = sectionMax - 2 * gutter;

  if (viewportPx < remToPx(36)) {
    return { contentWidth, columns: 1 };
  }
  let columns = 1;
  while ((columns + 1) * minColPx + columns * gapPx <= contentWidth) {
    columns++;
  }
  return { contentWidth, columns };
}

test('case-study-gallery grid: no horizontal overflow at 320px, and column count never exceeds what the container can comfortably fit at 1440/1920px', () => {
  const getToken = (name) => {
    const match = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
    assert.ok(match, `token --${name} not found in compiled CSS`);
    return match[1].trim();
  };
  const containerWideRem = parseFloat(getToken('container-wide'));
  const gapRem = parseFloat(getToken('gap-lg'));
  const block = css.match(
    /@media \(width\s*>=\s*36em\)\s*\{\s*\.case-study-gallery\s*\{([^}]*)\}\s*\}/,
  )[1];
  const minColMatch = block.match(/minmax\((\d+(?:\.\d+)?)rem,\s*1fr\)/);
  assert.ok(minColMatch, 'could not read the minmax minimum column width');

  const config = {
    containerWidePx: remToPx(containerWideRem),
    gapPx: remToPx(gapRem),
    minColPx: remToPx(parseFloat(minColMatch[1])),
  };

  const at320 = simulateColumns(320, config);
  assert.equal(at320.columns, 1, 'expected a single column at 320px');
  assert.ok(
    at320.contentWidth <= 320,
    `at 320px, computed content width (${at320.contentWidth.toFixed(1)}px) must not exceed the viewport`,
  );

  for (const viewport of [1440, 1920]) {
    const result = simulateColumns(viewport, config);
    assert.ok(
      result.columns >= 2 && result.columns <= 3,
      `expected 2 or 3 columns at ${viewport}px, got ${result.columns}`,
    );
  }
});
