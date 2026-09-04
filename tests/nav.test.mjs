import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderNav } from '../src/components/partials/nav.js';
import { primaryNav } from '../src/config/navigation.js';
import { site } from '../src/config/site.js';

const navItems = [
  { key: 'home', label: 'Home', path: '/' },
  { key: 'solutions', label: 'Solutions', path: '/solutions/' },
];

test('marks aria-current only on the matching key', () => {
  const html = renderNav(navItems, 'solutions');
  assert.match(
    html,
    /<a href="\/solutions\/" aria-current="page">Solutions<\/a>/,
  );
  assert.doesNotMatch(html, /<a href="\/" aria-current="page">/);
});

test('marks no aria-current when activeKey matches nothing', () => {
  const html = renderNav(navItems, null);
  assert.doesNotMatch(html, /aria-current/);
});

test('escapes labels and paths', () => {
  const html = renderNav(
    [{ key: 'x', label: '<script>', path: '/"quote/' }],
    null,
  );
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&quot;/);
});

test('renders the id and class hooks the header/CSS depend on', () => {
  const html = renderNav(navItems, null);
  assert.match(
    html,
    /<nav id="primary-navigation" class="site-nav" aria-label="Primary">/,
  );
});

test('appends the CTA as a distinct final item when provided', () => {
  const html = renderNav(navItems, 'home', {
    label: 'Start a Project',
    path: '/contact/',
  });
  assert.match(
    html,
    /<li><a class="btn btn--primary btn--sm site-nav__cta" href="\/contact\/">Start a Project<\/a><\/li><\/ul>/,
  );
});

test('omits any CTA markup when not provided', () => {
  const html = renderNav(navItems, 'home');
  assert.doesNotMatch(html, /site-nav__cta/);
});

test('production navigation order is Home, Solutions, Process, Work, About, Start a Project with no ordinary Contact link', () => {
  const html = renderNav(primaryNav, 'home', site.primaryCta);
  const labels = [...html.matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(labels, [
    'Home',
    'Solutions',
    'Process',
    'Work',
    'About',
    'Start a Project',
  ]);
  assert.equal([...html.matchAll(/href="\/contact\/"/g)].length, 1);
  assert.doesNotMatch(html, />Contact<\/a>/);
});

test('Contact route marks the sole Start a Project CTA current', () => {
  const html = renderNav(primaryNav, 'contact', site.primaryCta);
  assert.match(
    html,
    /<a class="btn btn--primary btn--sm site-nav__cta" href="\/contact\/" aria-current="page">Start a Project<\/a>/,
  );
  assert.equal([...html.matchAll(/aria-current="page"/g)].length, 1);
});
