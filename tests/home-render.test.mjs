// PF-041 — asserts the real renderer output (not the showcase) against the
// same shared structural helpers tests/*-layout.test.mjs already use
// against dev/design-system/index.html — see
// tests/helpers/component-markup.mjs and docs/DECISION_LOG.md's PF-041
// entry for why. Also covers what only real rendered output can: escapeHtml
// applied to every string field, and optional-field omission behavior.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/pages/render.js';
import { routes } from '../src/config/routes.js';
import { renderCapabilityCards } from '../src/components/capability-card.js';
import { renderProjectCards } from '../src/components/project-card.js';
import { renderProcessSteps } from '../src/components/process-steps.js';
import { renderTrustList } from '../src/components/trust-list.js';
import { renderEngagementOptions } from '../src/components/engagement-options.js';
import { renderCta } from '../src/components/cta.js';
import {
  expectSingleList,
  expectItemsHaveListParent,
  expectLinkPairing,
  expectDecorativeIcons,
  expectAriaHiddenBadges,
  expectSingleSectionAction,
  expectNoClass,
  expectNoInteractiveChildren,
  expectCtaPanels,
} from './helpers/component-markup.mjs';

function homeMain() {
  const route = routes.find((r) => r.key === 'home');
  return renderRoute(route).main;
}

// Several sections share the same wrapping <section class="home-section">
// class, so helpers that count "every <a>"/"every <svg>" in the given HTML
// (expectSingleSectionAction, expectDecorativeIcons) need to be scoped to
// just one section's own markup, not the whole page — this isolates the
// <section class="home-section">...</section> that contains `innerMarker`.
function extractSection(main, innerMarker) {
  const markerIndex = main.indexOf(innerMarker);
  assert.ok(markerIndex >= 0, `marker "${innerMarker}" not found in main`);
  const sectionStart = main.lastIndexOf(
    '<section class="home-section">',
    markerIndex,
  );
  assert.ok(
    sectionStart >= 0,
    'containing <section class="home-section"> not found',
  );
  const closeTag = '</section>';
  const sectionEnd = main.indexOf(closeTag, markerIndex) + closeTag.length;
  return main.slice(sectionStart, sectionEnd);
}

// --- Real content, end-to-end, against the same shared contract the
// showcase tests use -----------------------------------------------------

test('home: capability cards satisfy the shared list/pairing contract with all 6 real items', () => {
  const main = homeMain();
  expectSingleList(main, {
    listTag: 'ul',
    listClass: 'capability-cards',
    itemClass: 'capability-card',
    count: 6,
  });
  expectLinkPairing(main, {
    cardClass: 'capability-card',
    linkClass: 'capability-card__link',
    pairedClass: 'capability-card__arrow',
  });
});

test('home: project cards satisfy the shared list/pairing contract with all 3 real items, exactly one featured', () => {
  const main = homeMain();
  expectItemsHaveListParent(main, {
    listTag: 'ul',
    listClass: 'project-cards',
    itemClass: 'project-card',
  });
  expectLinkPairing(main, {
    cardClass: 'project-card',
    linkClass: 'project-card__link',
    pairedClass: 'project-card__action',
  });
  const featuredCount = [
    ...main.matchAll(/<li class="project-card project-card--featured">/g),
  ].length;
  assert.equal(featuredCount, 1, 'expected exactly one featured project card');
  // PF-033 clean-empty-frame precedent: no real card gets a fabricated
  // decorative composition standing in for a screenshot.
  const emptyFrames = [
    ...main.matchAll(/<div class="media-frame project-card__media"><\/div>/g),
  ].length;
  assert.equal(
    emptyFrames,
    3,
    'expected all 3 real project cards to use an empty .media-frame',
  );
  // FES Challenger and eBarangay have no approved category phrase; only
  // Business Workflow System does (PF-033 precedent).
  const categoryCount = [
    ...main.matchAll(/class="project-card__category tag"/g),
  ].length;
  assert.equal(
    categoryCount,
    1,
    'expected exactly one project card with a category tag',
  );
});

