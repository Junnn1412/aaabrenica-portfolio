import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';

// Compiles the real source of truth — main.scss, not a duplicated fixture —
// so both the design tokens and the actual .capability-card pattern rule
// (including its real opacity) come from the same compiled output. If a
// future edit changes the pattern's opacity without re-checking contrast,
// this test reads the new value and fails on its own, rather than
// asserting against a value hardcoded separately here.
const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

function parseHex(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function getToken(name) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6});`, 'i'));
  assert.ok(
    match,
    `token --${name} not found in compiled CSS custom properties`,
  );
  return parseHex(match[1]);
}

// Reads the real opacity used by .capability-card::before's pattern layer,
// e.g. "color-mix(in srgb, var(--color-canvas) 5%, transparent)" -> 0.05.
function getPatternOpacity() {
  const match = css.match(
    /\.capability-card::before\s*\{[^}]*color-mix\(in srgb, var\(--color-canvas\)\s*(\d+(?:\.\d+)?)%,\s*transparent\)/,
  );
  assert.ok(
    match,
    "could not find .capability-card::before's color-mix() pattern opacity in compiled CSS",
  );
  return parseFloat(match[1]) / 100;
}

function relativeLuminance({ r, g, b }) {
  const channel = (c) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : ((cs + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(colorA, colorB) {
  const l1 = relativeLuminance(colorA);
  const l2 = relativeLuminance(colorB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ink * alpha + base * (1 - alpha) — the same compositing the browser
// performs for color-mix(in srgb, ink <alpha>%, transparent) painted over
// an opaque base color.
function compositeOver(ink, base, alpha) {
  return {
    r: ink.r * alpha + base.r * (1 - alpha),
    g: ink.g * alpha + base.g * (1 - alpha),
    b: ink.b * alpha + base.b * (1 - alpha),
  };
}

// Reads which tokens the real two-tone focus ring actually uses, rather
// than assuming --color-canvas/--color-text-primary — if the ring's color
// is ever changed back to e.g. --color-focus-ring (the cobalt default that
// fails against every accent, docs/DECISION_LOG.md), this resolves to
// *that* token's real value and the contrast assertions below fail
// honestly instead of silently checking the wrong color.
function getFocusRingColors() {
  const rule = css.match(
    /\.capability-card:has\(\.capability-card__link:focus-visible\)\s*\{([^}]*)\}/,
  );
  assert.ok(
    rule,
    'could not find the two-tone focus-ring rule (.capability-card:has(.capability-card__link:focus-visible)) in compiled CSS',
  );
  const varNames = [...rule[1].matchAll(/var\(--([a-z0-9-]+)\)/g)].map(
    (m) => m[1],
  );
  assert.equal(
    varNames.length,
    2,
    `expected exactly 2 color tokens (inner + outer ring) in the focus-ring box-shadow, found ${varNames.length}: ${varNames.join(', ')}`,
  );
  const [innerName, outerName] = varNames;
  return {
    inner: getToken(innerName),
    outer: getToken(outerName),
  };
}

const BODY_TEXT_MIN = 4.5; // WCAG AA, normal-size text — title/description/icon
const NON_TEXT_MIN = 3.0; // WCAG 1.4.11 — card boundary and focus indicators

const accents = ['lime', 'amber', 'coral', 'violet', 'cyan', 'magenta'];
const ink = getToken('color-canvas'); // the pattern's ink and the title/description/icon color
const canvas = getToken('color-canvas');
const surface1 = getToken('color-surface-1');
const { inner: innerRing, outer: outerRing } = getFocusRingColors();
const patternAlpha = getPatternOpacity();

test('the capability-card pattern opacity is documented as 5%', () => {
  assert.equal(
    patternAlpha,
    0.05,
    `expected the pattern's color-mix() opacity to be 5% (docs/DECISION_LOG.md — reduced from an initial 8% for contrast margin), got ${patternAlpha * 100}%`,
  );
});

for (const accent of accents) {
  const accentColor = getToken(`accent-${accent}`);
  const composite = compositeOver(ink, accentColor, patternAlpha);

  test(`body text/icon contrast: dark ink on flat --accent-${accent} meets ${BODY_TEXT_MIN}:1`, () => {
    const ratio = contrastRatio(ink, accentColor);
    assert.ok(
      ratio >= BODY_TEXT_MIN,
      `expected dark ink on flat --accent-${accent} to be >= ${BODY_TEXT_MIN}:1, got ${ratio.toFixed(3)}:1`,
    );
  });

  test(`body text/icon contrast: dark ink on --accent-${accent}'s darkest pattern composite (${(patternAlpha * 100).toFixed(0)}% ink) meets ${BODY_TEXT_MIN}:1`, () => {
    const ratio = contrastRatio(ink, composite);
    assert.ok(
      ratio >= BODY_TEXT_MIN,
      `expected dark ink on --accent-${accent}'s darkest pattern composite to be >= ${BODY_TEXT_MIN}:1, got ${ratio.toFixed(3)}:1`,
    );
  });

  test(`card boundary contrast: --accent-${accent} vs --color-canvas meets ${NON_TEXT_MIN}:1`, () => {
    const ratio = contrastRatio(accentColor, canvas);
    assert.ok(
      ratio >= NON_TEXT_MIN,
      `expected --accent-${accent} vs --color-canvas to be >= ${NON_TEXT_MIN}:1, got ${ratio.toFixed(3)}:1`,
    );
  });

  test(`card boundary contrast: --accent-${accent} vs --color-surface-1 meets ${NON_TEXT_MIN}:1`, () => {
    const ratio = contrastRatio(accentColor, surface1);
    assert.ok(
      ratio >= NON_TEXT_MIN,
      `expected --accent-${accent} vs --color-surface-1 to be >= ${NON_TEXT_MIN}:1, got ${ratio.toFixed(3)}:1`,
    );
  });

  test(`focus indicator contrast: inner ring vs flat --accent-${accent} meets ${NON_TEXT_MIN}:1`, () => {
    const ratio = contrastRatio(innerRing, accentColor);
    assert.ok(
      ratio >= NON_TEXT_MIN,
      `expected the inner focus ring vs flat --accent-${accent} to be >= ${NON_TEXT_MIN}:1, got ${ratio.toFixed(3)}:1`,
    );
  });

  test(`focus indicator contrast: inner ring vs --accent-${accent}'s pattern composite meets ${NON_TEXT_MIN}:1`, () => {
    const ratio = contrastRatio(innerRing, composite);
    assert.ok(
      ratio >= NON_TEXT_MIN,
      `expected the inner focus ring vs --accent-${accent}'s pattern composite to be >= ${NON_TEXT_MIN}:1, got ${ratio.toFixed(3)}:1`,
    );
  });
}

test(`focus indicator contrast: outer ring vs --color-canvas meets ${NON_TEXT_MIN}:1`, () => {
  const ratio = contrastRatio(outerRing, canvas);
  assert.ok(
    ratio >= NON_TEXT_MIN,
    `expected the outer focus ring vs --color-canvas to be >= ${NON_TEXT_MIN}:1, got ${ratio.toFixed(3)}:1`,
  );
});

test(`focus indicator contrast: outer ring vs --color-surface-1 meets ${NON_TEXT_MIN}:1`, () => {
  const ratio = contrastRatio(outerRing, surface1);
  assert.ok(
    ratio >= NON_TEXT_MIN,
    `expected the outer focus ring vs --color-surface-1 to be >= ${NON_TEXT_MIN}:1, got ${ratio.toFixed(3)}:1`,
  );
});
