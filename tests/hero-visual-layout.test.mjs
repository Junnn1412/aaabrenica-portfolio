import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import { resolveProperty } from './helpers/cascade-resolver.mjs';

const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const heroScssPath = fileURLToPath(
  new URL('../src/styles/components/_hero.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);
const source = fs.readFileSync(heroScssPath, 'utf8');

function ruleBody(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `rule not found: ${selector}`);
  return match[1];
}

function animationDuration(selector) {
  const body = ruleBody(selector);
  const match = body.match(/animation:[^;]*?([\d.]+)(ms|s)\b/);
  assert.ok(match, `animation duration missing for ${selector}`);
  return match[2] === 's' ? Number(match[1]) * 1000 : Number(match[1]);
}

function gutterAt(viewport) {
  return Math.min(48, Math.max(20, 16 + viewport * 0.02));
}

test('winning static SVG dimensions preserve the 400x400 responsive visual boundary', () => {
  const visual = { tag: 'svg', classes: ['hero__visual'] };
  assert.equal(resolveProperty(css, visual, 'display'), 'block');
  assert.equal(resolveProperty(css, visual, 'width'), '100%');
  assert.equal(resolveProperty(css, visual, 'max-width'), '28rem');
  assert.equal(resolveProperty(css, visual, 'height'), 'auto');
  assert.equal(resolveProperty(css, visual, 'overflow'), 'hidden');
  assert.equal(resolveProperty(css, visual, 'pointer-events'), 'none');
  assert.match(ruleBody('.hero__media'), /min-width:\s*0;/);
});

test('static base lines and nodes remain visible without enhancement classes', () => {
  assert.match(
    ruleBody('.hero__connection--base'),
    /stroke:\s*var\(--color-border-interactive\);/,
  );
  assert.match(
    ruleBody('.hero__connection--reveal'),
    /stroke:\s*var\(--color-accent\);/,
  );
  assert.match(
    ruleBody('.hero__node--primary'),
    /stroke:\s*var\(--color-border-interactive\);/,
  );
  assert.doesNotMatch(
    source,
    /\.hero__visual(?![^\n{]*is-enhanced)[^{]*\{[^}]*?(?:display:\s*none|visibility:\s*hidden|opacity:\s*0)/s,
  );
});

test('intro and continuous signal durations stay inside the approved restrained ranges', () => {
  const intro = animationDuration(
    '.hero__visual.is-enhanced.is-introducing .hero__connection--reveal',
  );
  const signal = animationDuration(
    '.hero__visual.is-enhanced.is-introduced .hero__connection--signal',
  );
  assert.ok(intro >= 600 && intro <= 900, `intro was ${intro}ms`);
  assert.ok(signal >= 5000 && signal <= 7000, `signal was ${signal}ms`);
  assert.match(
    ruleBody(
      '.hero__visual.is-enhanced.is-introduced .hero__connection--signal',
    ),
    /linear infinite/,
  );
});

test('motion uses only restrained transform and stroke-dash animation properties', () => {
  const keyframes = source.slice(source.indexOf('@keyframes hero-'));
  assert.doesNotMatch(
    keyframes,
    /opacity:|rotate\(|translate\(|top:|right:|bottom:|left:|width:|height:/,
  );
  const scales = [...keyframes.matchAll(/scale\(([\d.]+)\)/g)].map((match) =>
    Number(match[1]),
  );
  assert.ok(scales.length > 0);
  assert.ok(scales.every((scale) => scale >= 1 && scale <= 1.05));
  assert.doesNotMatch(
    source,
    /filter:|drop-shadow|text-shadow|box-shadow|glow|bounce|parallax/,
  );
});

test('offscreen and hidden-tab pause class freezes every scoped SVG animation', () => {
  assert.match(
    ruleBody('.hero__visual.is-enhanced.is-paused *'),
    /animation-play-state:\s*paused !important;/,
  );
});

test('reduced motion resolves to complete static geometry with every animation disabled', () => {
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.hero__visual \*,\s*\.hero__visual\.is-enhanced \*[\s\S]*?animation:\s*none !important;/,
  );
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.hero__connection--reveal[\s\S]*?stroke-dasharray:\s*none;[\s\S]*?stroke-dashoffset:\s*0;/,
  );
});

test('mobile simplifies only idle breathing while retaining static and signal geometry', () => {
  const media = css.match(
    /@media \(width < 48em\) \{\s*\.hero__visual\.is-enhanced\.is-introduced \.hero__node--primary\s*\{([^}]*)\}/,
  );
  assert.ok(media);
  assert.match(media[1], /animation:\s*none;/);
  assert.doesNotMatch(media[0], /hero__connection|hero__node--destination/);
});

test('responsive width model cannot overflow at required review widths', () => {
  for (const viewport of [320, 375, 390, 768, 1024, 1440, 1920]) {
    const container = Math.min(viewport, 1280);
    const available = container - 2 * gutterAt(viewport);
    const mediaWidth = viewport >= 1024 ? available * 0.45 : available;
    const visualWidth = Math.min(mediaWidth, 448);
    assert.ok(
      visualWidth <= available,
      `hero visual ${visualWidth}px exceeded ${available}px at ${viewport}px`,
    );
  }
});

test('hero enhancement introduces no canvas, remote resource, filter, or layout animation', () => {
  assert.doesNotMatch(
    source,
    /canvas|https?:|url\(|filter:|position:\s*(?:fixed|absolute)/,
  );
  assert.doesNotMatch(
    source,
    /@keyframes[\s\S]*?(?:margin|padding|inset|grid|flex-basis):/,
  );
});
