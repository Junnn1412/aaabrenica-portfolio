// PF-041 — extracted from src/pages/templates/home.js for its second real
// caller (PF-050's solutions.js template). eyebrow and lede are both
// optional — omitted entirely when absent, never rendered empty.
import { escapeHtml } from '../pages/escape.js';

export function renderSectionHeader({ eyebrow, heading, lede }) {
  const eyebrowMarkup = eyebrow
    ? `<span class="section-header__eyebrow">${escapeHtml(eyebrow)}</span>`
    : '';
  const ledeMarkup = lede
    ? `<p class="section-header__lede">${escapeHtml(lede)}</p>`
    : '';
  return (
    `<div class="section-header">` +
    eyebrowMarkup +
    `<h2 class="section-header__heading">${escapeHtml(heading)}</h2>` +
    ledeMarkup +
    `</div>`
  );
}
