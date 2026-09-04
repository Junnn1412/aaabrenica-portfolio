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

test('.about-page uses a real grid layout with a consistent space-8 gap between full-row siblings', () => {
  const body = ruleBody('.about-page');
  assert.match(body, /display:\s*grid;/);
  assert.match(body, /gap:\s*var\(--space-8\);/);
});

test('Experience wins a full-width, centered 70rem composition boundary shared by its header and timeline', () => {
  const page = { tag: 'div', classes: ['container', 'about-page'] };
  const section = {
    tag: 'section',
    classes: ['about-experience'],
    ancestors: [page],
  };
  const inner = {
    tag: 'div',
    classes: ['about-experience__inner'],
    ancestors: [page, section],
  };
  const header = {
    tag: 'div',
    classes: ['section-header'],
    ancestors: [page, section, inner],
  };
  const timeline = {
    tag: 'ol',
    classes: ['experience-timeline'],
    ancestors: [page, section, inner],
  };
  const card = {
    tag: 'article',
    classes: ['experience-card'],
    ancestors: [page, section, inner, timeline],
  };

  assert.equal(resolveProperty(css, section, 'width'), '100%');
  assert.equal(resolveProperty(css, inner, 'width'), '100%');
  assert.equal(resolveProperty(css, inner, 'max-width'), '70rem');
  assert.equal(resolveProperty(css, inner, 'margin-inline'), 'auto');
  assert.equal(resolveProperty(css, header, 'width'), '100%');
  assert.equal(resolveProperty(css, header, 'max-width'), 'none');
  assert.equal(resolveProperty(css, timeline, 'width'), '100%');
  assert.equal(resolveProperty(css, timeline, 'max-width'), 'none');
  assert.equal(resolveProperty(css, card, 'width'), '100%');
});

test('About stacks naturally by default and switches to the established 64em two-column composition', () => {
  const mobile = ruleBody('.about-layout');
  assert.match(mobile, /display:\s*flex;/);
  assert.match(mobile, /flex-direction:\s*column;/);

  const desktop = css.match(
    /@media \(width >= 64em\) \{[\s\S]*?\.about-layout--with-card\s*\{([^}]*)\}/,
  );
  assert.ok(desktop);
  assert.match(desktop[1], /flex-direction:\s*row;/);
  assert.match(desktop[1], /gap:\s*var\(--space-9\);/);
});

test('About desktop split preserves biography first and full profile card second without CSS order', () => {
  const content = ruleBody('.about-layout--with-card .about-layout__content');
  const card = ruleBody('.about-layout--with-card .profile-card');
  assert.match(content, /flex:\s*1 1 58%;/);
  assert.match(card, /flex:\s*1 1 42%;/);
  assert.doesNotMatch(content, /(?<![a-z-])order:/);
  assert.doesNotMatch(card, /(?<![a-z-])order:/);
});

test('About stack uses flexible one-column tracks by default and two columns only where space permits', () => {
  const groups = ruleBody('.about-stack__groups');
  assert.match(groups, /display:\s*grid;/);
  assert.match(groups, /grid-template-columns:\s*minmax\(0, 1fr\);/);

  const wider = css.match(
    /@media \(width >= 40em\) \{\s*\.about-stack__groups\s*\{([^}]*)\}/,
  );
  assert.ok(wider);
  assert.match(
    wider[1],
    /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/,
  );
});

test('About stack resets the prose-list cascade and keeps static tags naturally wrapping', () => {
  const content = ruleBody('.about-layout__content');
  const group = ruleBody('.about-stack__group');
  const tags = ruleBody('.about-stack__tags');
  const item = ruleBody('.about-stack__tag-item');
  const tag = ruleBody('.about-stack__tag-item .tag');

  assert.match(content, /min-width:\s*0;/);
  assert.match(group, /min-width:\s*0;/);
  assert.match(tags, /display:\s*flex;/);
  assert.match(tags, /flex-wrap:\s*wrap;/);
  assert.match(tags, /max-width:\s*none;/);
  assert.match(tags, /margin:\s*0;/);
  assert.match(tags, /padding:\s*0;/);
  assert.match(tags, /list-style:\s*none;/);
  assert.match(item, /min-width:\s*0;/);
  assert.match(item, /margin:\s*0;/);
  assert.match(tag, /max-width:\s*100%;/);
});

