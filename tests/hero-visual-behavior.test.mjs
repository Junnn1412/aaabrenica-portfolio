import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initHeroVisual, initHeroVisuals } from '../src/scripts/hero-visual.js';

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  toggle(name, force) {
    if (force) this.values.add(name);
    else this.values.delete(name);
  }

  contains(name) {
    return this.values.has(name);
  }
}

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
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}

function createFixture({ reduced = false, malformed = false } = {}) {
  const reveal = new FakeEventTarget();
  const counts = {
    '[data-hero-connection]': [{}],
    '[data-hero-reveal]': [reveal],
    '[data-hero-signal]': malformed ? [] : [{}],
    '[data-hero-node]': [{}, {}],
    '[data-hero-point]': [{}, {}, {}, {}],
  };
  const visual = {
    classList: new FakeClassList(),
    querySelectorAll(selector) {
      return counts[selector] ?? [];
    },
    querySelector(selector) {
      return counts[selector]?.[0] ?? null;
    },
  };
  const document = new FakeEventTarget();
  document.visibilityState = 'visible';
  const motionQuery = new FakeEventTarget();
  motionQuery.matches = reduced;
  let observerCallback;
  let observed;
  let disconnected = false;
  class FakeIntersectionObserver {
    constructor(callback) {
      observerCallback = callback;
    }

    observe(target) {
      observed = target;
    }

    disconnect() {
      disconnected = true;
    }
  }
  function intersect(isIntersecting) {
    observerCallback?.([
      {
        target: visual,
        isIntersecting,
        intersectionRatio: isIntersecting ? 1 : 0,
      },
    ]);
  }
  function setReduced(matches) {
    motionQuery.matches = matches;
    motionQuery.dispatch('change', { matches });
  }
  function setVisibility(visibilityState) {
    document.visibilityState = visibilityState;
    document.dispatch('visibilitychange');
  }
  return {
    visual,
    reveal,
    document,
    motionQuery,
    FakeIntersectionObserver,
    intersect,
    setReduced,
    setVisibility,
    get observed() {
      return observed;
    },
    get disconnected() {
      return disconnected;
    },
  };
}

function environment(view, includeObserver = true) {
  return {
    document: view.document,
    motionQuery: view.motionQuery,
    IntersectionObserver: includeObserver
      ? view.FakeIntersectionObserver
      : undefined,
  };
}

test('failed geometry validation leaves the complete server-owned state untouched', () => {
  const view = createFixture({ malformed: true });
  assert.equal(initHeroVisual(view.visual, environment(view)), false);
  assert.equal(view.visual.classList.values.size, 0);
  assert.equal(view.observed, undefined);
  assert.equal(view.document.listeners.size, 0);
});

test('successful initialization waits for first intersection, exposes enhancement, and completes intro once', () => {
  const view = createFixture();
  const controller = initHeroVisual(view.visual, environment(view));
  assert.notEqual(controller, false);
  assert.equal(view.observed, view.visual);
  assert.equal(view.visual.classList.contains('is-enhanced'), true);
  assert.equal(view.visual.classList.contains('is-paused'), true);
  assert.equal(view.visual.classList.contains('is-introducing'), false);

  view.intersect(true);
  assert.equal(view.visual.classList.contains('is-active'), true);
  assert.equal(view.visual.classList.contains('is-paused'), false);
  assert.equal(view.visual.classList.contains('is-introducing'), true);

  view.reveal.dispatch('animationend', {
    animationName: 'hero-connection-reveal',
  });
  assert.equal(view.visual.classList.contains('is-introducing'), false);
  assert.equal(view.visual.classList.contains('is-introduced'), true);

  view.intersect(false);
  view.intersect(true);
  assert.equal(view.visual.classList.contains('is-introduced'), true);
  assert.equal(view.visual.classList.contains('is-introducing'), false);
});

test('offscreen and hidden-tab changes pause and resume the current CSS state', () => {
  const view = createFixture();
  initHeroVisual(view.visual, environment(view));
  view.intersect(true);
  view.reveal.dispatch('animationend', {
    animationName: 'hero-connection-reveal',
  });

  view.intersect(false);
  assert.equal(view.visual.classList.contains('is-paused'), true);
  assert.equal(view.visual.classList.contains('is-active'), false);
  view.intersect(true);
  assert.equal(view.visual.classList.contains('is-paused'), false);

  view.setVisibility('hidden');
  assert.equal(view.visual.classList.contains('is-paused'), true);
  view.setVisibility('visible');
  assert.equal(view.visual.classList.contains('is-paused'), false);
  assert.equal(view.visual.classList.contains('is-introduced'), true);
});

test('reduced motion starts static and runtime preference changes never animate while reduced', () => {
  const view = createFixture({ reduced: true });
  initHeroVisual(view.visual, environment(view));
  view.intersect(true);
  assert.equal(view.visual.classList.contains('is-enhanced'), false);
  assert.equal(view.visual.classList.contains('is-introducing'), false);
  assert.equal(view.visual.classList.contains('is-introduced'), false);

  view.setVisibility('hidden');
  view.setVisibility('visible');
  assert.equal(view.visual.classList.contains('is-enhanced'), false);

  view.setReduced(false);
  assert.equal(view.visual.classList.contains('is-enhanced'), true);
  assert.equal(view.visual.classList.contains('is-introducing'), true);
  view.reveal.dispatch('animationend', {
    animationName: 'hero-connection-reveal',
  });
  view.setReduced(true);
  assert.equal(view.visual.classList.contains('is-enhanced'), false);
  assert.equal(view.visual.classList.contains('is-introduced'), false);
  view.setReduced(false);
  assert.equal(view.visual.classList.contains('is-introduced'), true);
  assert.equal(view.visual.classList.contains('is-introducing'), false);
});

test('browser without IntersectionObserver uses the documented safe running enhancement', () => {
  const view = createFixture();
  const controller = initHeroVisual(view.visual, environment(view, false));
  assert.notEqual(controller, false);
  assert.equal(view.observed, undefined);
  assert.equal(view.visual.classList.contains('is-active'), true);
  assert.equal(view.visual.classList.contains('is-introducing'), true);
});

test('destroy disconnects lifecycle observers and listeners', () => {
  const view = createFixture();
  const controller = initHeroVisual(view.visual, environment(view));
  controller.destroy();
  assert.equal(view.disconnected, true);
  assert.equal(view.document.listeners.get('visibilitychange')?.size, 0);
  assert.equal(view.motionQuery.listeners.get('change')?.size, 0);
  assert.equal(view.reveal.listeners.get('animationend')?.size, 0);
});

test('empty roots perform no Home hero initialization work', () => {
  const root = { querySelectorAll: () => [] };
  assert.deepEqual(initHeroVisuals(root, {}), []);
});

test('initializer adds no focus/resize restart, frame loop, timer loop, or animation dependency', () => {
  const source = fs.readFileSync(
    fileURLToPath(new URL('../src/scripts/hero-visual.js', import.meta.url)),
    'utf8',
  );
  assert.doesNotMatch(source, /requestAnimationFrame|setInterval|setTimeout/);
  assert.doesNotMatch(
    source,
    /addEventListener(?:\?\.)?\(['"](?:focus|resize)/,
  );
  assert.doesNotMatch(source, /from ['"](?:motion|gsap|animejs|three)/);
});
