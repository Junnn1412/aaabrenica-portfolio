import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateContent } from '../src/pages/content-schema.js';

test('valid standard content produces no problems', () => {
  const route = { key: 'about', template: 'standard' };
  const content = {
    title: 'About',
    heading: 'About',
    paragraphs: ['Body copy.'],
  };
  assert.deepEqual(validateContent(route, content), []);
});

test('missing required fields are reported', () => {
  const route = { key: 'about', template: 'standard' };
  const problems = validateContent(route, {});
  assert.ok(problems.some((p) => p.includes('"title"')));
  assert.ok(problems.some((p) => p.includes('"heading"')));
  assert.ok(problems.some((p) => p.includes('"paragraphs"')));
});

test('wrong field types are reported', () => {
  const route = { key: 'about', template: 'standard' };
  const content = { title: 42, heading: 'About', paragraphs: ['ok'] };
  const problems = validateContent(route, content);
  assert.ok(problems.some((p) => p.includes('"title"')));
});

test('optional description is validated only when present', () => {
  const route = { key: 'privacy', template: 'standard' };
  const withoutDescription = {
    title: 'Privacy',
    heading: 'Privacy',
    paragraphs: ['ok'],
  };
  assert.deepEqual(validateContent(route, withoutDescription), []);

  const withBadDescription = { ...withoutDescription, description: '' };
  assert.ok(validateContent(route, withBadDescription).length > 0);
});

test('listing template requires a non-empty links array of valid links', () => {
  const route = { key: 'work', template: 'listing' };
  const base = { title: 'Work', heading: 'Work', paragraphs: ['ok'] };

  assert.ok(validateContent(route, base).some((p) => p.includes('"links"')));

  const badLink = { ...base, links: [{ label: '', path: 'not-safe' }] };
  const problems = validateContent(route, badLink);
  assert.ok(problems.some((p) => p.includes('links[0].label')));
  assert.ok(problems.some((p) => p.includes('links[0].path')));

  const goodLink = {
    ...base,
    links: [{ label: 'FES Challenger', path: '/work/fes-challenger/' }],
  };
  assert.deepEqual(validateContent(route, goodLink), []);
});

test('case-study template requires backLink pointing exactly at /work/', () => {
  const route = { key: 'work-fes-challenger', template: 'case-study' };
  const base = {
    title: 'FES Challenger',
    heading: 'FES Challenger',
    paragraphs: ['ok'],
  };

  assert.ok(validateContent(route, base).some((p) => p.includes('"backLink"')));

  const wrongPath = { ...base, backLink: { label: 'Back', path: '/work' } };
  assert.ok(
    validateContent(route, wrongPath).some((p) => p.includes('backLink.path')),
  );

  const correct = {
    ...base,
    backLink: { label: 'Back to Work', path: '/work/' },
  };
  assert.deepEqual(validateContent(route, correct), []);
});
