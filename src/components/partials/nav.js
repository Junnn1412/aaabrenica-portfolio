import { escapeHtml } from '../../pages/escape.js';

export function renderNav(navItems, activeKey, cta) {
  const items = navItems
    .map(({ key, label, path }) => {
      const current = key === activeKey ? ' aria-current="page"' : '';
      return `<li><a href="${escapeHtml(path)}"${current}>${escapeHtml(label)}</a></li>`;
    })
    .join('');
  const ctaItem = cta
    ? `<li><a class="btn btn--primary btn--sm site-nav__cta" href="${escapeHtml(cta.path)}"${cta.key === activeKey ? ' aria-current="page"' : ''}>${escapeHtml(cta.label)}</a></li>`
    : '';
  return `<nav id="primary-navigation" class="site-nav" aria-label="Primary"><ul>${items}${ctaItem}</ul></nav>`;
}
