// PF-053: the 'standard' template previously had only indirect coverage via
// tests/render.test.mjs's generic single-container check. Direct
// fixture-level tests here cover its full optional-field surface
// (link, and the new PF-053 cta field) plus escaping, mirroring the style
// tests/work-render.test.mjs already established for other templates.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderStandardPage } from '../src/pages/templates/standard.js';
import { primaryNav } from '../src/config/navigation.js';
import { site } from '../src/config/site.js';

function baseContent(overrides = {}) {
  return {
    title: 'Title',
    heading: 'Heading',
    paragraphs: ['First paragraph.', 'Second paragraph.'],
    ...overrides,
  };
}

function render(content) {
  return renderStandardPage({
    content,
    navItems: primaryNav,
    activeKey: 'about',
    site,
  });
}

test('renders heading and paragraphs inside one page container', () => {
  const { main } = render(baseContent());
  assert.match(
    main,
    /^<div class="container"><h1>Heading<\/h1><p>First paragraph\.<\/p><p>Second paragraph\.<\/p><\/div>$/,
  );
});

test('optional link renders when present', () => {
  const { main } = render(
    baseContent({ link: { label: 'Return home', path: '/' } }),
  );
  assert.match(main, /<p><a href="\/">Return home<\/a><\/p>/);
});

test('link is omitted entirely, not rendered blank, when absent', () => {
  const { main } = render(baseContent());
  assert.doesNotMatch(main, /<a /);
});

test('optional cta renders as <h2 class="cta__heading"> when present', () => {
  const { main } = render(
    baseContent({
      cta: {
        heading: 'Talk it through?',
        body: 'Share the details.',
        action: { label: 'Contact', path: '/contact/' },
      },
    }),
  );
  assert.match(main, /<h2 class="cta__heading">Talk it through\?<\/h2>/);
  assert.match(main, /<p class="cta__body">Share the details\.<\/p>/);
  assert.match(
    main,
    /<a class="btn btn--primary" href="\/contact\/">Contact<\/a>/,
  );
});

test('cta is omitted entirely, not rendered blank, when absent', () => {
  const { main } = render(baseContent());
  assert.doesNotMatch(main, /class="cta/);
});

test('cta without a body omits the body paragraph but still renders', () => {
  const { main } = render(
    baseContent({
      cta: { heading: 'No body here', action: { label: 'Go', path: '/' } },
    }),
  );
  assert.match(main, /<h2 class="cta__heading">No body here<\/h2>/);
  assert.doesNotMatch(main, /cta__body/);
});

test('escapes every hostile string field, including link and cta', () => {
  const hostileContent = {
    title: 'T',
    heading: '<b>Bold</b> & Heading',
    paragraphs: ['P & <script>alert(1)</script>'],
    link: { label: 'Return & <b>home</b>', path: '/' },
    cta: {
      heading: 'Closing & <b>markup</b>',
      body: 'Body & <b>markup</b>',
      action: { label: "Let's Go & <b>markup</b>", path: '/contact/' },
    },
  };
  const { main } = render(hostileContent);
  assert.doesNotMatch(main, /<script>/, 'no raw <script> tag should survive');
  assert.match(main, /&lt;b&gt;Bold&lt;\/b&gt; &amp; Heading/);
  assert.match(main, /P &amp; &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(main, /Return &amp; &lt;b&gt;home&lt;\/b&gt;/);
  assert.match(main, /Closing &amp; &lt;b&gt;markup&lt;\/b&gt;/);
  assert.match(main, /Body &amp; &lt;b&gt;markup&lt;\/b&gt;/);
  assert.match(main, /Let&#39;s Go &amp; &lt;b&gt;markup&lt;\/b&gt;/);
});
