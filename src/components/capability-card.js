// PF-041 — the real caller PF-032's decision log named as the trigger to
// finally add this renderer. Reproduces the Gate-C-approved markup contract
// exactly as proven in dev/design-system/index.html and styled by
// src/styles/components/_capability-card.scss — no markup change from that
// contract. See docs/DESIGN_SYSTEM.md's "Capability cards (PF-032)" section.
import { escapeHtml } from '../pages/escape.js';
import { renderIcon } from './icon.js';
import { CAPABILITY_ICONS, CARD_ARROW_ICON } from '../pages/icon-registry.js';

function renderCapabilityCard({ accent, icon, heading, description, link }) {
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
    `<h4 class="capability-card__heading">${headingInner}</h4>` +
    `<p class="capability-card__description">${escapeHtml(description)}</p>` +
    arrowMarkup +
    `</li>`
  );
}

export function renderCapabilityCards(items) {
  return `<ul class="capability-cards">${items.map(renderCapabilityCard).join('')}</ul>`;
}
