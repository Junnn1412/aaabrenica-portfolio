// PF-052 — end-to-end structural assertions against the real 'work' route's
// rendered output, mirroring tests/process-render.test.mjs's/
// tests/solutions-render.test.mjs's style: real renderer output checked
// against the shared structural-contract helpers plus this page's own
// heading-hierarchy/route-completeness contract.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/pages/render.js';
import { renderWorkPage } from '../src/pages/templates/work.js';
import { routes } from '../src/config/routes.js';
import workContent from '../src/content/pages/work/index.js';
import { primaryNav } from '../src/config/navigation.js';
import { site } from '../src/config/site.js';
import { expectCtaPanels } from './helpers/component-markup.mjs';

function workMain() {
  const route = routes.find((r) => r.key === 'work');
  return renderRoute(route).main;
}

function cardBlocks(main) {
  return [
    ...main.matchAll(/<li class="project-card[^"]*">[\s\S]*?<\/li>/g),
  ].map((m) => m[0]);
}

test('work: exactly one <h1>', () => {
  const main = workMain();
  const h1s = [...main.matchAll(/<h1[ >]/g)].length;
  assert.equal(h1s, 1, 'expected exactly one <h1>');
});

test('work: exactly 2 <h2>s total (Projects section header, plus the closing CTA heading)', () => {
  const main = workMain();
  const sectionH2s = [...main.matchAll(/<h2 class="section-header__heading">/g)]
    .length;
  const ctaH2s = [...main.matchAll(/<h2 class="cta__heading">/g)].length;
  assert.equal(sectionH2s, 1, 'expected 1 section-header <h2>');
  assert.equal(ctaH2s, 1, 'expected 1 <h2 class="cta__heading">');
  assert.equal(sectionH2s + ctaH2s, 2, 'expected 2 <h2>s total');
});

test('work: exactly 1 visible project-card h3, zero project-card h4, and zero CTA h3', () => {
  const main = workMain();
  const h3s = [...main.matchAll(/<h3 class="project-card__heading">/g)].length;
  const h4s = [...main.matchAll(/<h4 class="project-card__heading">/g)].length;
  assert.equal(h3s, 1, 'expected 1 visible project-card <h3>');
  assert.equal(h4s, 0, 'expected zero project-card <h4>s');
  assert.equal(
    [...main.matchAll(/<h3 class="cta__heading">/g)].length,
    0,
    'expected zero <h3 class="cta__heading"> — the closing CTA must render as <h2>, not <h3>',
  );
});

test('work: only FES renders; BWS and eBarangay never enter emitted HTML', () => {
  const main = workMain();
  const blocks = cardBlocks(main);
  assert.equal(blocks.length, 1, 'expected exactly 1 visible project card');
  assert.match(blocks[0], /project-card--featured/);
  assert.match(blocks[0], />FES Challenger</);
  assert.doesNotMatch(main, /Business Workflow System|eBarangay/);
  assert.doesNotMatch(main, /<li class="project-card[^>]*hidden/);
});

test('work: one visible project emits one explicit track and no featured-pair modifier', () => {
  const main = workMain();
  assert.match(
    main,
    /<ul class="project-cards project-cards--single">/,
    'expected the one-card state to use the explicit single-track modifier',
  );
  assert.doesNotMatch(main, /project-cards--featured-pair/);
});

test('work: the visible card link is registered while raw content retains the exact route set', () => {
  const main = workMain();
  const links = [
    ...main.matchAll(/<a class="project-card__link" href="([^"]*)">/g),
  ].map((m) => m[1]);
  assert.deepEqual(links, ['/work/fes-challenger/']);
  const registeredCaseStudyPaths = new Set(
    routes.filter((r) => r.template === 'case-study').map((r) => r.path),
  );
  for (const link of links) {
    assert.ok(
      registeredCaseStudyPaths.has(link),
      `project-card link "${link}" does not match a registered case-study route`,
    );
  }
  const rawLinks = workContent.projects.items.map((item) => item.link);
  assert.deepEqual(new Set(rawLinks), registeredCaseStudyPaths);
});

// PF-060/PF-061: FES Challenger's and Business Workflow System's cards now
// carry their own category/summary/tags, each sourced from that project's
// own `card` export (see tests/fes-challenger-render.test.mjs's and
// tests/business-workflow-system-render.test.mjs's consistency checks), so
// neither is the "no category" specimen anymore. eBarangay remains the
// only card with none (PF-062 still blocked/untouched).
test('work: the visible FES card retains its approved category', () => {
  const main = workMain();
  const blocks = cardBlocks(main);
  assert.match(
    blocks[0],
    /<span class="project-card__category tag">Marine Services Corporate Website<\/span>/,
  );
});

