// PF-052 — the Work-index template. Mirrors solutions.js/process.js's
// per-section container-ownership shape: intro (bare .container), then
// each top-level block as its own .page-section + .container, closing
// with the shared .cta panel. See docs/DECISION_LOG.md for the full
// rationale.
import { escapeHtml } from '../escape.js';
import { renderHeader } from '../../components/partials/header.js';
import { renderFooter } from '../../components/partials/footer.js';
import { renderSectionHeader } from '../../components/section-header.js';
import { renderProjectCards } from '../../components/project-card.js';
import { renderCta } from '../../components/cta.js';
import { getVisibleProjectCards } from '../../content/project-card-visibility.js';
import { contentRevealAttributes } from '../../components/content-reveal.js';

function renderIntro(content) {
  const paragraphs = content.paragraphs
    .map((p) => `<p class="text-lead">${escapeHtml(p)}</p>`)
    .join('');
  return `<div class="container"><div${contentRevealAttributes('fade-up')}><h1>${escapeHtml(content.heading)}</h1>${paragraphs}</div></div>`;
}

// headingLevel: 3 — these cards sit directly under this section's own
// <h2> (renderSectionHeader() below), so the card headings must be <h3>,
// not renderProjectCards()'s <h4> default (which stays correct for the
// Gate-C showcase and any future unchanged caller). See docs/DECISION_LOG.md's
// PF-052 accessibility-correction entry.
function renderProjectsSection(projects) {
  const visibleItems = getVisibleProjectCards(projects.items);
  return (
    `<section class="page-section"><div class="container">` +
    `<div${contentRevealAttributes('fade-up')}>${renderSectionHeader(projects)}</div>` +
    renderProjectCards(visibleItems, 3) +
    `</div></section>`
  );
}

// headingLevel: 2 — this closing CTA is a sibling of the Projects
// .page-section, not nested beneath it, so its own heading must be a
// second, sibling <h2>, matching the fix PF-051 built for exactly this
// shape (Process's own closing CTA).
function renderClosingCtaSection(cta) {
  return (
    `<section class="page-section"><div class="container">` +
    renderCta({ ...cta, headingLevel: 2, reveal: 'fade-up' }) +
    `</div></section>`
  );
}

export function renderWorkPage({ content, navItems, activeKey, site }) {
  const main =
    renderIntro(content) +
    renderProjectsSection(content.projects) +
    renderClosingCtaSection(content.cta);

  return {
    header: renderHeader(navItems, activeKey, site),
    main,
    footer: renderFooter(navItems, site),
  };
}
