import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import {
  remToPx,
  parseRules,
  resolveProperty,
} from './helpers/cascade-resolver.mjs';
import {
  expectItemsHaveListParent,
  expectLinkPairing,
} from './helpers/component-markup.mjs';

// Compiles the real source of truth, same method (and the same shared
// resolver — this is its second real caller, docs/DECISION_LOG.md) as
// tests/capability-card-layout.test.mjs. Proactively resets the exact
// generic-`ul`/`li` properties that defect fixed on .capability-card,
// rather than discovering the gap after a review round-trip — verified
// below via resolved cascade, not presence.
const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

const previewPath = fileURLToPath(
  new URL('../dev/design-system/index.html', import.meta.url),
);
const previewHtml = fs.readFileSync(previewPath, 'utf8');

test('resolved cascade: .project-cards (a <ul>) has max-width: none, not the inherited ~68ch prose-reading-width from the generic ul,ol rule', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'ul', classes: ['project-cards'] },
    'max-width',
  );
  assert.equal(
    resolved,
    'none',
    `expected the cascade-winning max-width on <ul class="project-cards"> to be "none", got "${resolved}"`,
  );
});

test('resolved cascade: .project-card (a <li>) has margin: 0, not the inherited margin-bottom from the generic li rule', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'li', classes: ['project-card'] },
    'margin',
  );
  assert.equal(
    resolved,
    '0',
    `expected the cascade-winning margin on <li class="project-card"> to be "0", got "${resolved}"`,
  );
});

test('resolved cascade: no property on .project-cards or .project-card is won by a lower-specificity generic element rule', () => {
  const genericElementSelectors = {
    ul: { tag: 'ul', classes: ['project-cards'] },
    li: { tag: 'li', classes: ['project-card'] },
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
    'expected to find at least one generic ul/li property to check against — the resolver setup itself may be broken',
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
    if (tag === 'ul' && prop === 'max-width') {
      assert.notEqual(
        resolved,
        genericValue,
        `.project-cards must override <ul>'s generic max-width (currently resolves to the inherited "${genericValue}")`,
      );
    }
    if (tag === 'li' && prop === 'margin-bottom') {
      const resolvedMargin = resolveProperty(css, element, 'margin');
      assert.equal(
        resolvedMargin,
        '0',
        `.project-card must override <li>'s generic margin-bottom (currently resolves to "${genericValue}")`,
      );
    }
  }
});

test('.project-cards defaults to a single column unconditionally (mobile-safe, no media query involved)', () => {
  const rule = css.match(/\.project-cards\s*\{([^}]*)\}/);
  assert.ok(rule, '.project-cards base rule not found in compiled CSS');
  assert.match(
    rule[1],
    /grid-template-columns:\s*1fr;/,
    'expected the unconditional base rule to be a plain single column',
  );
});

test('multi-column layout is gated behind a single, plain media query using auto-fit/minmax (no nested CSS math functions)', () => {
  const block = css.match(
    /@media \(width\s*>=\s*36em\)\s*\{\s*\.project-cards\s*\{([^}]*)\}\s*\}/,
  );
  assert.ok(
    block,
    'expected exactly one @media (width >= 36em) block overriding .project-cards',
  );
  assert.match(
    block[1],
    /grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(21rem,\s*1fr\)\);/,
    'expected a plain repeat(auto-fit, minmax(21rem, 1fr)) — 22rem was the original proposal but produced only 1 column at 768px against the real computed tokens; 21rem is the value that actually produces the intended 1/2/3-column pattern (docs/DECISION_LOG.md)',
  );
});

