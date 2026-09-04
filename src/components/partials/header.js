import { escapeHtml } from '../../pages/escape.js';
import { renderNav } from './nav.js';

// Header/nav visual-polish task — `site.brandMark` is an optional,
// replaceable slot: absent today (renders text-only), later a temporary
// placeholder, eventually the final SBTech PH emblem — swapping the value
// never requires touching this markup. The mark is purely decorative
// (`alt=""`); the concise public name stays the one real accessible name, and both
// live inside the same single `<a>` so the whole lockup is one keyboard
// stop with one accessible name.
function renderBrandMark(brandMark) {
  if (!brandMark) return '';
  return `<img class="site-brand__mark" src="${escapeHtml(brandMark.src)}" alt="" width="${brandMark.width}" height="${brandMark.height}">`;
}

export function renderHeader(navItems, activeKey, site) {
  const skipLink = `<a class="skip-link" href="#main-content">Skip to main content</a>`;
  const brand =
    `<a class="site-header__brand" href="/">` +
    renderBrandMark(site.brandMark) +
    `<span class="site-brand__text">${escapeHtml(site.siteName)}</span>` +
    `</a>`;
  // Ships hidden — the no-JS baseline shows the nav fully expanded at
  // every width; nav-toggle.js reveals this button only once it has
  // confirmed every element it needs exists (see src/scripts/nav-toggle.js).
  // Mobile-toggle redesign — icon-only: no visible "Menu"/"Close" text.
  // `aria-label` is the button's one real accessible name, synchronized by
  // nav-toggle.js on every state change (server-rendered as the closed
  // label, matching the server-rendered `aria-expanded="false"` baseline).
  // The three bars are purely decorative CSS shapes
  // (components/_site-header.scss), wrapped in one `aria-hidden="true"`
  // span so they can never surface as a second, duplicate accessible name.
  const menuToggle =
    `<button class="site-header__menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation" hidden>` +
    `<span class="site-header__menu-icon" aria-hidden="true">` +
    `<span class="site-header__menu-bar"></span>` +
    `<span class="site-header__menu-bar"></span>` +
    `<span class="site-header__menu-bar"></span>` +
    `</span>` +
    `</button>`;
  const nav = renderNav(navItems, activeKey, site.primaryCta);
  return `${skipLink}<header>${brand}${menuToggle}${nav}</header>`;
}
