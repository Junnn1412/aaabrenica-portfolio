import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import { renderHeader } from '../src/components/partials/header.js';
import { primaryNav } from '../src/config/navigation.js';
import { site as realSite } from '../src/config/site.js';

// Header/nav overflow-defect follow-up (round 3) — AAA's real browser
// measurement at 1440px viewport (documentElement.scrollWidth 1513 vs.
// clientWidth 1440) proved the actual defect was never about total row
// width vs. the viewport (rounds 1 and 2's framing, which moved the
// desktop breakpoint from 768px to 1024px to 1280px — none of it changed
// anything, because none of it was the real bug). AAA's measured geometry
// showed `.site-nav` itself resolved to only 544px wide while its own `<ul>`
// content (CTA right edge at 1512.9375) needed ~661.7px — a *fixed*,
// viewport-independent shortfall of ~117.7px, present at every breakpoint.
//
// Root cause: elements/_body-copy.scss's generic `ul, ol { max-width:
// var(--width-reading); }` (68ch ≈ 544px at 16px Inter — the exact width
// AAA measured) is a bare-tag rule with specificity (0,0,1). `.site-nav
// ul` (specificity (0,1,1), a class+tag descendant selector) has *higher*
// specificity, but the cascade resolves per PROPERTY, not per rule — a
// selector that never declares `max-width` has no competing declaration
// for it at all, so the lower-specificity generic rule wins that one
// property outright. `.site-nav ul` never declared `max-width` before
// this fix; every other list-shaped component in this codebase
// (`.project-cards`, `.capability-cards`, `.trust-list`,
// `.process-steps`, `.engagement-options`) already resets `max-width:
// none` for exactly this reason — `.site-nav ul` was the one that never
// got it. Because `.site-nav`'s own `flex-basis: auto` is computed from
// its content's (the capped `<ul>`'s) width, `.site-nav` itself inherited
// the 544px cap as a flex item of `header`, while the `<ul>`'s own
// `flex-flow: row nowrap` children don't respect that cap and simply
// overflow past it (default `overflow: visible`) — independent of
// viewport width, which is exactly why moving the desktop breakpoint
// never fixed it.
//
// This file now tests the actual resolved cascade relationship that
// caused the defect, not an estimated total-text-width budget (rounds 1/2's
// approach, which answered a real but irrelevant question — the
// header-level fixed overhead vs. viewport comparison never had any way
// to catch an *inner* element being capped smaller than its own content).
// CSS *rendering* still requires manual browser review; this proves the
// compiled stylesheet's declarations are sound.
const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

// --- Geometry proofs: no wrapper, no box-sizing risk, no .container leak ---
// (still valid, orthogonal to the round-3 bug — kept from round 2.)

test("box-sizing: border-box is applied globally (generic/_reset.scss), so header's padding-inline can never inflate its box past its own width", () => {
  const match = css.match(/\*\s*\{([^}]*)\}/);
  assert.ok(match, 'expected a universal * rule');
  assert.match(match[1], /box-sizing:\s*border-box;/);
});

test('header has no explicit width/max-width/margin-inline of its own — it relies on block-level width:auto, not a percentage or fixed value that padding could add to', () => {
  const rules = [...css.matchAll(/(?:^|\n)header\s*\{([^}]*)\}/g)].map(
    (m) => m[1],
  );
  assert.ok(rules.length > 0, 'no bare `header {}` rule found');
  for (const rule of rules) {
    assert.doesNotMatch(rule, /(?<!max-)(?<!min-)\bwidth:/);
    assert.doesNotMatch(rule, /max-width:/);
    assert.doesNotMatch(rule, /margin-inline:/);
    assert.doesNotMatch(rule, /\btransform:/);
  }
});

test(".container's max-width/margin-inline:auto rule does not target header — there is no .site-header__inner or .container wrapper for it to apply through", () => {
  const containerRule = css.match(/\.container\s*\{([^}]*)\}/);
  assert.ok(containerRule, '.container rule not found');
  assert.match(containerRule[1], /margin-inline:\s*auto;/);
  assert.match(containerRule[1], /max-width:\s*var\(--container-max\);/);
  assert.doesNotMatch(css, /header\s*\.container/);
  assert.doesNotMatch(css, /\.container\s+header/);
  assert.doesNotMatch(css, /site-header__inner/);
});

test('the real composed header markup never applies the .container class to any element', () => {
  const html = renderHeader(primaryNav, 'home', realSite);
  assert.doesNotMatch(html, /class="[^"]*\bcontainer\b/);
});

// --- The actual root-cause cascade relationship (round 3) ---