// PF-041 visual-review defect fix: the default auto-fit grid resolves to 3
// columns at widths wide enough (1440/1920px), but with exactly one
// featured card (spanning the full row) plus two secondary cards, that
// leaves a third column empty — the section reads as incomplete
// (docs/DECISION_LOG.md). `.project-cards--featured-pair` forces a fixed
// 2-column grid instead, so the two secondary cards always balance,
// regardless of how wide the container is.
test('.project-cards--featured-pair forces a fixed 2-column grid at the same >=36em breakpoint, overriding the default auto-fit/minmax', () => {
  const block = css.match(
    /@media \(width\s*>=\s*36em\)\s*\{\s*\.project-cards--featured-pair\s*\{([^}]*)\}\s*\}/,
  );
  assert.ok(
    block,
    'expected exactly one @media (width >= 36em) block overriding .project-cards--featured-pair',
  );
  assert.match(
    block[1],
    /grid-template-columns:\s*repeat\(2,\s*1fr\);/,
    'expected a fixed repeat(2, 1fr) — not auto-fit/minmax — so the column count never depends on container width',
  );
});

// A fixed repeat(2, 1fr) has no third track to leave empty at any width —
// this asserts that directly against the real compiled tokens rather than
// re-deriving the same auto-fit column-count math the base grid already
// has its own simulation for (above).
test('.project-cards--featured-pair never resolves to more than 2 columns at any required review width', () => {
  const getToken = (name) => {
    const match = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
    assert.ok(match, `token --${name} not found in compiled CSS`);
    return match[1].trim();
  };
  const containerWideRem = parseFloat(getToken('container-wide'));
  assert.ok(
    containerWideRem > 0,
    'sanity check: --container-wide must be a positive rem value',
  );
  // repeat(2, 1fr) is a fixed track count declared directly in the
  // compiled CSS (verified above) — it cannot resolve to a different
  // number of columns at any width, so no per-width simulation is needed
  // to prove "never 3 columns"; this test documents that invariant
  // explicitly rather than leaving it implicit.
  const block = css.match(
    /@media \(width\s*>=\s*36em\)\s*\{\s*\.project-cards--featured-pair\s*\{([^}]*)\}\s*\}/,
  )[1];
  assert.doesNotMatch(
    block,
    /auto-fit|repeat\(3/,
    'expected no auto-fit or 3-column track in .project-cards--featured-pair at any width',
  );
});

test('.project-card--featured spans every grid column, staying inside the same list as secondary cards rather than a second one', () => {
  const rule = css.match(/\.project-card--featured\s*\{([^}]*)\}/);
  assert.ok(rule, '.project-card--featured rule not found');
  assert.match(
    rule[1],
    /grid-column:\s*1\s*\/\s*-1;/,
    'expected .project-card--featured to span the full grid width via grid-column: 1 / -1',
  );
});

test('the project-cards section element carries both preview-section and preview-section--wide together', () => {
  assert.match(
    previewHtml,
    /<section class="preview-section preview-section--wide" id="project-cards">/,
    'expected the project-cards <section> to carry both classes on the same element',
  );
});

function getProjectCardsSection() {
  const opening =
    '<section class="preview-section preview-section--wide" id="project-cards">';
  const start = previewHtml.indexOf(opening);
  assert.notEqual(start, -1, 'project-cards <section> not found');

  let depth = 0;
  const sectionTags = /<section\b[^>]*>|<\/section>/g;
  sectionTags.lastIndex = start;
  for (const match of previewHtml.matchAll(sectionTags)) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) {
      return previewHtml.slice(start, match.index + match[0].length);
    }
  }

  assert.fail('project-cards <section> is not closed');
}

test('every <ul class="project-cards"> in the showcase is well-formed: equal open/close tags for li, div, svg, span, h4, and p', () => {
  const section = getProjectCardsSection();
  // [^"]* tolerates the real-cards list's added .project-cards--featured-pair
  // modifier class (PF-041 defect fix, docs/DECISION_LOG.md) — the demo
  // specimens list has no featured card, so it keeps the bare class.
  const lists = [
    ...section.matchAll(/<ul class="project-cards[^"]*">[\s\S]*?<\/ul>/g),
  ];
  assert.equal(
    lists.length,
    2,
    `expected exactly 2 <ul class="project-cards"> lists (the three real projects, and the demo specimens), found ${lists.length}`,
  );

  function countTag(html, tag) {
    const open = [...html.matchAll(new RegExp(`<${tag}[ >]`, 'g'))].length;
    const close = [...html.matchAll(new RegExp(`</${tag}>`, 'g'))].length;
    return { open, close };
  }

  for (const [index, list] of lists.entries()) {
    for (const tag of ['li', 'section', 'div', 'svg', 'span', 'h4', 'p', 'a']) {
      const { open, close } = countTag(list[0], tag);
      assert.equal(
        open,
        close,
        `list #${index + 1}: unbalanced <${tag}> tags (${open} opening, ${close} closing)`,
      );
    }
  }
});

