import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderIcon } from '../src/components/icon.js';

// Real Lucide icon data (lucide@1.31.0), copied verbatim from
// node_modules/lucide/dist/esm/icons/menu.mjs — not a synthetic fixture.
const Menu = [
  ['path', { d: 'M4 5h16' }],
  ['path', { d: 'M4 12h16' }],
  ['path', { d: 'M4 19h16' }],
];

test('renders a well-formed <svg> containing every child node', () => {
  const svg = renderIcon(Menu);
  assert.match(svg, /^<svg /);
  assert.equal((svg.match(/<path/g) || []).length, 3);
});

test('is decorative by default: aria-hidden and focusable=false', () => {
  const svg = renderIcon(Menu);
  assert.match(svg, /aria-hidden="true"/);
  assert.match(svg, /focusable="false"/);
});

test('decorative: false omits the decorative attributes', () => {
  const svg = renderIcon(Menu, { decorative: false });
  assert.doesNotMatch(svg, /aria-hidden/);
  assert.doesNotMatch(svg, /focusable/);
});

test('never injects an accessible name of its own', () => {
  assert.doesNotMatch(renderIcon(Menu), /aria-label/);
  assert.doesNotMatch(renderIcon(Menu, { decorative: false }), /aria-label/);
});

test('escapes a crafted attribute value and cannot break out of the attribute', () => {
  const malicious = [['path', { d: '"><script>alert(1)</script>' }]];
  const svg = renderIcon(malicious);
  assert.doesNotMatch(svg, /"><script>/);
  assert.match(svg, /&quot;&gt;&lt;script&gt;/);
});

test('throws on a non-array iconNode', () => {
  assert.throws(() => renderIcon(null), TypeError);
  assert.throws(() => renderIcon({}), TypeError);
  assert.throws(() => renderIcon('not-an-icon'), TypeError);
});

test('throws on an unexpected tag (e.g. "script"), even with no attributes', () => {
  // No attributes at all — isolates the tag whitelist specifically; a
  // tag carrying a disallowed attribute (e.g. "src") would also be
  // caught by the separate attribute whitelist, masking a tag-whitelist
  // regression.
  assert.throws(() => renderIcon([['script', {}]]), TypeError);
});

test('throws on an unexpected attribute name (onload/onclick/style/typo)', () => {
  assert.throws(
    () => renderIcon([['path', { d: 'M0 0', onload: 'evil()' }]]),
    TypeError,
  );
  assert.throws(
    () => renderIcon([['path', { d: 'M0 0', onclick: 'evil()' }]]),
    TypeError,
  );
  assert.throws(
    () => renderIcon([['path', { d: 'M0 0', style: 'color:red' }]]),
    TypeError,
  );
  assert.throws(() => renderIcon([['path', { dd: 'M0 0' }]]), TypeError);
});

test('className is emitted safely as the fixed class attribute', () => {
  const svg = renderIcon(Menu, { className: 'site-header__menu-icon' });
  assert.match(svg, /class="site-header__menu-icon"/);
});

test('a className containing markup is escaped and cannot break out or inject a new attribute', () => {
  const svg = renderIcon(Menu, {
    className: 'foo" onmouseover="alert(1)',
  });
  assert.doesNotMatch(svg, /onmouseover="alert/);
  assert.match(svg, /class="foo&quot; onmouseover=&quot;alert\(1\)"/);
});

test('an unrecognized option key has no effect on the output', () => {
  const svg = renderIcon(Menu, { onload: 'evil()' });
  assert.doesNotMatch(svg, /onload/);
});

test('hidden: true emits the boolean hidden attribute; default omits it', () => {
  assert.match(renderIcon(Menu, { hidden: true }), /<svg[^>]* hidden[ >]/);
  assert.doesNotMatch(renderIcon(Menu), /<svg[^>]* hidden[ >]/);
});
