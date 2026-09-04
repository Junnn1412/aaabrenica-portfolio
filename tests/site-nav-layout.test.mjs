import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';

// Compiles the real source of truth, same method as design-tokens.test.mjs
// and hidden-visibility.test.mjs. Guards a real regression: `.site-nav`
// (the <nav> element, a flex item of `header`) had no flex-shrink of its
// own, defaulting to flex-shrink: 1 — allowed to be compressed below its
// content's natural width whenever `header`'s available space was even
// slightly tight. Combined with `flex-flow: row wrap` on the desktop nav
// list, that compression is what let the "Start a Project" CTA wrap onto
// a second row even though the row was never genuinely out of viewport
// width (docs/DECISION_LOG.md). CSS *rendering* still requires manual
// browser review at 1024/1440/1920px; this only proves the compiled
// stylesheet contains the corrected declarations.
const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

// `.site-nav ul` / `.site-nav li` are each defined twice — once for the
// mobile-first base rule, once inside the desktop @media block. Sass
// preserves source order, and the desktop block is authored after the
// base rules in _site-nav.scss, so the *last* match of each selector is
// always the desktop-scoped one — simpler and more robust than trying to
// regex-balance the @media block's braces.
function lastRuleBody(selectorPattern) {
  const matches = [
    ...css.matchAll(new RegExp(`${selectorPattern}\\s*\\{([^}]*)\\}`, 'g')),
  ];
  assert.ok(matches.length > 0, `no rule found for ${selectorPattern}`);
  return matches[matches.length - 1][1];
}

test('the desktop .site-nav does not shrink as a header flex item', () => {
  // .site-nav (bare, no descendant) is now defined twice — a mobile-base
  // rule (flex-basis: 100%, for the wrapped mobile-open header layout —
  // see site-header-mobile-layout.test.mjs) and this desktop override.
  // flex-shrink is only asserted on the *last* (desktop) occurrence.
  const desktopRule = lastRuleBody('\\.site-nav');
  assert.match(
    desktopRule,
    /flex-shrink:\s*0/,
    'expected the desktop .site-nav rule to include flex-shrink: 0 so it cannot be compressed below its content width',
  );
});

test('the desktop nav list does not allow wrapping', () => {
  const desktopUlRule = lastRuleBody('\\.site-nav ul');
  // "nowrap" itself contains the substring "wrap", so this must check for
  // the word "wrap" NOT preceded by "no" — not just absence of "wrap".
  assert.doesNotMatch(
    desktopUlRule,
    /(?<!no)wrap/,
    'the desktop .site-nav ul rule must not allow flex-wrap: wrap — the CTA and nav links must stay in one row',
  );
});

test('desktop nav items do not shrink individually either', () => {
  const desktopLiRule = lastRuleBody('\\.site-nav li');
  assert.match(
    desktopLiRule,
    /flex-shrink:\s*0/,
    'expected the desktop .site-nav li rule to include flex-shrink: 0 — otherwise "no wrap" could still mean the CTA gets silently squeezed instead',
  );
});