test('About stack width model cannot overflow at 320, 375, or 390px', () => {
  const longestTechnology = 'Microsoft SQL Server';
  const conservativeLabelWidth = longestTechnology.length * 10 + 48;

  for (const viewport of [320, 375, 390]) {
    const minimumInlineGutters = 2 * 20;
    const availableWidth = viewport - minimumInlineGutters;
    assert.ok(
      conservativeLabelWidth <= availableWidth,
      `${longestTechnology} must fit within the ${viewport}px one-column stack`,
    );
  }
});

test('all About page rules avoid CSS order and animation properties', () => {
  const relevantRules = [
    ...css.matchAll(/\.(?:about|experience)[a-z0-9_ .:-]*\s*\{([^}]*)\}/g),
  ];
  assert.ok(relevantRules.length > 0);
  for (const [, body] of relevantRules) {
    assert.doesNotMatch(body, /(?<![a-z-])order:/);
    assert.doesNotMatch(body, /animation:|transition:/);
  }
});

test('Experience timeline uses CSS-only electric-blue line and nodes beside neutral cards', () => {
  const timeline = ruleBody('.experience-timeline');
  const line = ruleBody('.experience-timeline::before');
  const node = ruleBody('.experience-timeline__item::before');
  const card = ruleBody('.experience-card');

  assert.match(timeline, /position:\s*relative;/);
  assert.match(timeline, /width:\s*100%;/);
  assert.match(timeline, /max-width:\s*none;/);
  assert.match(timeline, /list-style:\s*none;/);
  assert.match(line, /border-left:\s*2px solid var\(--color-accent\);/);
  assert.match(node, /border:\s*2px solid var\(--color-accent\);/);
  assert.match(node, /border-radius:\s*var\(--radius-full\);/);
  assert.match(node, /background-color:\s*var\(--color-canvas\);/);
  assert.match(
    card,
    /border:\s*var\(--border-width\) solid var\(--color-border\);/,
  );
  assert.match(card, /border-radius:\s*var\(--radius-lg\);/);
  assert.match(card, /background-color:\s*var\(--color-surface-1\);/);
  assert.doesNotMatch(card, /gradient|box-shadow|filter|blur|height:/i);
});

