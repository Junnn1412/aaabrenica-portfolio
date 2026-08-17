// Extracted from tests/capability-card-layout.test.mjs (PF-032) for its
// second real caller (tests/project-card-layout.test.mjs, PF-033) — see
// docs/DECISION_LOG.md's revisit condition for the original capability-card
// grid-width defect, which is exactly what this resolver exists to catch:
// a component class can have higher selector specificity than a generic
// element rule (e.g. `.capability-cards` vs. bare `ul`) and still lose a
// specific property to it, because the cascade resolves per property, not
// per rule — a class that never declares a property has no competing
// declaration for it at all. Presence-only checks ("does .foo { max-width:
// none } appear somewhere in the file") can't catch that; only resolving
// the real winning declaration, the way a browser would, can.
//
// Scoped to what this project's real stylesheets actually use: flat
// top-level rules (parsed with their real source position) plus rules
// nested one level inside a single @media block (`min-width`/`width >=`
// forms only). Each selector in a comma-separated list is either a bare
// tag name (`ul`), a single class (`.capability-cards`), or a tag+class/
// class+class compound with no combinator — the only forms this codebase's
// real element/component selectors use for the rules relevant here. Good
// enough to prove real cascade outcomes for this project without building
// a general CSS engine.

export function remToPx(rem) {
  return rem * 16; // this project's root font-size is the browser default, never overridden
}

export function specificity(simpleSelector) {
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

export function compareSpecificity(a, b) {
  if (a[0] !== b[0]) return a[0] - b[0];
  return a[1] - b[1];
}

export function elementMatchesSimpleSelector(element, simpleSelector) {
  const trimmed = simpleSelector.trim();
  // Pseudo-elements (::selection, ::before, ::after, ...) target a
  // generated/pseudo box, never the element itself — without this check
  // one with no tag or class of its own (e.g. generic/_document.scss's
  // bare `::selection { ... }`) would vacuously "match" any tag/class
  // query below (empty tag check passes, empty class list has nothing to
  // fail on), and its "::" would even inflate its measured specificity
  // above a real one-class selector, letting it silently win properties
  // it was never actually declaring for that element.
  if (trimmed.includes('::')) {
    return false;
  }
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

export function extractDeclarations(body) {
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

export function parseRules(cssText) {
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
export function resolveProperty(cssText, element, property) {
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
