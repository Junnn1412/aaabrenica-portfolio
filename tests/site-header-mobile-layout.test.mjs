import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';

// Compiles the real source of truth, same method as design-tokens.test.mjs,
// hidden-visibility.test.mjs, and site-nav-layout.test.mjs. Guards a real
// regression: the global chrome `header` had no `flex-wrap`, so all three
// mobile-open children (brand, toggle, .site-nav) were forced into one
// unbreakable row — .site-nav, with no width of its own, got squeezed into
// whatever space brand + toggle left over, producing a narrow right-hand
// nav column and a wrapped CTA (docs/DECISION_LOG.md). CSS *rendering*
// still requires manual browser review; this only proves the compiled
// stylesheet contains the corrected declarations.
const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

// `header {` also matches the unrelated .section-header content object
// (objects/_section-header.scss) — disambiguated by requiring `display:
// flex`, which only the site-chrome header rule has.
function siteChromeHeaderRules() {
  return [...css.matchAll(/header\s*\{([^}]*)\}/g)]
    .map((m) => m[1])
    .filter((body) => /display:\s*flex/.test(body));
}

test('the base (mobile) header rule wraps its flex children', () => {
  const rules = siteChromeHeaderRules();
  assert.ok(
    rules.length > 0,
    'no site-chrome header { display: flex } rule found',
  );
  assert.match(
    rules[0],
    /flex-wrap:\s*wrap/,
    'expected the mobile-default header rule to set flex-wrap: wrap, so .site-nav can drop to its own row',
  );
});

test('the desktop header rule reverts to a single non-wrapping row', () => {
  // The desktop override lives inside a nested @media block, compiled as
  // its own separate `header { ... }` occurrence in expanded output.
  // Header/nav overflow-defect follow-up (round 2) — this breakpoint moved
  // from 64em (1024px, spacing.$bp-lg, round 1's fix) to 80em (1280px,
  // spacing.$bp-xl): round 1's 1024px still overflowed in real-browser
  // testing (see tests/site-header-overflow.test.mjs and
  // docs/DECISION_LOG.md for the full derivation).
  const match = css.match(
    /@media \(min-width: 80em\) \{\s*header\s*\{([^}]*)\}/,
  );
  assert.ok(match, 'desktop header override not found');
  assert.match(
    match[1],
    /flex-wrap:\s*nowrap/,
    'expected the desktop header rule to set flex-wrap: nowrap',
  );
});

test('.site-nav claims a full-width mobile row via flex-basis: 100%', () => {
  const match = css.match(/\.site-nav\s*\{([^}]*)\}/);
  assert.ok(match, '.site-nav rule not found');
  assert.match(
    match[1],
    /flex-basis:\s*100%/,
    'expected the mobile-default .site-nav rule to set flex-basis: 100%',
  );
});

test('.site-nav reverts to content-sized width at desktop', () => {
  const matches = [...css.matchAll(/\.site-nav\s*\{([^}]*)\}/g)];
  assert.ok(
    matches.length > 1,
    'expected both a mobile and desktop .site-nav rule',
  );
  const desktopRule = matches[matches.length - 1][1];
  assert.match(
    desktopRule,
    /flex-basis:\s*auto/,
    'expected the desktop .site-nav rule to reset flex-basis: auto',
  );
});
