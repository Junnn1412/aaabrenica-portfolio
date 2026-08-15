#!/usr/bin/env node
import fs from 'node:fs';
import { routes } from '../src/config/routes.js';
import { MARKERS } from '../src/pages/compose.js';

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

  if (countMatches(html, /<main id="main-content">/g) !== 1) {
    add(`route "${route.key}": expected exactly one <main id="main-content">`);
  }

  if (countMatches(html, /<nav aria-label="Primary">/g) !== 1) {
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

if (problems.length > 0) {
  console.error(`[verify-build-output] ${problems.length} problem(s) found:\n`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
} else {
  console.log(
    `[verify-build-output] all ${routes.length} build outputs valid.`,
  );
}
