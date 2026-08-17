// PF-041 — the real caller PF-034's decision log named as the trigger to
// finally add this renderer. Reproduces the Gate-C-approved markup contract
// exactly as proven in dev/design-system/index.html and styled by
// src/styles/components/_cta.scss. .cta__body is genuinely optional — when
// absent, the element is omitted entirely, never rendered empty, matching
// the approved contract's second showcase specimen. No focus-visible/
// outline rule of its own — the action reuses .btn's existing global ring.
import { escapeHtml } from '../pages/escape.js';

export function renderCta({ heading, body, action }) {
  const bodyMarkup = body ? `<p class="cta__body">${escapeHtml(body)}</p>` : '';
  return (
    `<div class="cta">` +
    `<h3 class="cta__heading">${escapeHtml(heading)}</h3>` +
    bodyMarkup +
    `<a class="btn btn--primary" href="${escapeHtml(action.path)}">${escapeHtml(action.label)}</a>` +
    `</div>`
  );
}