// PF-041 visual-review defect fix (docs/DECISION_LOG.md): the real
// homepage has exactly 1 featured + 2 secondary projects — precisely the
// shape that used to leave an empty third grid track at 1440/1920px.
test('home: the real project-cards list carries the .project-cards--featured-pair modifier', () => {
  const main = homeMain();
  assert.match(
    main,
    /<ul class="project-cards project-cards--featured-pair">/,
    'expected the real 1-featured+2-secondary project list to opt into the fixed 2-column modifier',
  );
});

test('home: process steps satisfy the shared list/action/badge contract', () => {
  const main = homeMain();
  const section = extractSection(main, '<ol class="process-steps">');
  const list = expectSingleList(section, {
    listTag: 'ol',
    listClass: 'process-steps',
    itemClass: 'process-steps__step',
    count: 4,
  });
  expectAriaHiddenBadges(section, {
    badgeClass: 'process-steps__number',
    count: 4,
  });
  expectSingleSectionAction(section, {
    listHtml: list,
    actionClass: 'process-steps__action',
    linkHref: '/process/',
    linkText: 'See the Full Process',
  });
});

test('home: trust list satisfies the shared list/action/icon contract', () => {
  const main = homeMain();
  const section = extractSection(main, '<ul class="trust-list">');
  const list = expectSingleList(section, {
    listTag: 'ul',
    listClass: 'trust-list',
    itemClass: 'trust-list__item',
    count: 3,
  });
  expectDecorativeIcons(section, { count: 3 });
  expectSingleSectionAction(section, {
    listHtml: list,
    actionClass: 'trust-list__action',
    linkHref: '/about/',
    linkText: 'Learn About My Approach',
  });
});

test('home: engagement options satisfy the shared list/non-interactive contract', () => {
  const main = homeMain();
  expectSingleList(main, {
    listTag: 'ul',
    listClass: 'engagement-options',
    itemClass: 'engagement-options__item',
    count: 4,
  });
  expectNoClass(
    main.match(/<ul class="engagement-options">[\s\S]*?<\/ul>/)[0],
    'tag',
  );
  expectNoInteractiveChildren(main, { itemClass: 'engagement-options__item' });
});

test('home: exactly one CTA panel with one interactive element', () => {
  const main = homeMain();
  expectCtaPanels(main, { count: 1, actionClass: 'btn btn--primary' });
});

test('home: exactly one <h1> and every section heading is a real <h2>', () => {
  const main = homeMain();
  const h1s = [...main.matchAll(/<h1[ >]/g)].length;
  assert.equal(h1s, 1, 'expected exactly one <h1> (the hero heading)');
  const h2s = [...main.matchAll(/<h2 class="section-header__heading">/g)]
    .length;
  // trust, problems, capabilities, projects, process, engagement, about = 7
  assert.equal(h2s, 7, 'expected 7 section-header headings');
});

// --- Individual renderer units: escaping and optional-field behavior ----

test('renderCapabilityCards escapes every string field and omits the icon/arrow when absent', () => {
  const html = renderCapabilityCards([
    {
      accent: 'lime',
      icon: 'boxes',
      heading: '<b>Bold</b> & Title',
      description: 'A "quoted" & <script>alert(1)</script> description.',
      link: '/solutions/',
    },
    {
      accent: 'amber',
      heading: 'No icon, no link',
      description: 'Plain.',
    },
  ]);
  assert.doesNotMatch(
    html,
    /<script>/,
    'description must be escaped, not raw HTML',
  );
  assert.match(html, /&lt;b&gt;Bold&lt;\/b&gt; &amp; Title/);
  assert.match(html, /&quot;quoted&quot;/);
  // second card: no link means plain text heading, no __link, no __arrow
  assert.doesNotMatch(html, /No icon, no link<\/a>/);
  const secondCard = html.split('capability-card--amber')[1];
  assert.doesNotMatch(secondCard, /capability-card__link/);
  assert.doesNotMatch(secondCard, /capability-card__arrow/);
  assert.doesNotMatch(secondCard, /capability-card__icon/);
});

