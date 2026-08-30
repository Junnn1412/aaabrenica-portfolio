import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createProjectCarouselState,
  deriveProjectCarouselState,
} from '../src/scripts/project-carousel-state.js';

test('carousel starts on the first of exactly three slides', () => {
  assert.deepEqual(createProjectCarouselState(), {
    activeIndex: 0,
    slideCount: 3,
  });
});

test('previous and next wrap while goto keeps the chosen active slide', () => {
  const initial = createProjectCarouselState();
  assert.equal(
    deriveProjectCarouselState(initial, { type: 'PREVIOUS' }).activeIndex,
    2,
  );
  const second = deriveProjectCarouselState(initial, { type: 'NEXT' });
  assert.equal(second.activeIndex, 1);
  const third = deriveProjectCarouselState(second, { type: 'GOTO', index: 2 });
  assert.equal(third.activeIndex, 2);
  assert.equal(
    deriveProjectCarouselState(third, { type: 'NEXT' }).activeIndex,
    0,
  );
});

test('invalid indexes, state shapes, and actions fail closed', () => {
  assert.throws(() => createProjectCarouselState(3), /index/);
  assert.throws(
    () =>
      deriveProjectCarouselState(
        { activeIndex: 0, slideCount: 4 },
        { type: 'NEXT' },
      ),
    /three slides/,
  );
  assert.throws(
    () =>
      deriveProjectCarouselState(createProjectCarouselState(), {
        type: 'RESET',
      }),
    /not supported/,
  );
});
