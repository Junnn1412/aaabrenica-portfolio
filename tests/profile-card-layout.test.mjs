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
  const match = css.match(
    new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`),
  );
  assert.ok(match, `rule not found: ${selector}`);
  return match[1];
}

test('shared profile card preserves the approved surface and spacing without min-content overflow', () => {
  const card = ruleBody('.profile-card');
  assert.match(card, /background-color:\s*var\(--color-surface-1\);/);
  assert.match(card, /padding:\s*var\(--space-6\);/);
  assert.match(
    card,
    /border:\s*var\(--border-width\) solid var\(--color-border\);/,
  );
  assert.match(card, /border-radius:\s*var\(--radius-lg\);/);
  assert.match(card, /min-width:\s*0;/);
  assert.match(card, /max-width:\s*100%;/);
});

test('the production portrait class combination resolves to a definite 4:5 frame and centered cover image', () => {
  const card = (variant) => ({
    tag: 'div',
    classes: ['profile-card', `profile-card--${variant}`],
  });
  const portrait = (variant) => ({
    tag: 'div',
    classes: ['profile-card__portrait'],
    ancestors: [card(variant)],
  });
  const frame = (variant) => ({
    tag: 'span',
    classes: ['media-frame', 'media-frame--portrait'],
    ancestors: [card(variant), portrait(variant)],
  });
  const image = (variant) => ({
    tag: 'img',
    classes: [],
    ancestors: [card(variant), portrait(variant), frame(variant)],
  });

  for (const variant of ['full', 'compact']) {
    assert.equal(resolveProperty(css, frame(variant), 'display'), 'block');
    assert.equal(resolveProperty(css, frame(variant), 'width'), '100%');
    assert.equal(resolveProperty(css, frame(variant), 'aspect-ratio'), '4/5');
    assert.equal(resolveProperty(css, image(variant), 'width'), '100%');
    assert.equal(resolveProperty(css, image(variant), 'height'), '100%');
    assert.equal(resolveProperty(css, image(variant), 'object-fit'), 'cover');
    assert.equal(
      resolveProperty(css, image(variant), 'object-position'),
      'center',
    );
  }
});

test('full and compact portrait wrappers resolve to responsive widths that cannot exceed their cards', () => {
  const fullPortrait = {
    tag: 'div',
    classes: ['profile-card__portrait'],
    ancestors: [
      { tag: 'div', classes: ['profile-card', 'profile-card--full'] },
    ],
  };
  const compactPortrait = {
    tag: 'div',
    classes: ['profile-card__portrait'],
    ancestors: [
      { tag: 'div', classes: ['profile-card', 'profile-card--compact'] },
    ],
  };

  assert.equal(resolveProperty(css, fullPortrait, 'width'), '100%');
  assert.equal(
    resolveProperty(css, compactPortrait, 'width'),
    'min(100%, 16rem)',
  );
  for (const portrait of [fullPortrait, compactPortrait]) {
    assert.equal(resolveProperty(css, portrait, 'min-width'), '0');
    assert.equal(resolveProperty(css, portrait, 'max-width'), '100%');
  }

  for (const viewport of [320, 375, 390]) {
    const compactFrameWidth = Math.min(viewport, 16 * 16);
    assert.ok(compactFrameWidth <= viewport);
  }
});

test('shared profile-card paragraphs reset generic margins so the body gap controls spacing', () => {
  const match = css.match(
    /\.profile-card__name,\s*\n\.profile-card__role,\s*\n\.profile-card__statement\s*\{([^}]*)\}/,
  );
  assert.ok(match, 'expected the combined name/role/statement reset');
  assert.match(match[1], /margin:\s*0;/);
});

test('shared card retains one restrained static electric-blue corner bracket', () => {
  const body = ruleBody('.profile-card__portrait::after');
  assert.match(body, /border-right:\s*2px solid var\(--color-accent\);/);
  assert.match(body, /border-bottom:\s*2px solid var\(--color-accent\);/);
  assert.match(body, /width:\s*var\(--space-7\);/);
  assert.match(body, /height:\s*var\(--space-7\);/);
  assert.doesNotMatch(
    body,
    /border-top:|border-left:|animation:|transition:|box-shadow:|gradient|filter:|blur/i,
  );
  assert.equal(
    [...css.matchAll(/\.profile-card__portrait::after\s*\{/g)].length,
    1,
  );
});

test('full highlight list resets generic prose spacing', () => {
  const list = ruleBody('.profile-card__highlights');
  assert.match(list, /margin:\s*0;/);
  assert.match(list, /padding:\s*0;/);
  assert.match(list, /list-style:\s*none;/);
  assert.match(ruleBody('.profile-card__highlights li'), /margin:\s*0;/);
});

test('compact card gains its internal grid only at the existing 48em breakpoint', () => {
  const match = css.match(
    /@media \(width >= 48em\) \{[\s\S]*?\.profile-card--compact\s*\{([^}]*)\}/,
  );
  assert.ok(match);
  assert.match(match[1], /display:\s*grid;/);
  assert.match(
    match[1],
    /grid-template-columns:\s*minmax\(0, 2fr\) minmax\(0, 3fr\);/,
  );
});

test('profile-card, About, and homepage About rules never use CSS order', () => {
  const relevantRules = [
    ...css.matchAll(
      /\.(?:profile-card|about(?:-layout|-page)?|home-about)[a-z0-9_ .:-]*\s*\{([^}]*)\}/g,
    ),
  ];
  assert.ok(relevantRules.length > 0);
  for (const [, body] of relevantRules) {
    assert.doesNotMatch(body, /(?<![a-z-])order:/);
  }
});

test('homepage About is stacked by default and becomes a 58/42 row at 64em', () => {
  const mobile = ruleBody('.home-about');
  assert.match(mobile, /display:\s*flex;/);
  assert.match(mobile, /flex-direction:\s*column;/);

  const desktop = css.match(
    /@media \(width >= 64em\) \{\s*\.home-about\s*\{([^}]*)\}[\s\S]*?\.home-about__copy\s*\{([^}]*)\}[\s\S]*?\.home-about \.profile-card\s*\{([^}]*)\}/,
  );
  assert.ok(desktop);
  assert.match(desktop[1], /flex-direction:\s*row;/);
  assert.match(desktop[2], /flex:\s*1 1 58%;/);
  assert.match(desktop[3], /flex:\s*1 1 42%;/);
});
