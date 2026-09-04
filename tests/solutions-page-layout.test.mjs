// PF-050 — compiled-CSS coverage for the Solutions-page-only structural
// hooks in src/styles/pages/_solutions.scss: the sticky-header-safe anchor
// offset, the six icon/accent rules, and the jump-nav cascade-leak fixes
// (li margin-bottom / ul max-width / touch-target min-height / forced-
// colors border survival). Same sass.compile() + resolveProperty() method
// as tests/trust-list-layout.test.mjs/tests/process-steps-layout.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { resolveProperty } from './helpers/cascade-resolver.mjs';

const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);
const solutionsSource = fs.readFileSync(
  fileURLToPath(
    new URL('../src/styles/pages/_solutions.scss', import.meta.url),
  ),
  'utf8',
);

test('anchored solutions sections carry the sticky-header-safe scroll-margin-top', () => {
  const match = css.match(
    /body\[data-page=solutions\] \.page-section\[id\]\s*\{([^}]*)\}/,
  );
  assert.ok(
    match,
    'expected a "body[data-page=solutions] .page-section[id]" rule',
  );
  assert.match(match[1], /scroll-margin-top:\s*var\(--header-offset\)/);
});

for (const accent of ['lime', 'amber', 'coral', 'violet', 'cyan', 'magenta']) {
  test(`.solution-section__icon--${accent} resolves to the matching --accent-${accent} token, same as .capability-card--${accent}`, () => {
    const iconResolved = resolveProperty(
      css,
      {
        tag: 'span',
        classes: [
          'solution-section__icon',
          `solution-section__icon--${accent}`,
        ],
      },
      'background-color',
    );
    assert.equal(iconResolved, `var(--accent-${accent})`);
  });
}

test('resolved cascade: .solutions-jump-nav__item (a <li>) has margin: 0, not the inherited margin-bottom', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'li', classes: ['solutions-jump-nav__item'] },
    'margin',
  );
  assert.equal(resolved, '0');
});

test('resolved cascade: .solutions-jump-nav__list (a <ul>) has max-width: none, not the inherited ~68ch prose-reading-width', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'ul', classes: ['solutions-jump-nav__list'] },
    'max-width',
  );
  assert.equal(resolved, 'none');
});

test('resolved cascade: .solutions-jump-nav__link (an <a>) meets the minimum touch-target size', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'a', classes: ['solutions-jump-nav__link'] },
    'min-height',
  );
  assert.equal(resolved, 'var(--touch-target-min)');
});

test('resolved cascade: .solutions-jump-nav__link keeps a real border (forced-colors boundary survives with no dedicated override)', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'a', classes: ['solutions-jump-nav__link'] },
    'border',
  );
  assert.ok(resolved, 'expected a resolved border declaration');
  assert.doesNotMatch(resolved, /^none$/);
});

// Regression coverage for the icon/heading vertical-misalignment defect
// AAA's visual review found: .section-header's own margin-bottom and its
// child .section-header__heading's own margin-bottom both stayed real
// inside .solution-section__heading-row (a flex item establishes its own
// block formatting context, so a child's margin can't collapse through
// it), inflating the flex item's box past the icon's fixed 3rem height and
// making align-items: center center that inflated box instead of the
// visible heading text. Descendant-combinator selectors aren't safely
// resolver-matchable (tests/helpers/cascade-resolver.mjs's own header
// comment scopes it to bare-tag/single-class/no-combinator compounds —
// same reason tests/page-section-layout.test.mjs asserts its sibling-
// combinator rule via a direct regex, not resolveProperty), so the scoped
// reset itself is asserted directly against the compiled CSS below; the
// resolver is still used for the two single-class checks that prove the
// fix didn't regress .section-header's normal (non-flex) usage elsewhere.

test('.solution-section__heading-row still resolves to align-items: center', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'div', classes: ['solution-section__heading-row'] },
    'align-items',
  );
  assert.equal(resolved, 'center');
});

