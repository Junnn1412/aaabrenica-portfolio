import { escapeHtml } from '../pages/escape.js';

// Footer redesign — GitHub and LinkedIn brand marks. Deliberately separate
// from src/pages/icon-registry.js/src/components/icon.js: those are for
// Lucide's stroke-based interface-icon set, whitelisted against Lucide's
// own iconNode shape (ALLOWED_TAGS/ALLOWED_ATTRS in icon.js). GitHub/
// LinkedIn are brand-specific graphics (CLAUDE.md: "approved local SVGs for
// brand-specific graphics", distinct from "Lucide for general interface
// icons") and Lucide itself does not ship them (confirmed: no
// node_modules/lucide/dist/esm/icons/{github,linkedin}.mjs) — reusing
// icon.js's renderer for these would also be structurally wrong regardless,
// since Simple Icons ships one filled <path> per mark (fill="currentColor"),
// not Lucide's multi-shape stroke outlines (stroke="currentColor"
// fill="none").
//
// Path data is the official monochrome glyph from the Simple Icons project
// (https://simpleicons.org, MIT License), simple-icons npm package v16.28.0,
// fetched 2026-08-18 from cdn.jsdelivr.net/npm/simple-icons@16.28.0/icons/
// {github,linkedin}.svg (GitHub's copy additionally cross-checked against
// raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/github.svg).
// Reproduced verbatim — do not hand-edit these strings; if Simple Icons
// revises either mark, replace the whole value from the source, not a
// partial edit.
const SOCIAL_ICON_PATHS = {
  github:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
};

// Closed set — only the two brand marks this footer needs. Unknown keys
// throw rather than silently rendering nothing, the same fail-loud
// precedent icon.js's renderIcon() already establishes for its own closed
// tag/attribute sets.
export function renderSocialIcon(name, { className = '' } = {}) {
  const d = SOCIAL_ICON_PATHS[name];
  if (!d) {
    throw new TypeError(`renderSocialIcon: unknown icon "${name}"`);
  }
  const classAttr = className ? ` class="${escapeHtml(className)}"` : '';
  // Always decorative: the accessible name lives on the parent <a> via
  // aria-label (src/components/partials/footer.js), never on the icon
  // itself — one accessible name per link, never two.
  return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"${classAttr}><path d="${d}"></path></svg>`;
}
