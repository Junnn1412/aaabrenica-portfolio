import { escapeHtml } from '../../pages/escape.js';
import {
  isSafeInternalPath,
  isSafeEmail,
  isSafeExternalUrl,
} from '../../pages/link-safety.js';
import { renderIcon } from '../icon.js';
import { renderSocialIcon } from '../social-icons.js';
import { Mail } from 'lucide';

// No import from src/config/* anywhere in this file — navItems and site
// are always explicitly injected by the caller (render.js -> templates),
// which is what keeps renderFooter pure and testable with fixture data
// instead of the real singleton.

// Footer redesign — reuses the exact same replaceable brand-mark slot the
// header established (src/components/partials/header.js's
// renderBrandMark()): absent renders text-only, present renders
// decoratively (alt="") inside one link with the visible "AAA Portfolio"
// text as the sole accessible name. The footer's brand lockup is NOT a
// link (unlike the header's) — it's a static identity mark, so there is no
// accessible-name concern to guard beyond the image staying decorative.
function renderBrand(site) {
  const mark = site.brandMark
    ? `<img class="site-footer__brand-mark" src="${escapeHtml(site.brandMark.src)}" alt="" width="${site.brandMark.width}" height="${site.brandMark.height}">`
    : '';
  return (
    `<div class="site-footer__brand">${mark}` +
    `<span class="site-footer__brand-name">${escapeHtml(site.siteName)}</span>` +
    `</div>`
  );
}

function renderFooterNav(navItems) {
  const items = navItems
    .map(
      ({ label, path }) =>
        `<li><a href="${escapeHtml(path)}">${escapeHtml(label)}</a></li>`,
    )
    .join('');
  return (
    `<nav class="site-footer__nav" aria-label="Footer">` +
    `<h2 class="site-footer__heading">Quick Links</h2>` +
    `<ul>${items}</ul>` +
    `</nav>`
  );
}

// Icon-only Connect links — the icon is always decorative
// (renderIcon()/renderSocialIcon() both hardcode aria-hidden); the anchor's
// aria-label is the one real accessible name, never duplicated onto the
// icon itself.
function renderContactLink(site) {
  if (!isSafeEmail(site.contactEmail)) return '';
  const icon = renderIcon(Mail, { className: 'site-footer__connect-icon' });
  return (
    `<li><a class="site-footer__connect-link" href="mailto:${escapeHtml(site.contactEmail)}" aria-label="Email">` +
    icon +
    `</a></li>`
  );
}

function renderSocialLink(site, hostGroup, label, iconName) {
  const url = site.social?.[hostGroup];
  if (!isSafeExternalUrl(url, hostGroup)) return '';
  const icon = renderSocialIcon(iconName, {
    className: 'site-footer__connect-icon',
  });
  return (
    `<li><a class="site-footer__connect-link" href="${escapeHtml(url)}" aria-label="${escapeHtml(label)}">` +
    icon +
    `</a></li>`
  );
}

function renderResumeLink(site) {
  if (!isSafeInternalPath(site.resumePath)) return '';
  return `<li><a href="${escapeHtml(site.resumePath)}">Résumé</a></li>`;
}

function renderConnect(site) {
  const links = [
    renderContactLink(site),
    renderSocialLink(site, 'github', 'GitHub', 'github'),
    renderSocialLink(site, 'linkedin', 'LinkedIn', 'linkedin'),
    renderResumeLink(site),
  ]
    .filter(Boolean)
    .join('');
  if (!links) return '';
  return (
    `<div class="site-footer__connect">` +
    `<h2 class="site-footer__heading">Connect</h2>` +
    `<ul class="site-footer__links">${links}</ul>` +
    `</div>`
  );
}

export function renderFooter(
  navItems,
  site,
  { year = new Date().getFullYear() } = {},
) {
  const columns =
    `<div class="site-footer__columns">` +
    renderBrand(site) +
    renderFooterNav(navItems) +
    renderConnect(site) +
    `</div>`;

  // Privacy lives only in this bottom/meta row — never duplicated into
  // Quick Links, which is exactly the existing 6-item primaryNav and
  // nothing else.
  const bottom =
    `<div class="site-footer__bottom">` +
    `<p class="site-footer__meta">© ${year} ${escapeHtml(site.siteName)}. All rights reserved.</p>` +
    `<p class="site-footer__privacy"><a href="/privacy/">Privacy</a></p>` +
    `</div>`;

  return `<footer>${columns}${bottom}</footer>`;
}
