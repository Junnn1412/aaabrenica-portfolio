#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { routes } from '../src/config/routes.js';
import { primaryNav } from '../src/config/navigation.js';
import { site } from '../src/config/site.js';
import { templates } from '../src/pages/templates/index.js';
import { contentByKey } from '../src/content/pages/index.js';
import { validateContent } from '../src/pages/content-schema.js';
import { getMarkerProblems } from '../src/pages/compose.js';
import { normalizePath, resolveEntryPath } from '../src/pages/paths.js';
import { isSafeInternalPath } from '../src/pages/link-safety.js';

const projectRootUrl = new URL('../', import.meta.url);

const APPROVED_PATHS = [
  '/',
  '/solutions/',
  '/process/',
  '/work/',
  '/work/fes-challenger/',
  '/work/business-workflow-system/',
  '/work/ebarangay/',
  '/about/',
  '/contact/',
  '/privacy/',
  '/404.html',
];

// Exactly the 10 directories that can hold a route entry. Never recursed
// into automatically — each is listed explicitly (the 3 case-study folders
// are not discovered by recursing into work/), and readdirSync is called
// non-recursively on each, so this never touches node_modules, dist, .git,
// or src.
const ROUTE_PARENT_DIRS = [
  '.',
  'solutions',
  'process',
  'work',
  'work/fes-challenger',
  'work/business-workflow-system',
  'work/ebarangay',
  'about',
  'contact',
  'privacy',
];

const problems = [];
const add = (msg) => problems.push(msg);

function checkDuplicates() {
  const byKey = new Map();
  const byPath = new Map();
  const byEntry = new Map();
  for (const route of routes) {
    const entryAbs = resolveEntryPath(projectRootUrl, route.entry);
    if (byKey.has(route.key)) add(`duplicate route key "${route.key}"`);
    else byKey.set(route.key, true);
    if (byPath.has(route.path)) add(`duplicate route path "${route.path}" (routes "${byPath.get(route.path)}" and "${route.key}")`);
    else byPath.set(route.path, route.key);
    if (byEntry.has(entryAbs)) add(`duplicate route entry "${route.entry}" (routes "${byEntry.get(entryAbs)}" and "${route.key}")`);
    else byEntry.set(entryAbs, route.key);
  }
}

function checkRegistries() {
  for (const route of routes) {
    if (!(route.template in templates)) add(`route "${route.key}": unknown template "${route.template}"`);
    if (!(route.content in contentByKey)) add(`route "${route.key}": missing content module for key "${route.content}"`);
  }
}

function checkContentShape() {
  for (const route of routes) {
    const content = contentByKey[route.content];
    if (!content) continue; // already reported by checkRegistries
    for (const problem of validateContent(route, content)) {
      add(`route "${route.key}": ${problem}`);
    }
  }
}

function checkSiteConfig() {
  if (typeof site.defaultDescription !== 'string' || site.defaultDescription.length === 0) {
    add('site.defaultDescription must be a non-empty string');
  }
}

// Cross-route link resolution — requires the full manifest, so this lives
// only here, not in the single-route content-schema.js checks.
function checkNavigation() {
  for (const item of primaryNav) {
    if (!isSafeInternalPath(item.path)) {
      add(`navigation item "${item.key}": path "${item.path}" is not a safe internal path`);
      continue;
    }
    const matchingRoutes = routes.filter((r) => r.navKey === item.key);
    if (matchingRoutes.length === 0) {
      add(`navigation item "${item.key}": no route has navKey "${item.key}"`);
      continue;
    }
    // Several routes may share one navKey (e.g. the 3 case studies also
    // highlight "Work"), but at least one of them must be the item's own
    // anchor route — otherwise the nav item points nowhere real.
    if (!matchingRoutes.some((route) => route.path === item.path)) {
      add(
        `navigation item "${item.key}" path "${item.path}" matches no route with navKey "${item.key}" ` +
          `(candidates: ${matchingRoutes.map((r) => r.path).join(', ')})`
      );
    }
  }
  for (const route of routes) {
    if (route.navKey != null && !primaryNav.some((i) => i.key === route.navKey)) {
      add(`route "${route.key}": navKey "${route.navKey}" has no matching navigation item`);
    }
  }
}

