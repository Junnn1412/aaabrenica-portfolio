// Pure, exported, testable — the three-way decision `transformIndexHtml`
// makes for every HTML entry Vite's dev server or build processes. Kept
// separate from the actual composePage/throw wiring in vite.config.js so it
// can be unit-tested without invoking Vite's own plugin machinery.
export function resolveHtmlRequest(
  filename,
  { routesByFile, previewEntryPath },
) {
  const route = routesByFile.get(filename);
  if (route) {
    return { kind: 'route', route };
  }
  if (filename === previewEntryPath) {
    return { kind: 'preview' };
  }
  return { kind: 'unregistered' };
}
