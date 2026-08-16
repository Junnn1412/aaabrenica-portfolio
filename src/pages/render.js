import { escapeHtml } from './escape.js';
import { validateContent } from './content-schema.js';
import { templates } from './templates/index.js';
import { contentByKey } from '../content/pages/index.js';
import { primaryNav } from '../config/navigation.js';
import { site } from '../config/site.js';

function buildHead(route, content) {
  const title = `${escapeHtml(content.title)} — ${escapeHtml(site.siteName)}`;
  const description = content.description ?? site.defaultDescription;
  let head = `<title>${title}</title><meta name="description" content="${escapeHtml(description)}">`;
  // Canonical markup is omitted entirely while no production domain is
  // connected, and unconditionally for the 404 page (a self-canonicalizing
  // error page isn't desired) — never an empty href either way.
  if (site.baseUrl && route.key !== 'not-found') {
    head += `<link rel="canonical" href="${escapeHtml(site.baseUrl + route.path)}">`;
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
