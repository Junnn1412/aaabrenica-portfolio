import { escapeHtml } from '../escape.js';
import { renderHeader } from '../../components/partials/header.js';
import { renderFooter } from '../../components/partials/footer.js';
import { renderCta } from '../../components/cta.js';
import { renderActionLink } from '../../components/action-link.js';
import { contentRevealAttributes } from '../../components/content-reveal.js';

export function renderStandardPage({ content, navItems, activeKey, site }) {
  const paragraphs = content.paragraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');
  const link = content.link
    ? `<p>${renderActionLink({ label: content.link.label, href: content.link.path, variant: 'forward' })}</p>`
    : '';
  // PF-053: headingLevel 2 — a sibling of the page's own <h1>, not nested
  // under any <h2> (standard.js has none), matching Process's closing-CTA
  // precedent.
  const cta = content.cta
    ? renderCta({
        ...content.cta,
        headingLevel: 2,
        reveal: 'fade-up',
      })
    : '';
  return {
    header: renderHeader(navItems, activeKey, site),
    main: `<div class="container"><div${contentRevealAttributes('fade-up')}><h1>${escapeHtml(content.heading)}</h1>${paragraphs}${link}</div>${cta}</div>`,
    footer: renderFooter(navItems, site),
  };
}