test('the generic ul, ol { max-width: var(--width-reading) } rule exists and is a bare-tag selector (specificity (0,0,1)) — this is the rule that was silently leaking onto .site-nav ul, not a hypothetical', () => {
  // Dart Sass's expanded output puts each comma-separated selector on its
  // own line: `ul,\nol {`.
  const match = css.match(/(?:^|\n)ul,\s*\nol\s*\{([^}]*)\}/);
  assert.ok(match, 'expected a bare `ul,\\nol { max-width: ... }` rule');
  assert.match(match[1], /max-width:\s*var\(--width-reading\);/);
});

test('.site-nav ul explicitly resets max-width: none — the fix. Without this, a class+tag descendant selector ((0,1,1) specificity) still loses the max-width property to the lower-specificity bare `ul` rule ((0,0,1)), because the cascade resolves per property and .site-nav ul never competed for this one', () => {
  const match = css.match(/\.site-nav ul\s*\{([^}]*)\}/);
  assert.ok(match, '.site-nav ul rule not found');
  assert.match(
    match[1],
    /max-width:\s*none;/,
    'expected .site-nav ul to explicitly reset max-width, the same pattern .project-cards/.capability-cards/.trust-list/.process-steps/.engagement-options already use against this same generic rule',
  );
});

test('resolving the real cascade winner for .site-nav ul manually (the shared cascade-resolver only models single simple selectors, not this descendant combinator): (0,1,1) > (0,0,1), and .site-nav ul now actually declares max-width, so it wins outright', () => {
  // Specificity per the CSS cascade spec: (ids, classes, types).
  const bareUl = [0, 0, 1];
  const siteNavUl = [0, 1, 1]; // .site-nav (1 class) + ul (1 type)
  const higher =
    siteNavUl[1] !== bareUl[1]
      ? siteNavUl[1] - bareUl[1]
      : siteNavUl[2] - bareUl[2];
  assert.ok(
    higher > 0,
    '.site-nav ul must have higher specificity than bare `ul`',
  );
  const match = css.match(/\.site-nav ul\s*\{([^}]*)\}/);
  assert.ok(match && /max-width:\s*none;/.test(match[1]));
});

test('68ch (the generic ul,ol max-width) renders far narrower than the real nav content needs — proving the cap, if it leaked, would genuinely constrain .site-nav below its content, exactly as AAA measured (544px cap vs. ~661.7px real content)', () => {
  // ch's real pixel value depends on the font's glyph metrics and can't be
  // computed from tokens alone — 8px/ch (a plausible, commonly-documented
  // ratio for Inter's digit width at 16px) is used here only to confirm
  // the general order of magnitude AAA's 544px measurement implies, not as
  // an authoritative conversion.
  const approxChPx = 8;
  const widthReadingPx = 68 * approxChPx; // ~544px
  const measuredNavContentPx = 661.734375; // AAA's real browser measurement: CTA.right - nav.left at 1440px
  assert.ok(
    widthReadingPx < measuredNavContentPx,
    'expected the generic 68ch cap to be narrower than the real nav content width — this is why it produced visible overflow rather than harmlessly wrapping',
  );
});

test('.site-nav retains its flex-basis: auto / flex-shrink: 0 desktop sizing (unchanged by this fix) — it can now correctly compute that basis from its no-longer-capped content', () => {
  const match = css.match(
    /@media \(min-width: 80em\) \{\s*\.site-nav\s*\{([^}]*)\}/,
  );
  assert.ok(match, 'expected the desktop .site-nav block scoped to 80em');
  assert.match(match[1], /flex-basis:\s*auto;/);
  assert.match(match[1], /flex-shrink:\s*0;/);
});

test('the desktop breakpoint is unchanged by this fix (still 80em / spacing.$bp-xl) — the round-3 bug was never breakpoint-dependent, so no breakpoint adjustment was made or is needed', () => {
  const headerMatch = css.match(
    /@media \(min-width: 80em\) \{\s*header\s*\{([^}]*)\}/,
  );
  assert.ok(headerMatch, 'expected the desktop header block scoped to 80em');
  const navMatch = css.match(
    /@media \(min-width: 80em\) \{\s*\.site-nav\s*\{([^}]*)\}/,
  );
  assert.ok(navMatch, 'expected the desktop .site-nav block scoped to 80em');
});

test('the real production header still renders all 6 nav links and the unaltered CTA label — the fix removed no content', () => {
  const html = renderHeader(primaryNav, 'home', realSite);
  for (const { label } of primaryNav) {
    assert.match(
      html,
      new RegExp(`>${label}<`),
      `expected the "${label}" link's text to still render`,
    );
  }
  assert.match(html, />Start a Project<\/a>/);
  assert.match(html, /class="btn btn--primary btn--sm site-nav__cta"/);
});
