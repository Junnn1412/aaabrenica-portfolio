#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { routes } from '../src/config/routes.js';
import { site } from '../src/config/site.js';
import { MARKERS } from '../src/pages/compose.js';
import { normalizePath, resolveEntryPath } from '../src/pages/paths.js';
import { contentByKey } from '../src/content/pages/index.js';
import {
  collectCaseStudyAssetPaths,
  findMissingCaseStudyAssets,
} from './case-study-assets.mjs';

const distRootUrl = new URL('../dist/', import.meta.url);
const distRootPath = fileURLToPath(distRootUrl);

const problems = [];
const add = (msg) => problems.push(msg);

function countMatches(html, re) {
  return (html.match(re) || []).length;
}

function extractRegion(html, tag) {
  const match = html.match(new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`));
  return match ? match[0] : '';
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// PF-053/054/055: site.js's contact fields are real values now, not null.
// Each rendered as an exact <a href="...">-prefixed anchor by
// src/components/partials/footer.js (mailto/GitHub/LinkedIn) and, on the
// contact route only, again by src/pages/templates/contact.js. Checked as
// two region-scoped invariants below, not one whole-document count — the
// contact route legitimately contains each link twice (once in <main>,
// once in <footer>).
const CONTACT_LINKS = [
  { href: `mailto:${site.contactEmail}`, label: 'email' },
  { href: site.social.github, label: 'GitHub' },
  { href: site.social.linkedin, label: 'LinkedIn' },
];

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
  // PF-041/PF-050/PF-051/PF-052/PF-060: home, solutions, process, work, and
  // every case-study route are the per-section-container exceptions,
  // anticipated by PF-040's own decision-log entry — instead of one
  // container wrapping the whole main, each top-level <section> owns its
  // own inner .container, so later full-bleed sections never fight a
  // page-level wrapper. `home`'s main opens directly with `.hero`; every
  // other top-level section on any of these routes carries `.page-section`
  // (an optional leading `id="..."` attribute — solutions' anchored
  // sections only — doesn't change that match). `solutions`/`process`/
  // `work`/case-study additionally open with one bare intro
  // `<div class="container">` before their first section — not itself a
  // section, so it's checked separately here rather than folded into the
  // per-section count.
  if (
    ['home', 'solutions', 'process', 'work'].includes(route.key) ||
    route.template === 'case-study'
  ) {
    const opensCorrectly =
      route.key === 'home'
        ? /<main id="main-content" tabindex="-1">\s*<section class="hero">/.test(
            html,
          )
        : /<main id="main-content" tabindex="-1">\s*<div class="container">/.test(
            html,
          );
    if (!opensCorrectly) {
      add(
        `route "${route.key}": expected <main id="main-content" tabindex="-1"> to open with its documented top-level element`,
      );
    }
    const sectionCount = countMatches(
      html,
      /<section(?: id="[^"]*")? class="(?:hero|page-section)/g,
    );
    const sectionContainerCount = countMatches(
      html,
      /<section(?: id="[^"]*")? class="(?:hero|page-section)[^"]*"><div class="container/g,
    );
    // home/solutions/process/work always render at least one fixed,
    // required section — zero is a real bug there. A case-study route is
    // different: every named section is independently optional
    // (docs/DECISION_LOG.md's PF-060 entry), so a case study with no
    // approved sections yet (e.g. still-placeholder content) legitimately
    // has zero — that's honest omission, not a defect.
    const requiresAtLeastOneSection = route.template !== 'case-study';
    if (
      (requiresAtLeastOneSection && sectionCount === 0) ||
      sectionCount !== sectionContainerCount
    ) {
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

  const footerHtml = extractRegion(html, 'footer');
  for (const { href, label } of CONTACT_LINKS) {
    if (
      countMatches(
        footerHtml,
        new RegExp(`<a href="${escapeRegExp(href)}">`, 'g'),
      ) !== 1
    ) {
      add(`route "${route.key}": expected exactly one footer ${label} link`);
    }
  }

  if (route.key === 'contact') {
    const mainHtml = extractRegion(html, 'main');
    for (const { href, label } of CONTACT_LINKS) {
      if (
        countMatches(
          mainHtml,
          new RegExp(`<a href="${escapeRegExp(href)}">`, 'g'),
        ) !== 1
      ) {
        add(
          `route "${route.key}": expected exactly one main-content ${label} link`,
        );
      }
    }
  }

  // PF-060 — region-scoped, not whole-document: the shared footer
  // legitimately links to GitHub/LinkedIn on every route, case studies
  // included, so only the <main> region is checked here. Generic across any
  // case-study route (not FES-specific), reading the approved URL from the
  // route's own content module rather than a second hardcoded copy — so no
  // staging URL, admin path, or unapproved external host can ever appear in
  // a case study's main content, regardless of which route it is.
  if (route.template === 'case-study') {
    const mainHtml = extractRegion(html, 'main');
    const content = contentByKey[route.content];
    const allowedExternal = content?.externalLink?.url ?? null;
    const externalHrefs = [...mainHtml.matchAll(/href="([^"]*)"/g)]
      .map((m) => m[1])
      .filter((href) => !href.startsWith('/') && !href.startsWith('mailto:'));

    if (allowedExternal) {
      const approvedCount = externalHrefs.filter(
        (href) => href === allowedExternal,
      ).length;
      if (approvedCount !== 1) {
        add(
          `route "${route.key}": expected exactly one main-content link to the approved external URL "${allowedExternal}", found ${approvedCount}`,
        );
      }
      const unapproved = externalHrefs.filter(
        (href) => href !== allowedExternal,
      );
      if (unapproved.length > 0) {
        add(
          `route "${route.key}": found unapproved external link(s) in main content: ${unapproved.join(', ')}`,
        );
      }
    } else if (externalHrefs.length > 0) {
      add(
        `route "${route.key}": found external link(s) in main content but no externalLink is configured: ${externalHrefs.join(', ')}`,
      );
    }

    // PF-060 logo-integration follow-up — proves, not just configures, that
    // every case-study local asset (logo, and any future gallery image)
    // actually survived the build: Vite copies public/ to dist/ verbatim,
    // so the same root-relative path must resolve here too, not just under
    // public/ (already checked pre-build by scripts/validate-routes.mjs).
    const assetPaths = collectCaseStudyAssetPaths(content).filter(
      (p) => typeof p === 'string' && p.startsWith('/') && !p.startsWith('//'),
    );
    for (const problem of findMissingCaseStudyAssets(
      distRootPath,
      assetPaths,
    )) {
      add(`route "${route.key}": ${problem} (checked under dist/)`);
    }
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
