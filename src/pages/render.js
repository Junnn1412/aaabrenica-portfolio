import { escapeHtml } from './escape.js';
import { validateContent } from './content-schema.js';
import { templates } from './templates/index.js';
import { contentByKey } from '../content/pages/index.js';
import { primaryNav } from '../config/navigation.js';
import { site } from '../config/site.js';

function buildHead(route, content) {
  const title = `${escapeHtml(content.title)} — ${escapeHtml(site.siteName)}`;
  const description = content.description ?? site.defaultDescription;
  const canonicalUrl =
    site.baseUrl && route.key !== 'not-found'
      ? new URL(route.path, site.baseUrl).toString()
      : null;

  let head =
    `<title>${title}</title><meta name="description" content="${escapeHtml(description)}">` +
    '<link rel="icon" href="/images/brand/aaa-placeholder-logo.ico" type="image/x-icon">';

  if (canonicalUrl) {
    head += `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`;
  }

  if (canonicalUrl) {
    head +=
      `<meta property="og:type" content="website">` +
      `<meta property="og:title" content="${escapeHtml(title)}">` +
      `<meta property="og:description" content="${escapeHtml(description)}">` +
      `<meta property="og:site_name" content="${escapeHtml(site.siteName)}">` +
      `<meta property="og:url" content="${escapeHtml(canonicalUrl)}">` +
      `<meta property="og:image" content="${escapeHtml(site.socialImageUrl)}">` +
      `<meta name="twitter:card" content="summary_large_image">` +
      `<meta name="twitter:title" content="${escapeHtml(title)}">` +
      `<meta name="twitter:description" content="${escapeHtml(description)}">` +
      `<meta name="twitter:image" content="${escapeHtml(site.socialImageUrl)}">`;

    if (route.key === 'home') {
      const sameAs = [
        site.social.github,
        site.social.linkedin,
        site.social.facebook,
      ].filter(Boolean);

      const structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            name: site.siteName,
            url: site.baseUrl,
            description,
          },
          {
            '@type': 'Person',
            name: site.profile.identity.formalName,
            url: site.baseUrl,
            sameAs,
          },
        ],
      };

      head += `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`;
    }
  }

  return head;
}

// Re-validates the specific route's content on every call (not just once at
// dev-server startup) so a mid-session edit that introduces invalid data
// can't silently reach the composed output after a watcher-triggered
// restart. Shares content-schema.js with scripts/validate-routes.mjs, which
// additionally checks cross-route references (nav/link resolution) that
// require the full route manifest.
export function renderRoute(route) {
  const content = contentByKey[route.content];
  if (!content) {
    throw new Error(
      `[render] missing content module for route "${route.key}" (expected key "${route.content}")`,
    );
  }

  const problems = validateContent(route, content);
  if (problems.length > 0) {
    throw new Error(
      `[render] invalid content for route "${route.key}":\n` +
        problems.map((p) => `  - ${p}`).join('\n'),
    );
  }

  const renderTemplate = templates[route.template];
  if (!renderTemplate) {
    throw new Error(
      `[render] unknown template "${route.template}" for route "${route.key}"`,
    );
  }

  const { header, main, footer } = renderTemplate({
    content,
    navItems: primaryNav,
    activeKey: route.navKey,
    site,
  });
  return { head: buildHead(route, content), header, main, footer };
}
