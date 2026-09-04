export const MARKERS = {
  head: '<!--@head-->',
  header: '<!--@header-->',
  content: '<!--@content-->',
  footer: '<!--@footer-->',
  pageKey: '__PAGE_KEY__',
};

function countOccurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
}

// Pure — returns violation strings, never throws. Shared by the runtime
// composer (which throws on any result) and the validator (which collects
// results across all routes into one report).
export function getMarkerProblems(html, route) {
  const problems = [];
  for (const [name, marker] of Object.entries(MARKERS)) {
    const count = countOccurrences(html, marker);
    if (count !== 1) {
      problems.push(
        `route "${route.key}" (${route.entry}): marker "${marker}" (${name}) ` +
          `expected exactly 1 occurrence, found ${count}`,
      );
    }
  }
  return problems;
}

export function composePage(html, route, parts) {
  const problems = getMarkerProblems(html, route);
  if (problems.length > 0) {
    throw new Error(
      `[page-composer] invalid skeleton markers:\n` +
        problems.map((p) => `  - ${p}`).join('\n'),
    );
  }

  const composed = html
    .replace(MARKERS.head, parts.head)
    .replace(MARKERS.pageKey, route.key)
    .replace(MARKERS.header, parts.header)
    .replace(MARKERS.content, parts.main)
    .replace(MARKERS.footer, parts.footer);

  const leftover = Object.values(MARKERS).filter((m) => composed.includes(m));
  if (leftover.length > 0) {
    throw new Error(
      `[page-composer] route "${route.key}": unresolved markers after composition: ${leftover.join(', ')}`,
    );
  }

  return composed;
}
