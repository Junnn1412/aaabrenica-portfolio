// PF-041 — the real caller PF-033's decision log named as the trigger to
// finally add this renderer. Reproduces the Gate-C-approved markup contract
// exactly as proven in dev/design-system/index.html and styled by
// src/styles/components/_project-card.scss. Real cards carry no summary or
// tags (none approved — PF-003 still blocked) and an empty .media-frame (no
// <img>), matching the PF-033 clean-empty-frame precedent exactly — this
// renderer still supports both fields generically since the approved
// markup contract itself supports them, for a future caller with real
// content, but no home.js content currently populates them.
import { escapeHtml } from '../pages/escape.js';

// PF-052 — closed set: 3 (nested directly under a page-level h2 section —
// every real caller today: home.js's Projects section, work.js's Projects
// section) and 4 (the prior unconditional default, preserved so the
// Gate-C showcase's static markup and any future unchanged caller keep
// their current contract). Never interpolate an unvalidated value into
// the tag string — the Set membership check below is what makes that
// safe. headingLevel is a template-authored render parameter, never
// content-driven.
const ALLOWED_PROJECT_CARD_HEADING_LEVELS = new Set([3, 4]);

function renderProjectCard({
  featured = false,
  category,
  heading,
  summary,
  tags,
  link,
  headingLevel = 4,
}) {
  if (!ALLOWED_PROJECT_CARD_HEADING_LEVELS.has(headingLevel)) {
    throw new Error(
      `renderProjectCard: headingLevel must be one of ${[...ALLOWED_PROJECT_CARD_HEADING_LEVELS].join(', ')}, received ${JSON.stringify(headingLevel)}`,
    );
  }
  const headingTag = `h${headingLevel}`;
  const cardClass = featured
    ? 'project-card project-card--featured'
    : 'project-card';

  const frame =
    `<div class="project-card__frame">` +
    `<span class="project-card__frame-dots" aria-hidden="true"></span>` +
    `<div class="media-frame project-card__media"></div>` +
    `</div>`;

  const categoryMarkup = category
    ? `<span class="project-card__category tag">${escapeHtml(category)}</span>`
    : '';
  const headingInner = link
    ? `<a class="project-card__link" href="${escapeHtml(link)}">${escapeHtml(heading)}</a>`
    : escapeHtml(heading);
  const summaryMarkup = summary
    ? `<p class="project-card__summary">${escapeHtml(summary)}</p>`
    : '';
  const tagsMarkup =
    Array.isArray(tags) && tags.length > 0
      ? `<div class="project-card__tags">${tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`
      : '';
  const actionMarkup = link
    ? `<span class="project-card__action" aria-hidden="true">View Case Study →</span>`
    : '';

  const content =
    `<div class="project-card__content">` +
    categoryMarkup +
    `<${headingTag} class="project-card__heading">${headingInner}</${headingTag}>` +
    summaryMarkup +
    tagsMarkup +
    actionMarkup +
    `</div>`;

  return `<li class="${cardClass}">${frame}${content}</li>`;
}

// The default auto-fit/minmax() grid computes its column count purely from
// available width, unaware that a featured card spans the full row — at
// widths wide enough for 3 auto-fit columns, exactly one featured card plus
// two secondary cards leaves a third track empty (see
// src/styles/components/_project-card.scss). `.project-cards--featured-pair`
// forces a fixed 2-column grid for that specific, real shape instead.
// Detected from the actual item composition, not a page-specific flag, so
// any future caller with the same shape gets the same correct layout.
function needsFeaturedPairLayout(items) {
  const featuredCount = items.filter((item) => item.featured).length;
  return featuredCount === 1 && items.length - featuredCount === 2;
}

export function renderProjectCards(items, headingLevel = 4) {
  const listClass = needsFeaturedPairLayout(items)
    ? 'project-cards project-cards--featured-pair'
    : 'project-cards';
  return `<ul class="${listClass}">${items
    .map((item) => renderProjectCard({ ...item, headingLevel }))
    .join('')}</ul>`;
}
