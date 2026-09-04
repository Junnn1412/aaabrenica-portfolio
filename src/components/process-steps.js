// PF-041 — the real caller PF-034's decision log named as the trigger to
// finally add this renderer. Reproduces the Gate-C-approved markup contract
// exactly as proven in dev/design-system/index.html and styled by
// src/styles/components/_process-steps.scss — the section-level
// .process-steps__action link is rendered as a sibling *after* the closing
// </ol>, never nested inside it, matching the approved contract.
import { escapeHtml } from '../pages/escape.js';
import { renderActionLink } from './action-link.js';

function renderStep({ heading }, index) {
  return (
    `<li class="process-steps__step">` +
    `<span class="process-steps__number" aria-hidden="true">${index + 1}</span>` +
    `<h3 class="process-steps__heading">${escapeHtml(heading)}</h3>` +
    `</li>`
  );
}

export function renderProcessSteps(steps, link) {
  const list = `<ol class="process-steps">${steps.map(renderStep).join('')}</ol>`;
  const action = `<p class="process-steps__action">${renderActionLink({ label: link.label, href: link.path, variant: 'forward' })}</p>`;
  return list + action;
}
