import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { routes } from '../src/config/routes.js';
import { renderRoute } from '../src/pages/render.js';

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = new URL(
      `${entry.name}${entry.isDirectory() ? '/' : ''}`,
      directory,
    );
    if (entry.isDirectory()) files.push(...(await sourceFiles(child)));
    else if (entry.name.endsWith('.js')) files.push(child);
  }
  return files;
}

test('live Privacy source still states that no form is active', async () => {
  const privacy = await readFile(
    new URL('../src/content/pages/privacy.js', import.meta.url),
    'utf8',
  );
  assert.match(privacy, /The site currently has no contact form/);
  assert.doesNotMatch(privacy, /Resend|form submissions are processed/i);
});

test('the unpublished Privacy draft is not imported anywhere in production source', async () => {
  const files = await sourceFiles(new URL('../src/', import.meta.url));
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    assert.doesNotMatch(source, /CONTACT_FORM_PRIVACY_DRAFT/);
  }
});

test('/privacy/ remains a registered, renderable route with unchanged disabled-form copy', () => {
  const route = routes.find((candidate) => candidate.path === '/privacy/');
  assert.ok(route);
  assert.equal(route.key, 'privacy');
  const rendered = renderRoute(route);
  assert.match(rendered.main, /The site currently has no contact form/);
  assert.doesNotMatch(rendered.main, /Resend|form submissions are processed/i);
});
