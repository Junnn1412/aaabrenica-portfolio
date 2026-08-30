// Header/nav visual-polish task — the generic, project-agnostic half of
// what scripts/case-study-assets.mjs originally implemented directly.
// Resolves a root-relative asset path (e.g. "/images/brand/mark.png")
// against a real root directory (public/ pre-build, dist/ post-build) and
// reports whether it exists with exact path casing, or would resolve
// outside the root entirely. The segment-by-segment casing check is
// intentionally independent of host filesystem behavior so Windows cannot
// hide a URL that will fail on a case-sensitive deployment.
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

function findCaseMismatch(rootDir, absolutePath) {
  const relativePath = path.relative(rootDir, absolutePath);
  const segments = relativePath.split(path.sep).filter(Boolean);
  let currentDir = rootDir;

  for (const segment of segments) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir);
    } catch {
      return null;
    }

    if (entries.includes(segment)) {
      currentDir = path.join(currentDir, segment);
      continue;
    }

    const differentlyCasedEntry = entries.find(
      (entry) => entry.toLowerCase() === segment.toLowerCase(),
    );
    if (differentlyCasedEntry) {
      return { expected: segment, actual: differentlyCasedEntry };
    }

    return null;
  }

  return null;
}

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
    const caseMismatch = findCaseMismatch(resolvedRoot, abs);
    if (caseMismatch) {
      problems.push(
        `referenced asset path has incorrect casing: ${assetPath} ` +
          `(expected segment "${caseMismatch.expected}", found "${caseMismatch.actual}" on disk)`,
      );
      continue;
    }
    if (!fs.existsSync(abs)) {
      problems.push(`referenced asset does not exist on disk: ${assetPath}`);
    }
  }
  return problems;
}
