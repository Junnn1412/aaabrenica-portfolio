// PF-060/PF-064 — the shared case-study renderer. Optional named sections
// are omitted cleanly. Editorial pairing is derived from section presence,
// never from a route/content key, so partial cases acquire no empty tracks.
import { escapeHtml } from '../escape.js';
import { renderHeader } from '../../components/partials/header.js';
import { renderFooter } from '../../components/partials/footer.js';
import { renderSectionHeader } from '../../components/section-header.js';
import { renderCta } from '../../components/cta.js';
import { renderActionLink } from '../../components/action-link.js';
import { contentRevealAttributes } from '../../components/content-reveal.js';

function renderHero(content) {
  const paragraphs = content.paragraphs
    .map((paragraph) => `<p class="text-lead">${escapeHtml(paragraph)}</p>`)
    .join('');
  const logo = content.logo
    ? `<img class="case-study-hero__logo" src="${escapeHtml(content.logo.src)}" alt="${escapeHtml(content.logo.alt ?? '')}" width="${content.logo.width}" height="${content.logo.height}">`
    : '';
  const heading = `<div class="case-study-hero__heading-row">${logo}<h1>${escapeHtml(content.heading)}</h1></div>`;
  const externalLink = content.externalLink
    ? `<p><a class="btn btn--secondary" href="${escapeHtml(content.externalLink.url)}">${escapeHtml(content.externalLink.label)}</a></p>`
    : '';
  const media = content.heroMedia
    ? `<div class="media-frame case-study-hero__media"${contentRevealAttributes('fade-in')}><img src="${escapeHtml(content.heroMedia.src)}" alt="${escapeHtml(content.heroMedia.alt)}" width="${content.heroMedia.width}" height="${content.heroMedia.height}" loading="eager" fetchpriority="high" decoding="async"></div>`
    : '';
  const modifier = content.heroMedia ? ' case-study-hero--with-media' : '';

  return (
    `<section class="case-study-hero${modifier}">` +
    `<div class="case-study-hero__copy"${contentRevealAttributes('fade-up')}>${heading}${paragraphs}${externalLink}</div>` +
    media +
    `</section>`
  );
}

function renderMarkedList(items, { balanced = false } = {}) {
  const modifier = balanced ? ' case-study-list--balanced' : '';
  return `<ul class="list--marked case-study-list${modifier}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderSection({ key, heading, body = [], items, balanced = false }) {
  const paragraphs = body
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('');
  const list = items?.length ? renderMarkedList(items, { balanced }) : '';
  return (
    `<section class="page-section case-study-section case-study-section--${key}"${contentRevealAttributes('fade-up')}>` +
    renderSectionHeader({ heading }) +
    paragraphs +
    list +
    `</section>`
  );
}

function renderPair(sections, pairName) {
  const present = sections.filter(Boolean);
  if (present.length === 0) return '';
  const modifier = present.length === 1 ? ' case-study-pair--single' : '';
  return `<div class="case-study-pair case-study-pair--${pairName}${modifier}">${present.join('')}</div>`;
}

function renderTagsSection(items) {
  const tags = items
    .map((technology) => `<span class="tag">${escapeHtml(technology)}</span>`)
    .join('');
  return (
    `<section class="page-section case-study-section case-study-section--technology"${contentRevealAttributes('fade-up')}>` +
    renderSectionHeader({ heading: 'Technology Stack' }) +
    `<div class="case-study-tech-stack">${tags}</div>` +
    `</section>`
  );
}

function renderGallerySection(gallery) {
  if (gallery == null) return '';
  const items = gallery.items
    .map((item) => {
      const caption = item.caption
        ? `<figcaption>${escapeHtml(item.caption)}</figcaption>`
        : '';
      return (
        `<li class="case-study-gallery__item"><figure>` +
        `<div class="media-frame"><img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async"></div>` +
        caption +
        `</figure></li>`
      );
    })
    .join('');
  return (
    `<section class="page-section case-study-section case-study-section--gallery"${contentRevealAttributes('fade-in')}>` +
    renderSectionHeader({ heading: 'Project Gallery' }) +
    `<ul class="case-study-gallery">${items}</ul>` +
    `</section>`
  );
}

function renderNarrative(content) {
  const client = content.client
    ? renderSection({
        key: 'client',
        heading: 'Client & Business Context',
        body: content.client.body,
      })
    : '';
  const problem = content.problem
    ? renderSection({
        key: 'problem',
        heading: 'The Challenge',
        body: content.problem.body,
      })
    : '';
  const role = content.role
    ? renderSection({
        key: 'role',
        heading: 'My Role',
        body: content.role.body,
        items: content.role.responsibilities,
        balanced: true,
      })
    : '';
  const solution = content.solution
    ? renderSection({
        key: 'solution',
        heading: 'What I Built',
        body: content.solution.body,
        items: content.solution.features,
      })
    : '';
  const decisions = content.decisions
    ? renderSection({
        key: 'decisions',
        heading: 'Key Decisions',
        items: content.decisions.items,
      })
    : '';
  const technology = content.technologyStack
    ? renderTagsSection(content.technologyStack.items)
    : '';
  const outcomes = content.outcomes
    ? renderSection({
        key: 'outcomes',
        heading: 'Outcomes',
        items: content.outcomes.items,
        balanced: true,
      })
    : '';

  return (
    `<div class="case-study-narrative">` +
    renderPair([client, problem], 'context') +
    role +
    renderPair([solution, decisions], 'delivery') +
    technology +
    outcomes +
    renderGallerySection(content.gallery) +
    `</div>`
  );
}

export function renderCaseStudyPage({ content, navItems, activeKey, site }) {
  const backLink = `<p class="case-study-back">${renderActionLink({ label: content.backLink.label, href: content.backLink.path, variant: 'back' })}</p>`;
  const closingCta = content.cta
    ? `<section class="page-section case-study-closing">${renderCta({ ...content.cta, headingLevel: 2, reveal: 'fade-up' })}</section>`
    : '';
  const main =
    `<div class="container case-study">` +
    renderHero(content) +
    renderNarrative(content) +
    backLink +
    closingCta +
    `</div>`;

  return {
    header: renderHeader(navItems, activeKey, site),
    main,
    footer: renderFooter(navItems, site),
  };
}
