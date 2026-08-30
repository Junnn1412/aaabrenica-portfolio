// PF-061 — real end-to-end assertions against the Business Workflow System
// route's actual rendered output and content module, mirroring
// tests/fes-challenger-render.test.mjs's structure for its second real
// case-study caller. This project is fully anonymized (no logo, no
// gallery, no external link) — see docs/CONTENT_INVENTORY.md for the full
// approved-fact/redaction record.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/pages/render.js';
import { routes } from '../src/config/routes.js';
import bwsContent from '../src/content/pages/work/business-workflow-system.js';
import homeContent from '../src/content/pages/home.js';
import workContent from '../src/content/pages/work/index.js';
import { expectCtaPanels } from './helpers/component-markup.mjs';

function bwsMain() {
  const route = routes.find((r) => r.key === 'work-business-workflow-system');
  return renderRoute(route).main;
}

test('Business Workflow System: exactly one <h1>, 7 curated section headings, and the closing CTA as <h2>, never <h3>', () => {
  const main = bwsMain();
  assert.equal([...main.matchAll(/<h1[ >]/g)].length, 1);
  const sectionH2s = [
    ...main.matchAll(/<h2 class="section-header__heading">([^<]*)<\/h2>/g),
  ].map((m) => m[1]);
  assert.deepEqual(sectionH2s, [
    'Client &amp; Business Context',
    'The Challenge',
    'My Role',
    'What I Built',
    'Key Decisions',
    'Technology Stack',
    'Outcomes',
  ]);
  assert.equal(
    [...main.matchAll(/<h2 class="cta__heading">/g)].length,
    1,
    'expected the closing CTA to render as <h2>',
  );
  assert.equal([...main.matchAll(/<h3 class="cta__heading">/g)].length, 0);
});

// No approved asset/URL exists — all three must render as a clean, honest
// absence, never a placeholder or empty frame.
test('Business Workflow System: no gallery, no logo, and no external link render (none approved)', () => {
  const main = bwsMain();
  assert.doesNotMatch(main, /Project Gallery/);
  assert.doesNotMatch(main, /case-study-gallery/);
  assert.doesNotMatch(main, /case-study-hero__logo/);
  assert.doesNotMatch(main, /coming soon/i);
  const externalHrefs = [...main.matchAll(/href="([^"]*)"/g)]
    .map((m) => m[1])
    .filter((href) => !href.startsWith('/') && !href.startsWith('mailto:'));
  assert.deepEqual(
    externalHrefs,
    [],
    'expected zero external links in main content — no public URL is approved',
  );
});

test('Business Workflow System: back-to-Work link and closing CTA are present', () => {
  const main = bwsMain();
  assert.match(main, /class="action-link action-link--back" href="\/work\/"/);
  expectCtaPanels(main, { count: 1, actionClass: 'btn btn--primary' });
});

test('Business Workflow System: no numeric or business-performance claim appears anywhere', () => {
  const main = bwsMain();
  for (const forbidden of ['%', 'revenue', 'leads', 'traffic', 'ranking']) {
    assert.doesNotMatch(
      main,
      new RegExp(forbidden, 'i'),
      `unexpected "${forbidden}" found in the rendered case study`,
    );
  }
});

// PF-061 — the explicit anonymization guard AAA required: none of these
// identifying/prohibited terms may appear anywhere in the real rendered
// output, the content module itself (catches fields not yet rendered too),
// or the Home/Work card fields this project's `card` export feeds.
const PROHIBITED_TERMS = [
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
];

test('Business Workflow System: no prohibited identifying wording appears anywhere in the rendered output, content module, or Home/Work card fields', () => {
  const main = bwsMain();
  const contentJson = JSON.stringify(bwsContent);
  const homeItem = homeContent.projects.items.find(
    (item) => item.heading === 'Business Workflow System',
  );
  const workItem = workContent.projects.items.find(
    (item) => item.heading === 'Business Workflow System',
  );
  const cardJson = JSON.stringify([homeItem, workItem]);

  for (const pattern of PROHIBITED_TERMS) {
    assert.doesNotMatch(
      main,
      pattern,
      `prohibited term ${pattern} found in the rendered case-study output`,
    );
    assert.doesNotMatch(
      contentJson,
      pattern,
      `prohibited term ${pattern} found in the content module`,
    );
    assert.doesNotMatch(
      cardJson,
      pattern,
      `prohibited term ${pattern} found in the Home/Work card fields`,
    );
  }
});

test("Home and Work Business Workflow System project cards reuse business-workflow-system.js's own card export, not a second independently-typed copy", () => {
  const homeItem = homeContent.projects.items.find(
    (item) => item.heading === 'Business Workflow System',
  );
  const workItem = workContent.projects.items.find(
    (item) => item.heading === 'Business Workflow System',
  );
  for (const item of [homeItem, workItem]) {
    assert.equal(item.category, bwsContent.card.category);
    assert.equal(item.summary, bwsContent.card.summary);
    assert.deepEqual(item.tags, bwsContent.card.tags);
    assert.strictEqual(item.presentation, bwsContent.card.presentation);
  }
  assert.deepEqual(bwsContent.card.presentation, { kind: 'text-only' });
});
