// PF-041 — the real caller PF-034's decision log named as the trigger to
// finally add this renderer. Reproduces the Gate-C-approved markup contract
// exactly as proven in dev/design-system/index.html and styled by
// src/styles/components/_engagement-options.scss — plain text items, never
// composed from .tag, and no <a>/<button> inside any item.
import { escapeHtml } from '../pages/escape.js';

export function renderEngagementOptions(items) {
  const listItems = items
    .map(
      (label) =>
        `<li class="engagement-options__item">${escapeHtml(label)}</li>`,
    )
    .join('');
  return `<ul class="engagement-options">${listItems}</ul>`;
}
