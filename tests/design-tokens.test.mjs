import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';

// Compiles the real source of truth — never a duplicated literal hex or a
// hardcoded expected ratio. Every assertion below is a threshold check
// against the actual compiled tokens.
const customPropertiesPath = fileURLToPath(
  new URL('../src/styles/generic/_custom-properties.scss', import.meta.url),
);
const { css } = sass.compile(customPropertiesPath);

// Parses every color format Dart Sass may emit for these tokens: #rrggbb /
// #rgb hex, comma-form rgb(r, g, b) / rgba(r, g, b, a) (component values
// as either 0-255 integers or 0%-100% percentages — Dart Sass emits
// percentage form for color.adjust()-derived values, PF-021's
// --color-accent-fill*/--color-border-interactive among them), and modern
// space-form rgb(r g b) / rgb(r g b / a%). Alpha is ignored — every pair
// tested below is a solid, opaque text/background combination.
function parseColor(value) {
  const v = value.trim();

  let m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    const hex = m[1];
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  m = v.match(/^#([0-9a-f]{3})$/i);
  if (m) {
    const [r, g, b] = [...m[1]];
    return {
      r: parseInt(r + r, 16),
      g: parseInt(g + g, 16),
      b: parseInt(b + b, 16),
    };
  }

  // rgb(a)(...) — comma or space separated, component values as plain
  // numbers (0-255) or percentages (0%-100%), alpha optional and ignored.
  m = v.match(
    /^rgba?\(\s*([\d.]+)(%?)\s*[,\s]\s*([\d.]+)%?\s*[,\s]\s*([\d.]+)%?/i,
  );
  if (m) {
    const isPercent = m[2] === '%';
    const scale = isPercent ? 2.55 : 1;
    return {
      r: parseFloat(m[1]) * scale,
      g: parseFloat(m[3]) * scale,
      b: parseFloat(m[4]) * scale,
    };
  }

  throw new Error(`design-tokens test: unrecognized color format "${value}"`);
}

function getToken(name) {
  // Colon must immediately follow the name so --color-accent: never
  // matches --color-accent-text:/-hover:/-active:.
  const match = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  assert.ok(
    match,
    `token --${name} not found in compiled CSS custom properties`,
  );
  return parseColor(match[1]);
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

const BODY_TEXT_MIN = 4.5; // WCAG AA, normal-size text
const LARGE_TEXT_MIN = 3.0; // WCAG AA, large text / large-scale UI (color-accent's role)
const NON_TEXT_MIN = 3.0; // WCAG 1.4.11, interactive component boundaries
const FOCUS_INDICATOR_MIN = 3.0; // WCAG 2.4.11 / 1.4.11, focus indicator visibility

// Every text token whose documented use involves meaningful text (docs/DESIGN_SYSTEM.md),
// against every background it's actually approved for.
const pairs = [
  ['color-text-primary', 'color-canvas', BODY_TEXT_MIN],
  ['color-text-primary', 'color-surface-1', BODY_TEXT_MIN],
  ['color-text-secondary', 'color-canvas', BODY_TEXT_MIN],
  ['color-text-secondary', 'color-surface-1', BODY_TEXT_MIN],
  ['color-text-muted', 'color-canvas', BODY_TEXT_MIN],
  ['color-text-muted', 'color-surface-1', BODY_TEXT_MIN],
  ['color-accent-text', 'color-canvas', BODY_TEXT_MIN],
  ['color-accent-text', 'color-surface-1', BODY_TEXT_MIN],
  ['color-accent', 'color-canvas', LARGE_TEXT_MIN], // large text/icons/UI only, not small body text
  ['color-accent', 'color-surface-1', LARGE_TEXT_MIN],
  ['status-success', 'color-canvas', BODY_TEXT_MIN],
  ['status-warning', 'color-canvas', BODY_TEXT_MIN],
  ['status-danger', 'color-canvas', BODY_TEXT_MIN],
  ['status-danger', 'color-surface-1', BODY_TEXT_MIN],
  ['status-info', 'color-canvas', BODY_TEXT_MIN],

  // PF-021 base elements — every pair below is a real usage context, not a
  // speculative combination (docs/DESIGN_SYSTEM.md's "Base elements"
  // section). color-accent-fill/-hover/-active are deliberately NOT tested
  // as non-text pairs against color-canvas/color-surface-1 here — that
  // check would fail by design (verified during planning: as low as
  // 1.95:1), because the button's persistent color-border-interactive
  // border, not its fill, is the component's WCAG 1.4.11 boundary. See
  // .btn--primary/.btn--secondary in src/styles/components/_button.scss.
  ['color-accent-hover', 'color-canvas', BODY_TEXT_MIN], // link hover text
  ['color-accent-hover', 'color-surface-1', BODY_TEXT_MIN],
  ['color-accent-fill', 'color-text-primary', BODY_TEXT_MIN], // .btn--primary label
  ['color-accent-fill-hover', 'color-text-primary', BODY_TEXT_MIN],
  ['color-accent-fill-active', 'color-text-primary', BODY_TEXT_MIN],
  ['color-primary-gradient-start', 'color-text-primary', BODY_TEXT_MIN],
  ['color-primary-gradient-end', 'color-text-primary', BODY_TEXT_MIN],
  ['color-primary-gradient-hover-start', 'color-text-primary', BODY_TEXT_MIN],
  ['color-primary-gradient-hover-end', 'color-text-primary', BODY_TEXT_MIN],
  ['color-primary-gradient-active-start', 'color-text-primary', BODY_TEXT_MIN],
  ['color-primary-gradient-active-end', 'color-text-primary', BODY_TEXT_MIN],
  ['color-border-interactive', 'color-canvas', NON_TEXT_MIN], // button/form-control boundary
  ['color-border-interactive', 'color-surface-1', NON_TEXT_MIN],
  ['color-focus-ring', 'color-canvas', FOCUS_INDICATOR_MIN], // numerically identical to
  ['color-focus-ring', 'color-surface-1', FOCUS_INDICATOR_MIN], // color-accent's pairs above; asserted under its own name for traceability
  ['color-text-secondary', 'color-surface-2', BODY_TEXT_MIN], // .tag label
];

for (const [fgName, bgName, minRatio] of pairs) {
  test(`--${fgName} on --${bgName} meets its documented contrast floor`, () => {
    const ratio = contrastRatio(getToken(fgName), getToken(bgName));
    assert.ok(
      ratio >= minRatio,
      `expected --${fgName} on --${bgName} to be >= ${minRatio}:1, got ${ratio.toFixed(2)}:1`,
    );
  });
}
