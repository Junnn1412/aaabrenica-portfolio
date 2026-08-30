// PF-041 — the homepage template. Unlike standard/case-study (one
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
import { renderProfileCard } from '../../components/profile-card.js';
import { renderHeroVisual } from '../../components/hero-visual.js';
import { renderActionLink } from '../../components/action-link.js';
import { getVisibleProjectCards } from '../../content/project-card-visibility.js';
import { contentRevealAttributes } from '../../components/content-reveal.js';

// Original, decorative, aria-hidden abstract technical composition — no
// fabricated screenshot, no textual claim. Same inline-SVG technique
// already proven in the project-card demo specimen's decorative
// composition (dev/design-system/index.html).
function renderHero(content) {
  const paragraphs = content.paragraphs
    .map((p) => `<p class="text-lead">${escapeHtml(p)}</p>`)
    .join('');
  const { primaryCta, secondaryCta } = content.hero;
  return (
    `<section class="hero"><div class="container hero__inner">` +
    `<div class="hero__content"${contentRevealAttributes('fade-up')}>` +
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
    `<section class="page-section"><div class="container"><div class="home-reveal-group"${contentRevealAttributes('fade-up')}>` +
    renderSectionHeader(trust) +
    renderTrustList(trust.items, trust.link) +
    `</div></div></section>`
  );
}

// §9.4: no existing component — composed entirely from PF-021 base
// elements (.list--marked, .text-lead), no new component CSS.
function renderProblemsSection(problems) {
  const items = problems.items.map((p) => `<li>${escapeHtml(p)}</li>`).join('');
  return (
    `<section class="page-section"><div class="container"><div class="home-reveal-group"${contentRevealAttributes('fade-up')}>` +
    renderSectionHeader(problems) +
    `<ul class="list--marked">${items}</ul>` +
    `<p class="text-lead">${escapeHtml(problems.reassurance)}</p>` +
    `<p>${renderActionLink({ label: problems.link.label, href: problems.link.path, variant: 'forward' })}</p>` +
    `</div></div></section>`
  );
}

function renderCapabilitiesSection(capabilities) {
  return (
    `<section class="page-section"><div class="container"><div class="home-reveal-group"${contentRevealAttributes('fade-up')}>` +
    renderSectionHeader(capabilities) +
    renderCapabilityCards(capabilities.items, 3) +
    `</div></div></section>`
  );
}

function renderProjectsSection(projects) {
  const visibleItems = getVisibleProjectCards(projects.items);
  return (
    `<section class="page-section"><div class="container">` +
    `<div${contentRevealAttributes('fade-up')}>${renderSectionHeader(projects)}</div>` +
    `<div class="home-projects__body">` +
    renderProjectCards(visibleItems, 3) +
    `<p class="home-projects__action">${renderActionLink({ label: projects.link.label, href: projects.link.path, variant: 'forward' })}</p>` +
    `</div>` +
    `</div></section>`
  );
}

function renderProcessSection(process) {
  return (
    `<section class="page-section"><div class="container"><div class="home-reveal-group"${contentRevealAttributes('fade-up')}>` +
    renderSectionHeader(process) +
    renderProcessSteps(process.steps, process.link) +
    `</div></div></section>`
  );
}

// No eyebrow — the section heading is the verbatim §9.8 lead sentence
// itself, matching the showcase's own precedent of adding no extra framing
// around it.
function renderEngagementSection(engagement) {
  return (
    `<section class="page-section"><div class="container"><div class="home-reveal-group"${contentRevealAttributes('fade-up')}>` +
    renderSectionHeader({
      heading: engagement.heading,
      lede: engagement.lede,
    }) +
    renderEngagementOptions(engagement.items) +
    `</div></div></section>`
  );
}

// §9.9: approved copy remains in the first column; the shared compact
// profile card follows it and owns the section's one relocated About action.
function renderAboutSection(about, profile) {
  const paragraphs = about.paragraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');
  return (
    `<section class="page-section"><div class="container">` +
    `<div class="home-about">` +
    `<div class="home-about__copy"${contentRevealAttributes('fade-up')}>` +
    renderSectionHeader(about) +
    paragraphs +
    `</div>` +
    renderProfileCard({
      ...about.profileCard,
      variant: 'compact',
      profile,
      reveal: 'fade-in',
    }) +
    `</div>` +
    `</div></section>`
  );
}

function renderCtaSection(cta) {
  return (
    `<section class="page-section"><div class="container">` +
    renderCta({ ...cta, reveal: 'fade-up' }) +
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
    renderAboutSection(content.about, site.profile) +
    renderCtaSection(content.cta);

  return {
    header: renderHeader(navItems, activeKey, site),
    main,
    footer: renderFooter(navItems, site),
  };
}
