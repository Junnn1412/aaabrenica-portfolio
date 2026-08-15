export function isSafeInternalPath(path) {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//');
}
