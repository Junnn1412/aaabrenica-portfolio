// About profile-card task — proves the compiled cascade for the two-column
// layout, the card surface, the corner-accent decoration, and the specific
// generic-cascade resets that genuinely matter here. CSS *rendering* still
// requires manual browser review; this only proves the compiled
// declarations are sound.
//
// Per AAA's explicit instruction: no `max-width: none` reset/test is added
// for .about-card__highlights — .about-card is already narrower than
// elements/_body-copy.scss's generic `ul, ol { max-width:
// var(--width-reading); }` (68ch) at every supported width, since it's
// itself capped to `flex: 1 1 42%` of a container whose own max-width is
// --container-max (80rem/1280px); 42% of 1280px is ~538px, already under
// 544px before subtracting any padding/gutters, so the leak this project
// has twice found elsewhere (.site-nav ul, the same generic rule) cannot
// occur on this element for a real, structural reason, not by luck.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';

const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

// Anchored to start-of-line (Dart Sass's expanded output puts each
// top-level or comma-separated selector on its own line) so a bare class
// like `.about-card` can't accidentally match as the tail of a longer
// compound selector such as `.about-layout--with-card .about-card` — a
// real bug caught while writing this file (it silently returned the
// desktop override's body instead of the base rule's).
function ruleBody(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `rule not found: ${selector}`);
  return match[1];
}

// --- Two-column layout, DOM-order-only ---

test('mobile-default: .about-layout is a single-column flex stack', () => {
  const body = ruleBody('.about-layout');
  assert.match(body, /display:\s*flex;/);
  assert.match(body, /flex-direction:\s*column;/);
});

test("desktop: .about-layout--with-card switches to a row at width >= 64em (matching .hero__inner's own breakpoint) — the modifier class only applies with a real card present", () => {
  const match = css.match(
    /@media \(width >= 64em\) \{\s*\.about-layout--with-card\s*\{([^}]*)\}/,
  );
  assert.ok(match, 'expected a desktop .about-layout--with-card override');
  assert.match(match[1], /flex-direction:\s*row;/);
});

test('desktop: biography content and card split the row (58%/42%), matching source order — no CSS `order` property is used anywhere in the stylesheet for these selectors', () => {
  const contentMatch = css.match(
    /\.about-layout--with-card \.about-layout__content\s*\{([^}]*)\}/,
  );
  const cardMatch = css.match(
    /\.about-layout--with-card \.about-card\s*\{([^}]*)\}/,
  );
  assert.ok(contentMatch && cardMatch);
  assert.match(contentMatch[1], /flex:\s*1 1 58%;/);
  assert.match(cardMatch[1], /flex:\s*1 1 42%;/);
  assert.doesNotMatch(contentMatch[1], /order:/);
  assert.doesNotMatch(cardMatch[1], /order:/);
});

test('no rule anywhere in the compiled stylesheet sets the CSS `order` property on any about-* selector', () => {
  const aboutRules = [...css.matchAll(/\.about-[a-z_-]+[^{]*\{([^}]*)\}/g)];
  assert.ok(aboutRules.length > 0, 'expected at least one .about-* rule');
  for (const [, body] of aboutRules) {
    // Negative lookbehind excludes "border:"/"-order:"-style false
    // positives — this checks for the bare CSS `order` property only.
    assert.doesNotMatch(body, /(?<![a-z-])order:/);
  }
});

// --- Card surface, dark premium theme, reused tokens ---

test('.about-card uses existing surface/border/radius/spacing tokens — no new color or shape values invented', () => {
  const body = ruleBody('.about-card');
  assert.match(body, /background-color:\s*var\(--color-surface-1\);/);
  assert.match(
    body,
    /border:\s*var\(--border-width\) solid var\(--color-border\);/,
  );
  assert.match(body, /border-radius:\s*var\(--radius-lg\);/);
  assert.match(body, /padding:\s*var\(--space-6\);/);
});

