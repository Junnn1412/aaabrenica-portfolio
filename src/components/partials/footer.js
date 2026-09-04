import { escapeHtml } from '../../pages/escape.js';
import { isSafeEmail, isSafeExternalUrl } from '../../pages/link-safety.js';
import { renderIcon } from '../icon.js';
import { renderSocialIcon } from '../social-icons.js';
import { Mail } from 'lucide';

// The footer keeps the same injected public contract as every page template,
// but no longer consumes navItems. The sticky header owns the persistent brand
// lockup; this compact V1 footer contains copyright followed by contact methods.
// Keeping the argument avoids a coordinated signature migration across every
// template for no behavioral benefit.

// Icon-only links each have one anchor-owned accessible name. Every SVG is
// hardcoded decorative by its closed renderer; content cannot supply SVG.
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
    `<li><a class="site-footer__connect-link" href="${escapeHtml(url)}" aria-label="${escapeHtml(label)}" target="_blank" rel="noopener noreferrer">` +
    icon +
    `</a></li>`
  );
}

function renderSocialLinks(site) {
  const links = [
    renderContactLink(site),
    renderSocialLink(site, 'github', 'GitHub', 'github'),
    renderSocialLink(site, 'linkedin', 'LinkedIn', 'linkedin'),
    renderSocialLink(site, 'facebook', 'Facebook', 'facebook'),
  ]
    .filter(Boolean)
    .join('');
  return links ? `<ul class="site-footer__links">${links}</ul>` : '';
}

export function renderFooter(
  navItems,
  site,
  { year = new Date().getFullYear() } = {},
) {
  void navItems;
  return (
    `<footer><div class="container site-footer__inner">` +
    `<p class="site-footer__meta">© ${year} ${escapeHtml(site.siteName)}. All rights reserved.</p>` +
    renderSocialLinks(site) +
    `</div></footer>`
  );
}
