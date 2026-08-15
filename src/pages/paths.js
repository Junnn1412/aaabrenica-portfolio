import { fileURLToPath } from 'node:url';

export function normalizePath(p) {
  let n = p.replace(/\\/g, '/');
  if (/^[a-zA-Z]:\//.test(n)) n = n[0].toLowerCase() + n.slice(1);
  return n;
}

export function resolveEntryPath(projectRootUrl, relativeEntry) {
  return normalizePath(fileURLToPath(new URL(relativeEntry, projectRootUrl)));
}
