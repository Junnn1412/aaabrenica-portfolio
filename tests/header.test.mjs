import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderHeader } from '../src/components/partials/header.js';

const navItems = [
  { key: 'home', label: 'Home', path: '/' },
  { key: 'solutions', label: 'Solutions', path: '/solutions/' },
];
const site = {
  siteName: 'AAA Portfolio',
  primaryCta: { label: 'Start a Project', path: '/contact/' },
};

test('includes exactly one skip link targeting #main-content', () => {
  const html = renderHeader(navItems, 'home', site);
  const matches = [
    ...html.matchAll(/<a class="skip-link" href="#main-content">/g),
  ];
  assert.equal(matches.length, 1);
});

test('brand link uses site.siteName and points to /', () => {
  const html = renderHeader(navItems, 'home', site);
  assert.match(
    html,
    /<a class="site-header__brand" href="\/">AAA Portfolio<\/a>/,
  );
});

test('escapes the brand name', () => {
  const html = renderHeader(navItems, 'home', {
    siteName: '<script>',
    primaryCta: site.primaryCta,
  });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('menu-toggle button ships hidden, with explicit aria-expanded and aria-controls', () => {
  const html = renderHeader(navItems, 'home', site);
  assert.match(
    html,
    /<button class="site-header__menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" hidden>/,
  );
});

test('delegates to renderNav with the given activeKey and CTA', () => {
  const html = renderHeader(navItems, 'solutions', site);
  assert.match(
    html,
    /<a href="\/solutions\/" aria-current="page">Solutions<\/a>/,
  );
  assert.match(html, /site-nav__cta/);
});
