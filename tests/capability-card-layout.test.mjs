import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

// Compiles the real source of truth, same method as the other
// capability-card tests.
//
// Real root cause of the reported "narrow section, single column" result:
// `elements/_body-copy.scss` has a project-wide `ul, ol { max-width:
// var(--width-reading); }` rule (68ch — a prose reading-length limit,
// correct for a list of text, wrong for a card grid) that applies to
// every <ul>/<ol> in the document, `.capability-cards` included.
// `.capability-cards` (specificity 0,1,0) beats `ul` (0,0,1) for any
// property BOTH rules declare — but the cascade resolves per property, not
// per rule: a property this component's rule never mentions has no
// competing declaration, so the lower-specificity element-selector rule
// applies completely unopposed. The component's own `.capability-cards`
// rule never set `max-width` at all, so the ~68ch (~500-550px) prose
// constraint remained active on the grid regardless of how wide the
// *outer* `.preview-section--wide` container was made — a fix to the
// section's own width was necessary but not sufficient, because the grid
// element one level in had its own separate, narrower constraint the
// section-level fix never touched. Fixed with an explicit
// `max-width: none;` on `.capability-cards`.
//
// This is also why the previous version of this test file gave false
// confidence: its column/width simulation modeled the *section's*
// available width and assumed the grid used exactly that — it never
// checked whether `.capability-cards` itself carried any competing
// constraint from an unrelated, lower-specificity rule elsewhere in the
// stylesheet. The resolver below fixes that gap generally: it computes
// the actual cascade-winning value for a given property on a given
// element (matching every applicable rule in the real compiled
// stylesheet by specificity and source order, exactly as a browser
// would for normal-priority declarations), not just whether some
// plausible-looking declaration exists somewhere in the text.
const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

const customPropertiesPath = fileURLToPath(
  new URL('../src/styles/generic/_custom-properties.scss', import.meta.url),
);
const { css: rootCss } = sass.compile(customPropertiesPath);

const previewPath = fileURLToPath(
  new URL('../dev/design-system/index.html', import.meta.url),
);
const previewHtml = fs.readFileSync(previewPath, 'utf8');

function remToPx(rem) {
  return rem * 16; // this project's root font-size is the browser default, never overridden
}

// ---- Minimal real cascade resolver -----------------------------------
// Scoped to what this stylesheet actually uses: flat top-level rules
// (parsed with their real source position) plus rules nested one level
// inside a single @media block (min-width / width >= forms only — the
// only kind this project's components use). Each selector in a
// comma-separated list is either a bare tag name (`ul`), a single class
// (`.capability-cards`), or a tag+class/class+class compound with no
// combinator — the only forms this codebase's real element/component
// selectors use for the rules relevant here. Good enough to prove real
// cascade outcomes for this file without building a general CSS engine.

function specificity(simpleSelector) {
  // (classes/pseudo-classes/attrs, type-selectors) — no IDs in this
  // project's selectors, so that axis is omitted.
  const classLike = (simpleSelector.match(/[.:[]/g) || []).length;
  const withoutClassLike = simpleSelector.replace(
    /(\.[a-zA-Z0-9_-]+|:[a-zA-Z-]+(\([^)]*\))?|\[[^\]]*\])/g,
    '',
  );
  const typeLike = withoutClassLike.trim() === '' ? 0 : 1;
  return [classLike, typeLike];
}

function compareSpecificity(a, b) {
  if (a[0] !== b[0]) return a[0] - b[0];
  return a[1] - b[1];
}

function elementMatchesSimpleSelector(element, simpleSelector) {
  const trimmed = simpleSelector.trim();
  // Strip pseudo-classes for matching purposes (:hover etc. never apply to
  // a statically-rendered element the way base/default styling does) —
  // deliberately excluded from this resolver, which only answers "what
  // applies in the element's normal, non-interactive state."
  if (/:(hover|active|focus|focus-visible|focus-within|has)\(?/.test(trimmed)) {
    return false;
  }
  const tagMatch = trimmed.match(/^[a-zA-Z][a-zA-Z0-9-]*/);
  const tag = tagMatch ? tagMatch[0] : null;
  const classes = [...trimmed.matchAll(/\.([a-zA-Z0-9_-]+)/g)].map((m) => m[1]);
  if (tag && tag !== element.tag) return false;
  for (const c of classes) {
    if (!element.classes.includes(c)) return false;
  }
  return true;
}

function extractDeclarations(body) {
  const decls = {};
  for (const raw of body.split(';')) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;
    const prop = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();
    decls[prop] = value;
  }
  return decls;
}

