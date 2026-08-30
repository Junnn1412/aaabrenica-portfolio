// PF-041 — structural markup-contract assertions shared between the six
// existing *-layout.test.mjs/cta-section.test.mjs files (which assert
// against dev/design-system/index.html's hand-authored specimens) and
// tests/home-render.test.mjs (which asserts against the new renderers'
// real output). Extracting these into one place means the showcase markup
// and the renderer output are checked against a single shared contract,
// not two independently-maintained descriptions of it — see
// docs/DECISION_LOG.md's PF-041 entry.
//
// Deliberately scoped to structural/markup-contract checks only (list
// parentage, item counts, link/action pairing, decorative-icon a11y,
// section-level action placement). Cascade-resolution and grid
// column-count/pixel-simulation checks stay local to each *-layout test
// file — those are about the compiled stylesheet or the showcase's own
// specific wide-container arrangement, not the general markup contract a
// renderer must reproduce.
import assert from 'node:assert/strict';

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Asserts `html` contains exactly one <listTag class="listClass[...]">...</listTag>
// (the list's own class attribute may carry additional modifier classes
// after `listClass`, e.g. "project-cards project-cards--featured-pair" —
// same tolerance the item/card matchers below already have) with exactly
// `count` <li class="itemClass"> entries, all of which are real children of
// that one list (none stray elsewhere in `html`). Returns the matched
// list's own HTML so callers can run further checks against it.
export function expectSingleList(
  html,
  { listTag, listClass, itemClass, count },
) {
  const listRe = new RegExp(
    `<${listTag} class="${escapeRegExp(listClass)}[^"]*">[\\s\\S]*?<\\/${listTag}>`,
    'g',
  );
  const lists = [...html.matchAll(listRe)];
  assert.equal(
    lists.length,
    1,
    `expected exactly 1 <${listTag} class="${listClass}">, found ${lists.length}`,
  );

  const itemRe = new RegExp(
    `<li class="${escapeRegExp(itemClass)}(?:["\\s])`,
    'g',
  );
  const itemsInsideList = [...lists[0][0].matchAll(itemRe)].length;
  const itemsAnywhere = [...html.matchAll(itemRe)].length;
  assert.equal(
    itemsInsideList,
    count,
    `expected ${count} <li class="${itemClass}"> inside <${listTag} class="${listClass}">, found ${itemsInsideList}`,
  );
  assert.equal(
    itemsInsideList,
    itemsAnywhere,
    `every .${itemClass} must be inside <${listTag} class="${listClass}"> — found one outside it`,
  );
  return lists[0][0];
}

// Asserts every <itemTag class="itemClass..."> anywhere in `html` is a
// descendant of SOME <listTag class="listClass[...]">...</listTag> (any
// number of lists, each optionally carrying additional modifier classes) —
// the multi-list-aware version of expectSingleList, for showcase sections
// that demonstrate both real and demo specimen groups.
export function expectItemsHaveListParent(
  html,
  { listTag, listClass, itemTag = 'li', itemClass },
) {
  const listRe = new RegExp(
    `<${listTag} class="${escapeRegExp(listClass)}[^"]*">[\\s\\S]*?<\\/${listTag}>`,
    'g',
  );
  const lists = [...html.matchAll(listRe)];
  const itemRe = new RegExp(
    `<${itemTag} class="${escapeRegExp(itemClass)}(?:["\\s])`,
    'g',
  );
  const itemsInsideLists = lists.reduce(
    (total, list) => total + [...list[0].matchAll(itemRe)].length,
    0,
  );
  const itemsAnywhere = [...html.matchAll(itemRe)].length;
  assert.equal(
    itemsInsideLists,
    itemsAnywhere,
    `found ${itemsAnywhere} <${itemTag} class="${itemClass}"> but only ${itemsInsideLists} are inside a <${listTag} class="${listClass}">`,
  );
  assert.ok(
    itemsAnywhere > 0,
    `expected at least one <${itemTag} class="${itemClass}"> specimen`,
  );
  return itemsAnywhere;
}

// Per-card pairing rule shared by .capability-card (link/arrow) and
// .project-card (link/action): every card carrying `linkClass` must carry
// exactly one `pairedClass`, and every card without it must carry zero.
export function expectLinkPairing(
  html,
  { cardTag = 'li', cardClass, linkClass, pairedClass },
) {
  const cards = [
    ...html.matchAll(
      new RegExp(
        `<${cardTag} class="${escapeRegExp(cardClass)}[^"]*">[\\s\\S]*?<\\/${cardTag}>`,
        'g',
      ),
    ),
  ];
  assert.ok(cards.length > 0, 'expected at least one card specimen');

  for (const [index, card] of cards.entries()) {
    const hasLink = new RegExp(`class="${escapeRegExp(linkClass)}"`).test(
      card[0],
    );
    const pairedCount = [
      ...card[0].matchAll(
        new RegExp(`class="${escapeRegExp(pairedClass)}"`, 'g'),
      ),
    ].length;
    if (hasLink) {
      assert.equal(
        pairedCount,
        1,
        `card #${index + 1} has .${linkClass} but ${pairedCount} .${pairedClass} element(s) — every linked card must carry exactly one`,
      );
    } else {
      assert.equal(
        pairedCount,
        0,
        `card #${index + 1} has no .${linkClass} but carries .${pairedClass} — a non-interactive card must have neither`,
      );
    }
  }
}