test('work: the visible FES card retains its approved summary and tags', () => {
  const main = workMain();
  const blocks = cardBlocks(main);
  assert.match(blocks[0], /project-card__summary/);
  assert.match(blocks[0], /project-card__tags/);
});

// PF-061 — the prohibited-wording guard also applies to the Work index's
// rendered output, since Business Workflow System's card is composed here.
test('work: no prohibited identifying wording appears anywhere in the rendered Work index', () => {
  const main = workMain();
  for (const pattern of [
    /\bgovernment\b/i,
    /\bagenc(?:y|ies)\b/i,
    /\baccreditation\b/i,
    /\bregional\b/i,
    /\bcontract\b/i,
    /\bdepartment\b/i,
    /\bsector\b/i,
    /\bindustry\b/i,
    /\bprogram\b/i,
    /\boffice\b/i,
    /\blocation\b/i,
  ]) {
    assert.doesNotMatch(
      main,
      pattern,
      `prohibited term ${pattern} found in the rendered Work index`,
    );
  }
});

test('work: FES renders the three-slide carousel and no decorative frame dots', () => {
  const main = workMain();
  const blocks = cardBlocks(main);
  assert.doesNotMatch(blocks[0], /project-card__frame-dots/);
  assert.equal(
    [...blocks[0].matchAll(/data-project-carousel-slide/g)].length,
    3,
  );
  assert.equal(
    [...blocks[0].matchAll(/data-project-carousel-indicator="\d"/g)].length,
    3,
  );
});

test('work: exactly one closing CTA panel with one interactive element', () => {
  const main = workMain();
  expectCtaPanels(main, { count: 1, actionClass: 'btn btn--primary' });
});

test('work: every href is a safe internal path', () => {
  const main = workMain();
  const hrefs = [...main.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  assert.ok(
    hrefs.length > 0,
    'expected at least one href in the rendered output',
  );
  for (const href of hrefs) {
    assert.ok(href.startsWith('/'), `unsafe href found: "${href}"`);
    assert.ok(
      !href.startsWith('//'),
      `protocol-relative href found: "${href}"`,
    );
  }
});

test('production work content matches the schema-required shape used above (sanity check)', () => {
  assert.equal(workContent.projects.items.length, 3);
  const featuredCount = workContent.projects.items.filter(
    (item) => item.featured === true,
  ).length;
  assert.equal(featuredCount, 1);
});

test('renderWorkPage escapes every string field, including every project-card fact', () => {
  const hostileContent = {
    title: 'Work',
    description: 'D',
    heading: '<b>Bold</b> & Heading',
    paragraphs: ['P & <script>alert(1)</script>'],
    projects: {
      eyebrow: 'Eyebrow & <b>markup</b>',
      heading: 'Projects & <b>markup</b>',
      items: [
        {
          featured: true,
          isVisible: true,
          heading: 'One & <b>markup</b>',
          category: 'Cat & <b>egory</b>',
          link: '/work/one/',
          presentation: { kind: 'text-only' },
        },
        {
          isVisible: false,
          heading: 'Two & <b>markup</b>',
          link: '/work/two/',
          presentation: { kind: 'text-only' },
        },
      ],
    },
    cta: {
      heading: 'Closing & <b>markup</b>',
      body: 'Body & <b>markup</b>',
      action: { label: "Let's Discuss & <b>markup</b>", path: '/contact/' },
    },
  };

  const { main } = renderWorkPage({
    content: hostileContent,
    navItems: primaryNav,
    activeKey: 'work',
    site,
  });

  assert.doesNotMatch(main, /<script>/, 'no raw <script> tag should survive');
  assert.match(main, /&lt;b&gt;Bold&lt;\/b&gt; &amp; Heading/);
  assert.match(main, /P &amp; &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(main, /Projects &amp; &lt;b&gt;markup&lt;\/b&gt;/);
  assert.match(main, /One &amp; &lt;b&gt;markup&lt;\/b&gt;/);
  assert.match(main, /Cat &amp; &lt;b&gt;egory&lt;\/b&gt;/);
  assert.match(main, /Closing &amp; &lt;b&gt;markup&lt;\/b&gt;/);
  assert.match(main, /Let&#39;s Discuss &amp; &lt;b&gt;markup&lt;\/b&gt;/);
});
