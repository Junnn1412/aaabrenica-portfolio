// PF-055 — end-to-end structural assertions against the real 'not-found'
// route's rendered output, mirroring tests/work-render.test.mjs's style.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/pages/render.js';
import { renderNotFoundPage } from '../src/pages/templates/not-found.js';
import { routes } from '../src/config/routes.js';
import { primaryNav } from '../src/config/navigation.js';
import { site } from '../src/config/site.js';

function notFoundRendered() {
  const route = routes.find((r) => r.key === 'not-found');
  return renderRoute(route);
}

test('not-found: exactly one <h1>', () => {
  const { main } = notFoundRendered();
  assert.equal([...main.matchAll(/<h1[ >]/g)].length, 1);
});

test('not-found: exactly 3 links in a single .not-found__links list, in DOM order Home, Work, Contact', () => {
  const { main } = notFoundRendered();
  const listMatch = main.match(/<ul class="not-found__links">([\s\S]*?)<\/ul>/);
  assert.ok(listMatch, 'expected a <ul class="not-found__links">');
  const items = [
    ...listMatch[1].matchAll(
      /<li class="not-found__link-item"><a class="action-link action-link--forward" href="([^"]*)">[\s\S]*?<span class="action-link__label">([^<]*)<\/span>[\s\S]*?<\/a><\/li>/g,
    ),
  ];
  assert.equal(items.length, 3);
  assert.deepEqual(
    items.map((m) => [m[1], m[2]]),
    [
      ['/', 'Home'],
      ['/work/', 'Work'],
      ['/contact/', 'Contact'],
    ],
  );
});

test('not-found: every recovery link matches a real, registered route', () => {
  const { main } = notFoundRendered();
  const links = [
    ...main.matchAll(
      /<li class="not-found__link-item"><a class="action-link action-link--forward" href="([^"]*)">/g,
    ),
  ].map((m) => m[1]);
  const registeredPaths = new Set(routes.map((r) => r.path));
  for (const link of links) {
    assert.ok(
      registeredPaths.has(link),
      `recovery link "${link}" does not match a registered route`,
    );
  }
});

test('not-found: every href is a safe internal path', () => {
  const { main } = notFoundRendered();
  const hrefs = [...main.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  assert.ok(hrefs.length > 0);
  for (const href of hrefs) {
    assert.ok(href.startsWith('/'), `unsafe href found: "${href}"`);
    assert.ok(
      !href.startsWith('//'),
      `protocol-relative href found: "${href}"`,
    );
  }
});

test('not-found: the rendered header carries zero aria-current="page" (navKey: null policy)', () => {
  const { header } = notFoundRendered();
  assert.equal([...header.matchAll(/aria-current="page"/g)].length, 0);
});

test('renderNotFoundPage escapes every hostile string field, including link labels', () => {
  const hostileContent = {
    title: 'Not Found',
    heading: '<b>Bold</b> & Heading',
    paragraphs: ['P & <script>alert(1)</script>'],
    links: [
      { label: 'Home & <b>markup</b>', path: '/' },
      { label: 'Work & <b>markup</b>', path: '/work/' },
      { label: 'Contact & <b>markup</b>', path: '/contact/' },
    ],
  };
  const { main } = renderNotFoundPage({
    content: hostileContent,
    navItems: primaryNav,
    activeKey: null,
    site,
  });
  assert.doesNotMatch(main, /<script>/, 'no raw <script> tag should survive');
  assert.match(main, /&lt;b&gt;Bold&lt;\/b&gt; &amp; Heading/);
  assert.match(main, /P &amp; &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(main, /Home &amp; &lt;b&gt;markup&lt;\/b&gt;/);
});
