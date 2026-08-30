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
import homeContent from '../src/content/pages/home.js';
import solutionsContent from '../src/content/pages/solutions.js';
import { renderCapabilityCards } from '../src/components/capability-card.js';
import { renderProjectCards } from '../src/components/project-card.js';
import { renderProcessSteps } from '../src/components/process-steps.js';
import { renderTrustList } from '../src/components/trust-list.js';
import { renderEngagementOptions } from '../src/components/engagement-options.js';
import { renderCta } from '../src/components/cta.js';
import { escapeHtml } from '../src/pages/escape.js';
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

// Several sections share the same wrapping <section class="page-section">
// class, so helpers that count "every <a>"/"every <svg>" in the given HTML
// (expectSingleSectionAction, expectDecorativeIcons) need to be scoped to
// just one section's own markup, not the whole page — this isolates the
// <section class="page-section">...</section> that contains `innerMarker`.
function extractSection(main, innerMarker) {
  const markerIndex = main.indexOf(innerMarker);
  assert.ok(markerIndex >= 0, `marker "${innerMarker}" not found in main`);
  const sectionStart = main.lastIndexOf(
    '<section class="page-section">',
    markerIndex,
  );
  assert.ok(
    sectionStart >= 0,
    'containing <section class="page-section"> not found',
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
  // PF-052 accessibility correction: capability cards sit directly under
  // this section's own <h2>, so their headings must be <h3>, not the
  // component's prior unconditional <h4>.
  assert.equal(
    [...main.matchAll(/<h3 class="capability-card__heading">/g)].length,
    6,
    'expected 6 capability-card <h3>s',
  );
  assert.equal(
    [...main.matchAll(/<h4 class="capability-card__heading">/g)].length,
    0,
    'expected zero capability-card <h4>s',
  );
});

test('home: only the visible FES project enters the shared card list and accessibility tree', () => {
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
  const cards = [
    ...main.matchAll(/<li class="project-card[^"]*">[\s\S]*?<\/li>/g),
  ].map((match) => match[0]);
  assert.equal(cards.length, 1);
  assert.match(cards[0], />FES Challenger</);
  assert.match(cards[0], /data-project-carousel/);
  assert.doesNotMatch(main, /Business Workflow System|eBarangay/);
  assert.doesNotMatch(main, /<li class="project-card[^>]*hidden/);
  const categoryCount = [
    ...main.matchAll(/class="project-card__category tag"/g),
  ].length;
  assert.equal(categoryCount, 1, 'expected only the visible FES category tag');
  assert.equal(
    [...main.matchAll(/class="project-card__summary"/g)].length,
    1,
    'expected only the visible FES summary',
  );
  assert.equal(
    [...main.matchAll(/class="project-card__tags"/g)].length,
    1,
    'expected only the visible FES tags',
  );
  // PF-052 accessibility correction: project cards sit directly under this
  // section's own <h2>, so their headings must be <h3>, not the
  // component's prior unconditional <h4>.
  assert.equal(
    [...main.matchAll(/<h3 class="project-card__heading">/g)].length,
    1,
    'expected 1 visible project-card <h3>',
  );
  assert.equal(
    [...main.matchAll(/<h4 class="project-card__heading">/g)].length,
    0,
    'expected zero project-card <h4>s',
  );
});

// PF-061 — the prohibited-wording guard also applies to the homepage's
// rendered output, since Business Workflow System's card is composed here.
test('home: no prohibited identifying wording appears anywhere in the rendered homepage', () => {
  const main = homeMain();
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
      `prohibited term ${pattern} found in the rendered homepage`,
    );
  }
});

// PF-041 visual-review defect fix (docs/DECISION_LOG.md): the real
// homepage has exactly 1 featured + 2 secondary projects — precisely the
// shape that used to leave an empty third grid track at 1440/1920px.
test('home: the one-card list uses the single-track modifier and not featured-pair', () => {
  const main = homeMain();
  assert.match(
    main,
    /<ul class="project-cards project-cards--single">/,
    'expected one visible project to opt into the explicit single track',
  );
  assert.doesNotMatch(main, /project-cards--featured-pair/);
});

