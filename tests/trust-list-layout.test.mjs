import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { resolveProperty } from './helpers/cascade-resolver.mjs';

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

test('the showcase has exactly one <ul class="trust-list"> with exactly three .trust-list__item entries, each with a real <ul> parent', () => {
  const section = getTrustListSection();
  const lists = [...section.matchAll(/<ul class="trust-list">[\s\S]*?<\/ul>/g)];
  assert.equal(
    lists.length,
    1,
    `expected exactly 1 <ul class="trust-list">, found ${lists.length}`,
  );

  const itemsInsideList = [
    ...lists[0][0].matchAll(/<li class="trust-list__item">/g),
  ].length;
  const itemsAnywhereInSection = [
    ...section.matchAll(/<li class="trust-list__item">/g),
  ].length;
  assert.equal(
    itemsInsideList,
    3,
    `expected 3 items, found ${itemsInsideList}`,
  );
  assert.equal(itemsInsideList, itemsAnywhereInSection);
});

test('the trust-indicators specimen carries exactly one interactive element: a .trust-list__action link that is not a descendant of the <ul> or any <li>', () => {
  const section = getTrustListSection();
  const links = [...section.matchAll(/<a\s/g)].length;
  assert.equal(links, 1, `expected exactly one <a>, found ${links}`);

  // Not merely "not inside an <li>" — checks the link is entirely outside
  // the <ul>...</ul> substring, so it cannot be nested at any depth inside
  // the list (fixing the defect where a same-DOM-position sibling link
  // still visually read as belonging to the first grid item).
  const list = section.match(/<ul class="trust-list">[\s\S]*?<\/ul>/);
  assert.ok(list, '<ul class="trust-list"> not found');
  assert.doesNotMatch(
    list[0],
    /<a\s/,
    'the section-level link must not be a descendant of <ul class="trust-list"> at any depth',
  );

  const action = section.match(
    /<p class="trust-list__action"><a href="\/about\/">[^<]*<\/a><\/p>/,
  );
  assert.ok(
    action,
    'expected the link to be wrapped in <p class="trust-list__action">',
  );
  assert.ok(
    section.indexOf(list[0]) + list[0].length <= section.indexOf(action[0]),
    'the .trust-list__action element must appear after the closing </ul>, not before or inside it',
  );
});

test('every trust-list icon <svg> is decorative: aria-hidden="true" and focusable="false"', () => {
  const section = getTrustListSection();
  const icons = [...section.matchAll(/<svg([^>]*)>/g)];
  assert.equal(icons.length, 3, `expected 3 icons, found ${icons.length}`);
  for (const [index, match] of icons.entries()) {
    assert.match(
      match[1],
      /aria-hidden="true"/,
      `icon #${index + 1} missing aria-hidden="true"`,
    );
    assert.match(
      match[1],
      /focusable="false"/,
      `icon #${index + 1} missing focusable="false"`,
    );
  }
});