// Every <svg> in `html` must be decorative: aria-hidden="true" and
// focusable="false". `count`, when given, asserts the exact icon count too.
export function expectDecorativeIcons(html, { count } = {}) {
  const icons = [...html.matchAll(/<svg([^>]*)>/g)];
  if (count !== undefined) {
    assert.equal(
      icons.length,
      count,
      `expected ${count} icons, found ${icons.length}`,
    );
  }
  for (const [index, match] of icons.entries()) {
    assert.match(
      match[1],
      /aria-hidden="true"/,
      `icon #${index + 1} missing aria-hidden="true"`,
    );
    assert.match(
      match[1],
      /focusable="false"/,
      `icon #${index + 1} missing focusable="false"`,
    );
  }
}

// Every <span class="badgeClass"...> must carry aria-hidden="true"
// (decorative numbered badges — ordinal semantics come from the real
// list structure, not the visible digit).
export function expectAriaHiddenBadges(html, { badgeClass, count }) {
  const badges = [
    ...html.matchAll(
      new RegExp(`<span class="${escapeRegExp(badgeClass)}"([^>]*)>`, 'g'),
    ),
  ];
  assert.equal(
    badges.length,
    count,
    `expected ${count} badges, found ${badges.length}`,
  );
  for (const [index, match] of badges.entries()) {
    assert.match(
      match[1],
      /aria-hidden="true"/,
      `badge #${index + 1} missing aria-hidden="true"`,
    );
  }
}

// process-steps/trust-list pattern: exactly one <a> in `html`, entirely
// outside `listHtml` (not nested at any depth), wrapped in
// <p class="actionClass"> and appearing structurally after the list.
export function expectSingleSectionAction(
  html,
  { listHtml, actionClass, linkHref, linkText, variant },
) {
  const links = [...html.matchAll(/<a\s/g)].length;
  assert.equal(links, 1, `expected exactly one <a>, found ${links}`);

  assert.doesNotMatch(
    listHtml,
    /<a\s/,
    'the section-level link must not be a descendant of the list at any depth',
  );

  const actionRe = variant
    ? new RegExp(
        `<p class="${escapeRegExp(actionClass)}"><a class="action-link action-link--${escapeRegExp(variant)}" href="${escapeRegExp(linkHref)}">[\\s\\S]*?<span class="action-link__label">${escapeRegExp(linkText)}<\\/span>[\\s\\S]*?<\\/a><\\/p>`,
      )
    : new RegExp(
        `<p class="${escapeRegExp(actionClass)}"><a href="${escapeRegExp(linkHref)}">${escapeRegExp(linkText)}<\\/a><\\/p>`,
      );
  const action = html.match(actionRe);
  assert.ok(
    action,
    `expected the ${variant ?? 'plain'} link wrapped by <p class="${actionClass}">`,
  );
  assert.ok(
    html.indexOf(listHtml) + listHtml.length <= html.indexOf(action[0]),
    `the .${actionClass} element must appear after the closing list tag, not before or inside it`,
  );
}

export function expectNoClass(html, className) {
  assert.doesNotMatch(
    html,
    new RegExp(`class="[^"]*\\b${escapeRegExp(className)}\\b[^"]*"`),
    `must not use the .${className} class anywhere`,
  );
}

export function expectNoInteractiveChildren(html, { itemClass }) {
  const withControls = [
    ...html.matchAll(
      new RegExp(
        `<li class="${escapeRegExp(itemClass)}">[\\s\\S]*?<(a|button)[\\s\\S]*?<\\/li>`,
        'g',
      ),
    ),
  ].length;
  assert.equal(
    withControls,
    0,
    `no .${itemClass} should contain a link or button`,
  );
}

// .cta panel pattern: `count` panels, each with exactly one interactive
// element using `actionClass`.
export function expectCtaPanels(html, { count, actionClass }) {
  const panels = [
    ...html.matchAll(/<div class="cta"(?: [^>]*)?>[\s\S]*?<\/div>/g),
  ];
  assert.equal(
    panels.length,
    count,
    `expected ${count} .cta panels, found ${panels.length}`,
  );
  for (const [index, panel] of panels.entries()) {
    const links = [...panel[0].matchAll(/<a\s/g)].length;
    assert.equal(
      links,
      1,
      `panel #${index + 1}: expected exactly one <a>, found ${links}`,
    );
    assert.match(
      panel[0],
      new RegExp(`<a class="${escapeRegExp(actionClass)}"`),
      `panel #${index + 1}: expected the action link to use .${actionClass}`,
    );
  }
  return panels.map((p) => p[0]);
}
