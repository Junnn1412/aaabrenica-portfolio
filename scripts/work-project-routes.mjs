// PF-052 — pure, exported for direct unit testing. No file-system or
// module-level state (no import of routes.js/contentByKey), so
// scripts/validate-routes.mjs (real data) and tests (real and synthetic
// data) can call it identically. Derives the expected destination set
// from whatever caseStudyRoutePaths is actually passed — never a
// hardcoded count — so it stays correct as PF-060–063 registers more
// case-study routes.
//
// Deliberately its own tiny module, not a named export added directly to
// scripts/validate-routes.mjs: that script's own top level runs its full
// check sequence unconditionally on import (see its own header comment
// and tests/validate-routes-smoke.test.mjs's rationale for that being
// deliberate) and can call process.exit(1) — importing anything from it
// for a unit test would be unsafe. This module has no top-level side
// effects at all, so it is safe to import directly.
export function findWorkProjectRouteProblems(
  projectLinks,
  caseStudyRoutePaths,
) {
  const problems = [];
  const registeredSet = new Set(caseStudyRoutePaths);
  const seen = new Set();
  const duplicates = new Set();

  for (const link of projectLinks) {
    if (seen.has(link)) {
      duplicates.add(link);
    }
    seen.add(link);
  }

  for (const path of caseStudyRoutePaths) {
    if (!seen.has(path)) {
      problems.push(
        `missing a project card linking to the registered case-study route "${path}"`,
      );
    }
  }

  for (const link of projectLinks) {
    if (!registeredSet.has(link)) {
      problems.push(
        `project card link "${link}" does not match any registered case-study route`,
      );
    }
  }

  for (const dup of duplicates) {
    problems.push(`project card links to "${dup}" more than once`);
  }

  return problems;
}
