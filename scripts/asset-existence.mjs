// Header/nav visual-polish task — the generic, project-agnostic half of
// what scripts/case-study-assets.mjs originally implemented directly.
// Resolves a root-relative asset path (e.g. "/images/brand/mark.png")
// against a real root directory (public/ pre-build, dist/ post-build) and
// reports whether it exists, or would resolve outside the root entirely.
// Has no idea what a "case study" is — safe for any caller that just needs
// "does this public/-relative path exist on disk," including the site-wide
// header brand mark, without importing a module named after an unrelated
// content shape.
//
// Extracted rather than duplicated: scripts/case-study-assets.mjs now
// re-exports this same function as `findMissingCaseStudyAssets` for full
// backward compatibility (its existing callers/tests are unchanged), while
// its own `collectCaseStudyAssetPaths` — which genuinely is case-study-shape
// -specific (reads `content.logo`/`content.gallery`) — stays there. No
// top-level side effects, so it's safe to import directly from tests.
import fs from 'node:fs';
import path from 'node:path';

export function findMissingAssets(rootDir, assetPaths) {
  const resolvedRoot = path.resolve(rootDir);
  const problems = [];
  for (const assetPath of assetPaths) {
    const abs = path.resolve(rootDir, `.${assetPath}`);
    const withinRoot =
      abs === resolvedRoot || abs.startsWith(resolvedRoot + path.sep);
    if (!withinRoot) {
      problems.push(
        `asset path "${assetPath}" resolves outside the expected root directory`,
      );
      continue;
    }
    if (!fs.existsSync(abs)) {
      problems.push(`referenced asset does not exist on disk: ${assetPath}`);
    }
  }
  return problems;
}
