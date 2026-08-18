// PF-064 — eBarangay's route was given a neutral, fact-free holding message
// (replacing the PF-011 dev-facing placeholder), while PF-062's real
// case-study content stays deliberately deferred. This guard proves the
// rendered page never silently gains real case-study narrative — no
// client/problem/role/solution/technologyStack/decisions/outcomes section,
// no logo, no gallery, no external link — without a deliberate PF-062
// implementation going through its own review. See
// docs/CONTENT_INVENTORY.md and docs/DECISION_LOG.md's PF-064 entry.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/pages/render.js';
import { routes } from '../src/config/routes.js';
import ebarangayContent from '../src/content/pages/work/ebarangay.js';

function ebarangayMain() {
  const route = routes.find((r) => r.key === 'work-ebarangay');
  return renderRoute(route).main;
}

test('eBarangay: the holding page renders no case-study narrative sections', () => {
  const main = ebarangayMain();
  assert.equal(
    [...main.matchAll(/<h2 class="section-header__heading">/g)].length,
    0,
    'expected zero named case-study sections — eBarangay must stay a bare heading/paragraph/backLink placeholder',
  );
  assert.doesNotMatch(main, /case-study-hero__logo/);
  assert.doesNotMatch(main, /case-study-gallery/);
  assert.doesNotMatch(main, /Project Gallery/);
  assert.doesNotMatch(main, /btn--secondary/, 'expected no external link');
  assert.doesNotMatch(main, /class="cta"/, 'expected no closing CTA panel');
});

test('eBarangay: the holding copy states only development/shareability status, no project facts', () => {
  const main = ebarangayMain();
  assert.match(main, /<h1>eBarangay<\/h1>/);
  assert.match(
    main,
    /This case study is still in development and isn&#39;t ready to share yet\. In the meantime, take a look at my other projects\./,
  );
  assert.match(main, /<a href="\/work\/">Back to Work<\/a>/);
  // No status/technology/completion language that would read as a real
  // narrative claim about the project itself.
  for (const forbidden of [
    'stack',
    'built with',
    'launched',
    'completed',
    'feature',
  ]) {
    assert.doesNotMatch(
      main,
      new RegExp(forbidden, 'i'),
      `unexpected "${forbidden}" found in the eBarangay holding page`,
    );
  }
});

test("eBarangay: the content module's description states only development/shareability status", () => {
  assert.equal(
    ebarangayContent.description,
    'This case study is currently in development and will be published once it reaches a shareable stage.',
  );
  assert.doesNotMatch(ebarangayContent.description, /placeholder/i);
  assert.doesNotMatch(ebarangayContent.description, /later task/i);
});
