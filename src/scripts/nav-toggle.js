import { deriveNavState, toDom } from './nav-toggle-state.js';

function initNavToggle() {
  const toggle = document.querySelector('.site-header__menu-toggle');
  const nav = document.getElementById('primary-navigation');
  const label = toggle?.querySelector('.site-header__menu-label');
  const openIcon = toggle?.querySelector('.site-header__menu-icon--open');
  const closeIcon = toggle?.querySelector('.site-header__menu-icon--close');

  // Atomic: every required element is resolved before any DOM mutation
  // happens. If any is missing, bail out having touched nothing — the
  // server-rendered baseline (toggle hidden, nav visible) stays intact.
  if (!toggle || !nav || !label || !openIcon || !closeIcon) return;

  const desktopQuery = window.matchMedia('(min-width: 48em)');
  let state = { isDesktop: desktopQuery.matches, expanded: false };

  function applyDom() {
    const dom = toDom(state);
    toggle.hidden = !dom.showToggle;
    toggle.setAttribute('aria-expanded', dom.ariaExpanded);
    label.textContent = state.expanded ? 'Close' : 'Menu';
    openIcon.hidden = state.expanded;
    closeIcon.hidden = !state.expanded;
    return dom;
  }

  function dispatch(action) {
    const result = deriveNavState(state, action);
    state = result.state;
    const dom = applyDom(); // reveals/labels the toggle; nav.hidden not yet touched
    if (result.effect === 'FOCUS_TOGGLE') toggle.focus(); // BEFORE nav is hidden
    nav.hidden = dom.navHidden; // hide nav LAST
  }

  applyDom(); // initial render from the real starting viewport state

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
