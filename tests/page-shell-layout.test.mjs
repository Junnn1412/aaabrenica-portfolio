import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';

// Compiles the real source of truth, same method as site-nav-layout.test.mjs
// and design-tokens.test.mjs. Guards the PF-040 minimum-viewport shell: body
// becomes a flex column (generic/_document.scss) and #main-content absorbs
// the leftover space (objects/_page-shell.scss) so the footer is pinned to
// the viewport bottom on short routes without constraining long ones. CSS
// *rendering* still requires manual browser review; this only proves the
// compiled stylesheet contains the corrected declarations.
const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

function firstRuleBody(selectorPattern) {
  const match = css.match(new RegExp(`${selectorPattern}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `no rule found for ${selectorPattern}`);
  return match[1];
}

// Plain `body { ... }` is matched three times in the compiled output:
// generic/_reset.scss's unrelated `body { margin: 0; }`, this task's real
// chrome rule in generic/_document.scss, and that same file's `@supports`
// override (checked separately below). Disambiguated the same way
// site-header-mobile-layout.test.mjs tells `header` apart from
// `.section-header` — by requiring the one declaration only the real rule
// has.
function bodyChromeRule() {
  const matches = [...css.matchAll(/body\s*\{([^}]*)\}/g)].map((m) => m[1]);
  const chromeRule = matches.find((body) => /display:\s*flex/.test(body));
  assert.ok(chromeRule, 'no body { display: flex } chrome rule found');
  return chromeRule;
}

test('body is a flex column', () => {
  const bodyRule = bodyChromeRule();
  assert.match(bodyRule, /display:\s*flex/);
  assert.match(bodyRule, /flex-direction:\s*column/);
});

test('body upgrades to 100dvh inside an @supports block', () => {
  const match = css.match(
    /@supports \(min-height: 100dvh\) \{\s*body\s*\{([^}]*)\}/,
  );
  assert.ok(match, 'expected an @supports (min-height: 100dvh) body override');
  assert.match(match[1], /min-height:\s*100dvh/);
});

test('#main-content grows to fill the flex column', () => {
  const rule = firstRuleBody('#main-content');
  assert.match(rule, /flex:\s*1/);
});

test('#main-content carries the page-level vertical rhythm token', () => {
  const rule = firstRuleBody('#main-content');
  assert.match(rule, /padding-block:\s*var\(--space-section\)/);
});
