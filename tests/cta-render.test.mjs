// PF-051 — direct unit coverage of renderCta()'s new optional headingLevel
// parameter. Previously the component was only exercised indirectly through
// page-level renderers (tests/home-render.test.mjs, tests/solutions-render.test.mjs,
// tests/cta-section.test.mjs against the showcase). Those files' existing
// <h3 class="cta__heading"> assertions require no changes — proof that
// every prior caller keeps its default, unchanged behavior.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderCta } from '../src/components/cta.js';

function baseArgs(extra = {}) {
  return {
    heading: 'H',
    action: { label: 'Go', path: '/contact/' },
    ...extra,
  };
}

test('renderCta renders <h3 class="cta__heading"> by default when headingLevel is omitted', () => {
  const html = renderCta(baseArgs());
  assert.match(html, /<h3 class="cta__heading">H<\/h3>/);
  assert.doesNotMatch(html, /<h2 class="cta__heading">/);
});

test('renderCta renders <h2 class="cta__heading"> when headingLevel: 2 is requested', () => {
  const html = renderCta(baseArgs({ headingLevel: 2 }));
  assert.match(html, /<h2 class="cta__heading">H<\/h2>/);
  assert.doesNotMatch(html, /<h3 class="cta__heading">/);
});

test('renderCta throws for headingLevel: 4 (outside the approved set)', () => {
  assert.throws(() => renderCta(baseArgs({ headingLevel: 4 })), /headingLevel/);
});

test('renderCta throws for headingLevel: 1 (proves the Set genuinely excludes values, not just falsy ones)', () => {
  assert.throws(() => renderCta(baseArgs({ headingLevel: 1 })), /headingLevel/);
});

test('renderCta throws for a hostile/unsupported headingLevel string and never returns hostile HTML', () => {
  let result;
  assert.throws(() => {
    result = renderCta(baseArgs({ headingLevel: '<script>alert(1)</script>' }));
  }, /headingLevel/);
  assert.equal(
    result,
    undefined,
    'renderCta must not return any HTML when headingLevel is rejected',
  );
});
