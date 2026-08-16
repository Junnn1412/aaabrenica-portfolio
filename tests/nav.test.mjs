import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderNav } from '../src/components/partials/nav.js';

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
