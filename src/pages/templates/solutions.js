// PF-050 — the Solutions-page template. Six anchored sections, one per
// approved capability (§7.1/home.js), each covering problem/audience/
// what-I-build/benefit (§10.1) plus an optional evidence link and a
// per-section inquiry CTA. Follows home.js's per-section container-
// ownership shape (docs/DECISION_LOG.md's PF-040 entry) and reuses its
// shared renderSectionHeader() rather than duplicating it.
import { escapeHtml } from '../escape.js';
import { renderHeader } from '../../components/partials/header.js';
import { renderFooter } from '../../components/partials/footer.js';
import { renderSectionHeader } from '../../components/section-header.js';
import { renderIcon } from '../../components/icon.js';
import { renderCta } from '../../components/cta.js';
import { CAPABILITY_ICONS } from '../icon-registry.js';

function renderIntro(content) {
  const paragraphs = content.paragraphs
    .map((p) => `<p class="text-lead">${escapeHtml(p)}</p>`)
    .join('');
  return `<h1>${escapeHtml(content.heading)}</h1>${paragraphs}`;
}

// aria-label gives this nav an accessible name without adding a second,
// competing heading — its link text already repeats the page's own six
// upcoming <h2>s, so a visible/structural heading of its own would be
// redundant, not clarifying.
function renderJumpNav(sections) {
  const items = sections
    .map(
      (section) =>
        `<li class="solutions-jump-nav__item"><a class="solutions-jump-nav__link" href="#${escapeHtml(section.id)}">${escapeHtml(section.heading)}</a></li>`,
    )
    .join('');
  return (
    `<nav class="solutions-jump-nav" aria-label="Solutions sections">` +
    `<ul class="solutions-jump-nav__list">${items}</ul>` +
    `</nav>`
  );
}

// evidence is genuinely optional — omitted entirely (not rendered empty)
// when a section has no documented project match, per the architecture
// doc's "omit unavailable optional elements cleanly" rule.
function renderEvidence(evidence) {
  if (!evidence) return '';
  return (
    `<p class="solution-section__evidence">` +
    `<a href="${escapeHtml(evidence.path)}">Related project: ${escapeHtml(evidence.label)}</a>` +
    `</p>`
  );
}

function renderSolutionSection(section) {
  const iconMarkup = `<span class="solution-section__icon solution-section__icon--${escapeHtml(section.accent)}">${renderIcon(CAPABILITY_ICONS[section.icon])}</span>`;

  return (
    `<section id="${escapeHtml(section.id)}" class="page-section solution-section">` +
    `<div class="container">` +
    `<div class="solution-section__heading-row">` +
    iconMarkup +
    renderSectionHeader({ heading: section.heading }) +
    `</div>` +
    `<dl class="solution-section__detail">` +
    `<dt class="solution-section__label">The Problem</dt>` +
    `<dd>${escapeHtml(section.problem)}</dd>` +
    `<dt class="solution-section__label">Who It's For</dt>` +
    `<dd>${escapeHtml(section.audience)}</dd>` +
    `<dt class="solution-section__label">What I Can Build</dt>` +
    `<dd>${escapeHtml(section.build)}</dd>` +
    `<dt class="solution-section__label">Expected Benefit</dt>` +
    `<dd>${escapeHtml(section.benefit)}</dd>` +
    `</dl>` +
    renderEvidence(section.evidence) +
    `<p class="solution-section__action">` +
    `<a href="${escapeHtml(section.cta.path)}">${escapeHtml(section.cta.label)}</a>` +
    `</p>` +
    `</div></section>`
  );
}

function renderClosingCtaSection(cta) {
  return (
    `<section class="page-section"><div class="container">` +
    renderCta(cta) +
    `</div></section>`
  );
}

export function renderSolutionsPage({ content, navItems, activeKey, site }) {
  const main =
    `<div class="container">${renderIntro(content)}${renderJumpNav(content.sections)}</div>` +
    content.sections.map(renderSolutionSection).join('') +
    renderClosingCtaSection(content.cta);

  return {
    header: renderHeader(navItems, activeKey, site),
    main,
    footer: renderFooter(navItems, site),
  };
}
