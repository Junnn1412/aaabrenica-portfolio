import {
  createProjectCarouselState,
  deriveProjectCarouselState,
} from './project-carousel-state.js';

const EXPECTED_SLIDE_COUNT = 3;

export function initProjectCarousel(carousel) {
  const slides = [
    ...carousel.querySelectorAll('[data-project-carousel-slide]'),
  ];
  const indicators = [
    ...carousel.querySelectorAll('[data-project-carousel-indicator]'),
  ];
  const indicatorGroup = carousel.querySelector(
    '.project-carousel__indicators',
  );
  const previous = carousel.querySelector('[data-project-carousel-previous]');
  const next = carousel.querySelector('[data-project-carousel-next]');
  const status = carousel.querySelector('[data-project-carousel-status]');

  // Atomic enhancement: a malformed carousel keeps its truthful first-slide
  // server rendering and never exposes controls that cannot work.
  if (
    slides.length !== EXPECTED_SLIDE_COUNT ||
    indicators.length !== EXPECTED_SLIDE_COUNT ||
    !indicatorGroup ||
    !previous ||
    !next ||
    !status
  ) {
    return false;
  }

  let state = createProjectCarouselState();

  function applyState({ announce = false } = {}) {
    for (const [index, slide] of slides.entries()) {
      const isActive = index === state.activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    }
    for (const [index, indicator] of indicators.entries()) {
      indicator.setAttribute(
        'aria-pressed',
        String(index === state.activeIndex),
      );
    }
    if (announce) {
      status.textContent = `Project image ${state.activeIndex + 1} of ${state.slideCount}`;
    }
  }

  function dispatch(action, { focusIndicator = false } = {}) {
    state = deriveProjectCarouselState(state, action);
    applyState({ announce: true });
    if (focusIndicator) indicators[state.activeIndex].focus();
  }

  // Establish every inactive accessibility state before revealing any
  // control or removing the server-rendered hidden fallback from slides.
  applyState();
  for (const slide of slides) slide.hidden = false;
  previous.hidden = false;
  indicatorGroup.hidden = false;
  next.hidden = false;

  previous.addEventListener('click', () => dispatch({ type: 'PREVIOUS' }));
  next.addEventListener('click', () => dispatch({ type: 'NEXT' }));
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () =>
      dispatch({ type: 'GOTO', index }),
    );
  });

  indicatorGroup.addEventListener('keydown', (event) => {
    const actions = {
      ArrowLeft: { type: 'PREVIOUS' },
      ArrowRight: { type: 'NEXT' },
      Home: { type: 'GOTO', index: 0 },
      End: { type: 'GOTO', index: EXPECTED_SLIDE_COUNT - 1 },
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    dispatch(action, { focusIndicator: true });
  });

  return true;
}

export function initProjectCarousels(root = document) {
  for (const carousel of root.querySelectorAll('[data-project-carousel]')) {
    initProjectCarousel(carousel);
  }
}

function startProjectCarousels() {
  initProjectCarousels();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startProjectCarousels);
  } else {
    startProjectCarousels();
  }
}
