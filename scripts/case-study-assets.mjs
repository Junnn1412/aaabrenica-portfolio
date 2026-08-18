// PF-060 logo-integration follow-up — pure, side-effect-free case-study
// asset helpers shared by scripts/validate-routes.mjs (pre-flight, checked
// against public/) and scripts/verify-build-output.mjs (post-build, checked
// against dist/ — Vite copies public/ to dist/ verbatim, so the same
// relative asset path must resolve in both places). A separate tiny
// module, not inline in either script, for the same reason
// scripts/work-project-routes.mjs is separate: both scripts run their full
// check sequence (including a possible process.exit(1)) unconditionally on
// import, so this module has no top-level side effects and is safe to
// import directly from tests.
//
// Header/nav visual-polish task — `findMissingCaseStudyAssets` is now a
// re-export of the generic `findMissingAssets` in
// scripts/asset-existence.mjs, extracted there once a genuinely non-
// case-study caller (the site-wide header brand mark) needed the exact
// same root-relative-path-existence logic. Every existing import of
// `findMissingCaseStudyAssets` from this module keeps working unchanged —
// this is a re-export, not a behavior change. `collectCaseStudyAssetPaths`
// stays here: it's genuinely case-study-shape-specific (reads
// `content.logo`/`content.gallery`), not generic.
import { findMissingAssets } from './asset-existence.mjs';

export { findMissingAssets as findMissingCaseStudyAssets };

// A case study's only two possible local-asset fields today: `logo.src`
// and each `gallery.items[].src`. Returns an empty array when neither is
// present — a case study without a logo (or without a gallery) has
// nothing to check, by construction, not by a special-cased branch.
export function collectCaseStudyAssetPaths(content) {
  const paths = [];
  if (typeof content?.logo?.src === 'string') paths.push(content.logo.src);
  if (Array.isArray(content?.gallery?.items)) {
    for (const item of content.gallery.items) {
      if (typeof item?.src === 'string') paths.push(item.src);
    }
  }
  return paths;
}
