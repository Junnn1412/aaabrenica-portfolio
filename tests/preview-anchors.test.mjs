import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Reads the real, committed preview file — never a duplicated fixture — so
// this stays accurate as PF-031+ adds more sections/TOC entries to it.
const previewPath = fileURLToPath(
  new URL('../dev/design-system/index.html', import.meta.url),
);
const html = fs.readFileSync(previewPath, 'utf8');

test('the preview has exactly one page-title <h1>', () => {
  // Scoped to id="page-title" rather than every <h1> in the document: the
  // "Headings & body copy" section intentionally demonstrates a literal
  // <h1>-<h4> specimen as content, which must not be mistaken for the
  // page's own title heading.
  const matches = [...html.matchAll(/<h1\b[^>]*\bid="page-title"[^>]*>/g)];
  assert.equal(
    matches.length,
    1,
    `expected exactly one <h1 id="page-title">, found ${matches.length}`,
  );
});

test('every in-page anchor link in the table of contents resolves to a real id', () => {
  const hrefTargets = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  assert.ok(
    hrefTargets.length > 0,
    'expected at least one in-page anchor link (the table of contents) — found none',
  );

  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const target of hrefTargets) {
    assert.ok(
      ids.has(target),
      `in-page anchor links to "#${target}", but no element has id="${target}"`,
    );
  }
});

test('every id in the document is unique', () => {
  const allIds = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set();
  const duplicates = new Set();
  for (const id of allIds) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  assert.equal(
    duplicates.size,
    0,
    `duplicate id(s) found: ${[...duplicates].join(', ')}`,
  );
});
