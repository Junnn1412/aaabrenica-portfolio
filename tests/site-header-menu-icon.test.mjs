import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';

// Mobile-toggle redesign — proves the new icon-only hamburger/X control's
// compiled CSS: both closed/open bar states are driven purely by the same
// `[aria-expanded]` attribute nav-toggle.js already sets (no separate
// icon-hidden bookkeeping to fall out of sync), and the transition/forced-
// colors requirements AAA asked for are actually present in the compiled
// stylesheet. CSS *rendering* still requires manual browser review; this
// only proves the compiled declarations exist.
const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

test('the closed-state bars are three separate, evenly-placed lines', () => {
  const rule1 = css.match(
    /\.site-header__menu-bar:nth-child\(1\)\s*\{([^}]*)\}/,
  );
  const rule2 = css.match(
    /\.site-header__menu-bar:nth-child\(2\)\s*\{([^}]*)\}/,
  );
  const rule3 = css.match(
    /\.site-header__menu-bar:nth-child\(3\)\s*\{([^}]*)\}/,
  );
  assert.ok(rule1 && rule2 && rule3, 'expected all three bar position rules');
  assert.match(rule1[1], /top:\s*0;/);
  assert.match(rule2[1], /top:\s*50%;/);
  assert.match(rule3[1], /bottom:\s*0;/);
});

test('the open state (driven by [aria-expanded="true"]) rotates the outer bars into an X and hides the middle bar — the same attribute nav-toggle.js sets', () => {
  const rotate1 = css.match(
    /\.site-header__menu-toggle\[aria-expanded=true\]\s*\.site-header__menu-bar:nth-child\(1\)\s*\{([^}]*)\}/,
  );
  const hideMiddle = css.match(
    /\.site-header__menu-toggle\[aria-expanded=true\]\s*\.site-header__menu-bar:nth-child\(2\)\s*\{([^}]*)\}/,
  );
  const rotate3 = css.match(
    /\.site-header__menu-toggle\[aria-expanded=true\]\s*\.site-header__menu-bar:nth-child\(3\)\s*\{([^}]*)\}/,
  );
  assert.ok(
    rotate1 && hideMiddle && rotate3,
    'expected all three open-state rules',
  );
  assert.match(rotate1[1], /rotate\(45deg\)/);
  assert.match(hideMiddle[1], /opacity:\s*0;/);
  assert.match(rotate3[1], /rotate\(-45deg\)/);
});

test('the bars declare a transition, so the pre-existing global prefers-reduced-motion rule (generic/_document.scss) actually has something to collapse to an immediate state swap', () => {
  const match = css.match(/\.site-header__menu-bar\s*\{([^}]*)\}/);
  assert.ok(match, '.site-header__menu-bar base rule not found');
  assert.match(match[1], /transition:/);
  // The global rule itself: *, *::before, *::after { transition-duration:
  // 0.01ms !important; ... } under @media (prefers-reduced-motion: reduce).
  // Already covers every element project-wide, including this one — no
  // per-component override needed, confirmed present here rather than
  // assumed.
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?transition-duration:\s*0\.01ms\s*!important;/,
  );
});

test('forced-colors mode has an explicit override keeping the bars visible', () => {
  const match = css.match(
    /@media \(forced-colors: active\) \{\s*\.site-header__menu-bar\s*\{([^}]*)\}/,
  );
  assert.ok(
    match,
    'expected a forced-colors override for .site-header__menu-bar',
  );
  assert.match(match[1], /background-color:\s*CanvasText;/);
});

test('the "currently open" border accent reuses the same --color-accent border convention as the active nav-route indicator, not a background/glow', () => {
  const match = css.match(
    /\.site-header__menu-toggle\[aria-expanded=true\]\s*\{([^}]*)\}/,
  );
  assert.ok(match, 'expected an [aria-expanded="true"] rule for the toggle');
  assert.match(match[1], /border-color:\s*var\(--color-accent\);/);
  assert.doesNotMatch(match[1], /box-shadow/);
  assert.doesNotMatch(match[1], /gradient/);
});
