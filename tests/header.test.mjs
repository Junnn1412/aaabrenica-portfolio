import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderHeader } from '../src/components/partials/header.js';
import { site as realSite } from '../src/config/site.js';

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

test('brand link uses site.siteName and points to /, with no mark when site.brandMark is absent', () => {
  const html = renderHeader(navItems, 'home', site);
  assert.match(
    html,
    /<a class="site-header__brand" href="\/"><span class="site-brand__text">AAA Portfolio<\/span><\/a>/,
  );
  assert.doesNotMatch(html, /site-brand__mark/);
});

test('escapes the brand name', () => {
  const html = renderHeader(navItems, 'home', {
    siteName: '<script>',
    primaryCta: site.primaryCta,
  });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

// Header/nav visual-polish task — the brand mark is a replaceable,
// optional slot: when configured, it renders once, decoratively, inside
// the same single Home link as the visible text — one keyboard stop, one
// accessible name ("AAA Portfolio"), never a second one from the image.
test('renders the brand mark decoratively, inside the same link as the visible text, when site.brandMark is present', () => {
  const html = renderHeader(navItems, 'home', {
    ...site,
    brandMark: {
      src: '/images/brand/aaa-placeholder-logo.png',
      width: 96,
      height: 96,
    },
  });
  assert.match(
    html,
    /<a class="site-header__brand" href="\/"><img class="site-brand__mark" src="\/images\/brand\/aaa-placeholder-logo\.png" alt="" width="96" height="96"><span class="site-brand__text">AAA Portfolio<\/span><\/a>/,
  );
  // Exactly one <a>, exactly one <img> — mark and text are not two
  // separate interactive stops, and the image never carries its own name.
  assert.equal([...html.matchAll(/site-header__brand"/g)].length, 1);
  assert.equal([...html.matchAll(/site-brand__mark/g)].length, 1);
});

test('escapes a configured brand mark src', () => {
  const html = renderHeader(navItems, 'home', {
    ...site,
    brandMark: {
      src: '/images/brand/"><script>alert(1)</script>.png',
      width: 1,
      height: 1,
    },
  });
  assert.doesNotMatch(html, /<script>/);
});

// Logo-integration follow-up — proves the real production config
// (src/config/site.js), not just a synthetic fixture, renders the
// placeholder brand mark correctly end to end: real configured src/width/
// height, decorative alt, visible "AAA Portfolio" text still present,
// exactly one keyboard stop, exactly one accessible name.
test('the real site.brandMark config renders correctly through renderHeader', () => {
  assert.equal(
    realSite.brandMark?.src,
    '/images/brand/aaa-placeholder-logo.png',
  );
  const html = renderHeader(navItems, 'home', realSite);
  assert.match(
    html,
    /<a class="site-header__brand" href="\/"><img class="site-brand__mark" src="\/images\/brand\/aaa-placeholder-logo\.png" alt="" width="231" height="140"><span class="site-brand__text">AAA Portfolio<\/span><\/a>/,
  );
  assert.equal([...html.matchAll(/site-header__brand"/g)].length, 1);
  assert.equal([...html.matchAll(/site-brand__mark/g)].length, 1);
  assert.equal([...html.matchAll(/site-brand__text/g)].length, 1);
});

test('menu-toggle button ships hidden, with explicit aria-expanded, aria-controls, and the closed accessible name', () => {
  const html = renderHeader(navItems, 'home', site);
  assert.match(
    html,
    /<button class="site-header__menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation" hidden>/,
  );
});

// Mobile-toggle redesign — icon-only: no visible "Menu"/"Close" text
// anywhere in the markup, but the accessible name (aria-label) is present,
// and the three decorative bars are wrapped in one aria-hidden container
// so they can never register as a second, duplicate accessible name.
test('the menu toggle has no visible Menu/Close text and its icon bars are decorative', () => {
  const html = renderHeader(navItems, 'home', site);
  assert.doesNotMatch(html, />Menu<\/span>/);
  assert.doesNotMatch(html, />Close<\/span>/);
  assert.doesNotMatch(html, /site-header__menu-label/);
  assert.match(
    html,
    /<span class="site-header__menu-icon" aria-hidden="true">(?:<span class="site-header__menu-bar"><\/span>){3}<\/span>/,
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
