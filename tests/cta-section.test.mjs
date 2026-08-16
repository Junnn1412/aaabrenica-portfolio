import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

// No cascade-resolver here — .cta is not list-based, so the ul/ol/li reset
// defect class the resolver exists to catch does not apply. See
// tests/process-steps-layout.test.mjs for that check on the three PF-034
// list-based components.
const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

const previewPath = fileURLToPath(
  new URL('../dev/design-system/index.html', import.meta.url),
);
const previewHtml = fs.readFileSync(previewPath, 'utf8');

function getCtaSection() {
  const section = previewHtml.match(
    /<section class="preview-section" id="cta-section">[\s\S]*?<\/section>/,
  );
  assert.ok(section, 'cta-section <section> not found');
  return section[0];
}

test('the showcase has exactly two .cta panels (with and without supporting copy)', () => {
  const section = getCtaSection();
  const panels = [...section.matchAll(/<div class="cta">[\s\S]*?<\/div>/g)];
  assert.equal(
    panels.length,
    2,
    `expected 2 .cta panels, found ${panels.length}`,
  );
});

test('every .cta panel carries exactly one interactive element (the .btn action link)', () => {
  const section = getCtaSection();
  const panels = [...section.matchAll(/<div class="cta">[\s\S]*?<\/div>/g)];
  for (const [index, panel] of panels.entries()) {
    const links = [...panel[0].matchAll(/<a\s/g)].length;
    assert.equal(
      links,
      1,
      `panel #${index + 1}: expected exactly one <a>, found ${links}`,
    );
    assert.match(
      panel[0],
      /<a class="btn btn--primary"/,
      `panel #${index + 1}: expected the action link to use .btn.btn--primary`,
    );
  }
});

test('the second .cta panel omits .cta__body entirely rather than rendering an empty element', () => {
  const section = getCtaSection();
  const panels = [...section.matchAll(/<div class="cta">[\s\S]*?<\/div>/g)];
  assert.match(
    panels[0][0],
    /class="cta__body"/,
    'first panel should include supporting copy',
  );
  assert.doesNotMatch(
    panels[1][0],
    /class="cta__body"/,
    'second panel should omit .cta__body entirely, not render it empty',
  );
});

test('.cta defines no focus-visible/outline rule of its own — the .btn action link keeps the existing global ring unmodified', () => {
  assert.doesNotMatch(
    css,
    /\.cta[_\s{:][^}]*:focus-visible/,
    '.cta must not define a competing focus-visible rule; it should rely entirely on the global :focus-visible ring already applied to .btn',
  );
  assert.doesNotMatch(
    css,
    /\.cta\s*\{[^}]*outline/,
    '.cta itself should declare no outline property',
  );
});

test('forced-colors mode preserves the .cta panel boundary via an explicit border', () => {
  const blocks = [
    ...css.matchAll(/@media \(forced-colors: active\)\s*\{([\s\S]*?)\n\}\n/g),
  ];
  const ctaBlock = blocks.find((b) => /\.cta\b/.test(b[1]));
  assert.ok(ctaBlock, '.cta forced-colors block not found');
  assert.match(
    ctaBlock[1],
    /border:\s*1px solid CanvasText;/,
    'expected the forced-colors block to supply an explicit .cta boundary border',
  );
});
