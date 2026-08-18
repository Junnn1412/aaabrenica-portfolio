import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';

// Footer redesign — proves the compiled cascade for the new
// Brand/Quick-Links/Connect grid, and specifically guards the exact
// `max-width: none` leak already found and fixed on `.site-nav ul`
// (round 3 of the header/nav overflow defect, docs/DECISION_LOG.md):
// elements/_body-copy.scss's generic `ul, ol { max-width:
// var(--width-reading); }` (68ch) would otherwise cap both new footer
// lists. CSS *rendering* still requires manual browser review; this only
// proves the compiled declarations are sound.
const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

function ruleBody(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `rule not found: ${selector}`);
  return match[1];
}

test('the generic ul, ol { max-width: var(--width-reading) } rule still exists (context, not removed)', () => {
  const match = css.match(/(?:^|\n)ul,\s*\nol\s*\{([^}]*)\}/);
  assert.ok(match, 'expected the bare `ul,\\nol { ... }` rule');
  assert.match(match[1], /max-width:\s*var\(--width-reading\);/);
});

test('.site-footer__nav ul (Quick Links) resets max-width, margin, padding, and list-style against the generic ul,ol rule', () => {
  const body = ruleBody('.site-footer__nav ul');
  assert.match(body, /max-width:\s*none;/);
  assert.match(body, /margin:\s*0;/);
  assert.match(body, /padding:\s*0;/);
  assert.match(body, /list-style:\s*none;/);
});

test('.site-footer__links (Connect) resets max-width, margin, padding, and list-style against the same generic rule', () => {
  const body = ruleBody('.site-footer__links');
  assert.match(body, /max-width:\s*none;/);
  assert.match(body, /margin:\s*0;/);
  assert.match(body, /padding:\s*0;/);
  assert.match(body, /list-style:\s*none;/);
});

test('Quick Links renders as a 2-column grid', () => {
  const body = ruleBody('.site-footer__nav ul');
  assert.match(body, /display:\s*grid;/);
  assert.match(body, /grid-template-columns:\s*repeat\(2, 1fr\);/);
});

test('mobile-default: .site-footer__columns is a single column (Brand -> Quick Links -> Connect stack in document order)', () => {
  const body = ruleBody('.site-footer__columns');
  assert.match(body, /grid-template-columns:\s*1fr;/);
});

test('desktop: .site-footer__columns switches to a 3-column grid at spacing.$bp-md (768px)', () => {
  const match = css.match(
    /@media \(min-width: 48em\) \{\s*\.site-footer__columns\s*\{([^}]*)\}/,
  );
  assert.ok(match, 'expected a desktop .site-footer__columns override at 48em');
  assert.match(match[1], /grid-template-columns:/);
  assert.doesNotMatch(match[1], /grid-template-columns:\s*1fr;/);
});

test('.site-footer__connect-link meets the ~44x44px touch-target minimum via --touch-target-min, not a smaller hardcoded value', () => {
  const body = ruleBody('.site-footer__connect-link');
  assert.match(body, /min-width:\s*var\(--touch-target-min\);/);
  assert.match(body, /min-height:\s*var\(--touch-target-min\);/);
});

test('.site-footer__connect-link hover is pointer-gated (hover: hover) and (pointer: fine) — no hover feedback forced onto touch devices', () => {
  const match = css.match(
    /@media \(hover: hover\) and \(pointer: fine\) \{\s*\.site-footer__connect-link:hover\s*\{([^}]*)\}/,
  );
  assert.ok(
    match,
    'expected a pointer-gated .site-footer__connect-link:hover rule',
  );
  assert.match(match[1], /background-color:\s*var\(--color-surface-2\);/);
});

test(".site-footer__connect-link declares no transform/movement — restrained hover, matching the header icon-only toggle's own precedent", () => {
  const body = ruleBody('.site-footer__connect-link');
  assert.doesNotMatch(body, /transform:/);
  const hoverMatch = css.match(
    /@media \(hover: hover\) and \(pointer: fine\) \{\s*\.site-footer__connect-link:hover\s*\{([^}]*)\}/,
  );
  assert.doesNotMatch(hoverMatch[1], /transform:/);
});

test('no new prefers-reduced-motion or forced-colors override was added for the footer — it relies on the existing global rules (generic/_document.scss), the same as the rest of the project', () => {
  // .site-footer__connect-link's only animatable property is
  // background-color (a color transition, not a movement/animation) — the
  // pre-existing global `@media (prefers-reduced-motion: reduce) { *, ...
  // { transition-duration: 0.01ms !important; } }` rule already covers it,
  // confirmed present here rather than assumed.
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?transition-duration:\s*0\.01ms\s*!important;/,
  );
});

test('.site-footer__brand-mark is bounded and preserves aspect ratio: fixed height, capped width, object-fit: contain — same replaceable-slot contract as the header brand mark', () => {
  const body = ruleBody('.site-footer__brand-mark');
  assert.match(body, /height:\s*2rem;/);
  assert.match(body, /width:\s*auto;/);
  assert.match(body, /max-width:\s*2\.5rem;/);
  assert.match(body, /object-fit:\s*contain;/);
});

test('.site-footer__heading reuses the .section-header__eyebrow label recipe (uppercase, letter-spaced, accent-colored) rather than a new heading treatment', () => {
  const eyebrow = ruleBody('.section-header__eyebrow');
  const heading = ruleBody('.site-footer__heading');
  for (const rule of [eyebrow, heading]) {
    assert.match(rule, /text-transform:\s*uppercase;/);
    assert.match(rule, /letter-spacing:\s*var\(--letter-spacing-label\);/);
    assert.match(rule, /color:\s*var\(--color-accent-text\);/);
  }
});

test('.site-footer__meta and .site-footer__privacy reset the generic p margin so the bottom row stays visually aligned', () => {
  const match = css.match(
    /\.site-footer__meta,\s*\n\.site-footer__privacy\s*\{([^}]*)\}/,
  );
  assert.ok(
    match,
    'expected a combined .site-footer__meta, .site-footer__privacy rule',
  );
  assert.match(match[1], /margin:\s*0;/);
});
