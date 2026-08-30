import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initProjectCarousel } from '../src/scripts/project-carousel.js';

class FakeElement {
  constructor({ hidden = false, classes = [] } = {}) {
    this.hidden = hidden;
    this.attributes = new Map();
    this.listeners = new Map();
    this.textContent = '';
    this.focused = false;
    const classSet = new Set(classes);
    this.classList = {
      toggle: (name, force) => {
        if (force) classSet.add(name);
        else classSet.delete(name);
      },
      contains: (name) => classSet.has(name),
    };
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  getAttribute(name) {
    return this.attributes.get(name);
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  dispatch(type, event = {}) {
    this.listeners.get(type)?.(event);
  }

  focus() {
    this.focused = true;
  }
}

function fixture({ slideCount = 3, indicatorCount = 3 } = {}) {
  const slides = Array.from(
    { length: slideCount },
    (_, index) =>
      new FakeElement({
        hidden: index !== 0,
        classes: index === 0 ? ['is-active'] : [],
      }),
  );
  const indicators = Array.from(
    { length: indicatorCount },
    () => new FakeElement(),
  );
  const indicatorGroup = new FakeElement({ hidden: true });
  const previous = new FakeElement({ hidden: true });
  const next = new FakeElement({ hidden: true });
  const status = new FakeElement();
  const selectors = new Map([
    ['.project-carousel__indicators', indicatorGroup],
    ['[data-project-carousel-previous]', previous],
    ['[data-project-carousel-next]', next],
    ['[data-project-carousel-status]', status],
  ]);
  const root = {
    querySelectorAll(selector) {
      if (selector === '[data-project-carousel-slide]') return slides;
      if (selector === '[data-project-carousel-indicator]') return indicators;
      return [];
    },
    querySelector(selector) {
      return selectors.get(selector) ?? null;
    },
  };
  return { root, slides, indicators, indicatorGroup, previous, next, status };
}

test('successful initialization reveals controls and exposes only slide one', () => {
  const view = fixture();
  assert.equal(initProjectCarousel(view.root), true);
  assert.equal(view.previous.hidden, false);
  assert.equal(view.indicatorGroup.hidden, false);
  assert.equal(view.next.hidden, false);
  assert.deepEqual(
    view.slides.map((slide) => slide.getAttribute('aria-hidden')),
    ['false', 'true', 'true'],
  );
  assert.deepEqual(
    view.indicators.map((indicator) => indicator.getAttribute('aria-pressed')),
    ['true', 'false', 'false'],
  );
});

test('buttons keep the selected state and announce only explicit interaction', () => {
  const view = fixture();
  initProjectCarousel(view.root);
  assert.equal(view.status.textContent, '');

  view.next.dispatch('click');
  assert.deepEqual(
    view.slides.map((slide) => slide.getAttribute('aria-hidden')),
    ['true', 'false', 'true'],
  );
  assert.equal(view.status.textContent, 'Project image 2 of 3');

  view.indicators[2].dispatch('click');
  assert.equal(view.indicators[2].getAttribute('aria-pressed'), 'true');
  assert.equal(view.status.textContent, 'Project image 3 of 3');
});

test('indicator arrow keys update and focus without a timer or reset event', () => {
  const view = fixture();
  initProjectCarousel(view.root);
  let prevented = false;
  view.indicatorGroup.dispatch('keydown', {
    key: 'End',
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(prevented, true);
  assert.equal(view.indicators[2].focused, true);
  assert.equal(view.indicators[2].getAttribute('aria-pressed'), 'true');
});

test('failed initialization leaves all controls hidden and first-slide fallback untouched', () => {
  const view = fixture({ indicatorCount: 2 });
  assert.equal(initProjectCarousel(view.root), false);
  assert.equal(view.previous.hidden, true);
  assert.equal(view.indicatorGroup.hidden, true);
  assert.equal(view.next.hidden, true);
  assert.equal(view.slides[0].hidden, false);
  assert.equal(view.slides[1].hidden, true);
  assert.equal(view.slides[2].hidden, true);
});
