// PF-060 — the real case-study template, shared by every case-study route.
// Every named section is independently optional (src/pages/content-schema.js
// enforces the same shape) and rendered only when present — never an empty
// heading, frame, or "coming soon" placeholder. FES Challenger is the first
// real caller; PF-061/062 reuse this unchanged and simply omit whatever
// sections they don't have verified content for.
import { escapeHtml } from '../escape.js';
import { renderHeader } from '../../components/partials/header.js';
import { renderFooter } from '../../components/partials/footer.js';
import { renderSectionHeader } from '../../components/section-header.js';
import { renderCta } from '../../components/cta.js';

function renderIntro(content) {
  const paragraphs = content.paragraphs
    .map((p) => `<p class="text-lead">${escapeHtml(p)}</p>`)
    .join('');
  const logo = content.logo
    ? `<img class="case-study-hero__logo" src="${escapeHtml(content.logo.src)}" alt="${escapeHtml(content.logo.alt ?? '')}">`
    : '';
  const heading = `<div class="case-study-hero__heading-row">${logo}<h1>${escapeHtml(content.heading)}</h1></div>`;
  const externalLink = content.externalLink
    ? `<p><a class="btn btn--secondary" href="${escapeHtml(content.externalLink.url)}">${escapeHtml(content.externalLink.label)}</a></p>`
    : '';
  return `<div class="container">${heading}${paragraphs}${externalLink}</div>`;
}

function renderMarkedList(items) {
  return `<ul class="list--marked">${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
}

function renderProseSection(heading, body) {
  const paragraphs = body.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
  return (
    `<section class="page-section"><div class="container">` +
    renderSectionHeader({ heading }) +
    paragraphs +
    `</div></section>`
  );
}

// body is required; items is optional (e.g. solution.features may be
// absent) — the list is simply omitted, never rendered empty, when so.
function renderProseWithListSection(heading, body, items) {
  const paragraphs = body.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
  const list = items && items.length > 0 ? renderMarkedList(items) : '';
  return (
    `<section class="page-section"><div class="container">` +
    renderSectionHeader({ heading }) +
    paragraphs +
    list +
    `</div></section>`
  );
}

function renderListOnlySection(heading, items) {
  return (
    `<section class="page-section"><div class="container">` +
    renderSectionHeader({ heading }) +
    renderMarkedList(items) +
    `</div></section>`
  );
}

// Deliberately a plain tag row, not a <ul>/<li> list — mirrors
// .project-card__tags' existing precedent for the same "short technology
// labels" shape rather than introducing a second pattern for it.
function renderTagsSection(heading, items) {
  const tags = items
    .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
    .join('');
  return (
    `<section class="page-section"><div class="container">` +
    renderSectionHeader({ heading }) +
    `<div class="case-study-tech-stack">${tags}</div>` +
    `</div></section>`
  );
}

// Omitted entirely (not an empty grid or "coming soon" placeholder) when no
// gallery is present — real, reviewed screenshots only (docs/DECISION_LOG.md).
// width/height are pre-validated positive integers by content-schema.js, so
// they're interpolated directly, matching this project's existing precedent
// for other schema-guaranteed values.
function renderGallerySection(gallery) {
  if (gallery == null) return '';
  const items = gallery.items
    .map((item) => {
      const caption = item.caption
        ? `<figcaption>${escapeHtml(item.caption)}</figcaption>`
        : '';
      return (
        `<li class="case-study-gallery__item"><figure>` +
        `<div class="media-frame"><img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy"></div>` +
        caption +
        `</figure></li>`
      );
    })
    .join('');
  return (
    `<section class="page-section"><div class="container">` +
    renderSectionHeader({ heading: 'Project Gallery' }) +
    `<ul class="case-study-gallery">${items}</ul>` +
    `</div></section>`
  );
}

function renderClosingCtaSection(cta) {
  return (
    `<section class="page-section"><div class="container">` +
    renderCta({ ...cta, headingLevel: 2 }) +
    `</div></section>`
  );
}

export function renderCaseStudyPage({ content, navItems, activeKey, site }) {
  const sections = [];

  if (content.client) {
    sections.push(
      renderProseSection('Client & Business Context', content.client.body),
    );
  }
  if (content.problem) {
    sections.push(renderProseSection('The Challenge', content.problem.body));
  }
  if (content.role) {
    sections.push(
      renderProseWithListSection(
        'My Role',
        content.role.body,
        content.role.responsibilities,
      ),
    );
  }
  if (content.solution) {
    sections.push(
      renderProseWithListSection(
        'What I Built',
        content.solution.body,
        content.solution.features,
      ),
    );
  }
  if (content.technologyStack) {
    sections.push(
      renderTagsSection('Technology Stack', content.technologyStack.items),
    );
  }
  if (content.decisions) {
    sections.push(
      renderListOnlySection('Key Decisions', content.decisions.items),
    );
  }
  if (content.outcomes) {
    sections.push(renderListOnlySection('Outcomes', content.outcomes.items));
  }
  sections.push(renderGallerySection(content.gallery));

  const backLink = `<div class="container"><p><a href="${escapeHtml(content.backLink.path)}">${escapeHtml(content.backLink.label)}</a></p></div>`;
  const closingCta = content.cta ? renderClosingCtaSection(content.cta) : '';

  const main = renderIntro(content) + sections.join('') + backLink + closingCta;

  return {
    header: renderHeader(navItems, activeKey, site),
    main,
    footer: renderFooter(navItems, site),
  };
}
