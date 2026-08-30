// PF-041 — the real caller PF-034's decision log named as the trigger to
// finally add this renderer. Reproduces the Gate-C-approved markup contract
// exactly as proven in dev/design-system/index.html and styled by
// src/styles/components/_cta.scss. .cta__body is genuinely optional — when
// absent, the element is omitted entirely, never rendered empty, matching
// the approved contract's second showcase specimen. No focus-visible/
// outline rule of its own — the action reuses .btn's existing global ring.
import { escapeHtml } from '../pages/escape.js';
import { contentRevealAttributes } from './content-reveal.js';

// PF-051 — closed set: 2 (a top-level sibling section's own heading, e.g.
// the Process page's closing CTA) and 3 (nested inside a page-level h2
// section — every prior caller: home.js, solutions.js). Never interpolate
// an unvalidated value into the tag string; the Set membership check below
// is what makes that safe, not caller discipline.
const ALLOWED_CTA_HEADING_LEVELS = new Set([2, 3]);

export function renderCta({ heading, body, action, headingLevel = 3, reveal }) {
  if (!ALLOWED_CTA_HEADING_LEVELS.has(headingLevel)) {
    throw new Error(
      `renderCta: headingLevel must be one of ${[...ALLOWED_CTA_HEADING_LEVELS].join(', ')}, received ${JSON.stringify(headingLevel)}`,
    );
  }
  const tag = `h${headingLevel}`;
  const bodyMarkup = body ? `<p class="cta__body">${escapeHtml(body)}</p>` : '';
  const revealMarkup = reveal ? contentRevealAttributes(reveal) : '';
  return (
    `<div class="cta"${revealMarkup}>` +
    `<${tag} class="cta__heading">${escapeHtml(heading)}</${tag}>` +
    bodyMarkup +
    `<a class="btn btn--primary" href="${escapeHtml(action.path)}">${escapeHtml(action.label)}</a>` +
    `</div>`
  );
}
