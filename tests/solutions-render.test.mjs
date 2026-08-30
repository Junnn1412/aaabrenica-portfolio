// PF-050 — end-to-end structural assertions against the real 'solutions'
// route's rendered output, mirroring tests/home-render.test.mjs's style:
// asserts real renderer output against the shared structural-contract
// helpers in tests/helpers/component-markup.mjs, plus this page's own
// jump-nav/anchor/evidence-omission contract.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/pages/render.js';
import { renderSolutionsPage } from '../src/pages/templates/solutions.js';
import { routes } from '../src/config/routes.js';
import solutionsContent from '../src/content/pages/solutions.js';
import { primaryNav } from '../src/config/navigation.js';
import { site } from '../src/config/site.js';
import {
  expectDecorativeIcons,
  expectCtaPanels,
} from './helpers/component-markup.mjs';

function solutionsMain() {
  const route = routes.find((r) => r.key === 'solutions');
  return renderRoute(route).main;
}

function extractSectionById(main, id) {
  const re = new RegExp(
    `<section id="${id}" class="page-section solution-section"(?: [^>]*)?>[\\s\\S]*?<\\/section>`,
  );
  const match = main.match(re);
  assert.ok(match, `section id="${id}" not found`);
  return match[0];
}

test('solutions: exactly one <h1>, exactly 6 section <h2>s, exactly 1 closing-CTA <h3>', () => {
  const main = solutionsMain();
  const h1s = [...main.matchAll(/<h1[ >]/g)].length;
  assert.equal(h1s, 1, 'expected exactly one <h1>');
  const h2s = [...main.matchAll(/<h2 class="section-header__heading">/g)]
    .length;
  assert.equal(h2s, 6, 'expected 6 section-header headings, one per section');
  const h3s = [...main.matchAll(/<h3 class="cta__heading">/g)].length;
  assert.equal(h3s, 1, 'expected exactly one closing-CTA heading');
});

test('solutions: jump nav has exactly 6 links, set-equal to the 6 section ids on the page', () => {
  const main = solutionsMain();
  const navMatch = main.match(
    /<nav class="solutions-jump-nav" aria-label="Solutions sections">[\s\S]*?<\/nav>/,
  );
  assert.ok(navMatch, 'expected a <nav aria-label="Solutions sections">');
  const nav = navMatch[0];

  const hrefs = [
    ...nav.matchAll(/<a class="solutions-jump-nav__link" href="#([^"]+)">/g),
  ].map((m) => m[1]);
  assert.equal(hrefs.length, 6, 'expected exactly 6 jump-nav links');

  const sectionIds = [
    ...main.matchAll(
      /<section id="([^"]+)" class="page-section solution-section"(?: [^>]*)?>/g,
    ),
  ].map((m) => m[1]);
  assert.equal(sectionIds.length, 6, 'expected exactly 6 anchored sections');
  assert.equal(
    new Set(sectionIds).size,
    6,
    'expected all 6 section ids to be unique',
  );

  assert.deepEqual(
    new Set(hrefs),
    new Set(sectionIds),
    'expected the jump-nav hrefs to be set-equal to the real section ids',
  );
});

// PF-064 — Corporate Websites and WordPress Development gained evidence
// links to the now-complete FES Challenger case study, alongside Workflow &
// Process Solutions' existing link to Business Workflow System. Custom
// Business Systems, Existing-System Improvements, and Support & Maintenance
// still have no matching case study and must keep omitting the element
// entirely, not render it empty.
test('solutions: exactly 3 evidence links, each in its matching section, pointing at the right case study', () => {
  const main = solutionsMain();
  const evidenceLinks = [
    ...main.matchAll(/<p class="solution-section__evidence">/g),
  ].length;
  assert.equal(
    evidenceLinks,
    3,
    'expected exactly 3 evidence elements sitewide — the other 3 sections must omit it entirely, not render it empty',
  );

  const workflowSection = extractSectionById(
    main,
    'workflow-process-solutions',
  );
  assert.match(
    workflowSection,
    /<p class="solution-section__evidence"><a class="action-link action-link--forward" href="\/work\/business-workflow-system\/">[\s\S]*?<span class="action-link__label">Related project: Business Workflow System<\/span>[\s\S]*?<\/a><\/p>/,
  );

  const corporateSection = extractSectionById(main, 'corporate-websites');
  assert.match(
    corporateSection,
    /<p class="solution-section__evidence"><a class="action-link action-link--forward" href="\/work\/fes-challenger\/">[\s\S]*?<span class="action-link__label">Related project: FES Challenger<\/span>[\s\S]*?<\/a><\/p>/,
  );

  const wordpressSection = extractSectionById(main, 'wordpress-development');
  assert.match(
    wordpressSection,
    /<p class="solution-section__evidence"><a class="action-link action-link--forward" href="\/work\/fes-challenger\/">[\s\S]*?<span class="action-link__label">Related project: FES Challenger<\/span>[\s\S]*?<\/a><\/p>/,
  );

  for (const id of [
    'custom-business-systems',
    'existing-system-improvements',
    'support-maintenance',
  ]) {
    assert.doesNotMatch(
      extractSectionById(main, id),
      /solution-section__evidence/,
      `expected section "${id}" to omit the evidence element entirely`,
    );
  }
});