test('showcase has no empty project media frame and uses three real FES carousel controls', () => {
  assert.doesNotMatch(
    previewHtml,
    /<div class="media-frame project-card__media">\s*<\/div>/,
  );
  assert.doesNotMatch(previewHtml, /project-card__frame-dots/);
  assert.equal(
    [...previewHtml.matchAll(/data-project-carousel-slide/g)].length,
    3,
  );
  assert.equal(
    [...previewHtml.matchAll(/data-project-carousel-indicator="\d"/g)].length,
    3,
  );
});

test('resolved image presentation cascade keeps a responsive 16:9 frame and cover-fitted image', () => {
  const frame = {
    tag: 'div',
    classes: ['media-frame', 'project-card__media'],
    ancestors: [
      { tag: 'li', classes: ['project-card'] },
      { tag: 'section', classes: ['project-card__frame'] },
    ],
  };
  assert.equal(resolveProperty(css, frame, 'aspect-ratio'), '16/9');
  assert.equal(resolveProperty(css, frame, 'width'), '100%');

  const image = {
    tag: 'img',
    classes: [],
    ancestors: [...frame.ancestors, frame],
  };
  assert.equal(resolveProperty(css, image, 'width'), '100%');
  assert.equal(resolveProperty(css, image, 'height'), '100%');
  assert.equal(resolveProperty(css, image, 'object-fit'), 'cover');
  assert.equal(resolveProperty(css, image, 'object-position'), 'center');
});

// PF-041 — shared with tests/home-render.test.mjs's real renderer-output
// check via tests/helpers/component-markup.mjs (docs/DECISION_LOG.md).
test('every .project-card / .project-card--featured <li> has a <ul class="project-cards"> as its real parent', () => {
  const section = getProjectCardsSection();
  expectItemsHaveListParent(section, {
    listTag: 'ul',
    listClass: 'project-cards',
    itemClass: 'project-card',
  });
});

test('every specimen with .project-card__link carries exactly one .project-card__action, and vice versa', () => {
  const section = getProjectCardsSection();
  expectLinkPairing(section, {
    cardClass: 'project-card',
    linkClass: 'project-card__link',
    pairedClass: 'project-card__action',
  });
});

test('non-interactive specimen has neither .project-card__link nor .project-card__action', () => {
  const section = getProjectCardsSection();
  // Matches each <li>...</li> individually (non-greedy per card, same
  // technique as the pairing test above) rather than searching for "Demo:
  // non-interactive" across the whole section, which would span every
  // card between the first <li> and that text and false-fail on their
  // unrelated content.
  const cards = [
    ...section.matchAll(/<li class="project-card[^"]*">[\s\S]*?<\/li>/g),
  ];
  const nonInteractive = cards.find((card) =>
    card[0].includes('Demo: non-interactive'),
  );
  assert.ok(nonInteractive, 'non-interactive demo specimen not found');
  // Matches only real class attributes, not the explanatory prose inside
  // the specimen (which intentionally names <code>.project-card__link</code>
  // as documentation) — a bare substring match would false-fail on that.
  assert.doesNotMatch(
    nonInteractive[0],
    /class="project-card__(link|action)"/,
    'the non-interactive specimen must contain neither element',
  );
});

