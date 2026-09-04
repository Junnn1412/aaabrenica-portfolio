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
import { renderRoute } from '../src/pages/render.js';
import { renderCaseStudyPage } from '../src/pages/templates/case-study.js';
import { routes } from '../src/config/routes.js';
import { primaryNav } from '../src/config/navigation.js';
import { site } from '../src/config/site.js';

const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

const heroRow = {
  tag: 'div',
  classes: ['case-study-hero__heading-row'],
};
const heroLogo = {
  tag: 'img',
  classes: ['case-study-hero__logo'],
  ancestors: [heroRow],
};
const heroHeading = {
  tag: 'h1',
  classes: [],
  ancestors: [heroRow],
};
const desktopLogoMediaRe =
  /@media \(min-width: 48em\) \{\s*\.case-study-hero__logo\s*\{[^{}]*\}\s*\}/;

function cssBelowLogoBreakpoint() {
  assert.match(css, desktopLogoMediaRe);
  return css.replace(desktopLogoMediaRe, '');
}

test('case-study hero logo resolves to its approved responsive size without losing its intrinsic aspect ratio', () => {
  const mobileCss = cssBelowLogoBreakpoint();
  assert.equal(resolveProperty(mobileCss, heroLogo, 'height'), '3.5rem');
  assert.equal(resolveProperty(css, heroLogo, 'height'), '4.5rem');
  assert.equal(resolveProperty(mobileCss, heroLogo, 'width'), 'auto');
  assert.equal(resolveProperty(css, heroLogo, 'width'), 'auto');
  assert.equal(resolveProperty(css, heroLogo, 'object-fit'), 'contain');
});

test('case-study hero logo is a nonshrinking block with no generic image rule overriding its box', () => {
  for (const stylesheet of [cssBelowLogoBreakpoint(), css]) {
    assert.equal(resolveProperty(stylesheet, heroLogo, 'display'), 'block');
    assert.equal(resolveProperty(stylesheet, heroLogo, 'flex'), '0 0 auto');
    assert.equal(resolveProperty(stylesheet, heroLogo, 'margin'), '0');
    assert.equal(resolveProperty(stylesheet, heroLogo, 'max-width'), undefined);
  }
});

test('case-study hero row explicitly owns optical alignment, gap, and post-heading spacing', () => {
  assert.equal(resolveProperty(css, heroRow, 'display'), 'flex');
  assert.equal(resolveProperty(css, heroRow, 'align-items'), 'center');
  assert.equal(resolveProperty(css, heroRow, 'gap'), 'var(--space-3)');
  assert.equal(
    resolveProperty(css, heroRow, 'margin-bottom'),
    'var(--space-4)',
  );
  assert.equal(resolveProperty(css, heroHeading, 'margin'), '0');
  assert.equal(resolveProperty(css, heroHeading, 'min-width'), '0');
  assert.equal(resolveProperty(css, heroHeading, 'white-space'), undefined);
});

test('case-study hero logo/title row retains safe title space at every required narrow viewport', () => {
  const gapPx = remToPx(0.75);
  const logoWidthPx = remToPx(3.5) * (140 / 137);

  for (const viewportPx of [320, 375, 390]) {
    const contentWidth = viewportPx - 2 * gutterPx(viewportPx);
    const titleWidth = contentWidth - logoWidthPx - gapPx;
    assert.ok(
      titleWidth >= remToPx(12),
      `expected at least 12rem for naturally wrapping title text at ${viewportPx}px, got ${titleWidth.toFixed(1)}px`,
    );
  }
});

test('case-study hero logo introduces no badge or decorative visual effects', () => {
  for (const property of [
    'background',
    'background-color',
    'border',
    'box-shadow',
    'filter',
    'animation',
  ]) {
    assert.equal(resolveProperty(css, heroLogo, property), undefined);
  }
});

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

test('rich case-study container is centered at a scoped 72rem maximum without changing the generic container', () => {
  assert.equal(
    resolveProperty(
      css,
      { tag: 'div', classes: ['container', 'case-study'] },
      'max-width',
    ),
    '72rem',
  );
  assert.equal(
    resolveProperty(css, { tag: 'div', classes: ['container'] }, 'max-width'),
    'var(--container-max)',
  );
  assert.equal(
    resolveProperty(
      css,
      { tag: 'div', classes: ['container', 'case-study'] },
      'margin-inline',
    ),
    'auto',
  );
});

