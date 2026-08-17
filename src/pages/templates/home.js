// PF-041 — the homepage template. Unlike standard/listing/case-study (one
// <div class="container"> wrapping the whole main), each section here owns
// its own inner .container, per docs/DECISION_LOG.md's PF-040 entry, which
// names this exact shape as the reason .container became template-owned
// rather than skeleton-owned — so the hero (and any future full-bleed
// section) never has to fight a page-level wrapper.
import { escapeHtml } from '../escape.js';
import { renderHeader } from '../../components/partials/header.js';
import { renderFooter } from '../../components/partials/footer.js';
import { renderCapabilityCards } from '../../components/capability-card.js';
import { renderProjectCards } from '../../components/project-card.js';
import { renderProcessSteps } from '../../components/process-steps.js';
import { renderTrustList } from '../../components/trust-list.js';
import { renderEngagementOptions } from '../../components/engagement-options.js';
import { renderCta } from '../../components/cta.js';
import { renderSectionHeader } from '../../components/section-header.js';

// Original, decorative, aria-hidden abstract technical composition — no
// fabricated screenshot, no textual claim. Same inline-SVG technique
// already proven in the project-card demo specimen's decorative
// composition (dev/design-system/index.html).
function renderHeroVisual() {
  return (
    `<svg class="hero__visual" viewBox="0 0 400 400" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">` +
    `<circle cx="120" cy="130" r="70" fill="none" stroke="var(--color-border-interactive)" stroke-width="2"></circle>` +
    `<circle cx="290" cy="260" r="46" fill="none" stroke="var(--color-accent)" stroke-width="2"></circle>` +
    `<path d="M60 320 L160 200 L230 250 L360 90" fill="none" stroke="var(--color-border-interactive)" stroke-width="2"></path>` +
    `<circle cx="60" cy="320" r="5" fill="var(--color-accent)"></circle>` +
    `<circle cx="160" cy="200" r="5" fill="var(--color-accent)"></circle>` +
    `<circle cx="230" cy="250" r="5" fill="var(--color-accent)"></circle>` +
    `<circle cx="360" cy="90" r="5" fill="var(--color-accent)"></circle>` +
    `</svg>`
  );
}

function renderHero(content) {
  const paragraphs = content.paragraphs
    .map((p) => `<p class="text-lead">${escapeHtml(p)}</p>`)
    .join('');
  const { primaryCta, secondaryCta } = content.hero;
  return (
    `<section class="hero"><div class="container hero__inner">` +
    `<div class="hero__content">` +
    `<h1 class="text-display">${escapeHtml(content.heading)}</h1>` +
    paragraphs +
    `<div class="hero__actions">` +
    `<a class="btn btn--primary btn--lg" href="${escapeHtml(primaryCta.path)}">${escapeHtml(primaryCta.label)}</a>` +
    `<a class="btn btn--secondary btn--lg" href="${escapeHtml(secondaryCta.path)}">${escapeHtml(secondaryCta.label)}</a>` +
    `</div>` +
    `</div>` +
    `<div class="hero__media">${renderHeroVisual()}</div>` +
    `</div></section>`
  );
}

function renderTrustSection(trust) {
  return (
    `<section class="page-section"><div class="container">` +
    renderSectionHeader(trust) +
    renderTrustList(trust.items, trust.link) +
    `</div></section>`
  );
}

// §9.4: no existing component — composed entirely from PF-021 base
// elements (.list--marked, .text-lead), no new component CSS.
function renderProblemsSection(problems) {
  const items = problems.items.map((p) => `<li>${escapeHtml(p)}</li>`).join('');
  return (
    `<section class="page-section"><div class="container">` +
    renderSectionHeader(problems) +
    `<ul class="list--marked">${items}</ul>` +
    `<p class="text-lead">${escapeHtml(problems.reassurance)}</p>` +
    `<p><a href="${escapeHtml(problems.link.path)}">${escapeHtml(problems.link.label)}</a></p>` +
    `</div></section>`
  );
}

function renderCapabilitiesSection(capabilities) {
  return (
    `<section class="page-section"><div class="container">` +
    renderSectionHeader(capabilities) +
    renderCapabilityCards(capabilities.items) +
    `</div></section>`
  );
}

function renderProjectsSection(projects) {
  return (
    `<section class="page-section"><div class="container">` +
    renderSectionHeader(projects) +
    renderProjectCards(projects.items) +
    `<p><a href="${escapeHtml(projects.link.path)}">${escapeHtml(projects.link.label)}</a></p>` +
    `</div></section>`
  );
}

function renderProcessSection(process) {
  return (
    `<section class="page-section"><div class="container">` +
    renderSectionHeader(process) +
    renderProcessSteps(process.steps, process.link) +
    `</div></section>`
  );
}

// No eyebrow — the section heading is the verbatim §9.8 lead sentence
// itself, matching the showcase's own precedent of adding no extra framing
// around it.
function renderEngagementSection(engagement) {
  return (
    `<section class="page-section"><div class="container">` +
    renderSectionHeader({
      heading: engagement.heading,
      lede: engagement.lede,
    }) +
    renderEngagementOptions(engagement.items) +
    `</div></section>`
  );
}

// §9.9: no existing component — composed entirely from .section-header and
// base body copy; no photo (none approved).
function renderAboutSection(about) {
  const paragraphs = about.paragraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');
  return (
    `<section class="page-section"><div class="container">` +
    renderSectionHeader(about) +
    paragraphs +
    `<p><a href="${escapeHtml(about.link.path)}">${escapeHtml(about.link.label)}</a></p>` +
    `</div></section>`
  );
}

function renderCtaSection(cta) {
  return (
    `<section class="page-section"><div class="container">` +
    renderCta(cta) +
    `</div></section>`
  );
}

export function renderHomePage({ content, navItems, activeKey, site }) {
  const main =
    renderHero(content) +
    renderTrustSection(content.trust) +
    renderProblemsSection(content.problems) +
    renderCapabilitiesSection(content.capabilities) +
    renderProjectsSection(content.projects) +
    renderProcessSection(content.process) +
    renderEngagementSection(content.engagement) +
    renderAboutSection(content.about) +
    renderCtaSection(content.cta);

  return {
    header: renderHeader(navItems, activeKey, site),
    main,
    footer: renderFooter(navItems, site),
  };
}
