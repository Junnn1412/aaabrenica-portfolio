import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderProjectCards } from '../src/components/project-card.js';

const textOnly = { kind: 'text-only' };

function items(presentation = textOnly) {
  return [{ heading: 'A Project', link: '/work/a-project/', presentation }];
}

test('renderProjectCards renders the approved heading levels', () => {
  const defaultHtml = renderProjectCards(items());
  assert.match(defaultHtml, /<h4 class="project-card__heading">/);
  assert.doesNotMatch(defaultHtml, /<h3 class="project-card__heading">/);

  const levelThreeHtml = renderProjectCards(items(), 3);
  assert.match(levelThreeHtml, /<h3 class="project-card__heading">/);
  assert.doesNotMatch(levelThreeHtml, /<h4 class="project-card__heading">/);
});

test('image presentation renders truthful intrinsic data, lazy loading, frame, and browser dots', () => {
  const html = renderProjectCards(
    items({
      kind: 'image',
      src: '/images/example.png',
      alt: 'Example screenshot',
      width: 2880,
      height: 1388,
    }),
  );
  assert.match(html, /class="project-card__frame"/);
  assert.match(html, /class="project-card__frame-dots" aria-hidden="true"/);
  assert.match(html, /class="media-frame project-card__media"/);
  assert.match(
    html,
    /<img src="\/images\/example\.png" alt="Example screenshot" width="2880" height="1388" loading="lazy">/,
  );
});

test('carousel presentation renders three slides and a balanced hidden control set', () => {
  const html = renderProjectCards(
    items({
      kind: 'carousel',
      slides: [
        {
          src: '/images/one.png',
          alt: 'First screenshot',
          width: 800,
          height: 450,
        },
        {
          src: '/images/two.png',
          alt: 'Second screenshot',
          width: 716,
          height: 448,
        },
        {
          src: '/images/three.png',
          alt: 'Third screenshot',
          width: 718,
          height: 447,
        },
      ],
    }),
  );
  assert.match(
    html,
    /project-carousel__arrow--previous[\s\S]*project-carousel__indicators[\s\S]*project-carousel__arrow--next/,
  );
  assert.equal([...html.matchAll(/data-project-carousel-slide/g)].length, 3);
  assert.equal(
    [...html.matchAll(/data-project-carousel-indicator="\d"/g)].length,
    3,
  );
  assert.match(
    html,
    /data-project-carousel-previous aria-label="Previous project image" hidden/,
  );
  assert.match(html, /class="project-carousel__indicators"[^>]* hidden/);
  assert.match(
    html,
    /data-project-carousel-next aria-label="Next project image" hidden/,
  );
  assert.match(
    html,
    /project-carousel__slide is-active[^>]*aria-hidden="false"><img[^>]+>/,
  );
  assert.equal([...html.matchAll(/aria-hidden="true" hidden><img/g)].length, 2);
  assert.doesNotMatch(html, /<a[^>]*>[\s\S]*?<button/);
});

test('text-only presentation emits no media wrapper, frame, browser dots, image, or status', () => {
  const html = renderProjectCards(items());
  assert.doesNotMatch(
    html,
    /project-card__frame|project-card__media|media-frame/,
  );
  assert.doesNotMatch(
    html,
    /project-card__frame-dots|<img|project-card__status/,
  );
});

test('deferred presentation emits its escaped status and no media markup', () => {
  const html = renderProjectCards(
    items({ kind: 'deferred', label: 'Case study in development' }),
  );
  assert.match(
    html,
    /<p class="project-card__status">Case study in development<\/p>/,
  );
  assert.doesNotMatch(
    html,
    /project-card__frame|project-card__frame-dots|project-card__media|media-frame|<img/,
  );
});

test('missing, unknown, and malformed presentations fail renderer validation', () => {
  assert.throws(
    () => renderProjectCards([{ heading: 'Missing', link: '/work/' }]),
    /presentation/,
  );
  assert.throws(
    () => renderProjectCards(items({ kind: 'placeholder' })),
    /unknown presentation kind/,
  );
  for (const malformed of [
    { kind: 'image', src: 'unsafe.png', alt: 'Alt', width: 1, height: 1 },
    { kind: 'image', src: '/safe.png', alt: '', width: 1, height: 1 },
    { kind: 'image', src: '/safe.png', alt: 'Alt', width: 0, height: 1 },
    { kind: 'image', src: '/safe.png', alt: 'Alt', width: 1, height: 1.5 },
    { kind: 'text-only', src: '/unexpected.png' },
    { kind: 'deferred', label: '' },
    { kind: 'carousel', slides: [] },
    {
      kind: 'carousel',
      slides: [
        { src: '/one.png', alt: 'One', width: 1, height: 1 },
        { src: '/two.png', alt: '', width: 1, height: 1 },
        { src: '/three.png', alt: 'Three', width: 1, height: 1 },
      ],
    },
  ]) {
    assert.throws(() => renderProjectCards(items(malformed)), /presentation/);
  }
});

test('a one-card list emits the single-track modifier and never featured-pair', () => {
  const html = renderProjectCards(items());
  assert.match(html, /^<ul class="project-cards project-cards--single">/);
  assert.doesNotMatch(html, /project-cards--featured-pair/);
});

test('renderProjectCards throws for heading levels outside the approved set', () => {
  assert.throws(() => renderProjectCards(items(), 5), /headingLevel/);
  assert.throws(() => renderProjectCards(items(), 2), /headingLevel/);
  assert.throws(
    () => renderProjectCards(items(), '<script>alert(1)</script>'),
    /headingLevel/,
  );
});
