import { escapeHtml } from '../escape.js';
import { renderHeader } from '../../components/partials/header.js';
import { renderFooter } from '../../components/partials/footer.js';

function renderLinks(links) {
  const items = links
    .map(
      ({ label, path }) =>
        `<li class="not-found__link-item"><a class="not-found__link" href="${escapeHtml(path)}">${escapeHtml(label)}</a></li>`,
    )
    .join('');
  return `<ul class="not-found__links">${items}</ul>`;
}

export function renderNotFoundPage({ content, navItems, activeKey, site }) {
  const paragraphs = content.paragraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');
  return {
    header: renderHeader(navItems, activeKey, site),
    main: `<div class="container"><h1>${escapeHtml(content.heading)}</h1>${paragraphs}${renderLinks(content.links)}</div>`,
    footer: renderFooter(navItems, site),
  };
}
