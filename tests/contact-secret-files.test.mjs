import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const expectedNames = [
  'RESEND_API_KEY',
  'CONTACT_FROM_EMAIL',
  'CONTACT_TO_EMAIL',
  'CONTACT_FORM_ENABLED',
];

test('.dev.vars.example contains only the approved empty variable assignments and comments', async () => {
  const source = await readFile(
    new URL('../.dev.vars.example', import.meta.url),
    'utf8',
  );
  const assignments = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));

  assert.deepEqual(
    assignments.map((line) => line.split('=', 1)[0]),
    expectedNames,
  );
  for (const assignment of assignments) {
    assert.match(assignment, /^[A-Z_]+=$/);
  }
});

test('.gitignore excludes real Cloudflare local variable files but keeps the example trackable', async () => {
  const lines = (
    await readFile(new URL('../.gitignore', import.meta.url), 'utf8')
  )
    .split(/\r?\n/)
    .map((line) => line.trim());

  const exactIndex = lines.indexOf('.dev.vars');
  const wildcardIndex = lines.indexOf('.dev.vars.*');
  const exampleIndex = lines.indexOf('!.dev.vars.example');
  assert.ok(exactIndex >= 0);
  assert.ok(wildcardIndex > exactIndex);
  assert.ok(exampleIndex > wildcardIndex);
});
