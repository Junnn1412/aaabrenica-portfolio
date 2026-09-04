import { deriveNavState, toDom } from './nav-toggle-state.js';

function initNavToggle() {
  const toggle = document.querySelector('.site-header__menu-toggle');
  const nav = document.getElementById('primary-navigation');

  // Atomic: both required elements are resolved before any DOM mutation
  // happens. If either is missing, bail out having touched nothing — the
  // server-rendered baseline (toggle hidden, nav visible) stays intact.
  if (!toggle || !nav) return;

  // Header/nav overflow-defect follow-up (round 2) — must stay numerically
  // equal to spacing.$bp-xl (src/styles/settings/_spacing.scss), and to
  // the matching @media (min-width: spacing.$bp-xl) blocks in
  // components/_site-header.scss and components/_site-nav.scss. A plain JS
  // literal can't reference a Sass variable directly; if the token value
  // ever changes, this must change with it (see docs/DECISION_LOG.md).
  const desktopQuery = window.matchMedia('(min-width: 80em)');
  let state = { isDesktop: desktopQuery.matches, expanded: false };

  // The one function that syncs every DOM-visible consequence of `state`.
  // Mobile-toggle redesign — `aria-label` is now the toggle's one real
  // accessible name (no visible text label to sync); the hamburger/X bars
  // are pure CSS, driven directly by the `aria-expanded` attribute this
  // function sets, so there is no separate icon-hidden bookkeeping left to
  // fall out of sync.
  function applyDom() {
    const dom = toDom(state);
    toggle.hidden = !dom.showToggle;
    toggle.setAttribute('aria-expanded', dom.ariaExpanded);
    toggle.setAttribute(
      'aria-label',
      state.expanded ? 'Close navigation' : 'Open navigation',
    );
    return dom;
  }

  function dispatch(action) {
    const result = deriveNavState(state, action);
    state = result.state;
    const dom = applyDom(); // reveals/labels the toggle; nav.hidden not yet touched
    if (result.effect === 'FOCUS_TOGGLE') toggle.focus(); // BEFORE nav is hidden
    nav.hidden = dom.navHidden; // hide nav LAST
  }

  // Initial render from the real starting viewport state. Deliberately not
  // routed through dispatch() (no action fired it, so there's no `effect`
  // to react to) — but nav.hidden must still be synced here explicitly,
  // the exact same way dispatch() syncs it after every state change. A
  // prior version of this function called applyDom() alone and left
  // nav.hidden untouched at load, so a mobile page load never collapsed
  // the nav at all — it stayed exactly as the server rendered it (fully
  // expanded), regardless of viewport. Guarded by
  // tests/nav-toggle.test.mjs.
  const initialDom = applyDom();
  nav.hidden = initialDom.navHidden;

  toggle.addEventListener('click', () => dispatch({ type: 'TOGGLE' }));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') dispatch({ type: 'ESCAPE' });
  });

  desktopQuery.addEventListener('change', (event) => {
    if (event.matches) {
      dispatch({ type: 'ENTER_DESKTOP' });
    } else {
      dispatch({
        type: 'ENTER_MOBILE',
        focusWasInNav: nav.contains(document.activeElement),
      });
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavToggle);
} else {
  initNavToggle();
}
