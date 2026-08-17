// PF-060 — the case-study template's generic behavior (optional-section
// omission, escaping, heading hierarchy, region-scoped external-link
// enforcement, gallery-absent-renders-nothing) is exercised against
// synthetic fixture content so PF-061/062 are protected even before FES's
// real content existed. FES-specific assertions run against the real
// renderer output (renderRoute), the same pattern tests/work-render.test.mjs
// already uses for its own real content.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderCaseStudyPage } from '../src/pages/templates/case-study.js';
import { renderRoute } from '../src/pages/render.js';
import { routes } from '../src/config/routes.js';
import fesChallengerContent from '../src/content/pages/work/fes-challenger.js';
import homeContent from '../src/content/pages/home.js';
import workContent from '../src/content/pages/work/index.js';
import { primaryNav } from '../src/config/navigation.js';
import { site } from '../src/config/site.js';
import { expectCtaPanels } from './helpers/component-markup.mjs';

function minimalContent() {
  return {
    title: 'Minimal Case Study',
    heading: 'Minimal Case Study',
    paragraphs: ['A minimal case study with only the required fields.'],
    backLink: { label: 'Back to Work', path: '/work/' },
  };
}

// --- Optional-section omission (protects PF-061/062) --------------------

test('a minimal case study (only backLink + base fields) renders zero section headers, zero gallery, and no logo', () => {
  const { main } = renderCaseStudyPage({
    content: minimalContent(),
    navItems: primaryNav,
    activeKey: 'work',
    site,
  });
  assert.equal(
    [...main.matchAll(/<h2 class="section-header__heading">/g)].length,
    0,
  );
  assert.doesNotMatch(main, /case-study-gallery/);
  assert.doesNotMatch(main, /case-study-hero__logo/);
  assert.doesNotMatch(main, /class="cta"/);
  assert.equal([...main.matchAll(/<h1[ >]/g)].length, 1);
  assert.match(main, /<a href="\/work\/">Back to Work<\/a>/);
});

test('each named optional section renders only when its own field is present', () => {
  const withClientOnly = renderCaseStudyPage({
    content: {
      ...minimalContent(),
      client: { body: ['Client context.'] },
    },
    navItems: primaryNav,
    activeKey: 'work',
    site,
  }).main;
  assert.equal(
    [...withClientOnly.matchAll(/<h2 class="section-header__heading">/g)]
      .length,
    1,
  );
  assert.match(withClientOnly, /Client &amp; Business Context/);
  assert.doesNotMatch(withClientOnly, /The Challenge/);
  assert.doesNotMatch(withClientOnly, /My Role/);
});

// --- Escaping -------------------------------------------------------------

