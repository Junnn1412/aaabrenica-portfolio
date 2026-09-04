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
  assert.equal(site.siteName, 'Antonio Abrenica');
  assert.equal(
    matches[0][1],
    'Practical Software Solutions for Growing Businesses — Antonio Abrenica',
  );
});

test('renderRoute("privacy") falls back to site.defaultDescription end-to-end', () => {
  const { head } = renderRoute(routeByKey('privacy'));
  assert.match(
    head,
    new RegExp(`content="${site.defaultDescription.replace(/'/g, '&#39;')}"`),
  );
});

test('renderRoute("home") emits production canonical, social, and structured-data metadata', () => {
  const { head } = renderRoute(routeByKey('home'));

  assert.equal(site.baseUrl, 'https://aaabrenica.site');
  assert.match(
    head,
    /<link rel="canonical" href="https:\/\/aaabrenica\.site\/">/,
  );
  assert.match(head, /<meta property="og:type" content="website">/);
  assert.match(
    head,
    /<meta property="og:title" content="Practical Software Solutions for Growing Businesses — Antonio Abrenica">/,
  );
  assert.match(
    head,
    /<meta property="og:description" content="Antonio Abrenica helps organizations identify inefficient, repetitive, or difficult processes and turn them into practical websites, workflow solutions, internal systems, and custom software\.">/,
  );
  assert.match(
    head,
    /<meta property="og:site_name" content="Antonio Abrenica">/,
  );
  assert.match(
    head,
    /<meta property="og:url" content="https:\/\/aaabrenica\.site\/">/,
  );
  assert.equal(
    site.socialImageUrl,
    'https://aaabrenica.site/images/brand/aaabrenica-og-image.png',
  );
  assert.match(
    head,
    /<meta property="og:image" content="https:\/\/aaabrenica\.site\/images\/brand\/aaabrenica-og-image\.png">/,
  );
  assert.match(
    head,
    /<meta name="twitter:card" content="summary_large_image">/,
  );
  assert.match(
    head,
    /<meta name="twitter:title" content="Practical Software Solutions for Growing Businesses — Antonio Abrenica">/,
  );
  assert.match(
    head,
    /<meta name="twitter:description" content="Antonio Abrenica helps organizations identify inefficient, repetitive, or difficult processes and turn them into practical websites, workflow solutions, internal systems, and custom software\.">/,
  );
  assert.match(
    head,
    /<meta name="twitter:image" content="https:\/\/aaabrenica\.site\/images\/brand\/aaabrenica-og-image\.png">/,
  );
  assert.match(head, /<script type="application\/ld\+json">/);
  const script = head.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )?.[1];
  assert.ok(script, 'expected a JSON-LD script block');
  const data = JSON.parse(script);
  assert.equal(data['@graph'][0]['@type'], 'WebSite');
  assert.equal(data['@graph'][1]['@type'], 'Person');
  assert.equal('sameAs' in data['@graph'][0], false);
  assert.ok(Array.isArray(data['@graph'][1].sameAs));
});

test('every canonical-eligible route exposes exactly the expected canonical URL and 404 omits canonical metadata', () => {
  for (const route of routes) {
    const { head } = renderRoute(route);
    const canonicalMatches = [
      ...head.matchAll(/<link rel="canonical" href="([^"]+)"/g),
    ];

    if (route.key === 'not-found') {
      assert.equal(
        canonicalMatches.length,
        0,
        `404 route must not emit canonical metadata`,
      );
      continue;
    }

    assert.equal(
      canonicalMatches.length,
      1,
      `route "${route.key}" should emit exactly one canonical URL`,
    );
    const expectedCanonical = new URL(route.path, site.baseUrl).toString();
    assert.equal(
      canonicalMatches[0][1],
      expectedCanonical,
      `route "${route.key}" canonical href must match the route registry`,
    );
  }
});

test('renderRoute("not-found") omits canonical and social metadata for the 404 page', () => {
  const { head } = renderRoute(routeByKey('not-found'));
  assert.doesNotMatch(head, /<link rel="canonical"/);
  assert.doesNotMatch(head, /<meta property="og:url"/);
  assert.doesNotMatch(head, /<script type="application\/ld\+json">/);
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
  assert.match(main, /class="action-link action-link--back" href="\/work\/"/);
});

// PF-040: the page container is wired at the template layer (not the
// skeleton) so PF-041+ can introduce full-bleed sections without fighting
// a global wrapper — every single-container-template route's main output
// must still open with it. PF-041/PF-050/PF-051/PF-052/PF-060: home,
// solutions, process, and work are the anticipated per-section exceptions
// (docs/DECISION_LOG.md's PF-040 entry) — each top-level <section> owns its
// own inner .container. Case studies use one rich-editorial container below.
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
      /^<div class="container(?: [^"]+)?">[\s\S]*<\/div>$/,
      `route "${route.key}": expected main to be wrapped in a .container div`,
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

// PF-060 — case-study routes follow the same bare-intro-container +
// per-section-container shape as solutions/process/work, not home's
// section-only opening.
test('a case-study route composes one scoped editorial container', () => {
  const { main } = renderRoute(routeByKey('work-fes-challenger'));
  assert.match(
    main,
    /^<div class="container case-study">[\s\S]*<\/div>$/,
    'expected one case-study editorial container',
  );
  assert.equal([...main.matchAll(/class="container/g)].length, 1);
  assert.doesNotMatch(main, /case-study-section[^>]*><div class="container/);
});