test(".about-card__name, .about-card__role, .about-card__statement reset the generic p margin, so .about-card__body's own flex gap is the single source of vertical spacing", () => {
  const match = css.match(
    /\.about-card__name,\s*\n\.about-card__role,\s*\n\.about-card__statement\s*\{([^}]*)\}/,
  );
  assert.ok(match, 'expected the combined name/role/statement margin reset');
  assert.match(match[1], /margin:\s*0;/);
});

test('.about-card__highlights and its li items reset margin/padding/list-style against the generic ul/ol/li rules, so the flex gap is the single source of spacing between highlights', () => {
  const listBody = ruleBody('.about-card__highlights');
  assert.match(listBody, /margin:\s*0;/);
  assert.match(listBody, /padding:\s*0;/);
  assert.match(listBody, /list-style:\s*none;/);
  const liBody = ruleBody('.about-card__highlights li');
  assert.match(liBody, /margin:\s*0;/);
});

// --- Corner accent: restrained, static, decorative, forced-colors-safe ---

test('the corner accent is a single ::after pseudo-element (never exposed to the accessibility tree — no aria-hidden needed or possible on a generated box)', () => {
  assert.match(css, /\.about-card__portrait::after\s*\{/);
  // Exactly one accent rule — not a second branch/element.
  const matches = [...css.matchAll(/\.about-card__portrait::after\s*\{/g)];
  assert.equal(matches.length, 1);
});

test('the corner accent uses --color-accent (electric blue), not orange or any other new color', () => {
  const body = ruleBody('.about-card__portrait::after');
  assert.match(body, /var\(--color-accent\)/);
  assert.doesNotMatch(body, /orange/i);
  assert.doesNotMatch(body, /#f[0-9a-f]{2}[0-9a-f]{0,3}\b/i); // no ad-hoc orange-ish hex literal
});

test('the corner accent is a single L-shaped bracket (two border sides only), not a multi-branch circuit pattern, and uses real border properties so forced-colors mode can recolor it — not box-shadow or a gradient', () => {
  const body = ruleBody('.about-card__portrait::after');
  assert.match(body, /border-right:\s*2px solid var\(--color-accent\);/);
  assert.match(body, /border-bottom:\s*2px solid var\(--color-accent\);/);
  assert.doesNotMatch(body, /border-top:/);
  assert.doesNotMatch(body, /border-left:/);
  assert.doesNotMatch(body, /box-shadow:/);
  assert.doesNotMatch(body, /gradient/);
});

test('the corner accent has no glow (no blur/filter) and is small relative to the portrait frame (visually subordinate)', () => {
  const body = ruleBody('.about-card__portrait::after');
  assert.doesNotMatch(body, /filter:/);
  assert.doesNotMatch(body, /blur/);
  assert.match(body, /width:\s*var\(--space-7\);/);
  assert.match(body, /height:\s*var\(--space-7\);/);
});

test('the corner accent is static — no transition, no animation — consistent with "no broader animation now, site-wide motion is a later pass"', () => {
  const body = ruleBody('.about-card__portrait::after');
  assert.doesNotMatch(body, /transition:/);
  assert.doesNotMatch(body, /animation:/);
});

// --- Portrait frame ---

test('.media-frame--portrait uses a 4:5 aspect ratio and inherits object-fit: cover from the base .media-frame rule (no distortion, a safe center-crop of the real ~1.14:1 source)', () => {
  const body = ruleBody('.media-frame--portrait');
  assert.match(body, /aspect-ratio:\s*4\s*\/\s*5;/);
  const baseImgRule = css.match(
    /\.media-frame img,\s*\n\.media-frame video\s*\{([^}]*)\}/,
  );
  assert.ok(baseImgRule, 'expected the base .media-frame img/video rule');
  assert.match(baseImgRule[1], /object-fit:\s*cover;/);
});
