const TARGET_SELECTOR = '[data-content-reveal]';
const ANIMATING_CLASS = 'is-content-reveal-animating';
const STATE_ATTRIBUTE = 'data-content-reveal-state';
const REVEAL_ANIMATION_PREFIX = 'content-reveal-';
const initializedRoots = new WeakSet();

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

function isInInitialViewport(element, viewportHeight) {
  const rect = element.getBoundingClientRect?.();
  return Boolean(rect && rect.bottom > 0 && rect.top < viewportHeight);
}

function closestRevealTarget(element) {
  if (element?.matches?.(TARGET_SELECTOR)) return element;
  return element?.closest?.(TARGET_SELECTOR) ?? null;
}

export function initContentReveal(root = document, environment = {}) {
  if (!root?.querySelectorAll || initializedRoots.has(root)) return false;

  const targets = [...root.querySelectorAll(TARGET_SELECTOR)];
  if (targets.length === 0) return false;

  initializedRoots.add(root);
  const documentObject =
    environment.document ??
    (root.nodeType === 9 ? root : root.ownerDocument) ??
    globalThis.document;
  const windowObject = environment.window ?? globalThis.window;
  const IntersectionObserverObject =
    environment.IntersectionObserver ?? globalThis.IntersectionObserver;
  const motionQuery =
    environment.motionQuery ??
    windowObject?.matchMedia?.('(prefers-reduced-motion: reduce)') ??
    null;
  const viewportHeight = windowObject?.innerHeight ?? 0;
  const activeTargets = new Set();
  let reducedMotion = Boolean(motionQuery?.matches);
  let pageVisible = documentObject?.visibilityState !== 'hidden';
  let observer = null;
  let destroyed = false;

  function markRevealed(element) {
    if (!element) return;
    observer?.unobserve?.(element);
    activeTargets.delete(element);
    element.classList.remove(ANIMATING_CLASS);
    element.setAttribute(STATE_ATTRIBUTE, 'revealed');
  }

  function startReveal(element) {
    if (
      destroyed ||
      element.getAttribute(STATE_ATTRIBUTE) === 'revealed' ||
      activeTargets.has(element)
    ) {
      return;
    }

    observer?.unobserve?.(element);
    const containsFocus = element.contains?.(documentObject?.activeElement);
    if (reducedMotion || !pageVisible || containsFocus) {
      markRevealed(element);
      return;
    }

    activeTargets.add(element);
    element.setAttribute(STATE_ATTRIBUTE, 'animating');
    element.classList.add(ANIMATING_CLASS);
  }

  function revealHashTarget(hash = windowObject?.location?.hash) {
    if (!hash || hash === '#') return;
    let id;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }
    const hashTarget = documentObject?.getElementById?.(id);
    markRevealed(closestRevealTarget(hashTarget));
  }

  function handleAnimationEnd(event) {
    if (
      event.animationName &&
      !event.animationName.startsWith(REVEAL_ANIMATION_PREFIX)
    ) {
      return;
    }
    markRevealed(event.currentTarget);
  }

  function handleFocus(event) {
    markRevealed(closestRevealTarget(event.target));
  }

  function handleHashClick(event) {
    const anchor = event.target?.closest?.('a[href^="#"]');
    const href = anchor?.getAttribute?.('href');
    if (href) revealHashTarget(href);
  }

  function handleHashChange() {
    revealHashTarget();
  }

  function handleVisibilityChange() {
    pageVisible = documentObject?.visibilityState !== 'hidden';
    if (!pageVisible) {
      [...activeTargets].forEach(markRevealed);
    }
  }

  function handleMotionChange(event) {
    reducedMotion = Boolean(event.matches);
    if (reducedMotion) {
      observer?.disconnect?.();
      targets.forEach(markRevealed);
    }
  }

  targets.forEach((target) =>
    target.addEventListener('animationend', handleAnimationEnd),
  );
  targets.forEach((target) =>
    target.addEventListener('animationcancel', handleAnimationEnd),
  );
  documentObject?.addEventListener?.('focus', handleFocus, true);
  documentObject?.addEventListener?.('click', handleHashClick, true);
  windowObject?.addEventListener?.('hashchange', handleHashChange);
  windowObject?.addEventListener?.('pageshow', handleHashChange);
  documentObject?.addEventListener?.(
    'visibilitychange',
    handleVisibilityChange,
  );
  const removeMediaListener = addMediaListener(motionQuery, handleMotionChange);

  if (!reducedMotion && typeof IntersectionObserverObject === 'function') {
    try {
      observer = new IntersectionObserverObject(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0) {
              startReveal(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px 12% 0px', threshold: 0.01 },
      );
    } catch {
      observer = null;
    }
  }

  revealHashTarget();

  targets.forEach((target) => {
    if (target.getAttribute(STATE_ATTRIBUTE) === 'revealed') return;
    if (reducedMotion || !pageVisible) {
      markRevealed(target);
    } else if (isInInitialViewport(target, viewportHeight)) {
      startReveal(target);
    } else if (observer) {
      observer.observe(target);
    } else {
      // IntersectionObserver is an enhancement, not a visibility dependency.
      // Keep below-fold content static when the platform cannot observe it.
      markRevealed(target);
    }
  });

  return {
    observer,
    destroy() {
      destroyed = true;
      observer?.disconnect?.();
      targets.forEach((target) => {
        markRevealed(target);
        target.removeEventListener?.('animationend', handleAnimationEnd);
        target.removeEventListener?.('animationcancel', handleAnimationEnd);
      });
      documentObject?.removeEventListener?.('focus', handleFocus, true);
      documentObject?.removeEventListener?.('click', handleHashClick, true);
      windowObject?.removeEventListener?.('hashchange', handleHashChange);
      windowObject?.removeEventListener?.('pageshow', handleHashChange);
      documentObject?.removeEventListener?.(
        'visibilitychange',
        handleVisibilityChange,
      );
      removeMediaListener();
      initializedRoots.delete(root);
    },
  };
}

function startContentReveal() {
  initContentReveal();
}

if (
  typeof document !== 'undefined' &&
  document.querySelector(TARGET_SELECTOR)
) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startContentReveal, {
      once: true,
    });
  } else {
    startContentReveal();
  }
}
