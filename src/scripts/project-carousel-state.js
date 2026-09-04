const SLIDE_COUNT = 3;

function assertIndex(index) {
  if (!Number.isInteger(index) || index < 0 || index >= SLIDE_COUNT) {
    throw new RangeError(
      `project carousel index must be between 0 and ${SLIDE_COUNT - 1}`,
    );
  }
}

export function createProjectCarouselState(activeIndex = 0) {
  assertIndex(activeIndex);
  return { activeIndex, slideCount: SLIDE_COUNT };
}

export function deriveProjectCarouselState(state, action) {
  if (state?.slideCount !== SLIDE_COUNT) {
    throw new TypeError('project carousel state must contain three slides');
  }
  assertIndex(state.activeIndex);

  if (action?.type === 'PREVIOUS') {
    return {
      ...state,
      activeIndex: (state.activeIndex - 1 + SLIDE_COUNT) % SLIDE_COUNT,
    };
  }
  if (action?.type === 'NEXT') {
    return { ...state, activeIndex: (state.activeIndex + 1) % SLIDE_COUNT };
  }
  if (action?.type === 'GOTO') {
    assertIndex(action.index);
    return { ...state, activeIndex: action.index };
  }
  throw new TypeError(
    `project carousel action is not supported: ${JSON.stringify(action?.type)}`,
  );
}
