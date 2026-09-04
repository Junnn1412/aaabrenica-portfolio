import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import { resolveProperty } from './helpers/cascade-resolver.mjs';

const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

function ruleBody(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `expected a ${selector} rule`);
  return match[1];
}

test('Process uses the scoped centered 72rem editorial composition', () => {
  assert.match(ruleBody('.process-page__container'), /max-width:\s*72rem;/);
  assert.match(
    ruleBody('.container'),
    /max-width:\s*var\(--container-max\);[\s\S]*margin-inline:\s*auto;/,
  );
});

test('process list resets the generic prose-list cascade', () => {
  const target = { tag: 'ol', classes: ['process-detail'] };
  assert.equal(resolveProperty(css, target, 'max-width'), 'none');
  assert.equal(resolveProperty(css, target, 'margin'), '0');
  assert.equal(resolveProperty(css, target, 'padding'), '0');
  assert.equal(resolveProperty(css, target, 'list-style'), 'none');
});

test('base/mobile Process facts remain one flexible source-order column', () => {
  const facts = ruleBody('.process-facts');
  assert.match(facts, /display:\s*grid;/);
  assert.match(facts, /grid-template-columns:\s*minmax\(0, 1fr\);/);
  assert.match(facts, /max-width:\s*none;/);
  assert.match(facts, /margin:\s*var\(--space-6\)\s*0\s*0;/);
  assert.match(
    ruleBody('.process-detail__stage .process-facts'),
    /margin-left:\s*calc\(2\.5rem \+ var\(--space-4\)\);/,
  );
});

test('desktop Process uses stage identity plus flexible two-column facts', () => {
  const blocks = [
    ...css.matchAll(/@media \(min-width:\s*64em\)\s*\{([\s\S]*?)\n\}/g),
  ];
  const body = blocks.find((block) =>
    /\.process-detail__stage/.test(block[1]),
  )?.[1];
  assert.ok(body, 'expected the 64em Process desktop block');
  assert.match(
    body,
    /grid-template-columns:\s*minmax\(13rem, 16rem\)\s*minmax\(0, 1fr\);/,
  );
  assert.match(
    body,
    /\.process-facts\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/,
  );
  assert.match(
    body,
    /\.process-facts__item:last-child:nth-child\(odd\)\s*\{[\s\S]*?grid-column:\s*1\s*\/\s*-1;/,
  );
});

test('timeline rail and nodes are CSS-only decoration with forced-colors boundaries', () => {
  assert.match(
    ruleBody('.process-detail::before'),
    /content:\s*['"]{2};[\s\S]*border-left:/,
  );
  assert.match(
    css,
    /@media \(forced-colors: active\)[\s\S]*?\.process-detail__number[\s\S]*?border:\s*1px solid CanvasText;/,
  );
});

test('stage headings keep direct alignment and readable detail measures', () => {
  assert.equal(
    resolveProperty(
      css,
      { tag: 'h3', classes: ['process-detail__heading'] },
      'margin',
    ),
    '0',
  );
  assert.match(
    ruleBody('.process-facts__detail'),
    /max-width:\s*var\(--width-reading\);/,
  );
});

test('Process stage dividers stay understated', () => {
  assert.match(
    ruleBody('.process-detail__stage + .process-detail__stage'),
    /border-top:\s*var\(--border-width\)\s*solid\s*var\(--color-border\);/,
  );
});

test('Process layout contains no CSS order or fixed stage/section height', () => {
  const source = css.match(/\.process-page__container[\s\S]*$/)?.[0] ?? '';
  assert.doesNotMatch(source, /\border\s*:/);
  assert.doesNotMatch(
    source,
    /\.(?:process-detail__stage|process-working|process-stages)[^{]*\{[^}]*\bheight\s*:/,
  );
});

test('Process flexible-track model fits all required viewport widths', () => {
  for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
    const gutter = Math.min(48, Math.max(20, 16 + width * 0.02));
    const available = Math.min(width, 72 * 16) - gutter * 2;
    assert.ok(available > 0, `expected positive content width at ${width}px`);
    if (width >= 1024) {
      assert.ok(
        available - 16 * 16 - 32 > 0,
        `expected flexible fact space at ${width}px`,
      );
    }
  }
});