test("solutions: exactly 6 per-section action links, each matching the content module's own cta label/path", () => {
  const main = solutionsMain();
  const actions = [...main.matchAll(/<p class="solution-section__action">/g)]
    .length;
  assert.equal(actions, 6, 'expected exactly one action link per section');

  for (const section of solutionsContent.sections) {
    const sectionHtml = extractSectionById(main, section.id);
    assert.match(
      sectionHtml,
      new RegExp(
        `<p class="solution-section__action"><a class="action-link action-link--forward" href="${section.cta.path}">[\\s\\S]*?<span class="action-link__label">${section.cta.label}<\\/span>[\\s\\S]*?<\\/a><\\/p>`,
      ),
      `expected section "${section.id}" to carry its own cta action link`,
    );
  }
});

test('solutions: exactly 6 decorative section icons', () => {
  const main = solutionsMain();
  const icons = [
    ...main.matchAll(
      /<span class="solution-section__icon[^"]*">([\s\S]*?)<\/span>/g,
    ),
  ]
    .map((m) => m[1])
    .join('');
  expectDecorativeIcons(icons, { count: 6 });
});

test('solutions: each detail list preserves left Problem/Audience then right Build/Benefit DOM grouping', () => {
  const main = solutionsMain();
  for (const section of solutionsContent.sections) {
    const html = extractSectionById(main, section.id);
    const detail = html.match(
      /<dl class="solution-section__detail">([\s\S]*?)<\/dl>/,
    )?.[1];
    assert.ok(detail);
    assert.equal(
      [...detail.matchAll(/<div class="solution-section__column">/g)].length,
      2,
    );
    const labels = [
      ...detail.matchAll(/<dt class="solution-section__label">([^<]+)<\/dt>/g),
    ].map((match) => match[1]);
    assert.deepEqual(labels, [
      'The Problem',
      "Who It's For",
      'What I Can Build',
      'Expected Benefit',
    ]);
  }
});

test('solutions: absent evidence creates no empty element or layout track', () => {
  const main = solutionsMain();
  for (const id of [
    'custom-business-systems',
    'existing-system-improvements',
    'support-maintenance',
  ]) {
    const html = extractSectionById(main, id);
    const links = html.match(
      /<div class="solution-section__links">([\s\S]*?)<\/div>/,
    )?.[1];
    assert.ok(links);
    assert.doesNotMatch(links, /solution-section__evidence/);
    assert.equal([...links.matchAll(/solution-section__action/g)].length, 1);
  }
});

test('solutions: exactly one closing CTA panel with one interactive element', () => {
  const main = solutionsMain();
  expectCtaPanels(main, { count: 1, actionClass: 'btn btn--primary' });
});

test('solutions: every href is a safe internal path or a same-page fragment', () => {
  const main = solutionsMain();
  const hrefs = [...main.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  assert.ok(
    hrefs.length > 0,
    'expected at least one href in the rendered output',
  );
  for (const href of hrefs) {
    assert.ok(
      href.startsWith('/') || href.startsWith('#'),
      `unsafe href found: "${href}"`,
    );
    assert.ok(
      !href.startsWith('//'),
      `protocol-relative href found: "${href}"`,
    );
  }
});

test('solutions: "technologies" never appears anywhere in the rendered output (approved V1 omission, not a leftover empty field)', () => {
  const main = solutionsMain();
  assert.doesNotMatch(main, /technologies/i);
});

test('renderSolutionsPage escapes every string field in a section', () => {
  const hostileContent = {
    title: 'Solutions',
    description: 'D',
    heading: 'H',
    paragraphs: ['P'],
    sections: [
      {
        id: 'custom-business-systems',
        icon: 'boxes',
        accent: 'lime',
        heading: '<b>Bold</b> & Heading',
        problem: 'Problem & <script>alert(1)</script>',
        audience: 'Audience "quoted" & <i>markup</i>',
        build: 'Build & <b>markup</b>',
        benefit: 'Benefit & <b>markup</b>',
        evidence: { label: 'Evidence & <b>markup</b>', path: '/work/x/' },
        cta: { label: 'CTA & <b>markup</b>', path: '/contact/' },
      },
    ],
    cta: {
      heading: 'Closing & <b>markup</b>',
      body: 'Body & <b>markup</b>',
      action: { label: "Let's Discuss", path: '/contact/' },
    },
  };

  const { main } = renderSolutionsPage({
    content: hostileContent,
    navItems: primaryNav,
    activeKey: 'solutions',
    site,
  });

  assert.doesNotMatch(main, /<script>/, 'no raw <script> tag should survive');
  assert.match(main, /&lt;b&gt;Bold&lt;\/b&gt; &amp; Heading/);
  assert.match(main, /Problem &amp; &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(
    main,
    /Audience &quot;quoted&quot; &amp; &lt;i&gt;markup&lt;\/i&gt;/,
  );
  assert.match(main, /Build &amp; &lt;b&gt;markup&lt;\/b&gt;/);
  assert.match(main, /Benefit &amp; &lt;b&gt;markup&lt;\/b&gt;/);
  assert.match(main, /Evidence &amp; &lt;b&gt;markup&lt;\/b&gt;/);
  assert.match(main, /CTA &amp; &lt;b&gt;markup&lt;\/b&gt;/);
  assert.match(main, /Closing &amp; &lt;b&gt;markup&lt;\/b&gt;/);
  assert.match(main, /Body &amp; &lt;b&gt;markup&lt;\/b&gt;/);
});