test('resolved focus rule: .project-card__link:focus-visible sets outline: none, suppressed in favor of the card-level ring', () => {
  // .resolveProperty() deliberately excludes pseudo-class-bearing selectors
  // from its element-state matching (it answers "what applies in an
  // element's default state") — checking THIS exact selector's own
  // declaration, and that no second rule competes for the same selector,
  // is a different, simpler query the shared resolver isn't built for, so
  // it's done directly here instead of forcing an ill-fitting abstraction.
  const matches = [
    ...css.matchAll(/\.project-card__link:focus-visible\s*\{([^}]*)\}/g),
  ];
  assert.equal(
    matches.length,
    1,
    `expected exactly one .project-card__link:focus-visible rule, found ${matches.length}`,
  );
  assert.match(
    matches[0][1],
    /outline:\s*none;/,
    'expected .project-card__link:focus-visible to set outline: none',
  );
});

test('resolved focus rule: .project-card:has(.project-card__link:focus-visible) sets the full-card ring using the real focus-ring tokens, exactly once', () => {
  const matches = [
    ...css.matchAll(
      /\.project-card:has\(\.project-card__link:focus-visible\)\s*\{([^}]*)\}/g,
    ),
  ];
  assert.equal(
    matches.length,
    1,
    `expected exactly one .project-card:has(.project-card__link:focus-visible) rule, found ${matches.length} — a title-only or duplicate rule here would mean the ring doesn't reliably wrap the whole card`,
  );
  assert.match(
    matches[0][1],
    /outline:\s*var\(--focus-ring-width\)\s*solid\s*var\(--color-focus-ring\);/,
    'expected the card-level ring to use --focus-ring-width/--color-focus-ring',
  );
  assert.match(
    matches[0][1],
    /outline-offset:\s*2px;/,
    'expected outline-offset: 2px on the card-level ring',
  );
});

test('forced-colors mode does not redefine the project-card focus ring separately — the same unconditional outline rule already covers it', () => {
  // Unlike .capability-card (which uses box-shadow normally, dropped under
  // forced-colors, and needs an explicit outline swap just for that mode),
  // .project-card uses a plain `outline` unconditionally — outline-color is
  // one of the properties forced-colors mode already recolors to the
  // system highlight automatically, so no second, mode-specific rule
  // should exist. Its presence would mean the "single ring system" design
  // was quietly abandoned.
  const blocks = [
    ...css.matchAll(/@media \(forced-colors: active\)\s*\{([\s\S]*?)\n\}\n/g),
  ];
  const projectCardBlock = blocks.find((b) => /\.project-card\b/.test(b[1]));
  assert.ok(projectCardBlock, '.project-card forced-colors block not found');
  assert.doesNotMatch(
    projectCardBlock[1],
    /:focus-visible/,
    "expected no focus-visible-related rule inside .project-card's forced-colors block",
  );
  assert.match(
    projectCardBlock[1],
    /border:\s*1px solid CanvasText;/,
    'expected the forced-colors block to still supply the card boundary border',
  );
});

test('--color-focus-ring vs --color-canvas and vs --color-surface-1 are already covered by tests/design-tokens.test.mjs (no new pair needed)', () => {
  const tokenTestPath = fileURLToPath(
    new URL('../tests/design-tokens.test.mjs', import.meta.url),
  );
  const tokenTestSource = fs.readFileSync(tokenTestPath, 'utf8');
  assert.match(
    tokenTestSource,
    /\['color-focus-ring',\s*'color-canvas',\s*FOCUS_INDICATOR_MIN\]/,
    'expected the existing color-focus-ring vs color-canvas pair to still be present',
  );
  assert.match(
    tokenTestSource,
    /\['color-focus-ring',\s*'color-surface-1',\s*FOCUS_INDICATOR_MIN\]/,
    'expected the existing color-focus-ring vs color-surface-1 pair to still be present',
  );
});

// Real layout simulation using actual compiled token values, seeded from
// the resolver's answer for .project-cards' own max-width — not an
// assumption that the grid uses exactly the section's content width. Same
// methodology as tests/capability-card-layout.test.mjs.
function gutterPx(viewportPx) {
  const min = remToPx(1.25);
  const max = remToPx(3);
  const preferred = remToPx(1) + 0.02 * viewportPx;
  return Math.min(max, Math.max(min, preferred));
}

