import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initContentReveal } from '../src/scripts/content-reveal.js';

class FakeEventTarget {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(type, event = {}) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener({ ...event, currentTarget: event.currentTarget ?? this });
    }
  }
}

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(name) {
    this.values.add(name);
  }

  remove(name) {
    this.values.delete(name);
  }

  contains(name) {
    return this.values.has(name);
  }
}

class FakeElement extends FakeEventTarget {
  constructor({ top, bottom, id } = {}) {
    super();
    this.rect = { top: top ?? 1000, bottom: bottom ?? 1100 };
    this.id = id;
    this.attributes = new Map([['data-content-reveal', 'fade-up']]);
    this.classList = new FakeClassList();
  }

  getBoundingClientRect() {
    return this.rect;
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  matches(selector) {
    return selector === '[data-content-reveal]';
  }

  closest(selector) {
    return this.matches(selector) ? this : null;
  }

  contains(candidate) {
    return candidate === this;
  }
}

function fixture({
  reduced = false,
  hidden = false,
  observerThrows = false,
} = {}) {
  const initial = new FakeElement({ top: 10, bottom: 110, id: 'initial' });
  const below = new FakeElement({ top: 1200, bottom: 1300, id: 'below' });
  const document = new FakeEventTarget();
  document.nodeType = 9;
  document.visibilityState = hidden ? 'hidden' : 'visible';
  document.activeElement = null;
  document.querySelectorAll = () => [initial, below];
  document.getElementById = (id) =>
    [initial, below].find((target) => target.id === id) ?? null;

  const window = new FakeEventTarget();
  window.innerHeight = 800;
  window.location = { hash: '' };
  const motionQuery = new FakeEventTarget();
  motionQuery.matches = reduced;
  let callback;
  let observerCount = 0;
  let disconnected = false;
  const observed = new Set();

  class FakeIntersectionObserver {
    constructor(observerCallback) {
      observerCount += 1;
      if (observerThrows) throw new Error('observer unavailable');
      callback = observerCallback;
    }

    observe(target) {
      observed.add(target);
    }

    unobserve(target) {
      observed.delete(target);
    }

    disconnect() {
      disconnected = true;
      observed.clear();
    }
  }

  function intersect(target, isIntersecting = true) {
    callback?.([
      {
        target,
        isIntersecting,
        intersectionRatio: isIntersecting ? 1 : 0,
      },
    ]);
  }

  function setReduced(matches) {
    motionQuery.matches = matches;
    motionQuery.dispatch('change', { matches });
  }

  function setVisibility(state) {
    document.visibilityState = state;
    document.dispatch('visibilitychange');
  }

  return {
    initial,
    below,
    document,
    window,
    motionQuery,
    FakeIntersectionObserver,
    observed,
    intersect,
    setReduced,
    setVisibility,
    get observerCount() {
      return observerCount;
    },
    get disconnected() {
      return disconnected;
    },
  };
}

function environment(view) {
  return {
    document: view.document,
    window: view.window,
    motionQuery: view.motionQuery,
    IntersectionObserver: view.FakeIntersectionObserver,
  };
}

test('initial viewport introduces immediately while below-fold content waits for the shared observer', () => {
  const view = fixture();
  const controller = initContentReveal(view.document, environment(view));
  assert.notEqual(controller, false);
  assert.equal(view.observerCount, 1);
  assert.equal(
    view.initial.classList.contains('is-content-reveal-animating'),
    true,
  );
  assert.equal(view.observed.has(view.below), true);
  assert.equal(
    view.below.classList.contains('is-content-reveal-animating'),
    false,
  );

  view.intersect(view.below);
  assert.equal(view.observed.has(view.below), false);
  assert.equal(
    view.below.classList.contains('is-content-reveal-animating'),
    true,
  );
});

test('a completed reveal stays complete across re-entry and cannot initialize twice', () => {
  const view = fixture();
  initContentReveal(view.document, environment(view));
  view.intersect(view.below);
  view.below.dispatch('animationend', {
    animationName: 'content-reveal-fade-up',
  });
  assert.equal(
    view.below.getAttribute('data-content-reveal-state'),
    'revealed',
  );
  assert.equal(
    view.below.classList.contains('is-content-reveal-animating'),
    false,
  );

  view.intersect(view.below, false);
  view.intersect(view.below, true);
  assert.equal(
    view.below.classList.contains('is-content-reveal-animating'),
    false,
  );
  assert.equal(initContentReveal(view.document, environment(view)), false);
  assert.equal(view.observerCount, 1);
});

test('initial and runtime reduced motion make every target immediately static', () => {
  const initiallyReduced = fixture({ reduced: true });
  initContentReveal(initiallyReduced.document, environment(initiallyReduced));
  assert.equal(initiallyReduced.observerCount, 0);
  for (const target of [initiallyReduced.initial, initiallyReduced.below]) {
    assert.equal(target.getAttribute('data-content-reveal-state'), 'revealed');
    assert.equal(
      target.classList.contains('is-content-reveal-animating'),
      false,
    );
  }

  const runtime = fixture();
  initContentReveal(runtime.document, environment(runtime));
  runtime.setReduced(true);
  assert.equal(runtime.disconnected, true);
  assert.equal(
    runtime.initial.getAttribute('data-content-reveal-state'),
    'revealed',
  );
  assert.equal(
    runtime.below.getAttribute('data-content-reveal-state'),
    'revealed',
  );
  runtime.setReduced(false);
  assert.equal(
    runtime.initial.classList.contains('is-content-reveal-animating'),
    false,
  );
});

test('hidden-tab initialization and transitions never queue or replay motion', () => {
  const hidden = fixture({ hidden: true });
  initContentReveal(hidden.document, environment(hidden));
  assert.equal(
    hidden.initial.getAttribute('data-content-reveal-state'),
    'revealed',
  );
  assert.equal(
    hidden.below.getAttribute('data-content-reveal-state'),
    'revealed',
  );

  const runtime = fixture();
  initContentReveal(runtime.document, environment(runtime));
  runtime.setVisibility('hidden');
  assert.equal(
    runtime.initial.getAttribute('data-content-reveal-state'),
    'revealed',
  );
  runtime.setVisibility('visible');
  assert.equal(
    runtime.initial.classList.contains('is-content-reveal-animating'),
    false,
  );
});

test('focus and hash targets are made fully visible immediately', () => {
  const view = fixture();
  initContentReveal(view.document, environment(view));
  const focusedChild = {
    closest: () => view.below,
  };
  view.document.dispatch('focus', { target: focusedChild });
  assert.equal(
    view.below.getAttribute('data-content-reveal-state'),
    'revealed',
  );

  const second = fixture();
  initContentReveal(second.document, environment(second));
  const anchor = {
    getAttribute: () => '#below',
  };
  second.document.dispatch('click', {
    target: { closest: () => anchor },
  });
  assert.equal(
    second.below.getAttribute('data-content-reveal-state'),
    'revealed',
  );
});

test('observer construction failure keeps below-fold content static and usable', () => {
  const view = fixture({ observerThrows: true });
  const controller = initContentReveal(view.document, environment(view));
  assert.notEqual(controller, false);
  assert.equal(
    view.below.getAttribute('data-content-reveal-state'),
    'revealed',
  );
  assert.equal(
    view.below.classList.contains('is-content-reveal-animating'),
    false,
  );
});

test('destroy disconnects and leaves every target visible', () => {
  const view = fixture();
  const controller = initContentReveal(view.document, environment(view));
  controller.destroy();
  assert.equal(view.disconnected, true);
  assert.equal(
    view.initial.getAttribute('data-content-reveal-state'),
    'revealed',
  );
  assert.equal(
    view.below.getAttribute('data-content-reveal-state'),
    'revealed',
  );
  assert.equal(view.document.listeners.get('focus')?.size, 0);
  assert.equal(view.motionQuery.listeners.get('change')?.size, 0);
});