test('hero media creates a desktop grid only on the presence modifier and preserves copy-first DOM order', () => {
  const route = routes.find((item) => item.key === 'work-fes-challenger');
  const main = renderRoute(route).main;
  const hero = main.match(
    /<section class="case-study-hero case-study-hero--with-media">[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(hero);
  assert.ok(
    hero.indexOf('case-study-hero__copy') <
      hero.indexOf('case-study-hero__media'),
  );
  assert.match(
    css,
    /@media \(min-width: 80em\)[\s\S]*?\.case-study-hero--with-media\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*minmax\(0, 0\.85fr\) minmax\(0, 1\.15fr\);/,
  );
  assert.ok(
    css.indexOf('.case-study-hero--with-media') >
      css.indexOf('@media (min-width: 80em)'),
    'the media hero grid must not activate before the desktop breakpoint',
  );
  assert.doesNotMatch(
    css,
    /\.case-study-hero(?![-_])\s*\{[^}]*grid-template-columns/s,
  );
});

test('media-free case studies emit neither an empty media column nor the media modifier', () => {
  for (const key of ['work-business-workflow-system', 'work-ebarangay']) {
    const main = renderRoute(routes.find((route) => route.key === key)).main;
    assert.doesNotMatch(main, /case-study-hero--with-media/);
    assert.doesNotMatch(main, /case-study-hero__media/);
  }
});

test('named section pairs use presence-driven wrappers and a missing member expands honestly', () => {
  const fes = renderRoute(
    routes.find((route) => route.key === 'work-fes-challenger'),
  ).main;
  assert.match(
    fes,
    /case-study-pair case-study-pair--context">[\s\S]*?case-study-section--client[\s\S]*?case-study-section--problem[\s\S]*?<\/div>/,
  );
  assert.match(
    fes,
    /case-study-pair case-study-pair--delivery">[\s\S]*?case-study-section--solution[\s\S]*?case-study-section--decisions[\s\S]*?<\/div>/,
  );

  const partial = renderCaseStudyPage({
    content: {
      title: 'Partial',
      heading: 'Partial',
      paragraphs: ['Lead.'],
      client: { body: ['Only member.'] },
      backLink: { label: 'Back to Work', path: '/work/' },
    },
    navItems: primaryNav,
    activeKey: 'work',
    site,
  }).main;
  assert.match(
    partial,
    /class="case-study-pair case-study-pair--context case-study-pair--single"/,
  );
  assert.doesNotMatch(partial, /case-study-section--problem/);
});

test('role, technology, outcomes, and gallery remain full editorial rows outside pair wrappers', () => {
  const main = renderRoute(
    routes.find((route) => route.key === 'work-fes-challenger'),
  ).main;
  const contextEnd = main.indexOf(
    '</div>',
    main.indexOf('case-study-pair--context'),
  );
  const role = main.indexOf('case-study-section--role');
  const delivery = main.indexOf('case-study-pair--delivery');
  const technology = main.indexOf('case-study-section--technology');
  const outcomes = main.indexOf('case-study-section--outcomes');
  const gallery = main.indexOf('case-study-section--gallery');
  assert.ok(contextEnd < role && role < delivery);
  assert.ok(
    delivery < technology && technology < outcomes && outcomes < gallery,
  );
  assert.match(
    css,
    /\.case-study-list--balanced\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/s,
  );
});

test('paragraph reading measure stays scoped while flexible tracks prevent modeled overflow from 320 through 1920px', () => {
  assert.match(
    css,
    /\.case-study-section p,\s*\.case-study-section \.section-header\s*\{[^}]*max-width:\s*var\(--width-reading\);/,
  );
  assert.match(css, /\.case-study-hero__copy\s*\{[^}]*min-width:\s*0;/);
  assert.match(
    css,
    /\.case-study-section,[\s\S]*?\.case-study-closing\s*\{[^}]*min-width:\s*0;/,
  );
  for (const viewport of [320, 375, 390, 768, 1024, 1440, 1920]) {
    const contentWidth =
      Math.min(viewport, remToPx(72)) - 2 * gutterPx(viewport);
    assert.ok(contentWidth > 0 && contentWidth <= viewport);
  }
});

test('case-study layout uses natural document flow with no CSS order or fixed section height', () => {
  assert.doesNotMatch(css, /\.case-study[^}]*\border\s*:/s);
  assert.doesNotMatch(
    css,
    /\.case-study-(?:hero|section|pair|narrative)(?:\s|,|\{)[^}]*\bheight\s*:/s,
  );
});
