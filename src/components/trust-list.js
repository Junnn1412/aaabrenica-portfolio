// PF-041 — the real caller PF-034's decision log named as the trigger to
// finally add this renderer. Reproduces the Gate-C-approved markup contract
// exactly as proven in dev/design-system/index.html and styled by
// src/styles/components/_trust-list.scss. Icons now go through icon.js's
// renderIcon() (a real, new call site) rather than the showcase's
// hand-authored static SVG, since this is a production JS module, not the
// static-HTML-only showcase — same path data either way (see
// src/pages/icon-registry.js).
import { escapeHtml } from '../pages/escape.js';
import { renderIcon } from './icon.js';
import { renderActionLink } from './action-link.js';
import { TRUST_ICONS } from '../pages/icon-registry.js';

function renderItem({ icon, heading }) {
  return (
    `<li class="trust-list__item">` +
    `<span class="trust-list__icon">${renderIcon(TRUST_ICONS[icon])}</span>` +
    `<h3 class="trust-list__heading">${escapeHtml(heading)}</h3>` +
    `</li>`
  );
}

export function renderTrustList(items, link) {
  const list = `<ul class="trust-list">${items.map(renderItem).join('')}</ul>`;
  const action = `<p class="trust-list__action">${renderActionLink({ label: link.label, href: link.path, variant: 'forward' })}</p>`;
  return list + action;
}
