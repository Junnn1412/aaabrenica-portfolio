// PF-060 — the case-study template's generic behavior (optional-section
// omission, escaping, heading hierarchy, gallery-absent-renders-nothing) is
// exercised here against synthetic fixture content only, so it protects any
// case-study route (PF-060/061/062...) without depending on any one
// project's real content. Per-route real-content assertions live in their
// own dedicated files (tests/fes-challenger-render.test.mjs,
// tests/business-workflow-system-render.test.mjs, ...), the same
// one-file-per-real-route convention tests/home-render.test.mjs/
// tests/work-render.test.mjs/tests/solutions-render.test.mjs already use —
// extracted at PF-061 once a second real case study made the original
// FES-plus-generic mix in this single file awkward to keep growing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderCaseStudyPage } from '../src/pages/templates/case-study.js';
import { primaryNav } from '../src/config/navigation.js';
import { site } from '../src/config/site.js';

function minimalContent() {
  return {
    title: 'Minimal Case Study',
    heading: 'Minimal Case Study',
    paragraphs: ['A minimal case study with only the required fields.'],
    backLink: { label: 'Back to Work', path: '/work/' },
  };
}

// --- Optional-section omission (protects any future case-study route) ----

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
