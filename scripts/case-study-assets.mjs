// PF-060 logo-integration follow-up — pure, side-effect-free (besides the
// fs.existsSync read) asset-existence helpers shared by
// scripts/validate-routes.mjs (pre-flight, checked against public/) and
// scripts/verify-build-output.mjs (post-build, checked against dist/ —
// Vite copies public/ to dist/ verbatim, so the same relative asset path
// must resolve in both places). A separate tiny module, not inline in
// either script, for the same reason scripts/work-project-routes.mjs is
// separate: both scripts run their full check sequence (including a
// possible process.exit(1)) unconditionally on import, so this module has
// no top-level side effects and is safe to import directly from tests.
import fs from 'node:fs';
import path from 'node:path';

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

// Resolves each root-relative asset path (e.g. "/images/case-studies/
// fes-challenger/logo.png") against `rootDir` and reports any that don't
// exist on disk, or that would resolve outside `rootDir` entirely (a
// defensive check — content-schema.js's isSafeInternalPath only rejects
// "//"-prefixed and non-"/"-prefixed values, not an embedded "../" that
// could otherwise walk a filesystem check above the intended root).
export function findMissingCaseStudyAssets(rootDir, assetPaths) {
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
