import { renderNav } from './nav.js';

export function renderHeader(navItems, activeKey) {
  return `<a class="skip-link" href="#main-content">Skip to main content</a><header>${renderNav(navItems, activeKey)}</header>`;
}
