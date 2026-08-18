// PF-060/PF-060-logo-follow-up — real end-to-end assertions against the
// FES Challenger route's actual rendered output and content module.
// Extracted out of tests/case-study-render.test.mjs at PF-061 (which left
// that file purely generic) — see docs/DECISION_LOG.md's PF-061 entry.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/pages/render.js';
import { routes } from '../src/config/routes.js';
import fesChallengerContent from '../src/content/pages/work/fes-challenger.js';
import homeContent from '../src/content/pages/home.js';
import workContent from '../src/content/pages/work/index.js';
import { expectCtaPanels } from './helpers/component-markup.mjs';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

function fesMain() {
  const route = routes.find((r) => r.key === 'work-fes-challenger');
  return renderRoute(route).main;
}

test('FES Challenger: exactly one <h1>, 8 curated section headings (7 content + Gallery), and the closing CTA as <h2>, never <h3>', () => {
  const main = fesMain();
  assert.equal([...main.matchAll(/<h1[ >]/g)].length, 1);
  const sectionH2s = [
    ...main.matchAll(/<h2 class="section-header__heading">([^<]*)<\/h2>/g),
  ].map((m) => m[1]);
  assert.deepEqual(sectionH2s, [
    'Client &amp; Business Context',
    'The Challenge',
    'My Role',
    'What I Built',
    'Technology Stack',
    'Key Decisions',
    'Outcomes',
    'Project Gallery',
  ]);
  assert.equal(
    [...main.matchAll(/<h2 class="cta__heading">/g)].length,
    1,
    'expected the closing CTA to render as <h2>',
  );
  assert.equal([...main.matchAll(/<h3 class="cta__heading">/g)].length, 0);
});

// PF-063 — 4 of 7 captured production-site screenshots were selected after
// individual review (see docs/CONTENT_INVENTORY.md for the full audit).
const RAW_CAPTURE_FILENAMES = [
  'hero-banner.png',
  'services-page.png',
  'services-section.png',
  'projects-page.png',
  'projects-section1.png',
  'projects-section2.png',
  'fes-home-mobile.png',
];

test('FES Challenger: the gallery renders exactly the 4 approved images, in the approved order, with real paths/alt/caption/dimensions', () => {
  const main = fesMain();
  assert.match(
    main,
    /<h2 class="section-header__heading">Project Gallery<\/h2>/,
  );
  const items = [
    ...main.matchAll(/<li class="case-study-gallery__item">[\s\S]*?<\/li>/g),
  ].map((m) => m[0]);
  assert.equal(items.length, 4, 'expected exactly 4 gallery items');

  const expected = [
    {
      src: '/images/case-studies/fes-challenger/gallery/homepage-hero-desktop.png',
      alt: 'FES Challenger homepage hero section with a marine salvage vessel photo and headline',
      width: 719,
      height: 443,
      caption: 'Homepage',
    },
    {
      src: '/images/case-studies/fes-challenger/gallery/services-page-desktop.png',
      alt: 'FES Challenger Services page showing marine salvage and underwater service categories',
      width: 716,
      height: 448,
      caption: 'Services',
    },
    {
      src: '/images/case-studies/fes-challenger/gallery/projects-page-desktop.png',
      alt: 'FES Challenger Projects page showing completed marine salvage project cards',
      width: 718,
      height: 447,
      caption: 'Projects',
    },
    {
      src: '/images/case-studies/fes-challenger/gallery/homepage-mobile.png',
      alt: 'FES Challenger homepage on a mobile viewport, showing the responsive hero and navigation menu',
      width: 544,
      height: 689,
      caption: 'Mobile view',
    },
  ];

  items.forEach((item, i) => {
    const e = expected[i];
    assert.match(
      item,
      new RegExp(
        `<img src="${e.src.replace(/\//g, '\\/')}" alt="${e.alt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" width="${e.width}" height="${e.height}" loading="lazy">`,
      ),
      `gallery item ${i + 1} (${e.caption}) markup did not match expected src/alt/width/height`,
    );
    assert.match(
      item,
      new RegExp(`<figcaption>${e.caption}<\\/figcaption>`),
      `gallery item ${i + 1} caption mismatch`,
    );
  });
});

