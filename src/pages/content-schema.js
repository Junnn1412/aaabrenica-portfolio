import { isSafeInternalPath } from './link-safety.js';
import {
  TRUST_ICONS,
  CAPABILITY_ICONS,
  CAPABILITY_ACCENTS,
} from './icon-registry.js';

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
    problems.push(
      '"paragraphs" must be a non-empty array of non-empty strings',
    );
  }
  if (
    'description' in content &&
    content.description != null &&
    (typeof content.description !== 'string' ||
      content.description.length === 0)
  ) {
    problems.push('"description", when present, must be a non-empty string');
  }
}

function checkLink(link, fieldName, problems) {
  if (typeof link?.label !== 'string' || link.label.length === 0) {
    problems.push(`"${fieldName}.label" must be a non-empty string`);
  }
  if (typeof link?.path !== 'string' || !isSafeInternalPath(link.path)) {
    problems.push(
      `"${fieldName}.path" must be a safe internal path (start with "/", not "//")`,
    );
  }
}

// PF-041 helpers below, used only by the 'home' template branch.

function checkNonEmptyString(value, fieldName, problems) {
  if (typeof value !== 'string' || value.length === 0) {
    problems.push(`"${fieldName}" must be a non-empty string`);
  }
}

// Capability-card and project-card links have no independent visible
// label — the card's own heading text is the link's accessible name (see
// docs/DESIGN_SYSTEM.md's Capability/Project card markup contracts), so
// these are validated as a bare safe path, not the {label, path} shape
// checkLink() expects.
function checkBarePath(path, fieldName, problems) {
  if (typeof path !== 'string' || !isSafeInternalPath(path)) {
    problems.push(
      `"${fieldName}" must be a safe internal path (start with "/", not "//")`,
    );
  }
}

function checkExactArray(value, fieldName, count, problems) {
  if (!Array.isArray(value) || value.length !== count) {
    problems.push(`"${fieldName}" must be an array of exactly ${count} items`);
    return false;
  }
  return true;
}

function checkSectionHeader(section, fieldName, problems) {
  checkNonEmptyString(section?.eyebrow, `${fieldName}.eyebrow`, problems);
  checkNonEmptyString(section?.heading, `${fieldName}.heading`, problems);
}

// Shared by the 'home' and 'solutions' template branches — both close with
// a { heading, body?, action: {label, path} } CTA panel rendered by the
// same src/components/cta.js.
function checkCtaShape(cta, fieldName, problems) {
  if (cta == null || typeof cta !== 'object') {
    problems.push(`"${fieldName}" is required`);
    return;
  }
  checkNonEmptyString(cta.heading, `${fieldName}.heading`, problems);
  if (
    'body' in cta &&
    cta.body != null &&
    (typeof cta.body !== 'string' || cta.body.length === 0)
  ) {
    problems.push(
      `"${fieldName}.body", when present, must be a non-empty string`,
    );
  }
  checkLink(cta.action, `${fieldName}.action`, problems);
}

// PF-050 helpers below, used only by the 'solutions' template branch.

// The exact 6 approved anchor slugs (§7.1/home.js's six capability
// categories) — not just a kebab-case format check, since these ids are
// also the anchors home.js's capability-card links target directly
// (/solutions/#<id>), so an unrecognized id would silently break that
// cross-page link.
const SOLUTION_SECTION_IDS = [
  'custom-business-systems',
  'workflow-process-solutions',
  'corporate-websites',
  'wordpress-development',
  'existing-system-improvements',
  'support-maintenance',
];

// PF-051 helpers below, used only by the 'process' template branch.

// Single source of truth for the canonical 7-stage lifecycle order (§10.2).
// Exported so tests assert against this same array rather than re-typing
// the sequence independently.
export const PROCESS_STAGE_NAMES = [
  'Discover',
  'Define',
  'Design',
  'Develop',
  'Test',
  'Deploy',
  'Support',
];

// Property-presence check, not a truthiness/length check — Support (the
// terminal stage) must not declare a "next" key at all, including
// next: null/undefined/''. A plain `stage.next != null` check would wrongly
// accept `next: undefined` as "absent" in some callers' minds even though
// it's a real own property; Object.hasOwn is unambiguous.
function hasOwnNextProperty(stage) {
  return (
    stage != null && typeof stage === 'object' && Object.hasOwn(stage, 'next')
  );
}