test('every string field is escaped, including nested list/tag/gallery text', () => {
  const hostileContent = {
    title: 'T',
    heading: '<b>Bold</b> & Heading',
    paragraphs: ['Lead & <script>alert(1)</script>'],
    backLink: { label: 'Back & <b>Work</b>', path: '/work/' },
    logo: { src: '/images/logo.png', alt: '<b>Logo</b> & alt' },
    externalLink: { label: 'Visit & <b>Site</b>', url: 'https://example.com/' },
    client: { body: ['Client & <i>context</i>.'] },
    role: {
      body: ['Role body & <i>text</i>.'],
      responsibilities: ['Resp & <b>one</b>'],
    },
    technologyStack: { items: ['<Tag> & Stack'] },
    decisions: { items: ['Decision & <b>one</b>'] },
    outcomes: { items: ['Outcome & <b>one</b>'] },
    gallery: {
      items: [
        {
          src: '/images/case-studies/example/one.webp',
          alt: 'Alt & <b>text</b>',
          width: 800,
          height: 450,
          caption: 'Caption & <b>text</b>',
        },
      ],
    },
    cta: {
      heading: 'CTA & <b>Heading</b>',
      body: 'CTA body & <b>text</b>',
      action: { label: 'Go & <b>Now</b>', path: '/contact/' },
    },
  };

  const { main } = renderCaseStudyPage({
    content: hostileContent,
    navItems: primaryNav,
    activeKey: 'work',
    site,
  });

  assert.doesNotMatch(main, /<script>/, 'no raw <script> tag should survive');
  assert.match(main, /&lt;b&gt;Bold&lt;\/b&gt; &amp; Heading/);
  assert.match(main, /Lead &amp; &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(main, /Back &amp; &lt;b&gt;Work&lt;\/b&gt;/);
  assert.match(main, /&lt;b&gt;Logo&lt;\/b&gt; &amp; alt/);
  assert.match(main, /Visit &amp; &lt;b&gt;Site&lt;\/b&gt;/);
  assert.match(main, /Client &amp; &lt;i&gt;context&lt;\/i&gt;\./);
  assert.match(main, /Role body &amp; &lt;i&gt;text&lt;\/i&gt;\./);
  assert.match(main, /Resp &amp; &lt;b&gt;one&lt;\/b&gt;/);
  assert.match(main, /&lt;Tag&gt; &amp; Stack/);
  assert.match(main, /Decision &amp; &lt;b&gt;one&lt;\/b&gt;/);
  assert.match(main, /Outcome &amp; &lt;b&gt;one&lt;\/b&gt;/);
  assert.match(main, /Alt &amp; &lt;b&gt;text&lt;\/b&gt;/);
  assert.match(main, /Caption &amp; &lt;b&gt;text&lt;\/b&gt;/);
  assert.match(main, /CTA &amp; &lt;b&gt;Heading&lt;\/b&gt;/);
  assert.match(main, /Go &amp; &lt;b&gt;Now&lt;\/b&gt;/);
});

// --- Gallery ---------------------------------------------------------------

test('gallery items render required alt, numeric width/height, safe src, loading="lazy", and a .media-frame', () => {
  const { main } = renderCaseStudyPage({
    content: {
      ...minimalContent(),
      gallery: {
        items: [
          {
            src: '/images/case-studies/example/homepage-desktop.webp',
            alt: 'Homepage hero on desktop',
            width: 1440,
            height: 810,
          },
          {
            src: '/images/case-studies/example/mobile-nav.webp',
            alt: 'Mobile navigation open',
            width: 390,
            height: 844,
            caption: 'Mobile navigation',
          },
        ],
      },
    },
    navItems: primaryNav,
    activeKey: 'work',
    site,
  });
  assert.match(
    main,
    /<h2 class="section-header__heading">Project Gallery<\/h2>/,
  );
  const items = [
    ...main.matchAll(/<li class="case-study-gallery__item">[\s\S]*?<\/li>/g),
  ];
  assert.equal(items.length, 2);
  assert.match(
    items[0][0],
    /<div class="media-frame"><img src="\/images\/case-studies\/example\/homepage-desktop\.webp" alt="Homepage hero on desktop" width="1440" height="810" loading="lazy"><\/div>/,
  );
  assert.doesNotMatch(items[0][0], /figcaption/);
  assert.match(items[1][0], /<figcaption>Mobile navigation<\/figcaption>/);
});

test('gallery is entirely absent (no heading, no grid, no placeholder) when the field is absent', () => {
  const { main } = renderCaseStudyPage({
    content: minimalContent(),
    navItems: primaryNav,
    activeKey: 'work',
    site,
  });
  assert.doesNotMatch(main, /Project Gallery/);
  assert.doesNotMatch(main, /case-study-gallery/);
  assert.doesNotMatch(main, /coming soon/i);
});

// --- Real FES content, end-to-end ------------------------------------------

function fesMain() {
  const route = routes.find((r) => r.key === 'work-fes-challenger');
  return renderRoute(route).main;
}

test('FES Challenger: exactly one <h1>, 7 curated section headings, and the closing CTA as <h2>, never <h3>', () => {
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
  ]);
  assert.equal(
    [...main.matchAll(/<h2 class="cta__heading">/g)].length,
    1,
    'expected the closing CTA to render as <h2>',
  );
  assert.equal([...main.matchAll(/<h3 class="cta__heading">/g)].length, 0);
});

test('FES Challenger: no gallery renders (no reviewed screenshots exist yet)', () => {
  const main = fesMain();
  assert.doesNotMatch(main, /Project Gallery/);
  assert.doesNotMatch(main, /case-study-gallery/);
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

// --- Home/Work card consistency --------------------------------------------

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
