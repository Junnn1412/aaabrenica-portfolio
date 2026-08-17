// PF-052 — direct unit coverage of renderProjectCard()/renderProjectCards()'s
// new optional headingLevel parameter, mirroring tests/cta-render.test.mjs's
// structure exactly. Previously the component was only exercised indirectly
// through page-level renderers (tests/home-render.test.mjs). Those files'
// default-call assertions require no changes — proof every prior caller
// keeps its default, unchanged behavior.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderProjectCards } from '../src/components/project-card.js';

function items() {
  return [{ heading: 'A Project', link: '/work/a-project/' }];
}

test('renderProjectCards renders <h4 class="project-card__heading"> by default when headingLevel is omitted', () => {
  const html = renderProjectCards(items());
  assert.match(html, /<h4 class="project-card__heading">/);
  assert.doesNotMatch(html, /<h3 class="project-card__heading">/);
});

test('renderProjectCards renders <h3 class="project-card__heading"> when headingLevel: 3 is requested', () => {
  const html = renderProjectCards(items(), 3);
  assert.match(html, /<h3 class="project-card__heading">/);
  assert.doesNotMatch(html, /<h4 class="project-card__heading">/);
});

test('renderProjectCards throws for headingLevel: 5 (outside the approved set)', () => {
  assert.throws(() => renderProjectCards(items(), 5), /headingLevel/);
});

test('renderProjectCards throws for headingLevel: 2 (proves the Set genuinely excludes values, not just out-of-range-high ones)', () => {
  assert.throws(() => renderProjectCards(items(), 2), /headingLevel/);
});

test('renderProjectCards throws for a hostile/unsupported headingLevel string and never returns hostile HTML', () => {
  let result;
  assert.throws(() => {
    result = renderProjectCards(items(), '<script>alert(1)</script>');
  }, /headingLevel/);
  assert.equal(
    result,
    undefined,
    'renderProjectCards must not return any HTML when headingLevel is rejected',
  );
});
