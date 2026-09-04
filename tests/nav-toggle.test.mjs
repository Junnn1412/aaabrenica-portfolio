import { test } from 'node:test';
import assert from 'node:assert/strict';

// Guards the real DOM-wiring bug AAA's browser review found: on a fresh
// mobile page load, the nav was already expanded and the toggle read
// "Close" — src/scripts/nav-toggle.js's initial `applyDom()` call never
// touched `nav.hidden` (only dispatch() did), so the nav's collapsed state
// was never actually applied at load. src/scripts/nav-toggle-state.js's
// pure `deriveNavState`/`toDom` functions (tests/nav-toggle-state.test.mjs)
// were already fully tested and were never the bug — the gap was entirely
// in this file's DOM-wiring, which had no test coverage at all before now.
//
// No DOM library is installed (none may be added without approval), so
// this hand-rolls the minimal `document`/`window` surface
// src/scripts/nav-toggle.js actually touches: querySelector,
// getElementById, addEventListener/dispatch, matchMedia's `.matches` +
// change listener, and each element's `.hidden`/`.setAttribute`/`.focus`/
// `.contains`. `nav-toggle.js` runs `initNavToggle()` as a *module-load-time
// side effect*, so each test imports it fresh via a unique `?case=` query
// string (Node's ESM loader treats a different query string as a distinct
// module instance) after installing that test's own globals — no shared
// state leaks between tests.

function makeElement() {
  const listeners = {};
  return {
    hidden: false,
    _attrs: {},
    focused: false,
    setAttribute(name, value) {
      this._attrs[name] = String(value);
    },
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(this._attrs, name)
        ? this._attrs[name]
        : null;
    },
    addEventListener(type, cb) {
      (listeners[type] ??= []).push(cb);
    },
    dispatchEvent(type, event) {
      for (const cb of listeners[type] ?? []) cb(event);
    },
    focus() {
      this.focused = true;
    },
    contains() {
      return false;
    },
  };
}

function installDom({ isDesktop }) {
  const toggle = makeElement();
  const nav = makeElement();
  const documentListeners = {};
  const mediaListeners = [];
  const mediaQueryList = {
    matches: isDesktop,
    addEventListener(type, cb) {
      mediaListeners.push(cb);
    },
  };

  globalThis.document = {
    readyState: 'complete',
    activeElement: null,
    querySelector(selector) {
      return selector === '.site-header__menu-toggle' ? toggle : null;
    },
    getElementById(id) {
      return id === 'primary-navigation' ? nav : null;
    },
    addEventListener(type, cb) {
      (documentListeners[type] ??= []).push(cb);
    },
  };
  globalThis.window = {
    matchMedia() {
      return mediaQueryList;
    },
  };

  return {
    toggle,
    nav,
    triggerMediaChange(matches) {
      mediaQueryList.matches = matches;
      for (const cb of mediaListeners) cb({ matches });
    },
  };
}

let caseId = 0;
function freshNavToggleModule() {
  caseId += 1;
  return import(`../src/scripts/nav-toggle.js?case=${caseId}`);
}

test('fresh mobile load: nav starts hidden and the toggle starts closed with the correct accessible name — the exact bug AAA reported', async () => {
  const { toggle, nav } = installDom({ isDesktop: false });
  await freshNavToggleModule();

  assert.equal(toggle.hidden, false, 'the toggle should be visible on mobile');
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(toggle.getAttribute('aria-label'), 'Open navigation');
  assert.equal(
    nav.hidden,
    true,
    'the nav must start collapsed on a fresh mobile load',
  );
});

test('fresh desktop load: the toggle stays hidden and the nav is always visible', async () => {
  const { toggle, nav } = installDom({ isDesktop: true });
  await freshNavToggleModule();

  assert.equal(toggle.hidden, true);
  assert.equal(nav.hidden, false);
});

test('first activation opens, second closes — aria-expanded, aria-label, and nav.hidden stay synchronized', async () => {
  const { toggle, nav } = installDom({ isDesktop: false });
  await freshNavToggleModule();

  toggle.dispatchEvent('click');
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(toggle.getAttribute('aria-label'), 'Close navigation');
  assert.equal(nav.hidden, false);

  toggle.dispatchEvent('click');
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(toggle.getAttribute('aria-label'), 'Open navigation');
  assert.equal(nav.hidden, true);
});

test('resizing from mobile to desktop and back leaves a deterministic, closed state', async () => {
  const { toggle, nav, triggerMediaChange } = installDom({ isDesktop: false });
  await freshNavToggleModule();

  toggle.dispatchEvent('click'); // open it on mobile first
  assert.equal(nav.hidden, false);

  triggerMediaChange(true); // -> desktop
  assert.equal(toggle.hidden, true);
  assert.equal(nav.hidden, false); // always visible at desktop

  triggerMediaChange(false); // -> back to mobile
  assert.equal(toggle.hidden, false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(
    nav.hidden,
    true,
    'returning to mobile must reset to a closed nav, not resume the pre-resize open state',
  );
});