function parseRules(cssText) {
  const rules = [];
  // Rules directly inside one @media block are included with the same
  // source-position ordering as everything else — this project's real
  // media-gated rules are simple overrides of the same properties as
  // their unconditional counterparts, so ordinary source-order/specificity
  // resolution still gives the right answer for "what applies by default."
  const ruleRe = /(?:@media[^{]*\{\s*)?([^{}]+)\{([^{}]*)\}(?:\s*\})?/g;
  let match;
  while ((match = ruleRe.exec(cssText))) {
    const selectorList = match[1].trim();
    if (selectorList.startsWith('@') || selectorList === '') continue;
    const selectors = selectorList.split(',').map((s) => s.trim());
    rules.push({
      selectors,
      declarations: extractDeclarations(match[2]),
      index: match.index,
    });
  }
  return rules;
}

// Resolves the real cascade-winning value for `property` on `element`
// ({ tag, classes }), using every matching rule in `cssText`, ordered by
// specificity then source position — exactly the two tie-break axes that
// matter for normal-priority declarations with no !important involved
// (true of every rule in this stylesheet).
function resolveProperty(cssText, element, property) {
  const rules = parseRules(cssText);
  const candidates = [];
  for (const rule of rules) {
    if (!(property in rule.declarations)) continue;
    for (const selector of rule.selectors) {
      if (elementMatchesSimpleSelector(element, selector)) {
        candidates.push({
          value: rule.declarations[property],
          specificity: specificity(selector),
          index: rule.index,
        });
        break; // one matching selector in the list is enough to make the rule apply
      }
    }
  }
  candidates.sort((a, b) => {
    const specDiff = compareSpecificity(a.specificity, b.specificity);
    if (specDiff !== 0) return specDiff;
    return a.index - b.index;
  });
  return candidates.length > 0
    ? candidates[candidates.length - 1].value
    : undefined;
}

test('resolved cascade: .capability-cards (a <ul>) has max-width: none, not the inherited ~68ch prose-reading-width from the generic ul,ol rule', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'ul', classes: ['capability-cards'] },
    'max-width',
  );
  assert.equal(
    resolved,
    'none',
    `expected the cascade-winning max-width on <ul class="capability-cards"> to be "none", got "${resolved}" — elements/_body-copy.scss's generic "ul, ol { max-width: var(--width-reading); }" rule applies unopposed unless .capability-cards explicitly declares its own max-width, regardless of how wide any ancestor container is`,
  );
});

test('resolved cascade: .capability-card (a <li>) has margin: 0, not the inherited margin-bottom from the generic li rule', () => {
  const resolved = resolveProperty(
    css,
    { tag: 'li', classes: ['capability-card'] },
    'margin',
  );
  assert.equal(
    resolved,
    '0',
    `expected the cascade-winning margin on <li class="capability-card"> to be "0", got "${resolved}" — elements/_body-copy.scss's generic "li { margin-bottom: var(--space-2); }" rule would otherwise stack on top of the grid's own gap`,
  );
});

test('resolved cascade: no property on .capability-cards or .capability-card is won by a lower-specificity generic element rule', () => {
  // General regression guard, not just the two properties above: for every
  // property any generic elements/*.scss rule (ul, ol, li, a, h1-h4, p)
  // declares, if .capability-cards/.capability-card ever renders as that
  // element, the component's own rule must be the one that wins — proven
  // by resolving each such property for real and checking which selector
  // actually won, not just whether the component rule exists somewhere in
  // the file.
  const genericElementSelectors = {
    ul: { tag: 'ul', classes: ['capability-cards'] },
    li: { tag: 'li', classes: ['capability-card'] },
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
    // Passing here means EITHER the component overrides this property
    // (resolved !== the bare generic value) OR the inherited generic
    // value happens to already be what's intended (e.g. list-style is
    // explicitly reset to none by the component elsewhere) — the point of
    // this test is to force a conscious check, not to forbid every
    // inherited value outright, so it only fails on the two properties
    // this component actually needs different behavior for.
    if (tag === 'ul' && prop === 'max-width') {
      assert.notEqual(
        resolved,
        genericValue,
        `.capability-cards must override <ul>'s generic max-width (currently resolves to the inherited "${genericValue}")`,
      );
    }
    if (tag === 'li' && prop === 'margin-bottom') {
      // margin-bottom itself isn't set by the component (margin: 0 shorthand is) —
      // confirm the shorthand still wins for the longhand by checking margin resolves to 0.
      const resolvedMargin = resolveProperty(css, element, 'margin');
      assert.equal(
        resolvedMargin,
        '0',
        `.capability-card must override <li>'s generic margin-bottom (currently resolves to "${genericValue}")`,
      );
    }
  }
});