test('renderProjectCards omits category/summary/tags/action when absent, and escapes tag/summary text', () => {
  const html = renderProjectCards([
    { heading: 'No link project' },
    {
      heading: 'Full project',
      category: 'Cat <b>egory</b>',
      summary: 'A summary with <i>markup</i>.',
      tags: ['<Tag>'],
      link: '/work/example/',
    },
  ]);
  const noLinkCard = html.split('</li>')[0];
  assert.doesNotMatch(noLinkCard, /project-card__action/);
  assert.doesNotMatch(noLinkCard, /project-card__category/);
  assert.doesNotMatch(noLinkCard, /project-card__summary/);
  assert.doesNotMatch(noLinkCard, /project-card__tags/);

  assert.match(html, /Cat &lt;b&gt;egory&lt;\/b&gt;/);
  assert.match(html, /A summary with &lt;i&gt;markup&lt;\/i&gt;\./);
  assert.match(html, /&lt;Tag&gt;/);
  assert.match(html, /View Case Study/);
});

// PF-041 visual-review defect fix: renderProjectCards() decides whether to
// apply .project-cards--featured-pair from the real item composition, not
// a page-specific flag — only exactly one featured item plus exactly two
// non-featured items should opt in. A different shape (more secondary
// cards, or no featured card at all) keeps the default auto-fit grid,
// which already handles those cases correctly.
test('renderProjectCards applies .project-cards--featured-pair only for exactly one featured + two secondary items', () => {
  const onePlusTwo = renderProjectCards([
    { featured: true, heading: 'A', link: '/a/' },
    { heading: 'B', link: '/b/' },
    { heading: 'C', link: '/c/' },
  ]);
  assert.match(
    onePlusTwo,
    /^<ul class="project-cards project-cards--featured-pair">/,
  );

  const onePlusThree = renderProjectCards([
    { featured: true, heading: 'A', link: '/a/' },
    { heading: 'B', link: '/b/' },
    { heading: 'C', link: '/c/' },
    { heading: 'D', link: '/d/' },
  ]);
  assert.match(onePlusThree, /^<ul class="project-cards">/);
  assert.doesNotMatch(onePlusThree, /project-cards--featured-pair/);

  const noFeatured = renderProjectCards([
    { heading: 'A', link: '/a/' },
    { heading: 'B', link: '/b/' },
  ]);
  assert.match(noFeatured, /^<ul class="project-cards">/);
  assert.doesNotMatch(noFeatured, /project-cards--featured-pair/);

  const twoFeatured = renderProjectCards([
    { featured: true, heading: 'A', link: '/a/' },
    { featured: true, heading: 'B', link: '/b/' },
    { heading: 'C', link: '/c/' },
  ]);
  assert.doesNotMatch(twoFeatured, /project-cards--featured-pair/);
});

test('renderTrustList and renderProcessSteps escape link labels/paths', () => {
  const trustHtml = renderTrustList(
    [{ icon: 'handshake', heading: 'A "trusted" <b>thing</b>' }],
    { label: 'Go & Learn', path: '/about/?x="y"' },
  );
  assert.match(trustHtml, /A &quot;trusted&quot; &lt;b&gt;thing&lt;\/b&gt;/);
  assert.match(trustHtml, /Go &amp; Learn/);
  assert.match(trustHtml, /&quot;y&quot;/);

  const processHtml = renderProcessSteps([{ heading: 'Step & <one>' }], {
    label: 'Next',
    path: '/process/',
  });
  assert.match(processHtml, /Step &amp; &lt;one&gt;/);
});

test('renderCta omits .cta__body entirely when body is absent, not empty', () => {
  const withBody = renderCta({
    heading: 'H',
    body: 'B',
    action: { label: 'Go', path: '/contact/' },
  });
  assert.match(withBody, /class="cta__body"/);

  const withoutBody = renderCta({
    heading: 'H',
    action: { label: 'Go', path: '/contact/' },
  });
  assert.doesNotMatch(withoutBody, /class="cta__body"/);
});

test('renderEngagementOptions escapes labels and never emits .tag', () => {
  const html = renderEngagementOptions(['Fixed <scope>', 'A & B']);
  assert.match(html, /Fixed &lt;scope&gt;/);
  assert.match(html, /A &amp; B/);
  expectNoClass(html, 'tag');
});
