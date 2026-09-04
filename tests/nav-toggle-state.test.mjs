import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deriveNavState, toDom } from '../src/scripts/nav-toggle-state.js';

test('TOGGLE flips expanded and requests no focus effect', () => {
  const result = deriveNavState(
    { isDesktop: false, expanded: false },
    {
      type: 'TOGGLE',
    },
  );
  assert.equal(result.state.expanded, true);
  assert.equal(result.effect, null);
});

test('ESCAPE at desktop is a no-op', () => {
  const current = { isDesktop: true, expanded: false };
  const result = deriveNavState(current, { type: 'ESCAPE' });
  assert.equal(result.state, current);
  assert.equal(result.effect, null);
});

test('ESCAPE while already collapsed (mobile) is a no-op', () => {
  const current = { isDesktop: false, expanded: false };
  const result = deriveNavState(current, { type: 'ESCAPE' });
  assert.equal(result.state, current);
  assert.equal(result.effect, null);
});

test('ESCAPE while expanded (mobile) collapses and requests focus', () => {
  const result = deriveNavState(
    { isDesktop: false, expanded: true },
    {
      type: 'ESCAPE',
    },
  );
  assert.equal(result.state.expanded, false);
  assert.equal(result.effect, 'FOCUS_TOGGLE');
});

test('a second consecutive ESCAPE does not repeat the focus effect', () => {
  const first = deriveNavState(
    { isDesktop: false, expanded: true },
    {
      type: 'ESCAPE',
    },
  );
  assert.equal(first.effect, 'FOCUS_TOGGLE');

  const second = deriveNavState(first.state, { type: 'ESCAPE' });
  assert.equal(second.effect, null);
});

test('ENTER_DESKTOP always resets expanded to false', () => {
  const result = deriveNavState(
    { isDesktop: false, expanded: true },
    {
      type: 'ENTER_DESKTOP',
    },
  );
  assert.deepEqual(result.state, { isDesktop: true, expanded: false });
  assert.equal(result.effect, null);
});

test('ENTER_MOBILE requests focus only when focus was inside the nav', () => {
  const withFocus = deriveNavState(
    { isDesktop: true, expanded: false },
    {
      type: 'ENTER_MOBILE',
      focusWasInNav: true,
    },
  );
  assert.equal(withFocus.effect, 'FOCUS_TOGGLE');
  assert.deepEqual(withFocus.state, { isDesktop: false, expanded: false });

  const withoutFocus = deriveNavState(
    { isDesktop: true, expanded: false },
    {
      type: 'ENTER_MOBILE',
      focusWasInNav: false,
    },
  );
  assert.equal(withoutFocus.effect, null);
});

test('toDom: desktop always shows the nav and hides the toggle', () => {
  assert.deepEqual(toDom({ isDesktop: true, expanded: false }), {
    showToggle: false,
    navHidden: false,
    ariaExpanded: 'false',
  });
  // expanded is irrelevant at desktop — nav is never hidden there.
  assert.deepEqual(toDom({ isDesktop: true, expanded: true }), {
    showToggle: false,
    navHidden: false,
    ariaExpanded: 'true',
  });
});

test('toDom: mobile hides the nav unless expanded', () => {
  assert.deepEqual(toDom({ isDesktop: false, expanded: false }), {
    showToggle: true,
    navHidden: true,
    ariaExpanded: 'false',
  });
  assert.deepEqual(toDom({ isDesktop: false, expanded: true }), {
    showToggle: true,
    navHidden: false,
    ariaExpanded: 'true',
  });
});