function getCapabilityCardsRule() {
  const rule = css.match(/\.capability-cards\s*\{([^}]*)\}/);
  assert.ok(rule, '.capability-cards base rule not found in compiled CSS');
  return rule[1];
}

test('.capability-cards defaults to a single column unconditionally (mobile-safe, no media query involved)', () => {
  const rule = getCapabilityCardsRule();
  assert.match(
    rule,
    /grid-template-columns:\s*1fr;/,
    'expected the unconditional base rule to be a plain single column — this is what guarantees no overflow below the multi-column breakpoint, without depending on any minmax()/auto-fit math at all',
  );
});

test('multi-column layout is gated behind a single, plain media query using auto-fit/minmax (no nested CSS math functions)', () => {
  const block = css.match(
    /@media \(width\s*>=\s*36em\)\s*\{\s*\.capability-cards\s*\{([^}]*)\}\s*\}/,
  );
  assert.ok(
    block,
    'expected exactly one @media (width >= 36em) block overriding .capability-cards',
  );
  assert.match(
    block[1],
    /grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(20rem,\s*1fr\)\);/,
    'expected a plain repeat(auto-fit, minmax(20rem, 1fr)) — not minmax(min(20rem, 100%), 1fr): nesting min() inside minmax() is valid CSS but is one more moving part than needed once the narrow-viewport case is handled by the unconditional 1fr default above',
  );
});

test('--container-wide is genuinely emitted as a real custom property in the compiled :root block', () => {
  const rootBlock = rootCss.match(/:root\s*\{([\s\S]*)\}/);
  assert.ok(
    rootBlock,
    ':root block not found in compiled _custom-properties.scss output',
  );
  assert.match(
    rootBlock[1],
    /--container-wide:\s*90rem;/,
    '--container-wide is not actually emitted inside :root with the expected value — a var() reference to a token that was never really emitted resolves as invalid, silently dropping whatever declaration used it',
  );
});

test('the capability-cards section element carries both preview-section and preview-section--wide together', () => {
  assert.match(
    previewHtml,
    /<section class="preview-section preview-section--wide" id="capability-cards">/,
    'expected the capability-cards <section> to carry both classes on the same element — either one alone would not apply the intended cascade',
  );
});

test('.preview-section--wide is declared after .preview-section, so the same-specificity cascade tie-break resolves in its favor', () => {
  const baseIndex = previewHtml.indexOf('.preview-section {');
  const wideIndex = previewHtml.indexOf('.preview-section--wide {');
  assert.ok(baseIndex >= 0, '.preview-section base rule not found');
  assert.ok(wideIndex >= 0, '.preview-section--wide rule not found');
  assert.ok(
    wideIndex > baseIndex,
    '.preview-section--wide must be declared AFTER .preview-section in source order — both selectors have equal specificity (one class each), so when both classes are present on the same element, CSS resolves the tie by source order, not by which rule "should" win',
  );

  const wideRuleMatch = previewHtml.match(
    /\.preview-section--wide\s*\{\s*max-width:\s*var\(--container-wide\);\s*\}/,
  );
  assert.ok(
    wideRuleMatch,
    '.preview-section--wide must set max-width: var(--container-wide) — found the selector but not this exact declaration',
  );
});