test('home: Explore All Work remains after the cards inside the scoped gap composition', () => {
  const main = homeMain();
  assert.match(
    main,
    /<div class="home-projects__body"><ul class="project-cards project-cards--single">[\s\S]*?<\/ul><p class="home-projects__action"><a class="action-link action-link--forward" href="\/work\/">[\s\S]*?<span class="action-link__label">Explore All Work<\/span>[\s\S]*?<\/a><\/p><\/div>/,
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
    variant: 'forward',
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
  expectDecorativeIcons(section, { count: 4 });
  expectSingleSectionAction(section, {
    listHtml: list,
    actionClass: 'trust-list__action',
    linkHref: '/about/',
    linkText: 'Learn About My Approach',
    variant: 'forward',
  });
});

test('home: About keeps its exact approved copy first and renders one compact-card action second', () => {
  const main = homeMain();
  const section = extractSection(main, '<div class="home-about">');
  assert.match(section, /<span class="section-header__eyebrow">About<\/span>/);
  const escapedHeading = escapeHtml(homeContent.about.heading).replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  );
  assert.match(
    section,
    new RegExp(`<h2 class="section-header__heading">${escapedHeading}</h2>`),
  );
  for (const paragraph of homeContent.about.paragraphs) {
    assert.ok(
      section.includes(escapeHtml(paragraph)),
      'expected the exact existing About preview paragraph text to be present, unmodified',
    );
  }
  const copy = section.match(
    /<div class="home-about__copy"(?: [^>]*)?>([\s\S]*?)<\/div>/,
  )?.[1];
  assert.ok(copy, 'expected the homepage About copy column');
  assert.doesNotMatch(copy, /<a\b|href=/);

  assert.ok(
    section.indexOf('home-about__copy') <
      section.indexOf('profile-card profile-card--compact'),
    'copy column must precede compact card in DOM order',
  );
  assert.equal([...section.matchAll(/href="\/about\/"/g)].length, 1);
  assert.match(
    section,
    /<div class="profile-card profile-card--compact"(?: [^>]*)?>[\s\S]*?<a class="btn btn--primary profile-card__action" href="\/about\/">Read My Full Story<\/a>/,
  );
  assert.match(section, /<img[^>]+loading="lazy">/);
  assert.doesNotMatch(
    section,
    /profile-card__statement|profile-card__highlights/,
  );
  const compactCard = section.match(
    /<div class="profile-card profile-card--compact"(?: [^>]*)?>[\s\S]*?<\/div><\/div>/,
  )?.[0];
  assert.ok(compactCard, 'expected the complete compact profile card');
  assert.match(
    compactCard,
    /<p class="profile-card__name">Antonio Abrenica<\/p>/,
  );
  assert.match(
    compactCard,
    /<p class="profile-card__role">Full-Stack Software Developer<\/p>/,
  );
  assert.match(
    compactCard,
    /src="\/images\/profile\/aaa-portrait\.jpg"[^>]*loading="lazy"/,
  );
  assert.equal(
    [...compactCard.matchAll(/<p class="profile-card__/g)].length,
    2,
  );
  assert.doesNotMatch(
    compactCard,
    /I build practical websites|Problem-first planning|implementation through launch|Post-launch support/,
  );
  assert.equal(
    [
      ...section.matchAll(
        new RegExp(escapeHtml(homeContent.about.paragraphs[0]), 'g'),
      ),
    ].length,
    1,
    'approved homepage About paragraph must not be duplicated inside the card',
  );
});

test('home: About-owned Experience data never enters the compact preview', () => {
  const main = homeMain();
  assert.doesNotMatch(
    main,
    /about-experience|experience-timeline|experience-card|Computer Programmer II|Analyst Programmer|SolidService Electronics Corporation|Nephila Web Technology|Department of Public Works and Highways|Bank of Commerce/,
  );
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

// PF-050 — guards §9.5 ("Each card links to the relevant Solutions-page
// section") permanently: every home capability card's link must point at
// the /solutions/ anchor for the section with the matching heading, not
// just the bare /solutions/ route. Derived from both content modules, not
// hardcoded twice, so it can't silently drift if either changes.
test('home: every capability card links to its matching Solutions-page section anchor', () => {
  const idByHeading = new Map(
    solutionsContent.sections.map((section) => [section.heading, section.id]),
  );
  for (const item of homeContent.capabilities.items) {
    const expectedId = idByHeading.get(item.heading);
    assert.ok(
      expectedId,
      `no Solutions-page section found with heading "${item.heading}"`,
    );
    assert.equal(
      item.link,
      `/solutions/#${expectedId}`,
      `expected capability "${item.heading}" to link to its matching Solutions-page anchor`,
    );
  }
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
    { heading: 'No link project', presentation: { kind: 'text-only' } },
    {
      heading: 'Full project',
      category: 'Cat <b>egory</b>',
      summary: 'A summary with <i>markup</i>.',
      tags: ['<Tag>'],
      link: '/work/example/',
      presentation: { kind: 'text-only' },
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
    {
      featured: true,
      heading: 'A',
      link: '/a/',
      presentation: { kind: 'text-only' },
    },
    { heading: 'B', link: '/b/', presentation: { kind: 'text-only' } },
    { heading: 'C', link: '/c/', presentation: { kind: 'text-only' } },
  ]);
  assert.match(
    onePlusTwo,
    /^<ul class="project-cards project-cards--featured-pair">/,
  );

  const onePlusThree = renderProjectCards([
    {
      featured: true,
      heading: 'A',
      link: '/a/',
      presentation: { kind: 'text-only' },
    },
    { heading: 'B', link: '/b/', presentation: { kind: 'text-only' } },
    { heading: 'C', link: '/c/', presentation: { kind: 'text-only' } },
    { heading: 'D', link: '/d/', presentation: { kind: 'text-only' } },
  ]);
  assert.match(onePlusThree, /^<ul class="project-cards">/);
  assert.doesNotMatch(onePlusThree, /project-cards--featured-pair/);

  const noFeatured = renderProjectCards([
    { heading: 'A', link: '/a/', presentation: { kind: 'text-only' } },
    { heading: 'B', link: '/b/', presentation: { kind: 'text-only' } },
  ]);
  assert.match(noFeatured, /^<ul class="project-cards">/);
  assert.doesNotMatch(noFeatured, /project-cards--featured-pair/);

  const twoFeatured = renderProjectCards([
    {
      featured: true,
      heading: 'A',
      link: '/a/',
      presentation: { kind: 'text-only' },
    },
    {
      featured: true,
      heading: 'B',
      link: '/b/',
      presentation: { kind: 'text-only' },
    },
    { heading: 'C', link: '/c/', presentation: { kind: 'text-only' } },
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
