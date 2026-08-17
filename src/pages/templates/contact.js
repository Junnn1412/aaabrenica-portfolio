import { escapeHtml } from '../escape.js';
import { renderHeader } from '../../components/partials/header.js';
import { renderFooter } from '../../components/partials/footer.js';
import { isSafeEmail, isSafeExternalUrl } from '../link-safety.js';

// Sourced from `site`, not `content` — the same singleton-fact pattern
// src/components/partials/footer.js already uses for these same three
// values, so there is exactly one place (src/config/site.js) that holds
// them, not a second copy inside content/pages/contact.js.
function renderContactMethods(site) {
  const items = [];
  if (isSafeEmail(site.contactEmail)) {
    items.push(
      `<li class="contact-methods__item"><a href="mailto:${escapeHtml(site.contactEmail)}">${escapeHtml(site.contactEmail)}</a></li>`,
    );
  }
  if (isSafeExternalUrl(site.social?.github, 'github')) {
    items.push(
      `<li class="contact-methods__item"><a href="${escapeHtml(site.social.github)}">GitHub</a></li>`,
    );
  }
  if (isSafeExternalUrl(site.social?.linkedin, 'linkedin')) {
    items.push(
      `<li class="contact-methods__item"><a href="${escapeHtml(site.social.linkedin)}">LinkedIn</a></li>`,
    );
  }
  if (items.length === 0) return '';
  return (
    `<h2 class="contact-methods__heading">Ways to Reach Me</h2>` +
    `<ul class="contact-methods">${items.join('')}</ul>`
  );
}

export function renderContactPage({ content, navItems, activeKey, site }) {
  const paragraphs = content.paragraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');
  return {
    header: renderHeader(navItems, activeKey, site),
    main: `<div class="container"><h1>${escapeHtml(content.heading)}</h1>${paragraphs}${renderContactMethods(site)}</div>`,
    footer: renderFooter(navItems, site),
  };
}
