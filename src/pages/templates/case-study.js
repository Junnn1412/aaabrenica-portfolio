import { escapeHtml } from '../escape.js';
import { renderHeader } from '../../components/partials/header.js';
import { renderFooter } from '../../components/partials/footer.js';

export function renderCaseStudyPage({ content, navItems, activeKey, site }) {
  const paragraphs = content.paragraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');
  const backLink = `<p><a href="${escapeHtml(content.backLink.path)}">${escapeHtml(content.backLink.label)}</a></p>`;
  return {
    header: renderHeader(navItems, activeKey, site),
    main: `<div class="container"><h1>${escapeHtml(content.heading)}</h1>${paragraphs}${backLink}</div>`,
    footer: renderFooter(navItems, site),
  };
}
