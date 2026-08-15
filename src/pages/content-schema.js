import { isSafeInternalPath } from './link-safety.js';

function checkBaseFields(content, problems) {
  if (typeof content.title !== 'string' || content.title.length === 0) {
    problems.push('"title" must be a non-empty string');
  }
  if (typeof content.heading !== 'string' || content.heading.length === 0) {
    problems.push('"heading" must be a non-empty string');
  }
  if (
    !Array.isArray(content.paragraphs) ||
    content.paragraphs.length === 0 ||
    content.paragraphs.some((p) => typeof p !== 'string' || p.length === 0)
  ) {
    problems.push('"paragraphs" must be a non-empty array of non-empty strings');
  }
  if (
    'description' in content &&
    content.description != null &&
    (typeof content.description !== 'string' || content.description.length === 0)
  ) {
    problems.push('"description", when present, must be a non-empty string');
  }
}

function checkLink(link, fieldName, problems) {
  if (typeof link?.label !== 'string' || link.label.length === 0) {
    problems.push(`"${fieldName}.label" must be a non-empty string`);
  }
  if (typeof link?.path !== 'string' || !isSafeInternalPath(link.path)) {
    problems.push(`"${fieldName}.path" must be a safe internal path (start with "/", not "//")`);
  }
}

// Single-route content shape + literal link safety — used by both
// src/pages/render.js (fail-fast, route-specific) and
// scripts/validate-routes.mjs (collect-all, project-wide).
// Cross-route link *resolution* checks (does a path point at a route that
// currently exists) live only in scripts/validate-routes.mjs, since they
// require the full route manifest, not just one route's own content.
export function validateContent(route, content) {
  if (content == null || typeof content !== 'object') {
    return [`content for route "${route.key}" must be an object`];
  }

  const problems = [];
  checkBaseFields(content, problems);

  if ('link' in content && content.link != null) {
    checkLink(content.link, 'link', problems);
  }

  if (route.template === 'listing') {
    if (!Array.isArray(content.links) || content.links.length === 0) {
      problems.push('"links" must be a non-empty array for a listing page');
    } else {
      content.links.forEach((link, i) => checkLink(link, `links[${i}]`, problems));
    }
  }

  if (route.template === 'case-study') {
    if (content.backLink == null) {
      problems.push('"backLink" is required for a case-study page');
    } else {
      checkLink(content.backLink, 'backLink', problems);
      if (content.backLink.path !== '/work/') {
        problems.push('"backLink.path" must be exactly "/work/"');
      }
    }
  }

  return problems;
}
