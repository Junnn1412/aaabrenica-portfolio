// Project-card media is a required, closed presentation contract. Image
// cards render the approved browser-chrome frame; text-only and deferred
// cards omit the media subtree completely, so absence can never become an
// accidental blank frame.
import { escapeHtml } from '../pages/escape.js';
import { isSafeInternalPath } from '../pages/link-safety.js';

// PF-052 — closed set: 3 (nested directly under a page-level h2 section —
// every real caller today: home.js's Projects section, work.js's Projects
// section) and 4 (the prior unconditional default, preserved so the
// Gate-C showcase's static markup and any future unchanged caller keep
// their current contract). Never interpolate an unvalidated value into
// the tag string — the Set membership check below is what makes that
// safe. headingLevel is a template-authored render parameter, never
// content-driven.
const ALLOWED_PROJECT_CARD_HEADING_LEVELS = new Set([3, 4]);

function hasOnlyKeys(value, allowedKeys) {
  return Object.keys(value).every((key) => allowedKeys.has(key));
}

function validatePresentation(presentation) {
  if (
    presentation == null ||
    typeof presentation !== 'object' ||
    Array.isArray(presentation)
  ) {
    throw new Error(
      'renderProjectCard: presentation must be an object with an explicit valid kind',
    );
  }

  if (presentation.kind === 'image') {
    const valid =
      hasOnlyKeys(
        presentation,
        new Set(['kind', 'src', 'alt', 'width', 'height']),
      ) &&
      isSafeInternalPath(presentation.src) &&
      typeof presentation.alt === 'string' &&
      presentation.alt.length > 0 &&
      Number.isInteger(presentation.width) &&
      presentation.width > 0 &&
      Number.isInteger(presentation.height) &&
      presentation.height > 0;
    if (!valid) {
      throw new Error(
        'renderProjectCard: image presentation requires only a safe src, non-empty alt, and positive integer width/height',
      );
    }
    return;
  }

  if (presentation.kind === 'carousel') {
    const validRoot =
      hasOnlyKeys(presentation, new Set(['kind', 'slides'])) &&
      Array.isArray(presentation.slides) &&
      presentation.slides.length === 3;
    if (!validRoot) {
      throw new Error(
        'renderProjectCard: carousel presentation requires exactly three slides',
      );
    }
    for (const slide of presentation.slides) {
      const validSlide =
        slide != null &&
        typeof slide === 'object' &&
        !Array.isArray(slide) &&
        hasOnlyKeys(slide, new Set(['src', 'alt', 'width', 'height'])) &&
        isSafeInternalPath(slide.src) &&
        typeof slide.alt === 'string' &&
        slide.alt.length > 0 &&
        Number.isInteger(slide.width) &&
        slide.width > 0 &&
        Number.isInteger(slide.height) &&
        slide.height > 0;
      if (!validSlide) {
        throw new Error(
          'renderProjectCard: every carousel presentation slide requires only a safe src, non-empty alt, and positive integer width/height',
        );
      }
    }
    return;
  }

  if (presentation.kind === 'text-only') {
    if (!hasOnlyKeys(presentation, new Set(['kind']))) {
      throw new Error(
        'renderProjectCard: text-only presentation does not accept media or status fields',
      );
    }
    return;
  }

  if (presentation.kind === 'deferred') {
    if (
      !hasOnlyKeys(presentation, new Set(['kind', 'label'])) ||
      typeof presentation.label !== 'string' ||
      presentation.label.length === 0
    ) {
      throw new Error(
        'renderProjectCard: deferred presentation requires only a non-empty label',
      );
    }
    return;
  }

  throw new Error(
    `renderProjectCard: unknown presentation kind ${JSON.stringify(presentation.kind)}`,
  );
}

function renderCarouselPresentation(presentation, heading) {
  const slides = presentation.slides
    .map(
      (slide, index) =>
        `<div class="project-carousel__slide${index === 0 ? ' is-active' : ''}" data-project-carousel-slide role="group" aria-roledescription="slide" aria-label="${index + 1} of 3" aria-hidden="${index === 0 ? 'false' : 'true'}"${index === 0 ? '' : ' hidden'}>` +
        `<img src="${escapeHtml(slide.src)}" alt="${escapeHtml(slide.alt)}" width="${slide.width}" height="${slide.height}" loading="lazy">` +
        `</div>`,
    )
    .join('');
  const indicators = presentation.slides
    .map(
      (_, index) =>
        `<button class="project-carousel__indicator" type="button" data-project-carousel-indicator="${index}" aria-label="Show project image ${index + 1} of 3" aria-pressed="${index === 0 ? 'true' : 'false'}"></button>`,
    )
    .join('');

  return (
    `<section class="project-card__frame project-carousel" data-project-carousel aria-roledescription="carousel" aria-label="${escapeHtml(heading)} project images">` +
    `<div class="project-carousel__controls">` +
    `<button class="project-carousel__arrow project-carousel__arrow--previous" type="button" data-project-carousel-previous aria-label="Previous project image" hidden><span aria-hidden="true">&#8592;</span></button>` +
    `<div class="project-carousel__indicators" role="group" aria-label="Choose project image" hidden>${indicators}</div>` +
    `<button class="project-carousel__arrow project-carousel__arrow--next" type="button" data-project-carousel-next aria-label="Next project image" hidden><span aria-hidden="true">&#8594;</span></button>` +
    `</div>` +
    `<div class="media-frame project-card__media">${slides}</div>` +
    `<p class="visually-hidden" data-project-carousel-status role="status" aria-live="polite" aria-atomic="true"></p>` +
    `</section>`
  );
}

function renderPresentation(presentation, heading) {
  validatePresentation(presentation);

  if (presentation.kind === 'carousel') {
    return renderCarouselPresentation(presentation, heading);
  }

  if (presentation.kind !== 'image') return '';

  return (
    `<div class="project-card__frame">` +
    `<span class="project-card__frame-dots" aria-hidden="true"></span>` +
    `<div class="media-frame project-card__media">` +
    `<img src="${escapeHtml(presentation.src)}" alt="${escapeHtml(presentation.alt)}" width="${presentation.width}" height="${presentation.height}" loading="lazy">` +
    `</div>` +
    `</div>`
  );
}

function renderProjectCard({
  featured = false,
  category,
  heading,
  summary,
  tags,
  link,
  presentation,
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

  const frame = renderPresentation(presentation, heading);

  const categoryMarkup = category
    ? `<span class="project-card__category tag">${escapeHtml(category)}</span>`
    : '';
  const headingInner = link
    ? `<a class="project-card__link" href="${escapeHtml(link)}">${escapeHtml(heading)}</a>`
    : escapeHtml(heading);
  const summaryMarkup = summary
    ? `<p class="project-card__summary">${escapeHtml(summary)}</p>`
    : '';
  const statusMarkup =
    presentation.kind === 'deferred'
      ? `<p class="project-card__status">${escapeHtml(presentation.label)}</p>`
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
    statusMarkup +
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
  const listClass =
    items.length === 1
      ? 'project-cards project-cards--single'
      : needsFeaturedPairLayout(items)
        ? 'project-cards project-cards--featured-pair'
        : 'project-cards';
  return `<ul class="${listClass}">${items
    .map((item) => renderProjectCard({ ...item, headingLevel }))
    .join('')}</ul>`;
}
