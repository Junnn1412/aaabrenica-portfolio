const SELECTORS = Object.freeze({
  connection: '[data-hero-connection]',
  reveal: '[data-hero-reveal]',
  signal: '[data-hero-signal]',
  node: '[data-hero-node]',
  point: '[data-hero-point]',
});

const REQUIRED_COUNTS = Object.freeze({
  connection: 1,
  reveal: 1,
  signal: 1,
  node: 2,
  point: 4,
});

function hasRequiredGeometry(visual) {
  return Object.entries(REQUIRED_COUNTS).every(
    ([key, count]) => visual.querySelectorAll(SELECTORS[key]).length === count,
  );
}

function addMediaListener(mediaQuery, listener) {
  if (typeof mediaQuery?.addEventListener === 'function') {
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }
  if (typeof mediaQuery?.addListener === 'function') {
    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }
  return () => {};
}

export function initHeroVisual(visual, environment = {}) {
  if (!visual || !hasRequiredGeometry(visual)) return false;

  const documentObject = environment.document ?? globalThis.document;
  const windowObject = environment.window ?? globalThis.window;
  const IntersectionObserverObject =
    environment.IntersectionObserver ?? globalThis.IntersectionObserver;
  const motionQuery =
    environment.motionQuery ??
    windowObject?.matchMedia?.('(prefers-reduced-motion: reduce)') ??
    null;
  const reveal = visual.querySelector(SELECTORS.reveal);

  let reducedMotion = Boolean(motionQuery?.matches);
  let pageVisible = documentObject?.visibilityState !== 'hidden';
  let inViewport = typeof IntersectionObserverObject !== 'function';
  let introStarted = false;
  let introduced = false;

  function applyState() {
    const enhanced = !reducedMotion;
    if (enhanced && inViewport && pageVisible && !introStarted && !introduced) {
      introStarted = true;
    }

    visual.classList.toggle('is-enhanced', enhanced);
    visual.classList.toggle('is-active', enhanced && inViewport);
    visual.classList.toggle(
      'is-paused',
      enhanced && (!inViewport || !pageVisible),
    );
    visual.classList.toggle(
      'is-introducing',
      enhanced && introStarted && !introduced,
    );
    visual.classList.toggle('is-introduced', enhanced && introduced);
  }

  function finishIntroduction(event) {
    if (
      event?.animationName &&
      event.animationName !== 'hero-connection-reveal'
    ) {
      return;
    }
    if (reducedMotion || !introStarted) return;
    introduced = true;
    applyState();
  }

  function handleVisibilityChange() {
    pageVisible = documentObject?.visibilityState !== 'hidden';
    applyState();
  }

  function handleMotionChange(event) {
    reducedMotion = Boolean(event.matches);
    if (reducedMotion && !introduced) introStarted = false;
    applyState();
  }

  reveal.addEventListener('animationend', finishIntroduction);
  documentObject?.addEventListener?.(
    'visibilitychange',
    handleVisibilityChange,
  );
  const removeMediaListener = addMediaListener(motionQuery, handleMotionChange);

  let observer = null;
  if (typeof IntersectionObserverObject === 'function') {
    observer = new IntersectionObserverObject((entries) => {
      const entry = entries.find((candidate) => candidate.target === visual);
      if (!entry) return;
      inViewport = Boolean(entry.isIntersecting && entry.intersectionRatio > 0);
      applyState();
    });
    observer.observe(visual);
  }

  applyState();

  return {
    destroy() {
      observer?.disconnect();
      reveal.removeEventListener?.('animationend', finishIntroduction);
      documentObject?.removeEventListener?.(
        'visibilitychange',
        handleVisibilityChange,
      );
      removeMediaListener();
    },
  };
}

export function initHeroVisuals(root = document, environment = {}) {
  const visuals = [...root.querySelectorAll('[data-hero-visual]')];
  return visuals.map((visual) => initHeroVisual(visual, environment));
}

function startHeroVisual() {
  initHeroVisuals();
}

if (
  typeof document !== 'undefined' &&
  document.querySelector('[data-hero-visual]')
) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startHeroVisual, {
      once: true,
    });
  } else {
    startHeroVisual();
  }
}