test('Experience card main content stays one-column by default and becomes a balanced flexible grid only at 64em', () => {
  const mobileMain = ruleBody('.experience-card__main');
  assert.match(mobileMain, /display:\s*grid;/);
  assert.match(mobileMain, /grid-template-columns:\s*minmax\(0, 1fr\);/);
  assert.match(mobileMain, /min-width:\s*0;/);

  const desktop = css.match(
    /@media \(width >= 64em\) \{\s*\.about-layout--with-card\s*\{[\s\S]*?\.experience-card__main\s*\{([^}]*)\}/,
  );
  assert.ok(desktop);
  assert.match(
    desktop[1],
    /grid-template-columns:\s*minmax\(0, 2fr\) minmax\(0, 3fr\);/,
  );
  assert.match(desktop[1], /gap:\s*var\(--space-7\);/);
});

test('Experience role and narrative text retain heading/body hierarchy and readable measures', () => {
  const page = { tag: 'div', classes: ['container', 'about-page'] };
  const section = {
    tag: 'section',
    classes: ['about-experience'],
    ancestors: [page],
  };
  const inner = {
    tag: 'div',
    classes: ['about-experience__inner'],
    ancestors: [page, section],
  };
  const timeline = {
    tag: 'ol',
    classes: ['experience-timeline'],
    ancestors: [page, section, inner],
  };
  const card = {
    tag: 'article',
    classes: ['experience-card'],
    ancestors: [page, section, inner, timeline],
  };
  const role = {
    tag: 'h3',
    classes: ['experience-card__role'],
    ancestors: [page, section, inner, timeline, card],
  };
  const summary = {
    tag: 'p',
    classes: ['experience-card__summary'],
    ancestors: [page, section, inner, timeline, card],
  };
  const responsibilities = {
    tag: 'ul',
    classes: ['experience-card__responsibilities'],
    ancestors: [page, section, inner, timeline, card],
  };

  assert.equal(resolveProperty(css, role, 'font-size'), 'var(--font-size-h3)');
  assert.equal(
    resolveProperty(css, summary, 'font-size'),
    'var(--font-size-body)',
  );
  assert.equal(
    resolveProperty(css, responsibilities, 'font-size'),
    'var(--font-size-body)',
  );
  assert.equal(
    resolveProperty(css, summary, 'max-width'),
    'var(--width-reading)',
  );
  assert.equal(
    resolveProperty(css, responsibilities, 'max-width'),
    'var(--width-reading)',
  );
});

test('Experience dates stack below identity by default and move upper-right at the existing 48em breakpoint', () => {
  const mobileHeader = ruleBody('.experience-card__header');
  const mobileDates = ruleBody('.experience-card__dates');
  assert.match(mobileHeader, /display:\s*flex;/);
  assert.match(mobileHeader, /flex-direction:\s*column;/);
  assert.match(mobileDates, /flex-wrap:\s*wrap;/);

  const desktop = css.match(
    /@media \(width >= 48em\) \{\s*\.experience-card\s*\{[^}]*\}\s*\.experience-card__header\s*\{([^}]*)\}\s*\.experience-card__dates\s*\{([^}]*)\}/,
  );
  assert.ok(desktop);
  assert.match(desktop[1], /display:\s*grid;/);
  assert.match(desktop[1], /grid-template-columns:\s*minmax\(0, 1fr\) auto;/);
  assert.match(desktop[2], /justify-self:\s*end;/);
  assert.match(desktop[2], /white-space:\s*nowrap;/);
});

test('Experience cards and tags retain mobile-safe min-width and wrapping rules', () => {
  const timelineItem = ruleBody('.experience-timeline__item');
  const card = ruleBody('.experience-card');
  const header = ruleBody('.experience-card__header');
  const identity = ruleBody('.experience-card__identity');
  const technologies = ruleBody('.experience-card__technologies');
  const tagItem = ruleBody('.experience-card__tag-item');
  const tag = ruleBody('.experience-card__tag-item .tag');

  for (const body of [timelineItem, card, header, identity, tagItem]) {
    assert.match(body, /min-width:\s*0;/);
  }
  assert.match(technologies, /display:\s*flex;/);
  assert.match(technologies, /flex-wrap:\s*wrap;/);
  assert.match(technologies, /max-width:\s*none;/);
  assert.match(technologies, /padding:\s*0;/);
  assert.match(tag, /max-width:\s*100%;/);
  assert.match(tag, /overflow-wrap:\s*anywhere;/);
});

test('Experience width model cannot overflow at required mobile, tablet, and desktop widths', () => {
  for (const viewport of [320, 375, 390, 768, 1024, 1440, 1920]) {
    const gutter = Math.min(48, Math.max(20, 16 + viewport * 0.02));
    const containerWidth = Math.min(viewport, 1280) - 2 * gutter;
    const experienceWidth = Math.min(containerWidth, 70 * 16);
    const timelineOffset = 48;
    const cardWidth = experienceWidth - timelineOffset;
    const cardInlinePadding =
      viewport >= 1024 ? 2 * 48 : viewport >= 768 ? 2 * 32 : 2 * 24;
    const contentWidth = cardWidth - cardInlinePadding;
    assert.ok(experienceWidth <= containerWidth);
    assert.ok(cardWidth > 0, `expected a positive card width at ${viewport}px`);
    assert.ok(
      contentWidth >= 176,
      `expected at least 176px of wrapping space at ${viewport}px`,
    );

    if (viewport >= 1024) {
      const desktopGap = 48;
      const columnSpace = contentWidth - desktopGap;
      assert.ok(columnSpace * (2 / 5) >= 280);
      assert.ok(columnSpace * (3 / 5) >= 420);
    }
  }
});
