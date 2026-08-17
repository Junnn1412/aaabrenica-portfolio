import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { resolveProperty } from './helpers/cascade-resolver.mjs';
import {
  expectSingleList,
  expectNoClass,
  expectNoInteractiveChildren,
} from './helpers/component-markup.mjs';

// Same cascade-resolver method as tests/process-steps-layout.test.mjs /
// tests/trust-list-layout.test.mjs. No repeated deliberate-failure pass —
// see tests/process-steps-layout.test.mjs's header comment.
const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

const previewPath = fileURLToPath(
  new URL('../dev/design-system/index.html', import.meta.url),
);
const previewHtml = fs.readFileSync(previewPath, 'utf8');

test('resolved cascade: .engagement-options (a <ul>) has max-width: none, not the inherited ~68ch prose-reading-width', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'ul', classes: ['engagement-options'] },
    'max-width',
  );
  assert.equal(resolved, 'none');
});

test('resolved cascade: .engagement-options__item (a <li>) has margin: 0, not the inherited margin-bottom', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'li', classes: ['engagement-options__item'] },
    'margin',
  );
  assert.equal(resolved, '0');
});

function getEngagementOptionsSection() {
  const section = previewHtml.match(
    /<section class="preview-section" id="engagement-options">[\s\S]*?<\/section>/,
  );
  assert.ok(section, 'engagement-options <section> not found');
  return section[0];
}

// PF-041 — shared with tests/home-render.test.mjs's real renderer-output
// check via tests/helpers/component-markup.mjs (docs/DECISION_LOG.md).
test('the showcase has exactly one <ul class="engagement-options"> with exactly four .engagement-options__item entries, each with a real <ul> parent', () => {
  const section = getEngagementOptionsSection();
  expectSingleList(section, {
    listTag: 'ul',
    listClass: 'engagement-options',
    itemClass: 'engagement-options__item',
    count: 4,
  });
});

test('no engagement-options item is composed from .tag — these are meaningful options, not filterable metadata', () => {
  const section = getEngagementOptionsSection();
  expectNoClass(section, 'tag');
});

test('the engagement-options items are entirely non-interactive: no <a>/<button> inside any .engagement-options__item', () => {
  const section = getEngagementOptionsSection();
  expectNoInteractiveChildren(section, {
    itemClass: 'engagement-options__item',
  });
});
