import { defineConfig } from 'vite';
import { routes } from './src/config/routes.js';
import { renderRoute } from './src/pages/render.js';
import { composePage } from './src/pages/compose.js';
import { normalizePath, resolveEntryPath } from './src/pages/paths.js';
import { attachComposerWatcher } from './src/pages/dev-watcher.js';

const projectRootUrl = new URL('.', import.meta.url);

function pageComposerPlugin() {
  const routesByFile = new Map(routes.map((route) => [resolveEntryPath(projectRootUrl, route.entry), route]));

  const watchDirs = ['src/config', 'src/content', 'src/components/partials', 'src/pages'].map((p) =>
    resolveEntryPath(projectRootUrl, p)
  );

  return {
    name: 'aaa-portfolio:page-composer',
    transformIndexHtml(html, ctx) {
      const route = routesByFile.get(normalizePath(ctx.filename));
      if (!route) {
        throw new Error(`[page-composer] no route registered for HTML entry: ${ctx.filename}`);
      }
      return composePage(html, route, renderRoute(route));
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
      input: Object.fromEntries(routes.map((route) => [route.key, resolveEntryPath(projectRootUrl, route.entry)])),
    },
  },
});
