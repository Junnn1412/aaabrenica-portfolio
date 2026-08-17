#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { routes } from '../src/config/routes.js';
import { MARKERS } from '../src/pages/compose.js';
import { normalizePath, resolveEntryPath } from '../src/pages/paths.js';

const distRootUrl = new URL('../dist/', import.meta.url);

const problems = [];
const add = (msg) => problems.push(msg);

function countMatches(html, re) {
  return (html.match(re) || []).length;
}

for (const route of routes) {
  const distFile = new URL(route.entry, distRootUrl);
  let html;
  try {
    html = fs.readFileSync(distFile, 'utf8');
  } catch {
    add(`route "${route.key}": missing build output at dist/${route.entry}`);
    continue;
  }

  for (const marker of Object.values(MARKERS)) {
    if (html.includes(marker))
      add(
        `route "${route.key}": unresolved marker "${marker}" found in build output`,
      );
  }

  const titleMatches = [...html.matchAll(/<title>([^<]*)<\/title>/g)];
  if (titleMatches.length !== 1 || titleMatches[0][1].trim().length === 0) {
    add(
      `route "${route.key}": expected exactly one non-empty <title>, found ${titleMatches.length}`,
    );
  }

  const descMatches = [
    ...html.matchAll(/<meta name="description" content="([^"]*)"/g),
  ];
  if (descMatches.length !== 1 || descMatches[0][1].trim().length === 0) {
    add(
      `route "${route.key}": expected exactly one non-empty meta description, found ${descMatches.length}`,
    );
  }

  if (countMatches(html, /<main id="main-content" tabindex="-1">/g) !== 1) {
    add(
      `route "${route.key}": expected exactly one focusable <main id="main-content" tabindex="-1">`,
    );
  }

  // PF-040: the page container is wired at the template layer, but the
  // composed output must still show it immediately inside <main> — proves
  // the invariant end-to-end regardless of which layer produced it.
  //
  // PF-041: the home route is the one deliberate exception, anticipated by
  // PF-040's own decision-log entry — instead of one container wrapping the
  // whole main, each top-level <section> (hero, home-section) owns its own
  // inner .container, so later full-bleed sections never fight a
  // page-level wrapper. Verified end-to-end here the same way: <main> must
  // open directly with a section, and every such section must itself open
  // with .container.
  if (route.key === 'home') {
    if (
      !/<main id="main-content" tabindex="-1">\s*<section class="hero">/.test(
        html,
      )
    ) {
      add(
        `route "${route.key}": expected <main id="main-content" tabindex="-1"> to open with the hero section`,
      );
    }
    const sectionCount = countMatches(
      html,
      /<section class="(?:hero|home-section)/g,
    );
    const sectionContainerCount = countMatches(
      html,
      /<section class="(?:hero|home-section)[^"]*"><div class="container/g,
    );
    if (sectionCount === 0 || sectionCount !== sectionContainerCount) {
      add(
        `route "${route.key}": expected every top-level section (found ${sectionCount}) to open with its own <div class="container"> (found ${sectionContainerCount})`,
      );
    }
  } else if (
    countMatches(
      html,
      /<main id="main-content" tabindex="-1">\s*<div class="container">/g,
    ) !== 1
  ) {
    add(
      `route "${route.key}": expected <main id="main-content" tabindex="-1"> to open with <div class="container">`,
    );
  }

  if (countMatches(html, /<a class="skip-link" href="#main-content">/g) !== 1) {
    add(`route "${route.key}": expected exactly one skip link`);
  }

  if (countMatches(html, /<a href="\/privacy\/">/g) !== 1) {
    add(`route "${route.key}": expected exactly one privacy link`);
  }

  // PF-031: nav.js's <nav> tag now also carries id/class before
  // aria-label, so the match can't assume aria-label is the first/only
  // attribute — still requires exactly one, just order-independent.
  if (countMatches(html, /<nav[^>]* aria-label="Primary"[^>]*>/g) !== 1) {
    add(
      `route "${route.key}": expected exactly one primary navigation landmark`,
    );
  }

  const activeCount = countMatches(html, /aria-current="page"/g);
  if (route.navKey === null) {
    if (activeCount !== 0) {
      add(
        `route "${route.key}" (404/no-section policy): expected zero aria-current="page", found ${activeCount}`,
      );
    }
  } else {
    if (activeCount !== 1) {
      add(
        `route "${route.key}": expected exactly one aria-current="page", found ${activeCount}`,
      );
    }
    if (
      route.template === 'case-study' &&
      !/<a href="\/work\/" aria-current="page">/.test(html)
    ) {
      add(
        `route "${route.key}": expected the "/work/" nav link to carry aria-current="page"`,
      );
    }
  }

  if (/(href|content)=""/.test(html)) {
    add(`route "${route.key}": found an empty href or content attribute`);
  }

  if (/<link rel="canonical"/.test(html)) {
    add(
      `route "${route.key}": unexpected canonical link (site.baseUrl is null in PF-011)`,
    );
  }

  if (/mailto:|github\.com|linkedin\.com/.test(html)) {
    add(
      `route "${route.key}": unexpected contact/social reference (site.js fields are null in PF-011)`,
    );
  }
}

// Bounded to dist/ itself — our own regenerated build output, not the
// source tree the route validator's "no recursive scan" rule protects.
// Proves, rather than merely configures, that production contains exactly
// the 11 approved routes: nothing missing, nothing extra (e.g. a leaked
// dev/design-system/index.html preview, which is never listed in
// rollupOptions.input and therefore should never reach here).
function walkHtmlFiles(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const found = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...walkHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      found.push(normalizePath(full));
    }
  }
  return found;
}

function checkExactDistContents() {
  const distRootPath = normalizePath(fileURLToPath(distRootUrl));
  const actual = new Set(walkHtmlFiles(distRootPath));
  const expected = new Set(
    routes.map((route) => resolveEntryPath(distRootUrl, route.entry)),
  );

  for (const expectedFile of expected) {
    if (!actual.has(expectedFile)) {
      add(`expected build output missing from dist/: ${expectedFile}`);
    }
  }
  for (const actualFile of actual) {
    if (!expected.has(actualFile)) {
      add(
        `unexpected HTML file in dist/: ${actualFile} (production must contain exactly the 11 approved routes)`,
      );
    }
  }
}

checkExactDistContents();

if (problems.length > 0) {
  console.error(`[verify-build-output] ${problems.length} problem(s) found:\n`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
} else {
  console.log(
    `[verify-build-output] all ${routes.length} build outputs valid.`,
  );
}
