// Combines every configured public asset consumer before filesystem
// validation. A single binary may legitimately be referenced by multiple
// content contracts (the FES homepage screenshot is both gallery media and
// project-card media), so de-duplication happens here, across consumers,
// rather than inside any shape-specific collector.
import path from 'node:path';
import { findMissingAssets } from './asset-existence.mjs';
import { collectCaseStudyAssetPaths } from './case-study-assets.mjs';
import { collectProjectCardAssetPaths } from './project-card-assets.mjs';

export function collectRegisteredAssetEntries({ routes, contentByKey, site }) {
  const entries = [];

  for (const route of routes) {
    if (route.template !== 'case-study') continue;
    const content = contentByKey[route.content];
    if (!content) continue;
    for (const assetPath of collectCaseStudyAssetPaths(content)) {
      entries.push({ assetPath, source: `route:${route.key}` });
    }
  }

  const projectItems = [
    ...(contentByKey.home?.projects?.items ?? []),
    ...(contentByKey.work?.projects?.items ?? []),
  ];
  for (const assetPath of collectProjectCardAssetPaths(projectItems)) {
    entries.push({ assetPath, source: 'project-card' });
  }

  if (typeof site.brandMark?.src === 'string') {
    entries.push({ assetPath: site.brandMark.src, source: 'site.brandMark' });
  }
  if (typeof site.profile?.portrait?.src === 'string') {
    entries.push({
      assetPath: site.profile.portrait.src,
      source: 'site.profile.portrait',
    });
  }

  return entries;
}

export function normalizeAndDedupeAssetEntries(rootDir, entries) {
  const unique = new Map();
  for (const entry of entries) {
    if (typeof entry?.assetPath !== 'string') continue;
    // path.resolve() produces one normalized absolute physical-path key,
    // collapsing equivalent separators and dot segments while preserving
    // the configured casing for the exact-case checker. The original URL
    // path is retained for validation/error output; provenance is merged.
    const physicalPath = path.resolve(rootDir, `.${entry.assetPath}`);
    const existing = unique.get(physicalPath);
    if (existing) {
      existing.sources.push(entry.source);
    } else {
      unique.set(physicalPath, {
        assetPath: entry.assetPath,
        physicalPath,
        sources: [entry.source],
      });
    }
  }
  return [...unique.values()];
}

export function findRegisteredAssetProblems(rootDir, entries) {
  const uniqueEntries = normalizeAndDedupeAssetEntries(rootDir, entries);
  return findMissingAssets(
    rootDir,
    uniqueEntries.map((entry) => entry.assetPath),
  );
}
