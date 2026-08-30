import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import { resolveProperty } from './helpers/cascade-resolver.mjs';

const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);
const carouselSource = fs.readFileSync(
  fileURLToPath(new URL('../src/scripts/project-carousel.js', import.meta.url)),
  'utf8',
);

const card = { tag: 'li', classes: ['project-card', 'project-card--featured'] };
const carousel = {
  tag: 'section',
  classes: ['project-card__frame', 'project-carousel'],
  ancestors: [card],
};
const media = {
  tag: 'div',
  classes: ['media-frame', 'project-card__media'],
  ancestors: [card, carousel],
};
const image = {
  tag: 'img',
  classes: [],
  ancestors: [card, carousel, media],
};

test('resolved cascade gives the outer card all corners and project media a square clipped seam', () => {
  assert.equal(resolveProperty(css, card, 'border-radius'), 'var(--radius-lg)');
  assert.equal(resolveProperty(css, card, 'overflow'), 'hidden');
  assert.equal(resolveProperty(css, media, 'border-radius'), '0');
  assert.equal(resolveProperty(css, media, 'overflow'), 'hidden');
});

test('resolved production carousel classes create a stable 16:9 contained image frame', () => {
  assert.equal(resolveProperty(css, media, 'aspect-ratio'), '16/9');
  assert.equal(resolveProperty(css, media, 'width'), '100%');
  assert.equal(resolveProperty(css, media, 'flex'), '0 0 auto');
  assert.equal(resolveProperty(css, image, 'width'), '100%');
  assert.equal(resolveProperty(css, image, 'height'), '100%');
  assert.equal(resolveProperty(css, image, 'object-fit'), 'contain');
  assert.equal(resolveProperty(css, image, 'object-position'), 'center');
});

test('control bar is balanced previous / centered indicators / next with token-sized targets', () => {
  const controlRule = css.match(/\.project-carousel__controls\s*\{([^}]*)\}/);
  assert.ok(controlRule);
  assert.match(
    controlRule[1],
    /grid-template-columns:\s*var\(--touch-target-min\) minmax\(0,\s*1fr\) var\(--touch-target-min\);/,
  );
  assert.match(controlRule[1], /min-height:\s*var\(--touch-target-min\);/);
  const indicatorRule = css.match(
    /\.project-carousel__indicator\s*\{([^}]*)\}/,
  );
  assert.ok(indicatorRule);
  assert.match(indicatorRule[1], /width:\s*var\(--touch-target-min\);/);
  assert.match(indicatorRule[1], /height:\s*var\(--touch-target-min\);/);

  const viewport = 320;
  const minimumGutters = 2 * 20;
  const fiveTargets = 5 * 44;
  assert.ok(viewport - minimumGutters >= fiveTargets);
});

test('active indicator changes size as well as color and reduced motion removes transitions', () => {
  const active = css.match(
    /\.project-carousel__indicator\[aria-pressed=true\]::before\s*\{([^}]*)\}/,
  );
  assert.ok(active);
  assert.match(active[1], /width:\s*var\(--space-3\);/);
  assert.match(active[1], /height:\s*var\(--space-3\);/);
  assert.match(active[1], /background-color:\s*var\(--color-accent\);/);
  assert.match(
    css,
    /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.project-carousel__slide\s*\{\s*transition:\s*none;/,
  );
});

test('carousel source has no autoplay, timer, hover, swipe, drag, or navigation side effect', () => {
  assert.doesNotMatch(
    carouselSource,
    /setInterval|setTimeout|requestAnimationFrame|mouseenter|mouseover|pointermove|touchmove|dragstart|window\.location|location\.assign|\.click\(\)/,
  );
});

test('Home project composition resolves to a real grid gap and resets action margin', () => {
  const body = { tag: 'div', classes: ['home-projects__body'] };
  const action = {
    tag: 'p',
    classes: ['home-projects__action'],
    ancestors: [body],
  };
  assert.equal(resolveProperty(css, body, 'display'), 'grid');
  assert.equal(resolveProperty(css, body, 'gap'), 'var(--space-6)');
  assert.equal(resolveProperty(css, action, 'margin'), '0');
});

test('single-card modifier resolves to exactly one grid track', () => {
  assert.equal(
    resolveProperty(
      css,
      { tag: 'ul', classes: ['project-cards', 'project-cards--single'] },
      'grid-template-columns',
    ),
    '1fr',
  );
});