test('FES Challenger: none of the 7 raw capture filenames survive in the rendered output', () => {
  const main = fesMain();
  for (const filename of RAW_CAPTURE_FILENAMES) {
    assert.doesNotMatch(
      main,
      new RegExp(filename.replace('.', '\\.')),
      `raw capture filename "${filename}" must not appear in rendered output`,
    );
  }
});

// PF-063 — Vite copies public/ to dist/ verbatim, so proving the raw
// captures are absent from the real public/ source directory (the single
// place that determines build output) is equivalent to, and cheaper than,
// re-running a build just to inspect dist/. scripts/case-study-assets.mjs
// already proves the 4 *configured* gallery files exist under public/ and
// dist/ during npm run verify — this test additionally proves the 3
// *declined* + the 4 *pre-rename* raw filenames no longer exist anywhere
// under the real asset directory at all.
test('FES Challenger: none of the 7 raw capture files remain on disk under public/', () => {
  const assetDir = fileURLToPath(
    new URL('../public/images/case-studies/fes-challenger/', import.meta.url),
  );
  for (const filename of RAW_CAPTURE_FILENAMES) {
    assert.equal(
      fs.existsSync(assetDir + filename),
      false,
      `raw capture file "${filename}" must not remain under public/`,
    );
  }
  assert.equal(
    fs.existsSync(assetDir + 'fes-challenger-logo.png'),
    true,
    'the approved logo must remain unchanged',
  );
});

// PF-060 logo-integration follow-up — the approved logo is now configured.
test('FES Challenger: the logo renders once, decoratively (empty alt), at its approved path, beside the <h1>', () => {
  const main = fesMain();
  const logos = [
    ...main.matchAll(
      /<img class="case-study-hero__logo" src="([^"]*)" alt="([^"]*)">/g,
    ),
  ];
  assert.equal(logos.length, 1, 'expected exactly one logo image');
  assert.equal(
    logos[0][1],
    '/images/case-studies/fes-challenger/fes-challenger-logo.png',
  );
  assert.equal(logos[0][2], '', 'expected an empty (decorative) alt');
  assert.match(
    main,
    /<div class="case-study-hero__heading-row"><img class="case-study-hero__logo"[^>]*><h1>FES Challenger<\/h1><\/div>/,
    'expected the logo immediately before the <h1>, inside the shared heading row',
  );
});

test('FES Challenger: the external link appears exactly once in main, and is the only external destination in main', () => {
  const main = fesMain();
  assert.equal(
    [
      ...main.matchAll(
        /<a class="btn btn--secondary" href="https:\/\/feschallenger\.com\/">Visit the FES Challenger website<\/a>/g,
      ),
    ].length,
    1,
  );
  const externalHrefs = [...main.matchAll(/href="([^"]*)"/g)]
    .map((m) => m[1])
    .filter((href) => !href.startsWith('/') && !href.startsWith('mailto:'));
  assert.deepEqual(externalHrefs, ['https://feschallenger.com/']);
});

test('FES Challenger: back-to-Work link and closing CTA are present', () => {
  const main = fesMain();
  assert.match(main, /<a href="\/work\/">Back to Work<\/a>/);
  expectCtaPanels(main, { count: 1, actionClass: 'btn btn--primary' });
});

test('FES Challenger: no numeric or business-performance claim appears anywhere', () => {
  const main = fesMain();
  for (const forbidden of ['%', 'revenue', 'leads', 'traffic', 'ranking']) {
    assert.doesNotMatch(
      main,
      new RegExp(forbidden, 'i'),
      `unexpected "${forbidden}" found in the rendered case study`,
    );
  }
});

test("Home and Work FES project cards reuse fes-challenger.js's own card export, not a second independently-typed copy", () => {
  const homeItem = homeContent.projects.items.find(
    (item) => item.heading === 'FES Challenger',
  );
  const workItem = workContent.projects.items.find(
    (item) => item.heading === 'FES Challenger',
  );
  for (const item of [homeItem, workItem]) {
    assert.equal(item.category, fesChallengerContent.card.category);
    assert.equal(item.summary, fesChallengerContent.card.summary);
    assert.deepEqual(item.tags, fesChallengerContent.card.tags);
  }
});
