// Pure project-card asset collection. Existence and exact-case behavior is
// delegated to the shared asset helper so project cards preserve the same
// path-safety rules as case-study galleries and the profile portrait.
import { findMissingAssets } from './asset-existence.mjs';

export { findMissingAssets as findMissingProjectCardAssets };

export function collectProjectCardAssetPaths(items) {
  if (!Array.isArray(items)) return [];
  const paths = [];
  for (const item of items) {
    const presentation = item?.presentation;
    if (presentation?.kind === 'image') {
      paths.push(presentation.src);
    } else if (
      presentation?.kind === 'carousel' &&
      Array.isArray(presentation.slides)
    ) {
      paths.push(...presentation.slides.map((slide) => slide?.src));
    }
  }
  return [...new Set(paths.filter((src) => typeof src === 'string'))];
}