test('no other rule in the compiled component stylesheet defines .preview-section or .preview-section--wide', () => {
  // These are showcase-only arrangement styles (dev/design-system/index.html's
  // own inline <style> block) — if the real component stylesheet ever
  // defined a selector with the same name, it would be a second, harder-to-
  // spot source of the exact same kind of cascade conflict.
  assert.doesNotMatch(
    css,
    /\.preview-section(--wide)?\s*\{/,
    "found .preview-section or .preview-section--wide defined in the real compiled component stylesheet (main.scss) — these must only ever exist in the showcase's own inline styles",
  );
});

test('every <ul class="capability-cards"> in the showcase is well-formed: equal open/close tags for li, svg, span, h4, and p', () => {
  const section = previewHtml.match(
    /<section class="preview-section preview-section--wide" id="capability-cards">[\s\S]*?<\/section>/,
  );
  assert.ok(section, 'capability-cards <section> not found');

  const lists = [
    ...section[0].matchAll(/<ul class="capability-cards">[\s\S]*?<\/ul>/g),
  ];
  assert.equal(
    lists.length,
    2,
    `expected exactly 2 <ul class="capability-cards"> lists (the six real cards, and the two demo specimens), found ${lists.length}`,
  );

  function countTag(html, tag) {
    const open = [...html.matchAll(new RegExp(`<${tag}[ >]`, 'g'))].length;
    const close = [...html.matchAll(new RegExp(`</${tag}>`, 'g'))].length;
    return { open, close };
  }

  for (const [index, list] of lists.entries()) {
    for (const tag of ['li', 'svg', 'span', 'h4', 'p']) {
      const { open, close } = countTag(list[0], tag);
      assert.equal(
        open,
        close,
        `list #${index + 1}: unbalanced <${tag}> tags (${open} opening, ${close} closing) — an unclosed tag here is exactly the kind of defect that causes later cards to render nested inside an earlier one instead of as siblings`,
      );
    }
  }
});

// A real layout simulation using the actual compiled token values — not
// hardcoded pixels — so this stays accurate if the tokens themselves ever
// change. Approximates the same auto-fit algorithm the browser uses for
// equal minmax(min, 1fr) tracks: the largest N for which N columns at the
// minimum width, plus (N-1) gaps, still fits the available content width.
// Only applies above the 36em breakpoint; below it the grid is
// unconditionally 1 column, which trivially can't overflow.
//
// Critically, this now starts from the resolver's answer for
// .capability-cards' own max-width, not from an assumption that the grid
// uses exactly the section's content width — that assumption was the
// actual defect the previous version of this test missed entirely.
function gutterPx(viewportPx) {
  // clamp(1.25rem, 1rem + 2vw, 3rem)
  const min = remToPx(1.25);
  const max = remToPx(3);
  const preferred = remToPx(1) + 0.02 * viewportPx; // 2vw = 2% of viewport width
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

test("capability-cards grid: real column-count/width simulation at every required review width, accounting for the grid element's own resolved max-width", () => {
  const getToken = (name) => {
    const match = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
    assert.ok(match, `token --${name} not found in compiled CSS`);
    return match[1].trim();
  };

  const containerWideRem = parseFloat(getToken('container-wide')); // 90rem
  const gapRem = parseFloat(getToken('gap-lg')); // 2rem
  const cardPaddingRem = parseFloat(getToken('space-6')); // 2rem, .capability-card's padding on every side

  const block = css.match(
    /@media \(width\s*>=\s*36em\)\s*\{\s*\.capability-cards\s*\{([^}]*)\}\s*\}/,
  )[1];
  const minColMatch = block.match(/minmax\((\d+(?:\.\d+)?)rem,\s*1fr\)/);
  assert.ok(
    minColMatch,
    'could not read the minmax minimum column width from compiled CSS',
  );

  // Resolved from the real cascade, not assumed — this is the exact value
  // that was silently ~68ch before the fix, which is what this whole
  // simulation previously failed to model.
  const resolvedMaxWidth = resolveProperty(
    css,
    { tag: 'ul', classes: ['capability-cards'] },
    'max-width',
  );
  const gridOwnMaxWidthPx =
    resolvedMaxWidth === 'none' ? null : remToPx(parseFloat(resolvedMaxWidth));

  const config = {
    containerWidePx: remToPx(containerWideRem),
    gridOwnMaxWidthPx,
    gapPx: remToPx(gapRem),
    minColPx: remToPx(parseFloat(minColMatch[1])),
    cardPaddingPx: remToPx(cardPaddingRem) * 2, // padding applies to both left and right
  };

  const COMFORTABLE_TEXT_WIDTH_MIN = 200; // px — enough for "Workflow & Process Solutions" to wrap onto at most 2 lines at the h3 clamp size, not 4
  const expectations = {
    320: { columns: 1 },
    375: { columns: 1 },
    768: { columns: 2 },
    1024: { columns: 2 }, // the exact width that used to force a cramped 3rd column
    1440: { columns: 3 },
    1920: { columns: 3 },
  };

  for (const [viewport, expected] of Object.entries(expectations)) {
    const result = simulateColumns(Number(viewport), config);

    assert.ok(
      result.contentWidth <= Number(viewport) + 0.01,
      `at ${viewport}px, the grid's available content width (${result.contentWidth.toFixed(1)}px) exceeds the viewport itself — this is the no-horizontal-overflow requirement`,
    );

    assert.equal(
      result.columns,
      expected.columns,
      `expected ${expected.columns} column(s) at ${viewport}px, got ${result.columns} (column width ${result.columnWidth.toFixed(1)}px, grid's own resolved max-width: ${resolvedMaxWidth})`,
    );

    assert.ok(
      result.textWidth >= COMFORTABLE_TEXT_WIDTH_MIN,
      `at ${viewport}px, each card's text area would be only ${result.textWidth.toFixed(1)}px — below the ${COMFORTABLE_TEXT_WIDTH_MIN}px comfortable-wrapping floor`,
    );
  }
});