function simulateColumns(
  viewportPx,
  { containerWidePx, gridOwnMaxWidthPx, gapPx, minColPx, cardPaddingPx },
) {
  const sectionMax = Math.min(viewportPx, containerWidePx);
  const gutter = gutterPx(viewportPx);
  const sectionContentWidth = sectionMax - 2 * gutter;
  const contentWidth =
    gridOwnMaxWidthPx === null
      ? sectionContentWidth
      : Math.min(sectionContentWidth, gridOwnMaxWidthPx);

  if (viewportPx < remToPx(36)) {
    return {
      contentWidth,
      columns: 1,
      columnWidth: contentWidth,
      textWidth: contentWidth - cardPaddingPx,
    };
  }

  let columns = 1;
  while ((columns + 1) * minColPx + columns * gapPx <= contentWidth) {
    columns++;
  }
  const columnWidth = (contentWidth - (columns - 1) * gapPx) / columns;
  return {
    contentWidth,
    columns,
    columnWidth,
    textWidth: columnWidth - cardPaddingPx,
  };
}

test("project-cards grid: real column-count/width simulation at every required review width, accounting for the grid element's own resolved max-width", () => {
  const getToken = (name) => {
    const match = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
    assert.ok(match, `token --${name} not found in compiled CSS`);
    return match[1].trim();
  };

  const containerWideRem = parseFloat(getToken('container-wide'));
  const gapRem = parseFloat(getToken('gap-lg'));
  // .project-card__content's padding (space-5) is what actually insets the
  // card's text — the card itself has no padding.
  const contentPaddingRem = parseFloat(getToken('space-5'));

  const block = css.match(
    /@media \(width\s*>=\s*36em\)\s*\{\s*\.project-cards\s*\{([^}]*)\}\s*\}/,
  )[1];
  const minColMatch = block.match(/minmax\((\d+(?:\.\d+)?)rem,\s*1fr\)/);
  assert.ok(
    minColMatch,
    'could not read the minmax minimum column width from compiled CSS',
  );

  const resolvedMaxWidth = resolveProperty(
    css,
    { tag: 'ul', classes: ['project-cards'] },
    'max-width',
  );
  const gridOwnMaxWidthPx =
    resolvedMaxWidth === 'none' ? null : remToPx(parseFloat(resolvedMaxWidth));

  const config = {
    containerWidePx: remToPx(containerWideRem),
    gridOwnMaxWidthPx,
    gapPx: remToPx(gapRem),
    minColPx: remToPx(parseFloat(minColMatch[1])),
    cardPaddingPx: remToPx(contentPaddingRem) * 2,
  };

  const COMFORTABLE_TEXT_WIDTH_MIN = 200;
  const expectations = {
    320: { columns: 1 },
    375: { columns: 1 },
    768: { columns: 2 },
    1024: { columns: 2 },
    1440: { columns: 3 },
    1920: { columns: 3 },
  };

  for (const [viewport, expected] of Object.entries(expectations)) {
    const result = simulateColumns(Number(viewport), config);

    assert.ok(
      result.contentWidth <= Number(viewport) + 0.01,
      `at ${viewport}px, the grid's available content width (${result.contentWidth.toFixed(1)}px) exceeds the viewport itself`,
    );

    assert.equal(
      result.columns,
      expected.columns,
      `expected ${expected.columns} column(s) at ${viewport}px, got ${result.columns} (column width ${result.columnWidth.toFixed(1)}px, grid's own resolved max-width: ${resolvedMaxWidth})`,
    );

    assert.ok(
      result.textWidth >= COMFORTABLE_TEXT_WIDTH_MIN,
      `at ${viewport}px, each card's text area would be only ${result.textWidth.toFixed(1)}px — below the ${COMFORTABLE_TEXT_WIDTH_MIN}px comfortable floor`,
    );
  }
});
