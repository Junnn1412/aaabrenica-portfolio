const REVEAL_VARIANTS = new Set(['fade-up', 'fade-in']);
const MAX_STAGGER_STEP = 3;

// Template-authored progressive-enhancement metadata. The helper keeps the
// public markup contract closed and keeps timing decisions out of content
// modules. A stagger step is an index into the centralized CSS token, not an
// arbitrary duration supplied by visitor-facing data.
export function contentRevealAttributes(variant, { stagger = 0 } = {}) {
  if (!REVEAL_VARIANTS.has(variant)) {
    throw new Error(
      `contentRevealAttributes: variant must be one of ${[...REVEAL_VARIANTS].join(', ')}, received ${JSON.stringify(variant)}`,
    );
  }
  if (!Number.isInteger(stagger) || stagger < 0 || stagger > MAX_STAGGER_STEP) {
    throw new Error(
      `contentRevealAttributes: stagger must be an integer from 0 to ${MAX_STAGGER_STEP}, received ${JSON.stringify(stagger)}`,
    );
  }

  const staggerAttribute =
    stagger === 0 ? '' : ` data-content-reveal-stagger="${stagger}"`;
  return ` data-content-reveal="${variant}"${staggerAttribute}`;
}

export const CONTENT_REVEAL_VARIANTS = Object.freeze([...REVEAL_VARIANTS]);
export const CONTENT_REVEAL_MAX_STAGGER = MAX_STAGGER_STEP;