function checkHomeContent(content, problems) {
  const c = content;

  if (c.hero == null || typeof c.hero !== 'object') {
    problems.push('"hero" is required for the home page');
  } else {
    checkLink(c.hero.primaryCta, 'hero.primaryCta', problems);
    checkLink(c.hero.secondaryCta, 'hero.secondaryCta', problems);
  }

  if (c.trust == null || typeof c.trust !== 'object') {
    problems.push('"trust" is required for the home page');
  } else {
    checkSectionHeader(c.trust, 'trust', problems);
    if (checkExactArray(c.trust.items, 'trust.items', 3, problems)) {
      c.trust.items.forEach((item, i) => {
        checkNonEmptyString(
          item?.heading,
          `trust.items[${i}].heading`,
          problems,
        );
        if (typeof item?.icon !== 'string' || !(item.icon in TRUST_ICONS)) {
          problems.push(
            `"trust.items[${i}].icon" must be one of: ${Object.keys(TRUST_ICONS).join(', ')}`,
          );
        }
      });
    }
    checkLink(c.trust.link, 'trust.link', problems);
  }

  if (c.problems == null || typeof c.problems !== 'object') {
    problems.push('"problems" is required for the home page');
  } else {
    checkSectionHeader(c.problems, 'problems', problems);
    if (checkExactArray(c.problems.items, 'problems.items', 4, problems)) {
      c.problems.items.forEach((item, i) => {
        checkNonEmptyString(item, `problems.items[${i}]`, problems);
      });
    }
    checkNonEmptyString(
      c.problems.reassurance,
      'problems.reassurance',
      problems,
    );
    checkLink(c.problems.link, 'problems.link', problems);
  }

  if (c.capabilities == null || typeof c.capabilities !== 'object') {
    problems.push('"capabilities" is required for the home page');
  } else {
    checkSectionHeader(c.capabilities, 'capabilities', problems);
    if (
      checkExactArray(c.capabilities.items, 'capabilities.items', 6, problems)
    ) {
      c.capabilities.items.forEach((item, i) => {
        checkNonEmptyString(
          item?.heading,
          `capabilities.items[${i}].heading`,
          problems,
        );
        checkNonEmptyString(
          item?.description,
          `capabilities.items[${i}].description`,
          problems,
        );
        if (
          typeof item?.accent !== 'string' ||
          !CAPABILITY_ACCENTS.includes(item.accent)
        ) {
          problems.push(
            `"capabilities.items[${i}].accent" must be one of: ${CAPABILITY_ACCENTS.join(', ')}`,
          );
        }
        if (
          typeof item?.icon !== 'string' ||
          !(item.icon in CAPABILITY_ICONS)
        ) {
          problems.push(
            `"capabilities.items[${i}].icon" must be one of: ${Object.keys(CAPABILITY_ICONS).join(', ')}`,
          );
        }
        checkBarePath(item?.link, `capabilities.items[${i}].link`, problems);
      });
    }
  }

  if (c.projects == null || typeof c.projects !== 'object') {
    problems.push('"projects" is required for the home page');
  } else {
    checkSectionHeader(c.projects, 'projects', problems);
    if (checkExactArray(c.projects.items, 'projects.items', 3, problems)) {
      let featuredCount = 0;
      c.projects.items.forEach((item, i) => {
        checkProjectCardItem(item, `projects.items[${i}]`, problems);
        if (item?.featured === true) {
          featuredCount++;
        }
      });
      if (featuredCount !== 1) {
        problems.push(
          `"projects.items" must contain exactly one item with "featured: true", found ${featuredCount}`,
        );
      }
    }
    checkLink(c.projects.link, 'projects.link', problems);
  }

  if (c.process == null || typeof c.process !== 'object') {
    problems.push('"process" is required for the home page');
  } else {
    checkSectionHeader(c.process, 'process', problems);
    if (checkExactArray(c.process.steps, 'process.steps', 4, problems)) {
      c.process.steps.forEach((step, i) => {
        checkNonEmptyString(
          step?.heading,
          `process.steps[${i}].heading`,
          problems,
        );
      });
    }
    checkLink(c.process.link, 'process.link', problems);
  }

  if (c.engagement == null || typeof c.engagement !== 'object') {
    problems.push('"engagement" is required for the home page');
  } else {
    checkNonEmptyString(c.engagement.heading, 'engagement.heading', problems);
    checkNonEmptyString(c.engagement.lede, 'engagement.lede', problems);
    if (checkExactArray(c.engagement.items, 'engagement.items', 4, problems)) {
      c.engagement.items.forEach((item, i) => {
        checkNonEmptyString(item, `engagement.items[${i}]`, problems);
      });
    }
  }

  if (c.about == null || typeof c.about !== 'object') {
    problems.push('"about" is required for the home page');
  } else {
    checkSectionHeader(c.about, 'about', problems);
    if (
      !Array.isArray(c.about.paragraphs) ||
      c.about.paragraphs.length === 0 ||
      c.about.paragraphs.some((p) => typeof p !== 'string' || p.length === 0)
    ) {
      problems.push(
        '"about.paragraphs" must be a non-empty array of non-empty strings',
      );
    }
    checkLink(c.about.link, 'about.link', problems);
  }

  checkCtaShape(c.cta, 'cta', problems);
}

