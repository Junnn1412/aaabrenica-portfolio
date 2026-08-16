import { Menu, X } from 'lucide';
import { escapeHtml } from '../../pages/escape.js';
import { renderIcon } from '../icon.js';
import { renderNav } from './nav.js';

export function renderHeader(navItems, activeKey, site) {
  const skipLink = `<a class="skip-link" href="#main-content">Skip to main content</a>`;
  const brand = `<a class="site-header__brand" href="/">${escapeHtml(site.siteName)}</a>`;
  const openIcon = renderIcon(Menu, {
    className: 'site-header__menu-icon site-header__menu-icon--open',
  });
  const closeIcon = renderIcon(X, {
    className: 'site-header__menu-icon site-header__menu-icon--close',
    hidden: true,
  });
  // Ships hidden — the no-JS baseline shows the nav fully expanded at
  // every width; nav-toggle.js reveals this button only once it has
  // confirmed every element it needs exists (see src/scripts/nav-toggle.js).
  const menuToggle =
    `<button class="site-header__menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" hidden>` +
    `${openIcon}${closeIcon}<span class="site-header__menu-label">Menu</span>` +
    `</button>`;
  const nav = renderNav(navItems, activeKey, site.primaryCta);
  return `${skipLink}<header>${brand}${menuToggle}${nav}</header>`;
}
