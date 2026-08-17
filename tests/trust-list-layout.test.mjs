import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { resolveProperty } from './helpers/cascade-resolver.mjs';
import {
  expectSingleList,
  expectSingleSectionAction,
  expectDecorativeIcons,
} from './helpers/component-markup.mjs';

// Same cascade-resolver method as tests/process-steps-layout.test.mjs. No
// repeated deliberate-failure pass here — the ul/li reset defect class is
// already proven by that file and by the PF-032/033 precedent
// (docs/DECISION_LOG.md); this file only needs the resolved-value
// assertions themselves.
const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

const previewPath = fileURLToPath(
  new URL('../dev/design-system/index.html', import.meta.url),
);
const previewHtml = fs.readFileSync(previewPath, 'utf8');

test('resolved cascade: .trust-list (a <ul>) has max-width: none, not the inherited ~68ch prose-reading-width', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'ul', classes: ['trust-list'] },
    'max-width',
  );
  assert.equal(resolved, 'none');
});

test('resolved cascade: .trust-list__action (a <p>) has max-width: none, not the inherited ~68ch prose-reading-width from the generic p rule', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'p', classes: ['trust-list__action'] },
    'max-width',
  );
  assert.equal(
    resolved,
    'none',
    `expected the cascade-winning max-width on <p class="trust-list__action"> to be "none", got "${resolved}"`,
  );
});

test('resolved cascade: .trust-list__item (a <li>) has margin: 0, not the inherited margin-bottom', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'li', classes: ['trust-list__item'] },
    'margin',
  );
  assert.equal(resolved, '0');
});

function getTrustListSection() {
  const section = previewHtml.match(
    /<section class="preview-section" id="trust-indicators">[\s\S]*?<\/section>/,
  );
  assert.ok(section, 'trust-indicators <section> not found');
  return section[0];
}

// PF-041 — shared with tests/home-render.test.mjs's real renderer-output
// check via tests/helpers/component-markup.mjs (docs/DECISION_LOG.md).
test('the showcase has exactly one <ul class="trust-list"> with exactly three .trust-list__item entries, each with a real <ul> parent', () => {
  const section = getTrustListSection();
  expectSingleList(section, {
    listTag: 'ul',
    listClass: 'trust-list',
    itemClass: 'trust-list__item',
    count: 3,
  });
});

test('the trust-indicators specimen carries exactly one interactive element: a .trust-list__action link that is not a descendant of the <ul> or any <li>', () => {
  const section = getTrustListSection();
  const listHtml = section.match(/<ul class="trust-list">[\s\S]*?<\/ul>/);
  assert.ok(listHtml, '<ul class="trust-list"> not found');
  expectSingleSectionAction(section, {
    listHtml: listHtml[0],
    actionClass: 'trust-list__action',
    linkHref: '/about/',
    linkText: 'Learn About My Approach',
  });
});

test('every trust-list icon <svg> is decorative: aria-hidden="true" and focusable="false"', () => {
  const section = getTrustListSection();
  expectDecorativeIcons(section, { count: 3 });
});
