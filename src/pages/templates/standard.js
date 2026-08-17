import { escapeHtml } from '../escape.js';
import { renderHeader } from '../../components/partials/header.js';
import { renderFooter } from '../../components/partials/footer.js';
import { renderCta } from '../../components/cta.js';

export function renderStandardPage({ content, navItems, activeKey, site }) {
  const paragraphs = content.paragraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');
  const link = content.link
    ? `<p><a href="${escapeHtml(content.link.path)}">${escapeHtml(content.link.label)}</a></p>`
    : '';
  // PF-053: headingLevel 2 — a sibling of the page's own <h1>, not nested
  // under any <h2> (standard.js has none), matching Process's closing-CTA
  // precedent.
  const cta = content.cta ? renderCta({ ...content.cta, headingLevel: 2 }) : '';
  return {
    header: renderHeader(navItems, activeKey, site),
    main: `<div class="container"><h1>${escapeHtml(content.heading)}</h1>${paragraphs}${link}${cta}</div>`,
    footer: renderFooter(navItems, site),
  };
}
