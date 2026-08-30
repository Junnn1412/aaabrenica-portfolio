import { escapeHtml } from '../escape.js';
import { renderHeader } from '../../components/partials/header.js';
import { renderFooter } from '../../components/partials/footer.js';
import { renderActionLink } from '../../components/action-link.js';
import { contentRevealAttributes } from '../../components/content-reveal.js';

function renderLinks(links) {
  const items = links
    .map(
      ({ label, path }) =>
        `<li class="not-found__link-item">${renderActionLink({ label, href: path, variant: 'forward' })}</li>`,
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
    main: `<div class="container"><div${contentRevealAttributes('fade-up')}><h1>${escapeHtml(content.heading)}</h1>${paragraphs}${renderLinks(content.links)}</div></div>`,
    footer: renderFooter(navItems, site),
  };
}
