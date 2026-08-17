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
