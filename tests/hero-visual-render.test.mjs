import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderHeroVisual } from '../src/components/hero-visual.js';
import { renderRoute } from '../src/pages/render.js';
import { routes } from '../src/config/routes.js';
import homeContent from '../src/content/pages/home.js';

function routeOutput(key) {
  const route = routes.find((item) => item.key === key);
  assert.ok(route);
  return renderRoute(route);
}

test('static hero SVG is complete before initialization', () => {
  const svg = renderHeroVisual();
  assert.match(
    svg,
    /^<svg class="hero__visual" data-hero-visual viewBox="0 0 400 400"/,
  );
  assert.doesNotMatch(
    svg,
    /is-enhanced|is-active|is-paused|is-introducing|is-introduced|\shidden(?:[ >])/,
  );
  assert.equal([...svg.matchAll(/data-hero-connection/g)].length, 1);
  assert.equal([...svg.matchAll(/data-hero-reveal/g)].length, 1);
  assert.equal([...svg.matchAll(/data-hero-signal/g)].length, 1);
  assert.equal([...svg.matchAll(/data-hero-node=/g)].length, 2);
  assert.equal([...svg.matchAll(/data-hero-point/g)].length, 4);
  assert.equal([...svg.matchAll(/<path /g)].length, 3);
  assert.equal([...svg.matchAll(/<circle /g)].length, 6);
});

test('hero SVG is decorative, unfocusable, and noninteractive', () => {
  const svg = renderHeroVisual();
  assert.match(svg, /aria-hidden="true"/);
  assert.match(svg, /focusable="false"/);
  assert.doesNotMatch(
    svg,
    /<title|<desc|\srole=|aria-label|tabindex|<a\b|<button\b|data-live|aria-live/,
  );
});

test('hero visual uses local SVG geometry with no executable or remote surface', () => {
  const svg = renderHeroVisual();
  assert.doesNotMatch(
    svg,
    /<script|<filter|<foreignObject|<image|<canvas|<video|<iframe|\.gif|https?:|href=|src=|on[a-z]+=/i,
  );
});

test('Home emits the visual once while every non-Home route emits no animation marker', () => {
  const home = routeOutput('home').main;
  assert.equal([...home.matchAll(/data-hero-visual/g)].length, 1);
  for (const route of routes.filter((item) => item.key !== 'home')) {
    const rendered = renderRoute(route);
    assert.doesNotMatch(
      `${rendered.head}${rendered.header}${rendered.main}${rendered.footer}`,
      /data-hero-(?:visual|connection|reveal|signal|node|point)/,
    );
  }
});

test('hero text, CTA count, and content-first DOM order remain unchanged', () => {
  const main = routeOutput('home').main;
  const hero = main.match(/<section class="hero">[\s\S]*?<\/section>/)?.[0];
  assert.ok(hero);
  assert.match(
    hero,
    new RegExp(`<h1 class="text-display">${homeContent.heading}`),
  );
  assert.equal([...hero.matchAll(/<a class="btn /g)].length, 2);
  assert.match(hero, /Discuss Your Project/);
  assert.match(hero, /Explore My Work/);
  assert.ok(hero.indexOf('hero__content') < hero.indexOf('hero__media'));
  assert.ok(hero.indexOf('<h1') < hero.indexOf('hero__actions'));
  assert.ok(hero.indexOf('hero__actions') < hero.indexOf('data-hero-visual'));
});
