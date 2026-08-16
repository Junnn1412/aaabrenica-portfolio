import { escapeHtml } from '../../pages/escape.js';
import {
  isSafeInternalPath,
  isSafeEmail,
  isSafeExternalUrl,
} from '../../pages/link-safety.js';

// No import from src/config/* anywhere in this file — navItems and site
// are always explicitly injected by the caller (render.js -> templates),
// which is what keeps renderFooter pure and testable with fixture data
// instead of the real singleton.
function renderFooterNav(navItems) {
  const items = navItems
    .map(
      ({ label, path }) =>
        `<li><a href="${escapeHtml(path)}">${escapeHtml(label)}</a></li>`,
    )
    .join('');
  return `<nav aria-label="Footer"><ul>${items}</ul></nav>`;
}

function renderContactLink(site) {
  if (!isSafeEmail(site.contactEmail)) return '';
  return `<li><a href="mailto:${escapeHtml(site.contactEmail)}">Email</a></li>`;
}

function renderSocialLink(site, hostGroup, label) {
  const url = site.social?.[hostGroup];
  if (!isSafeExternalUrl(url, hostGroup)) return '';
  return `<li><a href="${escapeHtml(url)}">${escapeHtml(label)}</a></li>`;
}

function renderResumeLink(site) {
  if (!isSafeInternalPath(site.resumePath)) return '';
  return `<li><a href="${escapeHtml(site.resumePath)}">Résumé</a></li>`;
}

export function renderFooter(
  navItems,
  site,
  { year = new Date().getFullYear() } = {},
) {
  const nav = renderFooterNav(navItems);
  const privacy = `<p><a href="/privacy/">Privacy</a></p>`;

  const links = [
    renderContactLink(site),
    renderSocialLink(site, 'github', 'GitHub'),
    renderSocialLink(site, 'linkedin', 'LinkedIn'),
    renderResumeLink(site),
  ]
    .filter(Boolean)
    .join('');
  const linksSection = links
    ? `<ul class="site-footer__links">${links}</ul>`
    : '';

  const copyright = `<p class="site-footer__meta">© ${year} ${escapeHtml(site.siteName)}. All rights reserved.</p>`;

  return `<footer>${nav}${privacy}${linksSection}${copyright}</footer>`;
}
