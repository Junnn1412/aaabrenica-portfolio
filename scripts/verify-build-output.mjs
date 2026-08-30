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
  collectRegisteredAssetEntries,
  findRegisteredAssetProblems,
} from './registered-assets.mjs';

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
const DIRECT_CONTACT_LINKS = [
  { href: `mailto:${site.contactEmail}`, label: 'email' },
  { href: site.social.github, label: 'GitHub' },
  { href: site.social.linkedin, label: 'LinkedIn' },
];
const FOOTER_CONTACT_LINKS = [
  ...DIRECT_CONTACT_LINKS,
  { href: site.social.facebook, label: 'Facebook' },
];

const DISPLAY_NAME = 'Antonio Abrenica';
const FORMAL_NAME = 'Antonio A. Abrenica III';

if (
  site.siteName !== DISPLAY_NAME ||
  site.profile?.identity?.displayName !== DISPLAY_NAME ||
  site.profile?.identity?.formalName !== FORMAL_NAME
) {
  add('site identity contract does not match the approved public/formal names');
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

  if (html.includes('AAA Portfolio') || />\s*AAA\s*</.test(html)) {
    add(`route "${route.key}": superseded visitor-facing identity leaked`);
  }
  if (
    countMatches(
      html,
      /<span class="site-brand__text">Antonio Abrenica<\/span>/g,
    ) !== 1
  ) {
    add(`route "${route.key}": expected the exact concise navbar name once`);
  }
  if (
    countMatches(html, /<img class="site-brand__mark"[^>]* alt=""[^>]*>/g) !== 1
  ) {
    add(`route "${route.key}": temporary navbar mark must stay decorative`);
  }
  if (!titleMatches[0]?.[1].endsWith(`— ${DISPLAY_NAME}`)) {
    add(`route "${route.key}": title must compose the concise site name`);
  }

  if (countMatches(html, /<main id="main-content" tabindex="-1">/g) !== 1) {
    add(
      `route "${route.key}": expected exactly one focusable <main id="main-content" tabindex="-1">`,
    );
  }
  if (countMatches(html, /<header>/g) !== 1) {
    add(`route "${route.key}": expected exactly one header landmark`);
  }
  if (countMatches(html, /<footer>/g) !== 1) {
    add(`route "${route.key}": expected exactly one footer landmark`);
  }

  // PF-040: the page container is wired at the template layer, but the
  // composed output must still show it immediately inside <main> — proves
  // the invariant end-to-end regardless of which layer produced it.
  //
  // PF-041/PF-050/PF-051/PF-052/PF-060: home, solutions, process, work, and
  // those four routes are the per-section-container exceptions. Case studies
  // anticipated by PF-040's own decision-log entry — instead of one
  // instead own one centered rich-editorial container. For the four routes
  // own inner .container, so later full-bleed sections never fight a
  // page-level wrapper. `home`'s main opens directly with `.hero`; every
  // each top-level section carries `.page-section`
  // (an optional leading `id="..."` attribute — solutions' anchored
  // sections only — doesn't change that match). `solutions`/`process`/
  // `work` additionally opens with one bare intro
  // `<div class="container">` before their first section — not itself a
  // section, so it's checked separately here rather than folded into the
  // per-section count.
  if (['home', 'solutions', 'process', 'work'].includes(route.key)) {
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
    if (sectionCount === 0 || sectionCount !== sectionContainerCount) {
      add(
        `route "${route.key}": expected every top-level section (found ${sectionCount}) to open with its own <div class="container"> (found ${sectionContainerCount})`,
      );
    }
  } else if (route.template === 'case-study') {
    const mainHtml = extractRegion(html, 'main');
    if (
      !/<main id="main-content" tabindex="-1">\s*<div class="container case-study">/.test(
        html,
      ) ||
      countMatches(mainHtml, /class="container/g) !== 1
    ) {
      add(
        `route "${route.key}": expected one scoped .container.case-study editorial wrapper`,
      );
    }
  } else if (
    countMatches(
      html,
      /<main id="main-content" tabindex="-1">\s*<div class="container(?: [^"]+)?">/g,
    ) !== 1
  ) {
    add(
      `route "${route.key}": expected <main id="main-content" tabindex="-1"> to open with a .container div`,
    );
  }

  if (countMatches(html, /<a class="skip-link" href="#main-content">/g) !== 1) {
    add(`route "${route.key}": expected exactly one skip link`);
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
    if (
      route.key === 'contact' &&
      !/<a class="btn btn--primary btn--sm site-nav__cta" href="\/contact\/" aria-current="page">Start a Project<\/a>/.test(
        html,
      )
    ) {
      add('route "contact": primary CTA must carry aria-current="page"');
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

  // Footer redesign — the footer's own contact links now carry
  // class="site-footer__connect-link" before href and aria-label="..." after
  // it (icon-only Connect controls), unlike contact.js's plain
  // <a href="...">Label</a> in <main> (checked separately below,
  // unchanged) — `[^>]*` after href tolerates that trailing attribute, the
  // same pattern this file's own nav aria-label check above already
  // established for the same reason (PF-031).
  const footerHtml = extractRegion(html, 'footer');
  if (
    /href="\/privacy\/"|Quick Links|>Connect<|>Contact<|<nav\b|<h[1-6]\b/.test(
      footerHtml,
    )
  ) {
    add(
      `route "${route.key}": simplified footer must omit navigation, headings, Contact, Privacy, Quick Links, and Connect`,
    );
  }
  if (/<img\b|site-footer__brand|site-footer__brand-mark/.test(footerHtml)) {
    add(`route "${route.key}": footer must not repeat the header brand lockup`);
  }
  if (
    !/<footer><div class="container site-footer__inner"><p class="site-footer__meta">/.test(
      footerHtml,
    )
  ) {
    add(
      `route "${route.key}": footer must open with copyright inside the shared container`,
    );
  }
  if (
    footerHtml.indexOf('site-footer__meta') === -1 ||
    footerHtml.indexOf('site-footer__links') === -1 ||
    footerHtml.indexOf('site-footer__meta') >
      footerHtml.indexOf('site-footer__links')
  ) {
    add(`route "${route.key}": footer copyright must precede social links`);
  }
  if (
    countMatches(
      footerHtml,
      /<p class="site-footer__meta">© 2026 Antonio Abrenica\. All rights reserved\.<\/p>/g,
    ) !== 1
  ) {
    add(`route "${route.key}": footer copyright identity is not approved`);
  }
  for (const { href, label } of FOOTER_CONTACT_LINKS) {
    if (
      countMatches(
        footerHtml,
        new RegExp(
          `<a class="site-footer__connect-link" href="${escapeRegExp(href)}"[^>]*>`,
          'g',
        ),
      ) !== 1
    ) {
      add(`route "${route.key}": expected exactly one footer ${label} link`);
    }
    if (
      !href.startsWith('mailto:') &&
      !new RegExp(
        `<a class="site-footer__connect-link" href="${escapeRegExp(href)}" aria-label="${escapeRegExp(label)}" target="_blank" rel="noopener noreferrer">`,
      ).test(footerHtml)
    ) {
      add(
        `route "${route.key}": footer ${label} link must retain external-link protection`,
      );
    }
  }

  if (route.key === 'contact') {
    const mainHtml = extractRegion(html, 'main');
    for (const { href, label } of DIRECT_CONTACT_LINKS) {
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
    if (
      site.contactForm?.enabled === false &&
      /data-contact-form|contact-form-panel|action="\/api\/contact"/.test(
        mainHtml,
      )
    ) {
      add(
        'route "contact": form markup reached build output while the source gate is disabled',
      );
    }
  }

  if (route.key === 'home') {
    const mainHtml = extractRegion(html, 'main');
    if (
      countMatches(
        mainHtml,
        /profile-card--compact[\s\S]*?<p class="profile-card__name">Antonio Abrenica<\/p>/g,
      ) !== 1
    ) {
      add('route "home": compact profile card must use the concise name');
    }
    const visual = mainHtml.match(
      /<svg class="hero__visual" data-hero-visual[\s\S]*?<\/svg>/,
    )?.[0];
    if (!visual) {
      add('route "home": expected one progressively enhanced hero SVG');
    } else {
      const requiredCounts = [
        ['connection', /data-hero-connection/g, 1],
        ['reveal', /data-hero-reveal/g, 1],
        ['signal', /data-hero-signal/g, 1],
        ['nodes', /data-hero-node=/g, 2],
        ['points', /data-hero-point/g, 4],
      ];
      for (const [label, pattern, expected] of requiredCounts) {
        if (countMatches(visual, pattern) !== expected) {
          add(`route "home": hero SVG ${label} count must be ${expected}`);
        }
      }
      if (
        !/aria-hidden="true"/.test(visual) ||
        !/focusable="false"/.test(visual) ||
        /<title|<desc|\srole=|tabindex|<a\b|<button\b|<script|<filter|<image|href=|src=/i.test(
          visual,
        )
      ) {
        add('route "home": hero SVG must stay decorative, local, and inert');
      }
    }
  } else if (
    /data-hero-(?:visual|connection|reveal|signal|node|point)/.test(html)
  ) {
    add(`route "${route.key}": Home-only hero animation marker leaked`);
  }

  if (route.key === 'about') {
    const mainHtml = extractRegion(html, 'main');
    if (
      countMatches(
        mainHtml,
        /profile-card--full[\s\S]*?<p class="profile-card__name">Antonio A\. Abrenica III<\/p>/g,
      ) !== 1
    ) {
      add('route "about": full profile card must use the formal name');
    }
    if (
      countMatches(mainHtml, /alt="Portrait of Antonio A\. Abrenica III"/g) !==
      1
    ) {
      add('route "about": portrait alt must use the exact formal name');
    }
  }

  if (route.key === 'privacy') {
    if (!html.includes('The site currently has no contact form')) {
      add(
        'route "privacy": published output no longer carries the approved disabled/no-form statement',
      );
    }
    if (/Resend|form submissions are processed/i.test(html)) {
      add('route "privacy": unpublished Contact-form Privacy copy leaked');
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
  }

  if (route.key === 'work-fes-challenger') {
    const mainHtml = extractRegion(html, 'main');
    const galleryHtml = mainHtml.match(
      /<ul class="case-study-gallery">[\s\S]*?<\/ul>/,
    )?.[0];
    if (!galleryHtml) {
      add('route "work-fes-challenger": expected the current gallery');
    } else {
      const captions = [
        ...galleryHtml.matchAll(/<figcaption>([^<]*)<\/figcaption>/g),
      ].map((match) => match[1]);
      if (
        JSON.stringify(captions) !== JSON.stringify(['Services', 'Projects'])
      ) {
        add(
          'route "work-fes-challenger": gallery must contain exactly Services then Projects',
        );
      }
      if (/homepage-hero-desktop\.png|homepage-mobile\.png/.test(galleryHtml)) {
        add(
          'route "work-fes-challenger": Homepage or Mobile View leaked into the lower gallery',
        );
      }
    }
    if (
      countMatches(mainHtml, /homepage-hero-desktop\.png/g) !== 1 ||
      !/case-study-hero__media/.test(mainHtml)
    ) {
      add(
        'route "work-fes-challenger": canonical Homepage media must appear once in the hero',
      );
    }
    for (const unpublished of [
      'homepage-mobile.png',
      'project-details-page-desktop.png',
      'about-us-page-desktop.png',
    ]) {
      if (mainHtml.includes(unpublished)) {
        add(
          `route "work-fes-challenger": unpublished asset "${unpublished}" reached build HTML`,
        );
      }
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

function walkTextFiles(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const found = [];
  const textExtensions = new Set([
    '.css',
    '.html',
    '.js',
    '.json',
    '.map',
    '.txt',
  ]);
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...walkTextFiles(full));
    } else if (entry.isFile() && textExtensions.has(path.extname(entry.name))) {
      found.push(full);
    }
  }
  return found;
}

function checkContactDeploymentIsolation() {
  const routesFile = path.join(distRootPath, '_routes.json');
  try {
    const config = JSON.parse(fs.readFileSync(routesFile, 'utf8'));
    if (
      config.version !== 1 ||
      !Array.isArray(config.include) ||
      config.include.length !== 1 ||
      config.include[0] !== '/api/contact' ||
      !Array.isArray(config.exclude) ||
      config.exclude.length !== 0
    ) {
      add('dist/_routes.json must invoke Functions only for /api/contact');
    }
  } catch {
    add('dist/_routes.json is missing or invalid');
  }

  const forbiddenDeploymentText = [
    'RESEND_API_KEY',
    'CONTACT_FROM_EMAIL',
    'CONTACT_TO_EMAIL',
    'CONTACT_FORM_ENABLED',
    '.dev.vars',
  ];
  for (const file of walkTextFiles(distRootPath)) {
    const content = fs.readFileSync(file, 'utf8');
    for (const forbidden of forbiddenDeploymentText) {
      if (content.includes(forbidden)) {
        add(
          `deployment secret/configuration marker "${forbidden}" leaked into ${normalizePath(file)}`,
        );
      }
    }
  }
}

// Header/nav visual-polish task — mirrors checkBrandMarkAssetExists() in
// scripts/validate-routes.mjs, checked against dist/ instead of public/.
// site.brandMark stays null until a real asset file is confirmed (see
// docs/DECISION_LOG.md), so this is a no-op today.
function checkRegisteredAssetsInDist() {
  const entries = collectRegisteredAssetEntries({
    routes,
    contentByKey,
    site,
  }).filter(
    (entry) =>
      entry.assetPath.startsWith('/') && !entry.assetPath.startsWith('//'),
  );
  for (const problem of findRegisteredAssetProblems(distRootPath, entries)) {
    add(`asset registry: ${problem} (checked under dist/)`);
  }
}

checkExactDistContents();
checkRegisteredAssetsInDist();
checkContactDeploymentIsolation();

if (problems.length > 0) {
  console.error(`[verify-build-output] ${problems.length} problem(s) found:\n`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
} else {
  console.log(
    `[verify-build-output] all ${routes.length} build outputs valid.`,
  );
}