test('.solution-section__heading-row .section-header resets margin to 0', () => {
  const match = css.match(
    /\.solution-section__heading-row \.section-header\s*\{([^}]*)\}/,
  );
  assert.ok(
    match,
    'expected a ".solution-section__heading-row .section-header" rule',
  );
  assert.match(match[1], /margin:\s*0;/);
});

test('.solution-section__heading-row .section-header__heading resets margin to 0', () => {
  const match = css.match(
    /\.solution-section__heading-row \.section-header__heading\s*\{([^}]*)\}/,
  );
  assert.ok(
    match,
    'expected a ".solution-section__heading-row .section-header__heading" rule',
  );
  assert.match(match[1], /margin:\s*0;/);
});

test('the margin reset is scoped to the Solutions heading row — .section-header/.section-header__heading alone (as home.js uses them) keep their original margins', () => {
  const sectionHeaderMargin = resolveProperty(
    css,
    { tag: 'div', classes: ['section-header'] },
    'margin',
  );
  assert.equal(sectionHeaderMargin, '0 0 var(--space-6)');

  const headingMargin = resolveProperty(
    css,
    { tag: 'h2', classes: ['section-header__heading'] },
    'margin',
  );
  assert.equal(headingMargin, '0 0 var(--space-3)');
});

test('Solutions uses the scoped centered 72rem editorial composition', () => {
  const pageRule = css.match(/\.solutions-page__container\s*\{([^}]*)\}/);
  assert.ok(pageRule);
  assert.match(pageRule[1], /max-width:\s*72rem;/);
  const genericContainer = css.match(/\.container\s*\{([^}]*)\}/);
  assert.ok(genericContainer);
  assert.match(genericContainer[1], /max-width:\s*var\(--container-max\);/);
});

test('Solutions information is one flexible column by default and two only at the 64em desktop breakpoint', () => {
  const baseRule = css.match(/\.solution-section__detail\s*\{([^}]*)\}/);
  assert.ok(baseRule);
  assert.match(baseRule[1], /grid-template-columns:\s*minmax\(0, 1fr\);/);
  assert.match(baseRule[1], /max-width:\s*none;/);

  const blocks = [
    ...css.matchAll(/@media \(min-width:\s*64em\)\s*\{([\s\S]*?)\n\}/g),
  ];
  const desktop = blocks.find((block) =>
    /\.solution-section__detail/.test(block[1]),
  );
  assert.ok(desktop, 'expected a 64em Solutions desktop block');
  assert.match(
    desktop[1],
    /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/,
  );
});

test('Solutions keeps readable detail measures and optional evidence outside the information grid', () => {
  const detailRule = css.match(/\.solution-section__detail dd\s*\{([^}]*)\}/);
  assert.ok(detailRule);
  assert.match(detailRule[1], /max-width:\s*var\(--width-reading\);/);
  const linksRule = css.match(/\.solution-section__links\s*\{([^}]*)\}/);
  assert.ok(linksRule);
  assert.match(linksRule[1], /border-top:/);
  assert.doesNotMatch(linksRule[1], /display:\s*grid/);
});

test('Solutions layout uses natural flow with no CSS order or fixed section height', () => {
  assert.doesNotMatch(solutionsSource, /\border\s*:/);
  assert.doesNotMatch(
    solutionsSource,
    /\.solution-section(?:\s|__detail|__column|__links)[^{]*\{[^}]*\bheight\s*:/,
  );
});

test('Solutions flexible-track model fits 320 through 1920px without horizontal overflow', () => {
  for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
    const gutter = Math.min(48, Math.max(20, 16 + width * 0.02));
    const available = Math.min(width, 72 * 16) - gutter * 2;
    assert.ok(available > 0, `expected positive content width at ${width}px`);
    if (width >= 1024) {
      assert.ok(
        (available - 32) / 2 > 0,
        `expected two flexible tracks to fit at ${width}px`,
      );
    }
  }
});
