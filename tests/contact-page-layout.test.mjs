// PF-054 — same cascade-resolver method as tests/trust-list-layout.test.mjs
// (docs/DECISION_LOG.md's PF-032/033 ul/li-reset defect class): proves the
// real cascade-winning declaration, not just that a reset rule exists
// somewhere in the file.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import { resolveProperty } from './helpers/cascade-resolver.mjs';

const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

test('resolved cascade: .contact-methods (a <ul>) has max-width: none, not the inherited ~68ch prose-reading-width', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'ul', classes: ['contact-methods'] },
    'max-width',
  );
  assert.equal(resolved, 'none');
});

test('resolved cascade: .contact-methods (a <ul>) has margin: 0, not the inherited margin-bottom', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'ul', classes: ['contact-methods'] },
    'margin',
  );
  assert.equal(resolved, '0');
});

test('resolved cascade: .contact-methods__item (a <li>) has margin-bottom: 0, not the inherited margin-bottom', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'li', classes: ['contact-methods__item'] },
    'margin-bottom',
  );
  assert.equal(resolved, '0');
});
