import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';

// Compiles the real source of truth, same method as design-tokens.test.mjs
// — never a duplicated literal. This guards a real regression: a component
// rule setting `display` unconditionally on a selector that can also carry
// the `hidden` attribute silently defeats the browser's native
// `[hidden] { display: none }` behavior, since same-specificity author
// rules are resolved by source order, not by which one "should" apply.
// (docs/DECISION_LOG.md — the .site-header__menu-toggle mobile-menu bug.)
// CSS *rendering* still requires manual browser review; this only proves
// the compiled stylesheet contains the invariant, not that it renders
// correctly in any given browser.
const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

test('[hidden] is guaranteed to win over a same-or-higher-specificity component rule', () => {
  assert.match(
    css,
    /\[hidden\]\s*\{[^}]*display:\s*none\s*!important/,
    'expected a project-wide [hidden] { display: none !important } safety net in the compiled CSS',
  );
});

test('.site-header__menu-toggle does not set display unconditionally', () => {
  // Defense in depth: the specific rule that caused the regression should
  // itself stay well-behaved (display scoped to :not([hidden])), not rely
  // solely on the global safety net above.
  const match = css.match(/\.site-header__menu-toggle\s*\{([^}]*)\}/);
  assert.ok(match, '.site-header__menu-toggle rule not found in compiled CSS');
  assert.doesNotMatch(
    match[1],
    /display:/,
    '.site-header__menu-toggle must not set display unconditionally — scope it with :not([hidden])',
  );
});
