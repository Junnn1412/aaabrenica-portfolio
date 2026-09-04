// PF-052 — direct unit coverage of renderCapabilityCard()/renderCapabilityCards()'s
// new optional headingLevel parameter, mirroring tests/cta-render.test.mjs's
// and tests/project-card-render.test.mjs's structure exactly.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderCapabilityCards } from '../src/components/capability-card.js';

function items() {
  return [
    {
      accent: 'lime',
      icon: 'boxes',
      heading: 'A Capability',
      description: 'A description.',
    },
  ];
}

test('renderCapabilityCards renders <h4 class="capability-card__heading"> by default when headingLevel is omitted', () => {
  const html = renderCapabilityCards(items());
  assert.match(html, /<h4 class="capability-card__heading">/);
  assert.doesNotMatch(html, /<h3 class="capability-card__heading">/);
});

test('renderCapabilityCards renders <h3 class="capability-card__heading"> when headingLevel: 3 is requested', () => {
  const html = renderCapabilityCards(items(), 3);
  assert.match(html, /<h3 class="capability-card__heading">/);
  assert.doesNotMatch(html, /<h4 class="capability-card__heading">/);
});

test('renderCapabilityCards throws for headingLevel: 5 (outside the approved set)', () => {
  assert.throws(() => renderCapabilityCards(items(), 5), /headingLevel/);
});

test('renderCapabilityCards throws for headingLevel: 2 (proves the Set genuinely excludes values, not just out-of-range-high ones)', () => {
  assert.throws(() => renderCapabilityCards(items(), 2), /headingLevel/);
});

test('renderCapabilityCards throws for a hostile/unsupported headingLevel string and never returns hostile HTML', () => {
  let result;
  assert.throws(() => {
    result = renderCapabilityCards(items(), '<script>alert(1)</script>');
  }, /headingLevel/);
  assert.equal(
    result,
    undefined,
    'renderCapabilityCards must not return any HTML when headingLevel is rejected',
  );
});
