import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Cloudflare Pages routes invoke Functions only for the exact contact endpoint', async () => {
  const raw = await readFile(
    new URL('../public/_routes.json', import.meta.url),
    'utf8',
  );
  assert.deepEqual(JSON.parse(raw), {
    version: 1,
    include: ['/api/contact'],
    exclude: [],
  });
});
