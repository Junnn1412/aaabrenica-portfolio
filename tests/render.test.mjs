import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/pages/render.js';
import { routes } from '../src/config/routes.js';
import { site } from '../src/config/site.js';
import homeContent from '../src/content/pages/home.js';
import aboutContent from '../src/content/pages/about.js';

function routeByKey(key) {
  const route = routes.find((r) => r.key === key);
  assert.ok(route, `route "${key}" must exist in routes.js`);
  return route;
}

test('renderRoute("home") produces a single title combining content and site name', () => {
  const { head } = renderRoute(routeByKey('home'));
  const matches = [...head.matchAll(/<title>([^<]*)<\/title>/g)];
  assert.equal(matches.length, 1);
  assert.ok(matches[0][1].endsWith(site.siteName));
});

test('renderRoute("privacy") falls back to site.defaultDescription end-to-end', () => {
  const { head } = renderRoute(routeByKey('privacy'));
  assert.match(
    head,
    new RegExp(`content="${site.defaultDescription.replace(/'/g, '&#39;')}"`),
  );
});

// PF-053 — end-to-end sanity check that the real about.js content renders
// through the 'standard' template's new optional cta field correctly.
test('renderRoute("about") renders exactly one closing cta heading, linking to /contact/', () => {
  const { main } = renderRoute(routeByKey('about'));
  const ctaHeadings = [...main.matchAll(/<h2 class="cta__heading">/g)];
  assert.equal(ctaHeadings.length, 1);
  assert.match(main, /<a class="btn btn--primary" href="\/contact\/">/);
});

// PF-053 — DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md §8.3: "The homepage
// and dedicated pages must not repeat identical long-form content." Guards
// against About's real copy silently regressing back to home.js's verbatim
// about-preview sentence.
test("about.js's paragraphs do not repeat home.js's about-preview paragraph verbatim", () => {
  for (const aboutParagraph of aboutContent.paragraphs) {
    for (const homeParagraph of homeContent.about.paragraphs) {
      assert.notEqual(aboutParagraph, homeParagraph);
    }
  }
});

test('renderRoute for a case-study route includes the backLink to /work/', () => {
  const { main } = renderRoute(routeByKey('work-fes-challenger'));
  assert.match(main, /<a href="\/work\/">Back to Work<\/a>/);
});

// PF-040: the page container is wired at the template layer (not the
// skeleton) so PF-041+ can introduce full-bleed sections without fighting
// a global wrapper — every single-container-template route's main output
// must still open with it. PF-041/PF-050/PF-051/PF-052: home, solutions,
// process, and work are the anticipated exceptions (docs/DECISION_LOG.md's
// PF-040 entry) — each top-level <section> owns its own inner .container
// instead of one wrapping the whole page.
const PER_SECTION_CONTAINER_TEMPLATES = [
  'home',
  'solutions',
  'process',
  'work',
];

test('every route using a single-container template wraps its main content in the page container', () => {
  for (const route of routes) {
    if (PER_SECTION_CONTAINER_TEMPLATES.includes(route.template)) continue;
    const { main } = renderRoute(route);
    assert.match(
      main,
      /^<div class="container">[\s\S]*<\/div>$/,
      `route "${route.key}": expected main to be wrapped in <div class="container">...</div>`,
    );
  }
});

test('home route composes per-section containers instead of one page-level wrapper', () => {
  const { main } = renderRoute(routeByKey('home'));
  assert.match(
    main,
    /^<section class="hero"><div class="container/,
    'expected main to open with the hero section, itself opening with its own .container',
  );
  const sectionOpens = [
    ...main.matchAll(/<section class="(hero|page-section)[^"]*">/g),
  ];
  const sectionContainers = [
    ...main.matchAll(
      /<section class="(?:hero|page-section)[^"]*"><div class="container/g,
    ),
  ];
  assert.ok(sectionOpens.length > 0, 'expected at least one top-level section');
  assert.equal(
    sectionOpens.length,
    sectionContainers.length,
    'every top-level section must open with its own <div class="container">',
  );
});