function checkSolutionsContent(content, problems) {
  const c = content;

  if (checkExactArray(c.sections, 'sections', 6, problems)) {
    const seenIds = new Set();
    c.sections.forEach((section, i) => {
      checkNonEmptyString(section?.heading, `sections[${i}].heading`, problems);
      checkNonEmptyString(section?.problem, `sections[${i}].problem`, problems);
      checkNonEmptyString(
        section?.audience,
        `sections[${i}].audience`,
        problems,
      );
      checkNonEmptyString(section?.build, `sections[${i}].build`, problems);
      checkNonEmptyString(section?.benefit, `sections[${i}].benefit`, problems);

      if (
        typeof section?.id !== 'string' ||
        !SOLUTION_SECTION_IDS.includes(section.id)
      ) {
        problems.push(
          `"sections[${i}].id" must be one of: ${SOLUTION_SECTION_IDS.join(', ')}`,
        );
      } else if (seenIds.has(section.id)) {
        problems.push(
          `"sections[${i}].id" duplicates an id already used by another section: "${section.id}"`,
        );
      } else {
        seenIds.add(section.id);
      }

      if (
        typeof section?.icon !== 'string' ||
        !(section.icon in CAPABILITY_ICONS)
      ) {
        problems.push(
          `"sections[${i}].icon" must be one of: ${Object.keys(CAPABILITY_ICONS).join(', ')}`,
        );
      }
      if (
        typeof section?.accent !== 'string' ||
        !CAPABILITY_ACCENTS.includes(section.accent)
      ) {
        problems.push(
          `"sections[${i}].accent" must be one of: ${CAPABILITY_ACCENTS.join(', ')}`,
        );
      }

      // Optional — only the Workflow & Process Solutions section carries
      // one in V1 (see the plan's "Approved content exceptions"); absent
      // is valid, present-but-malformed is not.
      if (section?.evidence != null) {
        checkLink(section.evidence, `sections[${i}].evidence`, problems);
      }

      checkLink(section?.cta, `sections[${i}].cta`, problems);
    });
  }

  checkCtaShape(c.cta, 'cta', problems);
}

function checkProcessContent(content, problems) {
  const c = content;

  if (c.stages == null || typeof c.stages !== 'object') {
    problems.push('"stages" is required for the process page');
  } else {
    checkSectionHeader(c.stages, 'stages', problems);
    if (
      checkExactArray(
        c.stages.items,
        'stages.items',
        PROCESS_STAGE_NAMES.length,
        problems,
      )
    ) {
      c.stages.items.forEach((stage, i) => {
        const expectedName = PROCESS_STAGE_NAMES[i];
        if (stage?.heading !== expectedName) {
          problems.push(
            `"stages.items[${i}].heading" must be "${expectedName}" — stages must appear in the canonical order ${PROCESS_STAGE_NAMES.join(' → ')}`,
          );
        }
        checkNonEmptyString(
          stage?.whatHappens,
          `stages.items[${i}].whatHappens`,
          problems,
        );
        checkNonEmptyString(
          stage?.clientInput,
          `stages.items[${i}].clientInput`,
          problems,
        );
        checkNonEmptyString(
          stage?.delivers,
          `stages.items[${i}].delivers`,
          problems,
        );
        checkNonEmptyString(
          stage?.approval,
          `stages.items[${i}].approval`,
          problems,
        );

        const isLastStage = i === PROCESS_STAGE_NAMES.length - 1;
        if (isLastStage) {
          if (hasOwnNextProperty(stage)) {
            problems.push(
              `"stages.items[${i}].next" must be omitted entirely — ${expectedName} is the terminal stage and must not declare a "next" property at all (found one; even null, undefined, or an empty string is rejected)`,
            );
          }
        } else if (
          !hasOwnNextProperty(stage) ||
          typeof stage.next !== 'string' ||
          stage.next.length === 0
        ) {
          problems.push(`"stages.items[${i}].next" must be a non-empty string`);
        }
      });
    }
  }

  if (c.workingTogether == null || typeof c.workingTogether !== 'object') {
    problems.push('"workingTogether" is required for the process page');
  } else {
    checkNonEmptyString(
      c.workingTogether.heading,
      'workingTogether.heading',
      problems,
    );
    if (
      checkExactArray(
        c.workingTogether.items,
        'workingTogether.items',
        2,
        problems,
      )
    ) {
      c.workingTogether.items.forEach((item, i) => {
        checkNonEmptyString(
          item?.heading,
          `workingTogether.items[${i}].heading`,
          problems,
        );
        checkNonEmptyString(
          item?.body,
          `workingTogether.items[${i}].body`,
          problems,
        );
      });
    }
  }

  checkCtaShape(c.cta, 'cta', problems);
}

