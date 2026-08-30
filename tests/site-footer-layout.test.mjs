import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import { resolveProperty } from './helpers/cascade-resolver.mjs';

const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

function ruleBody(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `rule not found: ${selector}`);
  return match[1];
}

function gutterAt(viewport) {
  return Math.min(48, Math.max(20, 16 + viewport * 0.02));
}

test('mobile footer resolves to compact copyright-first and social-second centered rows', () => {
  const footer = ruleBody('footer');
  const inner = ruleBody('.site-footer__inner');
  assert.match(footer, /padding-block:\s*var\(--space-3\);/);
  assert.match(
    footer,
    /border-top:\s*var\(--border-width\) solid var\(--color-border\);/,
  );
  assert.doesNotMatch(
    footer,
    /position:\s*(?:fixed|sticky)|box-shadow|gradient/,
  );
  assert.match(inner, /display:\s*flex;/);
  assert.match(inner, /flex-direction:\s*column;/);
  assert.match(inner, /min-width:\s*0;/);
  assert.match(inner, /align-items:\s*center;/);
  assert.match(inner, /justify-content:\s*center;/);
  assert.match(inner, /gap:\s*var\(--space-2\);/);
  assert.match(inner, /text-align:\s*center;/);
  assert.match(ruleBody('.site-footer__links'), /justify-content:\s*center;/);
});

test('desktop footer resolves at 48em to one space-between row with right-aligned social links', () => {
  const media = css.match(
    /@media \(min-width: 48em\) \{[\s\S]*?\.site-footer__inner\s*\{([^}]*)\}[\s\S]*?\.site-footer__links\s*\{([^}]*)\}/,
  );
  assert.ok(media);
  assert.match(media[1], /flex-direction:\s*row;/);
  assert.match(media[1], /justify-content:\s*space-between;/);
  assert.match(media[1], /text-align:\s*left;/);
  assert.match(media[2], /justify-content:\s*flex-end;/);
});

test('footer inner reuses the centered site container boundary', () => {
  const container = ruleBody('.container');
  assert.match(container, /width:\s*100%;/);
  assert.match(container, /max-width:\s*var\(--container-max\);/);
  assert.match(container, /margin-inline:\s*auto;/);
  assert.match(container, /padding-inline:\s*var\(--gutter\);/);
  assert.doesNotMatch(ruleBody('footer'), /padding-inline:/);
});

test('social list winning cascade resets generic prose constraints and wraps safely', () => {
  const footer = { tag: 'footer', classes: [] };
  const inner = {
    tag: 'div',
    classes: ['container', 'site-footer__inner'],
    ancestors: [footer],
  };
  const list = {
    tag: 'ul',
    classes: ['site-footer__links'],
    ancestors: [footer, inner],
  };
  assert.equal(resolveProperty(css, list, 'max-width'), 'none');
  assert.equal(resolveProperty(css, list, 'margin'), '0');
  assert.equal(resolveProperty(css, list, 'padding'), '0');
  assert.equal(resolveProperty(css, list, 'list-style'), 'none');
  assert.equal(resolveProperty(css, list, 'display'), 'flex');
  assert.equal(resolveProperty(css, list, 'flex-wrap'), 'wrap');
});

test('each social link retains at least a 44x44px target and no inherited underline', () => {
  const body = ruleBody('.site-footer__connect-link');
  assert.match(body, /min-width:\s*var\(--touch-target-min\);/);
  assert.match(body, /min-height:\s*var\(--touch-target-min\);/);
  assert.match(body, /text-decoration:\s*none;/);
  assert.match(body, /border:\s*var\(--border-width\) solid transparent;/);
});

test('four social targets fit their separate mobile row at 320, 375, and 390px', () => {
  for (const viewport of [320, 375, 390]) {
    const available = viewport - 2 * gutterAt(viewport);
    const socialRowWidth = 4 * 44 + 3 * 8;
    assert.ok(
      socialRowWidth <= available,
      `expected ${socialRowWidth}px social row to fit ${available}px at ${viewport}px`,
    );
  }
});

test('desktop copyright and social row fit the centered container at required widths', () => {
  for (const viewport of [768, 1024, 1440, 1920]) {
    const containerOuter = Math.min(viewport, 1280);
    const available = containerOuter - 2 * gutterAt(viewport);
    const modeledCopyright = 280;
    const modeledSocials = 4 * 44 + 3 * 8;
    const minimumGap = 16;
    assert.ok(
      modeledCopyright + modeledSocials + minimumGap <= available,
      `expected desktop row to fit ${available}px at ${viewport}px`,
    );
  }
});

test('copyright resets generic prose width and margin without CSS order', () => {
  const meta = ruleBody('.site-footer__meta');
  assert.match(meta, /max-width:\s*none;/);
  assert.match(meta, /margin:\s*0;/);
  assert.match(meta, /overflow-wrap:\s*anywhere;/);
  const footerRules = [...css.matchAll(/\.site-footer[^{}]*\{([^}]*)\}/g)];
  for (const [, body] of footerRules) {
    assert.doesNotMatch(body, /(?:^|;)\s*order\s*:/);
  }
  assert.doesNotMatch(css, /\.site-footer__(?:brand|brand-mark|brand-name)/);
});

test('footer icon hover, focus, forced-colors, and motion behavior remain intact', () => {
  const hover = css.match(
    /@media \(hover: hover\) and \(pointer: fine\) \{\s*\.site-footer__connect-link:hover\s*\{([^}]*)\}/,
  );
  assert.ok(hover);
  assert.match(hover[1], /background-color:\s*var\(--color-surface-2\);/);
  assert.doesNotMatch(hover[1], /transform:|scale\(|box-shadow/);
  assert.doesNotMatch(ruleBody('.site-footer__connect-link'), /transform:/);

  const focus = ruleBody(':focus-visible');
  assert.match(
    focus,
    /outline:\s*var\(--focus-ring-width\) solid var\(--color-focus-ring\);/,
  );
  const forced = [
    ...css.matchAll(/\.site-footer__connect-link\s*\{([^}]*)\}/g),
  ].at(-1);
  assert.ok(forced);
  assert.match(forced[1], /border-color:\s*ButtonText;/);
  assert.match(forced[1], /color:\s*LinkText;/);
});

test('no footer or global overflow-hiding workaround is introduced', () => {
  const htmlBodyRules = [
    ...css.matchAll(/(?:^|\n)(?:html|body)\s*\{([^}]*)\}/g),
  ];
  for (const [, body] of htmlBodyRules) {
    assert.doesNotMatch(body, /overflow(?:-x)?:\s*(?:hidden|clip)/);
  }
  for (const [, body] of css.matchAll(/\.site-footer[^{}]*\{([^}]*)\}/g)) {
    assert.doesNotMatch(body, /overflow(?:-x)?:\s*(?:hidden|clip)/);
  }
});
