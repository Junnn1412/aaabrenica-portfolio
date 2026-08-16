// Pure state-decision logic for the mobile menu toggle — no DOM access,
// deliberately separable from src/scripts/nav-toggle.js's DOM wiring so it
// can be unit-tested with plain node:test.
//
// `state` only ever holds { isDesktop, expanded } — a one-shot focus
// request is never stored *in* state (a prior draft did this and it could
// go stale: a second Escape while already collapsed would re-read a
// leftover `focusToggle: true` and refocus the toggle with no new
// request). Instead each dispatch returns a fresh, one-time `effect`
// alongside the new state, computed from the *current* state, so a no-op
// action deterministically returns `effect: null`.
export function deriveNavState(current, action) {
  switch (action.type) {
    case 'TOGGLE':
      return {
        state: { ...current, expanded: !current.expanded },
        effect: null,
      };
    case 'ESCAPE':
      if (current.isDesktop || !current.expanded) {
        return { state: current, effect: null };
      }
      return { state: { ...current, expanded: false }, effect: 'FOCUS_TOGGLE' };
    case 'ENTER_DESKTOP':
      return { state: { isDesktop: true, expanded: false }, effect: null };
    case 'ENTER_MOBILE':
      return {
        state: { isDesktop: false, expanded: false },
        effect: action.focusWasInNav ? 'FOCUS_TOGGLE' : null,
      };
    default:
      return { state: current, effect: null };
  }
}

export function toDom(state) {
  return {
    showToggle: !state.isDesktop,
    navHidden: state.isDesktop ? false : !state.expanded,
    ariaExpanded: String(state.expanded),
  };
}