// PF-052 — used by both 'home' (curated, fixed-count preview) and 'work'
// (every real project, growth-safe count) template branches. Each caller
// still tallies its own featured count and applies its own aggregate rule
// (home: exactly one; work: at most one), since that constraint differs.
function checkProjectCardItem(item, fieldPrefix, problems) {
  checkNonEmptyString(item?.heading, `${fieldPrefix}.heading`, problems);
  checkBarePath(item?.link, `${fieldPrefix}.link`, problems);
  if (
    'category' in (item ?? {}) &&
    item.category != null &&
    (typeof item.category !== 'string' || item.category.length === 0)
  ) {
    problems.push(
      `"${fieldPrefix}.category", when present, must be a non-empty string`,
    );
  }
  if (
    'summary' in (item ?? {}) &&
    item.summary != null &&
    (typeof item.summary !== 'string' || item.summary.length === 0)
  ) {
    problems.push(
      `"${fieldPrefix}.summary", when present, must be a non-empty string`,
    );
  }
  if ('tags' in (item ?? {}) && item.tags != null) {
    if (
      !Array.isArray(item.tags) ||
      item.tags.length === 0 ||
      item.tags.some((t) => typeof t !== 'string' || t.length === 0)
    ) {
      problems.push(
        `"${fieldPrefix}.tags", when present, must be a non-empty array of non-empty strings`,
      );
    }
  }
  if (
    item?.featured !== undefined &&
    item?.featured !== true &&
    item?.featured !== false
  ) {
    problems.push(`"${fieldPrefix}.featured", when present, must be a boolean`);
  }
}

// PF-052 — Work's project list is "every real project," not a curated
// fixed-count preview like home's — a non-empty-array rule, not
// checkExactArray(..., 3, ...), keeps this growth-safe as PF-060–063
// registers more case studies. Completeness (every registered case-study
// route present exactly once) is the cross-file route check's job
// (scripts/work-project-routes.mjs), not this per-item shape schema's.
function checkWorkContent(content, problems) {
  const c = content;

  if (c.projects == null || typeof c.projects !== 'object') {
    problems.push('"projects" is required for the work page');
  } else {
    checkSectionHeader(c.projects, 'projects', problems);
    if (!Array.isArray(c.projects.items) || c.projects.items.length === 0) {
      problems.push('"projects.items" must be a non-empty array');
    } else {
      let featuredCount = 0;
      c.projects.items.forEach((item, i) => {
        checkProjectCardItem(item, `projects.items[${i}]`, problems);
        if (item?.featured === true) {
          featuredCount++;
        }
      });
      if (featuredCount > 1) {
        problems.push(
          `"projects.items" must contain at most one item with "featured: true", found ${featuredCount}`,
        );
      }
    }
  }

  checkCtaShape(c.cta, 'cta', problems);
}

// PF-055 helper, used only by the 'not-found' template branch. A fixed,
// curated navigational set (Home/Work/Contact) — checkExactArray(..., 3,
// ...), not a growth-safe non-empty-array rule like checkWorkContent's.
function checkNotFoundContent(content, problems) {
  if (checkExactArray(content.links, 'links', 3, problems)) {
    content.links.forEach((link, i) =>
      checkLink(link, `links[${i}]`, problems),
    );
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

  // PF-053: a universal optional field, the same way `link` already is —
  // not gated by route.template — so any dedicated page can opt into a
  // closing CTA panel without needing its own schema branch.
  if ('cta' in content && content.cta != null) {
    checkCtaShape(content.cta, 'cta', problems);
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

  if (route.template === 'home') {
    checkHomeContent(content, problems);
  }

  if (route.template === 'solutions') {
    checkSolutionsContent(content, problems);
  }

  if (route.template === 'process') {
    checkProcessContent(content, problems);
  }

  if (route.template === 'work') {
    checkWorkContent(content, problems);
  }

  if (route.template === 'not-found') {
    checkNotFoundContent(content, problems);
  }

  return problems;
}
