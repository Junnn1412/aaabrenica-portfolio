import { normalizePath } from './paths.js';

const STATE_KEY = Symbol.for('aaa-portfolio:page-composer-watcher-state');

// Attaches (or re-attaches) the composer's dev-server file watcher. Called
// unconditionally from configureServer on every invocation (i.e. on every
// restart), so there is no external flag whose staleness could hide a
// missing listener — this function itself owns detect-existing-state,
// dispose-it, then attach-fresh, which is correct whether Vite reuses or
// recreates `server`/`server.watcher` across server.restart().
export function attachComposerWatcher(server, watchDirs) {
  server.watcher[STATE_KEY]?.dispose();

  const normalizedDirs = watchDirs.map(normalizePath);
  // Directory-boundary-safe match — a plain startsWith(dir) would wrongly
  // match a sibling directory like src/pages-other against src/pages.
  const isWatchedPath = (p) => {
    const n = normalizePath(p);
    return normalizedDirs.some((dir) => n === dir || n.startsWith(`${dir}/`));
  };

  let restarting = false;
  let debounceTimer = null;

  const triggerRestart = (changedPath, eventName) => {
    server.config.logger.info(
      `[page-composer] restarting — ${eventName}: ${changedPath}`,
      { timestamp: true },
    );
    restarting = true;
    server
      .restart()
      .catch((err) => {
        server.config.logger.error(
          `[page-composer] restart failed: ${err.message}`,
          { error: err },
        );
      })
      .finally(() => {
        restarting = false;
      });
  };

  const makeHandler = (eventName) => (changedPath) => {
    if (!isWatchedPath(changedPath)) return;
    if (restarting) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      triggerRestart(normalizePath(changedPath), eventName);
    }, 150);
  };

  const onChange = makeHandler('change');
  const onAdd = makeHandler('add');
  const onUnlink = makeHandler('unlink');

  server.watcher.add(normalizedDirs);
  server.watcher.on('change', onChange);
  server.watcher.on('add', onAdd);
  server.watcher.on('unlink', onUnlink);

  const state = {
    dispose() {
      server.watcher.off('change', onChange);
      server.watcher.off('add', onAdd);
      server.watcher.off('unlink', onUnlink);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      if (server.watcher[STATE_KEY] === state) delete server.watcher[STATE_KEY];
    },
  };
  server.watcher[STATE_KEY] = state;
  server.httpServer?.once('close', state.dispose);

  return state;
}
