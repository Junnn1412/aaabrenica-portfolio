// PF-041 — the real caller PF-032's decision log named as the trigger to
// finally add this renderer. Reproduces the Gate-C-approved markup contract
// exactly as proven in dev/design-system/index.html and styled by
// src/styles/components/_capability-card.scss — no markup change from that
// contract. See docs/DESIGN_SYSTEM.md's "Capability cards (PF-032)" section.
import { escapeHtml } from '../pages/escape.js';
import { renderIcon } from './icon.js';
import { CAPABILITY_ICONS, CARD_ARROW_ICON } from '../pages/icon-registry.js';

// PF-052 — closed set: 3 (nested directly under a page-level h2 section —
// home.js's Capabilities section) and 4 (the prior unconditional default,
// preserved so the Gate-C showcase's static markup and any future
// unchanged caller keep their current contract). Never interpolate an
// unvalidated value into the tag string — the Set membership check below
// is what makes that safe. headingLevel is a template-authored render
// parameter, never content-driven.
const ALLOWED_CAPABILITY_CARD_HEADING_LEVELS = new Set([3, 4]);

function renderCapabilityCard({
  accent,
  icon,
  heading,
  description,
  link,
  headingLevel = 4,
}) {
  if (!ALLOWED_CAPABILITY_CARD_HEADING_LEVELS.has(headingLevel)) {
    throw new Error(
      `renderCapabilityCard: headingLevel must be one of ${[...ALLOWED_CAPABILITY_CARD_HEADING_LEVELS].join(', ')}, received ${JSON.stringify(headingLevel)}`,
    );
  }
  const headingTag = `h${headingLevel}`;
  const iconMarkup = icon
    ? `<span class="capability-card__icon">${renderIcon(CAPABILITY_ICONS[icon])}</span>`
    : '';
  const headingInner = link
    ? `<a class="capability-card__link" href="${escapeHtml(link)}">${escapeHtml(heading)}</a>`
    : escapeHtml(heading);
  const arrowMarkup = link
    ? `<span class="capability-card__arrow">${renderIcon(CARD_ARROW_ICON)}</span>`
    : '';
  return (
    `<li class="capability-card capability-card--${escapeHtml(accent)}">` +
    iconMarkup +
    `<${headingTag} class="capability-card__heading">${headingInner}</${headingTag}>` +
    `<p class="capability-card__description">${escapeHtml(description)}</p>` +
    arrowMarkup +
    `</li>`
  );
}

export function renderCapabilityCards(items, headingLevel = 4) {
  return `<ul class="capability-cards">${items
    .map((item) => renderCapabilityCard({ ...item, headingLevel }))
    .join('')}</ul>`;
}
