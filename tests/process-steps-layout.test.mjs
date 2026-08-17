import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { parseRules, resolveProperty } from './helpers/cascade-resolver.mjs';
import {
  expectSingleList,
  expectSingleSectionAction,
  expectAriaHiddenBadges,
} from './helpers/component-markup.mjs';

// Compiles the real source of truth, same method as
// tests/capability-card-layout.test.mjs / tests/project-card-layout.test.mjs.
// First real <ol>-based cascade check in this project — the deliberate-
// failure pass for PF-034 is anchored here (docs/DECISION_LOG.md): reverting
// .process-steps' max-width: none locally and re-running this file
// confirmed the assertion below fails against the inherited ~68ch value,
// then the fix was restored.
const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

const previewPath = fileURLToPath(
  new URL('../dev/design-system/index.html', import.meta.url),
);
const previewHtml = fs.readFileSync(previewPath, 'utf8');

test('resolved cascade: .process-steps (an <ol>) has max-width: none, not the inherited ~68ch prose-reading-width from the generic ol,ul rule', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'ol', classes: ['process-steps'] },
    'max-width',
  );
  assert.equal(
    resolved,
    'none',
    `expected the cascade-winning max-width on <ol class="process-steps"> to be "none", got "${resolved}"`,
  );
});

test('resolved cascade: .process-steps__action (a <p>) has max-width: none, not the inherited ~68ch prose-reading-width from the generic p rule', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'p', classes: ['process-steps__action'] },
    'max-width',
  );
  assert.equal(
    resolved,
    'none',
    `expected the cascade-winning max-width on <p class="process-steps__action"> to be "none", got "${resolved}"`,
  );
});

test('resolved cascade: .process-steps__step (a <li>) has margin: 0, not the inherited margin-bottom from the generic li rule', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'li', classes: ['process-steps__step'] },
    'margin',
  );
  assert.equal(
    resolved,
    '0',
    `expected the cascade-winning margin on <li class="process-steps__step"> to be "0", got "${resolved}"`,
  );
});

test('resolved cascade: no property on .process-steps or .process-steps__step is won by a lower-specificity generic element rule', () => {
  const genericElementSelectors = {
    ol: { tag: 'ol', classes: ['process-steps'] },
    li: { tag: 'li', classes: ['process-steps__step'] },
  };
  const rules = parseRules(css);
  const genericProps = new Set();
  for (const rule of rules) {
    for (const selector of rule.selectors) {
      const bare = selector.trim();
      if (/^(ul|ol|li)$/.test(bare) && genericElementSelectors[bare]) {
        for (const prop of Object.keys(rule.declarations))
          genericProps.add(`${bare}|${prop}`);
      }
    }
  }
  assert.ok(
    genericProps.size > 0,
    'expected to find at least one generic ol/li property to check against — the resolver setup itself may be broken',
  );

  for (const key of genericProps) {
    const [tag, prop] = key.split('|');
    const element = genericElementSelectors[tag];
    const resolved = resolveProperty(css, element, prop);
    const genericOnlyRule = rules.find(
      (r) =>
        r.selectors.some((s) => s.trim() === tag) && prop in r.declarations,
    );
    const genericValue = genericOnlyRule.declarations[prop];
    if (tag === 'ol' && prop === 'max-width') {
      assert.notEqual(
        resolved,
        genericValue,
        `.process-steps must override <ol>'s generic max-width (currently resolves to the inherited "${genericValue}")`,
      );
    }
    if (tag === 'li' && prop === 'margin-bottom') {
      const resolvedMargin = resolveProperty(css, element, 'margin');
      assert.equal(
        resolvedMargin,
        '0',
        `.process-steps__step must override <li>'s generic margin-bottom (currently resolves to "${genericValue}")`,
      );
    }
  }
});

function getProcessStepsSection() {
  const section = previewHtml.match(
    /<section class="preview-section" id="process-steps">[\s\S]*?<\/section>/,
  );
  assert.ok(section, 'process-steps <section> not found');
  return section[0];
}

// PF-041 — shared with tests/home-render.test.mjs's real renderer-output
// check via tests/helpers/component-markup.mjs (docs/DECISION_LOG.md).
test('the showcase has exactly one <ol class="process-steps"> with exactly four .process-steps__step items, each with a real <ol> parent', () => {
  const section = getProcessStepsSection();
  expectSingleList(section, {
    listTag: 'ol',
    listClass: 'process-steps',
    itemClass: 'process-steps__step',
    count: 4,
  });
});

test('the process-steps specimen carries exactly one interactive element: a .process-steps__action link that is not a descendant of the <ol> or any <li>', () => {
  const section = getProcessStepsSection();
  const listHtml = section.match(/<ol class="process-steps">[\s\S]*?<\/ol>/);
  assert.ok(listHtml, '<ol class="process-steps"> not found');
  expectSingleSectionAction(section, {
    listHtml: listHtml[0],
    actionClass: 'process-steps__action',
    linkHref: '/process/',
    linkText: 'See the Full Process',
  });
});

test('.process-steps__number carries aria-hidden="true" on every step (decorative badge, not the source of ordinal semantics)', () => {
  const section = getProcessStepsSection();
  expectAriaHiddenBadges(section, {
    badgeClass: 'process-steps__number',
    count: 4,
  });
});

test('multi-column layout is gated behind two plain media queries (2 columns, then 4), no nested CSS math functions', () => {
  const twoCol = css.match(
    /@media \(width\s*>=\s*40em\)\s*\{\s*\.process-steps\s*\{([^}]*)\}\s*\}/,
  );
  assert.ok(
    twoCol,
    'expected a @media (width >= 40em) block overriding .process-steps',
  );
  assert.match(twoCol[1], /grid-template-columns:\s*repeat\(2,\s*1fr\);/);

  const fourCol = css.match(
    /@media \(width\s*>=\s*64em\)\s*\{\s*\.process-steps\s*\{([^}]*)\}\s*\}/,
  );
  assert.ok(
    fourCol,
    'expected a @media (width >= 64em) block overriding .process-steps',
  );
  assert.match(fourCol[1], /grid-template-columns:\s*repeat\(4,\s*1fr\);/);
});
