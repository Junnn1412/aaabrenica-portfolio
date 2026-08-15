import { defineConfig } from 'vite';
import { routes } from './src/config/routes.js';
import { renderRoute } from './src/pages/render.js';
import { composePage } from './src/pages/compose.js';
import { normalizePath, resolveEntryPath } from './src/pages/paths.js';
import { attachComposerWatcher } from './src/pages/dev-watcher.js';
import { resolveHtmlRequest } from './src/pages/route-resolution.js';

const projectRootUrl = new URL('.', import.meta.url);

// The one exact file a hand-authored, dev-only design-system preview may
// bypass composition for (docs/DESIGN_SYSTEM.md) — never built into dist/
// (not listed in rollupOptions.input below), never scanned by
// scripts/validate-routes.mjs's checkNoUnexpectedFiles (dev/ isn't one of
// its ROUTE_PARENT_DIRS). Every other unregistered HTML file still throws.
const previewEntryPath = resolveEntryPath(
  projectRootUrl,
  'dev/design-system/index.html',
);

function pageComposerPlugin() {
  const routesByFile = new Map(
    routes.map((route) => [
      resolveEntryPath(projectRootUrl, route.entry),
      route,
    ]),
  );

  const watchDirs = [
    'src/config',
    'src/content',
    'src/components/partials',
    'src/pages',
  ].map((p) => resolveEntryPath(projectRootUrl, p));

  return {
    name: 'aaa-portfolio:page-composer',
    transformIndexHtml(html, ctx) {
      const filename = normalizePath(ctx.filename);
      const result = resolveHtmlRequest(filename, {
        routesByFile,
        previewEntryPath,
      });
      if (result.kind === 'route') {
        return composePage(html, result.route, renderRoute(result.route));
      }
      if (result.kind === 'preview') {
        return html; // hand-authored, dev-only — intentionally uncomposed
      }
      throw new Error(
        `[page-composer] no route registered for HTML entry: ${ctx.filename}`,
      );
    },
    configureServer(server) {
      attachComposerWatcher(server, watchDirs);
    },
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [pageComposerPlugin()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        routes.map((route) => [
          route.key,
          resolveEntryPath(projectRootUrl, route.entry),
        ]),
      ),
    },
  },
});
