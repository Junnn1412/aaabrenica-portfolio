import { escapeHtml } from '../escape.js';
import { renderHeader } from '../../components/partials/header.js';
import { renderFooter } from '../../components/partials/footer.js';

export function renderStandardPage({ content, navItems, activeKey, site }) {
  const paragraphs = content.paragraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');
  const link = content.link
    ? `<p><a href="${escapeHtml(content.link.path)}">${escapeHtml(content.link.label)}</a></p>`
    : '';
  return {
    header: renderHeader(navItems, activeKey, site),
    main: `<div class="container"><h1>${escapeHtml(content.heading)}</h1>${paragraphs}${link}</div>`,
    footer: renderFooter(navItems, site),
  };
}