function checkWorkListingLinks() {
  const workContent = contentByKey.work;
  if (!workContent?.links) return; // already reported by checkContentShape
  const caseStudyPaths = new Set(routes.filter((r) => r.template === 'case-study').map((r) => r.path));
  for (const link of workContent.links) {
    if (!caseStudyPaths.has(link.path)) {
      add(`work listing link "${link.label}" (${link.path}) does not match a registered case-study route`);
    }
  }
}

function checkSingletons() {
  const roots = routes.filter((r) => r.path === '/');
  if (roots.length !== 1) add(`expected exactly one route with path "/", found ${roots.length}`);
  const notFounds = routes.filter((r) => r.path === '/404.html');
  if (notFounds.length !== 1) add(`expected exactly one route with path "/404.html", found ${notFounds.length}`);
}

function checkFormats() {
  const DIR_PATH_RE = /^\/([a-z0-9-]+\/)*$/;
  for (const route of routes) {
    if (route.path === '/404.html') {
      if (route.entry !== '404.html') add(`route "${route.key}": path "/404.html" must use entry "404.html"`);
      continue;
    }
    if (!DIR_PATH_RE.test(route.path)) {
      add(`route "${route.key}": path "${route.path}" does not match the expected directory-route format`);
    }
    if (!route.entry.endsWith('index.html')) {
      add(`route "${route.key}": entry "${route.entry}" must end in "index.html"`);
    }
  }
}

function checkApprovedRoutes() {
  const actual = routes.map((r) => r.path);
  for (const p of APPROVED_PATHS) {
    if (!actual.includes(p)) add(`approved route "${p}" is missing from routes.js`);
  }
  for (const p of actual) {
    if (!APPROVED_PATHS.includes(p)) add(`route path "${p}" is not one of the 11 approved Version 1 routes`);
  }
}

function checkPhysicalFilesExist() {
  for (const route of routes) {
    const abs = resolveEntryPath(projectRootUrl, route.entry);
    if (!fs.existsSync(abs)) add(`route "${route.key}": entry file does not exist on disk: ${route.entry}`);
  }
}

function discoverPhysicalHtmlFiles() {
  const found = [];
  for (const relDir of ROUTE_PARENT_DIRS) {
    const absDir = resolveEntryPath(projectRootUrl, relDir === '.' ? '.' : `${relDir}/`);
    let entries;
    try {
      entries = fs.readdirSync(absDir, { withFileTypes: true });
    } catch {
      continue; // surfaced separately via checkPhysicalFilesExist
    }
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.html')) {
        found.push(normalizePath(path.join(absDir, entry.name)));
      }
    }
  }
  return found;
}

function checkNoUnexpectedFiles() {
  const manifestEntries = new Set(routes.map((r) => resolveEntryPath(projectRootUrl, r.entry)));
  for (const found of discoverPhysicalHtmlFiles()) {
    if (!manifestEntries.has(found)) {
      add(`unexpected HTML file not represented in the route manifest: ${found}`);
    }
  }
}

function checkMarkers() {
  for (const route of routes) {
    const abs = resolveEntryPath(projectRootUrl, route.entry);
    if (!fs.existsSync(abs)) continue; // already reported
    const html = fs.readFileSync(abs, 'utf8');
    for (const problem of getMarkerProblems(html, route)) add(problem);
  }
}

checkDuplicates();
checkRegistries();
checkContentShape();
checkSiteConfig();
checkNavigation();
checkWorkListingLinks();
checkSingletons();
checkFormats();
checkApprovedRoutes();
checkPhysicalFilesExist();
checkNoUnexpectedFiles();
checkMarkers();

if (problems.length > 0) {
  console.error(`[validate-routes] ${problems.length} problem(s) found:\n`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
} else {
  console.log(`[validate-routes] all ${routes.length} routes valid.`);
}
