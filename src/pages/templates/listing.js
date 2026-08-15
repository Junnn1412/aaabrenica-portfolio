import { escapeHtml } from '../escape.js';
import { renderHeader } from '../../components/partials/header.js';
import { renderFooter } from '../../components/partials/footer.js';

function renderLinkListItem({ label, path }) {
  return `<li><a href="${escapeHtml(path)}">${escapeHtml(label)}</a></li>`;
}

export function renderListingPage({ content, navItems, activeKey }) {
  const paragraphs = content.paragraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');
  const links = `<ul>${content.links.map(renderLinkListItem).join('')}</ul>`;
  return {
    header: renderHeader(navItems, activeKey),
    main: `<h1>${escapeHtml(content.heading)}</h1>${paragraphs}${links}`,
    footer: renderFooter(),
  };
}
