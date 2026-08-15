import { escapeHtml } from '../../pages/escape.js';

export function renderNav(navItems, activeKey) {
  const items = navItems
    .map(({ key, label, path }) => {
      const current = key === activeKey ? ' aria-current="page"' : '';
      return `<li><a href="${escapeHtml(path)}"${current}>${escapeHtml(label)}</a></li>`;
    })
    .join('');
  return `<nav aria-label="Primary"><ul>${items}</ul></nav>`;
}
