# Source Architecture

Established in PF-011. Describes how the site's 11 static routes are
composed from shared markup and structured content without any templating
package or generated files on disk. See [`DECISION_LOG.md`](DECISION_LOG.md)
for the reasoning behind the approach.

## Directory responsibilities

```text
src/
├── config/
│   ├── site.js         — site name, default description, base URL, primary CTA. PF-054: `contactEmail`/`social.github`/`social.linkedin` are now real, verified values (not null); `resumePath`/`baseUrl` remain null, deferred by explicit product decision
│   ├── navigation.js    — primary nav items [{ key, label, path }]
│   └── routes.js        — single source of truth: every route's path, entry file, nav key, template, content key
├── content/
│   └── pages/            — one plain-data module per route (title, description?, heading, paragraphs, ...)
├── components/
│   ├── icon.js            — build-time SVG string renderer for the small, whitelisted set of Lucide icons in use (PF-031)
│   ├── capability-card.js / project-card.js / process-steps.js / trust-list.js / engagement-options.js / cta.js — PF-041: one render*() module per Gate-C-approved component, each reproducing its documented markup contract exactly. cta.js — PF-051: gained an optional `headingLevel` render parameter (closed set `{2, 3}`, default `3` unchanged for every prior caller) so a top-level sibling section's own CTA (Process's closing CTA) can render `<h2>` instead of the default `<h3>`. capability-card.js/project-card.js — PF-052: gained the identical optional `headingLevel` parameter (closed set `{3, 4}`, default `4` unchanged) so a card nested directly under a page-level `<h2>` (Home's Capabilities/Projects sections, Work's Projects section) can render `<h3>` instead of the default `<h4>` — an accessibility correction to an already-shipped skipped-heading-level defect, not a redesign
│   ├── section-header.js  — PF-050: eyebrow/heading/lede section header, extracted from home.js's template for its second real caller (solutions.js) — shared by both, not home-specific
│   └── partials/          — shared structural markup: header, nav, footer
├── pages/
│   ├── templates/          — standard / case-study / home / solutions / process / work / contact / not-found: the *shape* a page takes (`listing` renamed to `work` at PF-052; `contact` and `not-found` added at PF-054/PF-055; `case-study` extended from a bare heading/paragraphs/backLink shape to ten independently optional named sections at PF-060 — see `DECISION_LOG.md`)
│   ├── render.js            — route -> composed { head, header, main, footer }
│   ├── compose.js           — marker validation + safe substitution into the HTML skeleton
│   ├── escape.js             — escapeHtml — the only way content reaches HTML
│   ├── link-safety.js        — isSafeInternalPath/isSafeEmail/isSafeExternalUrl — rejects javascript:, external, protocol-relative URLs, and unsafe mailto:/social-URL shapes (PF-031). PF-060 adds `isSafeCaseStudyExternalUrl(url, contentKey)`, checked against a private `CASE_STUDY_EXTERNAL_HOSTS` map keyed by `route.content` (never a content-supplied value) — a case study may link to at most one approved external production site
│   ├── icon-registry.js       — PF-041: closed-set icon-key/accent registry (TRUST_ICONS, CAPABILITY_ICONS, CAPABILITY_ACCENTS, CARD_ARROW_ICON) — the single source content-schema.js validates against and the components/*.js renderers resolve icons from, keeping the pure validation layer free of any dependency on renderer modules
│   ├── content-schema.js     — per-template required-field/type + link-safety checks. PF-051 adds `PROCESS_STAGE_NAMES` (exported single source of truth for the canonical 7-stage lifecycle order) and `checkProcessContent`, which enforces stage order/naming positionally and forbids a `next` property on the terminal stage via `Object.hasOwn` (presence, not truthiness). PF-052 adds the shared `checkProjectCardItem` helper (reused by `checkHomeContent`'s `projects` branch and the new `checkWorkContent`) — per-route content shape only; cross-route link *completeness* stays out of this module, see `scripts/work-project-routes.mjs` below. PF-053 adds `content.cta` as a universal optional field (validated unconditionally, like the existing `content.link`, not gated by `route.template`), reusing `checkCtaShape()`. PF-054's `contact` template needs no new branch — its contact-methods list is sourced from `site`, not `content`, so `contact.js`'s content only needs the base fields. PF-055 adds `checkNotFoundContent`, using `checkExactArray(content.links, 'links', 3, problems)` — a fixed 3-link recovery set, not a growth-safe count like Work's. PF-060 replaces the prior bare `backLink`-only `case-study` branch with `checkCaseStudyContent`, validating ten independently optional named sections (`logo`, `client`, `problem`, `role`, `solution`, `technologyStack`, `decisions`, `outcomes`, `gallery`, `externalLink`) — absent is always valid; present gets its own required sub-fields checked. `externalLink.url` is validated by `link-safety.js`'s new `isSafeCaseStudyExternalUrl(url, route.content)` — see `docs/DESIGN_SYSTEM.md`'s "Case study page (PF-060)" section for the full contract
│   └── dev-watcher.js         — attaches the dev-server file watcher that restarts on architecture edits
├── scripts/
│   ├── main.js                 — global JS entry (imports the SCSS entry, nav-toggle.js)
│   ├── nav-toggle.js            — DOM wiring for the mobile menu disclosure button (PF-031)
│   └── nav-toggle-state.js      — pure, DOM-free state/effect logic behind nav-toggle.js (PF-031)
└── styles/                     — ITCSS-lite (see below)

scripts/                         — Node-only build tooling, deliberately outside src/scripts/ (which is browser code)
├── validate-routes.mjs           — pre-flight validator, runs automatically before dev and build
├── verify-build-output.mjs       — composed-output verifier, runs automatically after build
└── work-project-routes.mjs       — PF-052: pure, exported `findWorkProjectRouteProblems(projectLinks, caseStudyRoutePaths)` — the Work directory's exact-set-equality check against every registered `case-study` route (no missing, duplicate, or unregistered destination). A separate tiny module, not a named export added to `validate-routes.mjs` itself, because that script's own top level runs its full check sequence (including a possible `process.exit(1)`) unconditionally on import — this module has no top-level side effects, so it is safe to import directly from tests
```

`project-card-assets.mjs` collects only `presentation.kind: 'image'`
sources; the pre-build and post-build validators pass that list through the
shared root-safe, exact-case asset checker. `project-card.js` independently
enforces the closed `image`/`text-only`/`deferred` renderer contract, while
`content-schema.js` rejects the same invalid shapes before rendering.

`src/assets/` is not created yet — no images/static assets exist. Every
ITCSS layer under `src/styles/` now has real content: `settings/`,
`generic/`, `elements/`, `objects/`, `components/`, and `utilities/` since
PF-020/021/031–034/040/041, and `pages/` since PF-050 (a second file,
`pages/_process.scss`, since PF-051 — see "SCSS layering" below).

## How a page is composed

Every route has a real, physical, **intentionally identical** HTML file on
disk (e.g. `solutions/index.html`) containing only the shared `<head>`
boilerplate, the `/src/scripts/main.js` script tag (kept untouched so Vite's
own asset discovery always works), and five markers:

```html
<!--@head-->
<!--@header-->
<!--@content-->
<!--@footer-->
data-page="__PAGE_KEY__"
```

The real skeleton also carries `<main id="main-content" tabindex="-1">` —
the `tabindex="-1"` (PF-031) is what lets the skip link reliably move
keyboard focus there, not just scroll it into view.

A Vite plugin (`vite.config.js`, `pageComposerPlugin`) intercepts every HTML
entry via the `transformIndexHtml` hook — which runs in both `vite dev` and
`vite build` — resolves the route from `src/config/routes.js`, renders it
(`src/pages/render.js`), and substitutes the markers
(`src/pages/compose.js`). **Nothing is ever written back to disk** — the
composed HTML only ever exists in memory for that one request/build pass.
`vite preview` serves the already-built `dist/` output as-is; it does not
re-run the plugin.

`compose.js` verifies every marker occurs **exactly once** before
substituting, and that none remain afterward — a route with a missing,
duplicated, or misspelled marker fails loudly rather than silently shipping
broken output.

## Content is data, never markup

Every field in `src/content/pages/*.js` is a plain string, array, or
`{ label, path }` link object — never raw HTML. `escape.js`'s `escapeHtml()`
is the only path content ever takes into the HTML string, and
`link-safety.js`'s `isSafeInternalPath()` rejects `javascript:`,
`http(s)://`, `mailto:`, and protocol-relative (`//...`) paths before a link
is ever rendered. If a future field genuinely needs to carry trusted HTML,
it must be explicitly named (e.g. `trustedHtml`) and separately
documented/approved — no such field exists today.

## Per-section containers and anchor composition

Most templates (`standard`) wrap their entire `main` output in one
template-owned `<div class="container">` (see `docs/DECISION_LOG.md`'s
PF-040 entry for why container ownership sits at the template layer, not
the skeleton). `home`, `solutions`, `process` (since PF-051), `work` (since
PF-052), and `case-study` (since PF-060) are the exceptions: each top-level
`<section>` owns its own inner `.container` instead, so a full-bleed
section never has to fight a page-level wrapper. All five share the
`.page-section` vertical-rhythm wrapper
(`src/styles/objects/_page-section.scss`) and the `renderSectionHeader()`
helper (`src/components/section-header.js`). Unlike the other four,
`case-study` may legitimately render **zero** top-level sections (a case
study with no approved content yet) — `scripts/verify-build-output.mjs`'s
"at least one section" check is gated behind `route.template !==
'case-study'` for exactly that reason; every section that _is_ present
must still open with its own container, so that half of the check applies
unconditionally.

`solutions.js`'s six sections are anchored (`<section id="...">`), with
every id sourced from `src/content/pages/solutions.js`'s own
`sections[].id` field — never hardcoded a second time. The page's own jump
navigation and `home.js`'s capability-card links (composed as
`/solutions/#<id>`) are both derived from/checked against that same set of
ids, so the two pages' cross-links cannot silently drift apart:
`content-schema.js`'s `SOLUTION_SECTION_IDS` allow-list rejects any section
id outside the six approved slugs, and a dedicated cross-file test in
`tests/home-render.test.mjs` asserts every homepage capability link points
at the Solutions section with the matching heading.

`process.js`'s seven stages are **not** anchored — §10.2 of the
requirements doc, unlike §10.1's Solutions page, carries no anchor/deep-link
requirement, and the stages are read in fixed sequential order rather than
looked up independently, so no jump navigation exists. Stage order is
enforced positionally by `content-schema.js`'s exported `PROCESS_STAGE_NAMES`
constant — the single place the 7-stage sequence (`Discover → Define →
Design → Develop → Test → Deploy → Support`) is spelled out; tests import
the same constant rather than re-typing it. The terminal stage (Support)
must not declare a `next` property at all — checked via `Object.hasOwn`,
so `next: null`/`undefined`/`''` are rejected exactly like a present
non-empty string, not just a falsy-value check that could be fooled by
treating `undefined` as "absent."

`work.js`'s project grid is also unanchored, for the same reason — no
anchor requirement, no independent lookup. Unlike `home`'s fixed, curated
3-project preview (`checkExactArray(..., 3, ...)`), `work`'s schema
requires only a non-empty `projects.items` array — completeness (does the
list contain every registered case-study route, exactly once) is enforced
separately by `scripts/work-project-routes.mjs`'s exact-set-equality check,
not by the per-route content schema, so the list can grow as PF-060–063
registers more case studies without a schema edit.

1. **Pre-flight** (`scripts/validate-routes.mjs`, runs automatically as
   `predev`/`prebuild`, also `npm run check:routes`): checks the whole
   manifest at once — duplicate keys/paths/entries, template/content
   registry membership, content shape and types, internal-link safety and
   resolution (nav agrees with its route; Work's project destinations have
   exact set equality with the registered `case-study` routes — missing,
   duplicate, extra, and unregistered destinations are all rejected, with
   the expected set derived from the route registry itself, never a
   hardcoded project count, via `scripts/work-project-routes.mjs`'s
   `findWorkProjectRouteProblems()`; every `backLink` points at `/work/`),
   exactly one `/` and one `/404.html`, the manifest matches the 11 approved routes
   exactly, every entry file exists, no unexpected HTML file exists in a
   known route directory, and every skeleton has each marker exactly once.
2. **Render-time** (`src/pages/render.js`): re-validates the _specific_
   route's content on every render, using the same `content-schema.js` the
   pre-flight validator uses. This matters because content edits trigger a
   dev-server _restart_, not a process exit — invalid data introduced
   mid-session must not silently reach the composed output on the next
   request.
3. **Build-output** (`scripts/verify-build-output.mjs`, runs automatically
   as `postbuild`, also `npm run check:build`): checks the actual generated
   `dist/*.html` — no leftover markers, exactly one non-empty `<title>` and
   meta description, exactly one focusable `<main id="main-content" tabindex="-1">`
   and one primary navigation landmark, correct `aria-current="page"`
   placement (including the documented 404 policy below), exactly one skip
   link and one privacy link (PF-031), no empty attributes, and no
   canonical or contact/social markup while those config values are unset.

## Development regeneration

Vite does not automatically restart on changes to files statically imported
by `vite.config.js` (a confirmed limitation for plain `.js` configs —
vitejs/vite#5780, #21655). `src/pages/dev-watcher.js` explicitly watches
`src/config/`, `src/content/`, `src/components/partials/`, and `src/pages/`
via the dev server's own `chokidar` watcher and calls `server.restart()` on
`change`/`add`/`unlink`, debounced and guarded against overlapping restarts.
It re-attaches its listeners on every `configureServer` call (i.e. every
restart) via a self-disposing state object, so it works correctly whether or
not Vite reuses the underlying watcher instance across a restart.

## 404 navigation policy

The 404 route's `navKey` is `null`; the nav partial only sets
`aria-current="page"` when a route's `navKey` matches a nav item's `key`, so
the 404 page renders the full primary navigation with **no active item** —
it isn't part of a normal site section. Verified in
`scripts/verify-build-output.mjs`. Unchanged by PF-055's move to a
dedicated `not-found` template — this task confirmed the existing policy
still holds end-to-end, it did not need new enforcement.

`scripts/verify-build-output.mjs` carries region-scoped contact checks. Email,
GitHub, and LinkedIn must appear exactly once in every footer and exactly once
inside Contact main; Facebook is footer-only. This preserves Contact's three
approved direct methods while allowing the compact global footer to own its
four-link social/contact set. A whole-document count would be wrong for the
three links intentionally rendered in both regions.

## SCSS layering

`src/styles/` follows an ITCSS-lite order — settings, generic, elements,
objects, components, utilities, pages — and `main.scss` is a thin `@use`
aggregator in that exact order. Every layer now has real content.
`objects/` holds shared, cross-page layout primitives: `container`,
`page-shell`, `section-header`, and — since PF-050 — `page-section`, the
inter-section spacing/divider wrapper generalized out of the
homepage-only `.home-section` (`components/_hero.scss`) for its second
real caller, `solutions.js` (now a third real caller, `process.js`, since
PF-051). `pages/` holds page-specific overrides that don't belong in a
shared object or component — reserved since PF-011, first populated by
PF-050's `pages/_solutions.scss` (jump-nav chips, section icon badges, the
problem/audience/build/benefit detail list, and the sticky-header-safe
anchor offset), and joined by a second file, `pages/_process.scss`, since
PF-051 (the ordered stage list's number/heading row, the shared
`.process-facts` term/detail pattern reused by both the stages and Working
Together sections, and the mobile-stack/desktop-grid responsive contract
for it, gated behind `spacing.$bp-md`), a third, `pages/_contact.scss`,
since PF-054 (`.contact-methods`'s `ul`/`li` prose-rule reset — the one
genuinely new structural hook the Contact page needed; no existing
component fit "N independent clickable destinations"), a fourth,
`pages/_not-found.scss`, added in a PF-055 visual-review follow-up after
AAA found the initial default `ul`/`li` presentation on the 404 page's
recovery links read as unfinished — the same reset pattern as
`_contact.scss`, styling `.not-found__link`/`.not-found__link-item`
(explicit classes, not a descendant selector), and a fifth,
`pages/_case-study.scss`, since PF-060 (the hero heading/logo row, the
`.case-study-tech-stack` tag row mirroring `.project-card__tags`'
declarations without depending on that component's class, and the
`.case-study-gallery` grid — the same proactive `max-width: none; margin:
0;` reset every `<ul>`-based grid in this project applies from the first
draft). See `docs/DESIGN_SYSTEM.md`'s "Solutions page (PF-050)", "Process
page (PF-051)", "Supporting pages: About, Contact, Privacy, 404
(PF-053/054/055)", and "Case study page (PF-060)" sections for the full
rationale.

## Deferred

- `src/assets/`, `public/` — no images/static assets yet.
- **No longer deferred as of PF-041**: capability cards, project cards,
  process steps, trust indicators, engagement options, and the CTA panel
  all now have real `render*()` modules in `src/components/` and real
  content in `src/content/pages/home.js`, validated by a `home`-template
  branch in `src/pages/content-schema.js`. See `docs/DESIGN_SYSTEM.md`'s
  "Homepage (PF-041)" section.
- **Project-card `summary`/`category`/`tags` — no longer deferred for FES
  Challenger as of PF-060**: `renderProjectCard()`'s already-supported
  optional fields are now populated for FES, sourced from
  `src/content/pages/work/fes-challenger.js`'s own `card` export (not
  retyped in `home.js`/`work/index.js`). Business Workflow System and
  eBarangay still carry only title/category(where quoted)/link — no
  summary/tech/outcome copy is approved for either yet (PF-061/062 still
  blocked).
- Page-specific browser JS — `data-page` on `<body>` is a ready, documented
  seam for this; PF-041 is its first real consumer, scoping a homepage-only
  CSS rule (`body[data-page='home'] #main-content`) in `_hero.scss`.
- External social/contact link _values_ — `site.social.github`/`.linkedin`/
  `.contactEmail`/`.resumePath` stay `null` until PF-003/PF-053 supplies
  real values. The safety policy itself is no longer deferred:
  `link-safety.js`'s `isSafeEmail()`/`isSafeExternalUrl()` and
  `footer.js`'s conditional rendering (PF-031) are already built and
  tested against fixture data, ready for the real values whenever they
  arrive.

## Profile-card and exact-case asset addendum (2026-08-19)

This addendum supersedes earlier statements in this document that no static
assets exist or that omit the dedicated About template from the template
inventory.

- `src/config/site.js` owns shared `profile` identity and portrait metadata
  used by Home and About.
- `src/components/profile-card.js` is a shared build-time renderer with closed
  `full` and `compact` variants. About content owns statement/highlights; Home
  content owns its relocated `/about/` action.
- `src/styles/components/_profile-card.scss` owns the shared surface, portrait,
  and bracket rules. Page files own only their surrounding composition:
  `_about.scss` adds the explicit grid gap before the closing CTA, and
  `_home.scss` adds the homepage copy/card layout.
- `scripts/asset-existence.mjs` retains the existing root-containment and
  existence behavior while additionally comparing every requested path
  segment with real directory entries. Both pre-build `public/` and post-build
  `dist/` checks therefore reject case-only URL mismatches on Windows too.

## Project-card publication and carousel addendum (2026-08-19)

- `src/content/project-card-visibility.js` is the shared, strict pre-render
  publication filter for Home and Work. It never changes the raw content
  arrays used by schema or route validation.
- Each project module owns its canonical `card.isVisible`; no page template
  contains project-name filters.
- `src/components/project-card.js` owns the closed `carousel` markup contract.
  `src/scripts/project-carousel-state.js` owns pure three-slide state, while
  `src/scripts/project-carousel.js` performs atomic DOM enhancement.
- `fes-challenger.js` owns the three canonical desktop descriptors reused by
  both gallery and carousel. `scripts/project-card-assets.mjs` collects every
  carousel slide path; `scripts/registered-assets.mjs` retains the normalized
  cross-consumer deduplication boundary used by public and dist checks.
- `_project-card.scss` owns card/carousel layout and clipping. `_home.scss`
  owns only the Home list/action composition gap.

## Disabled Contact-form addendum (2026-08-21)

**Implemented and disabled; not yet operationally enabled.**

- `site.contactForm.enabled` is the build-time presentation gate and remains
  `false`; direct Email, GitHub, and LinkedIn methods remain the rendered
  Contact page. The Function has a separate dashboard-owned runtime gate,
  `CONTACT_FORM_ENABLED`, and cannot be enabled by source configuration alone.
- `src/contact/form-contract.js` is the shared field/normalization/validation
  contract. `src/components/contact-form.js` owns static progressive markup;
  `src/contact/form-client.js` owns request/response behavior; and
  `src/scripts/contact-form.js` attaches enhancement only when a real form is
  rendered.
- `functions/api/contact.js` is the authoritative Cloudflare Pages Function.
  It accepts POST only and applies request/body validation, safe response and
  email generation, honeypot behavior, runtime gating, idempotency, safe logs,
  and generic provider/configuration failures.
- `functions/_shared/email-delivery.js` is the replaceable delivery boundary;
  its current adapter performs one Resend API request with an 8-second native
  abort timeout and no retry. Same-origin enforcement, when an `Origin` header
  is present, lives in the authoritative Function and complements rather than
  replaces its validation and the external WAF prerequisite. No Worker, Durable
  Object, KV/D1/database, Turnstile, local/in-memory limiter, or additional
  package exists.
- `public/_routes.json` is repository-owned and invokes Pages Functions only
  for `/api/contact`.
- An external exact-path Cloudflare WAF rate-limiting rule is an operational
  prerequisite, not repository functionality. Setup and network verification
  live in `docs/CONTACT_FORM_OPERATIONS.md`. Proposed Privacy copy is held
  unpublished in `docs/CONTACT_FORM_PRIVACY_DRAFT.md`.

## About technology-stack addendum (2026-08-21)

- `src/content/pages/about.js` owns the About-only heading, four group objects,
  and ordered technology strings. The stack does not belong to `site.profile`,
  whose shared Home/About responsibility remains identity and portrait data.
- `src/pages/templates/about.js` contains the single-purpose stack renderer.
  It emits escaped H2/H3 headings and escaped noninteractive tag lists directly
  after the biography. No shared component was created for one consumer.
- `src/pages/content-schema.js` owns the generic closed stack shape: exact
  section heading, exactly four groups, closed stack/group keys, non-empty
  strings and item arrays, and case-insensitive duplicate rejection. Exact
  production group/item copy and order remain real-content test assertions,
  rather than reusable-validator constants.
- `src/styles/pages/_about.scss` owns only page composition and stack grouping.
  It reuses the shared `.tag` visual contract without changing that component.
  Home's compact profile-card content, renderer, and styling are unchanged and
  protected by regression coverage.

## About Experience addendum (2026-08-21)

- `src/content/pages/about.js` owns the four reverse-chronological Experience
  entries and their display strings. Employment data does not belong to
  `site.profile` and is never imported by Home.
- The dedicated About template contains the sole Experience renderer. It emits
  one labelled section, an ordered list, article/H3 role relationships, escaped
  plain-text employers and copy, semantic responsibility/tag lists, and real
  date elements. No shared Experience component exists for one caller.
- `renderSectionHeader()` accepts an optional renderer-owned `headingId` so the
  Experience section can be labelled by its existing H2. The option is omitted
  by every prior caller and does not alter their output.
- `src/pages/content-schema.js` owns the closed reusable shape. It validates
  structure, types, month values, duplicate entry identities, and duplicate
  technologies without hardcoding production employer names or entry count.
- `src/styles/pages/_about.scss` owns the page-only timeline, responsive date
  layout, surface, and overflow safeguards. The line and nodes are CSS-only;
  shared `.tag`, profile-card, header/footer, and Home styles are unchanged.
- Browser review proved the section was already a sibling after the closed
  `.about-layout`; its narrow desktop result came from winning reading-width
  caps, not template nesting. The About renderer now adds only two layout hooks:
  `.about-experience__inner` groups the existing header/timeline under one
  centered 70rem boundary, and `.experience-card__main` groups summary and
  responsibilities for the 64em 2fr/3fr card grid. Their DOM content order is
  unchanged. These hooks and their resets remain About-only; shared section
  header, prose, Home, and non-About templates are unmodified.

## Compact navigation/footer and primary-button addendum (2026-08-21)

- `src/config/navigation.js` now owns exactly five ordinary primary links.
  Contact remains a registered route, but its only navbar entry is
  `site.primaryCta`. The CTA's `key: 'contact'` participates in route-key
  validation and current-page rendering; there is no second Contact nav item.
- `src/components/partials/footer.js` retains its injected `(navItems, site)`
  signature for template compatibility but intentionally does not render
  `navItems`. Its amended closed output contract is copyright followed by the
  optional safe icon-link list. Persistent identity remains solely in the shared
  header; the footer emits no image, brand link, wrapper, or hidden brand copy.
  `src/styles/components/_site-footer.scss` owns the compact mobile column and
  48em container-bound space-between row plus scoped generic-list/paragraph/
  min-content resets.
- `site.social.facebook` owns the exact approved profile URL.
  `src/pages/link-safety.js` adds the closed Facebook HTTPS host policy.
  `src/components/social-icons.js` adds Facebook to the existing closed filled
  brand-mark renderer; it does not accept content-supplied SVG. The exact path
  comes from pinned official Simple Icons v16.28.0 `icons/facebook.svg`, whose
  package metadata and license identify CC0-1.0.
- `src/styles/settings/_colors.scss` owns the six semantic gradient stops.
  `src/styles/components/_button.scss` is their sole component consumer through
  shared `.btn--primary` default, pointer-hover, and active rules. All primary
  anchors and native buttons therefore receive the same gradient without a
  page-specific declaration. Disabled and forced-colors rules remove it.
- `scripts/validate-routes.mjs` validates the CTA key/path and Facebook URL.
  `scripts/verify-build-output.mjs` checks one header/footer landmark per built
  route, exact region-scoped footer links, footer exclusions, and Contact-route
  CTA current semantics. `/privacy/` remains registered and built even though
  its footer link is temporarily absent.
- `site.contactForm.enabled` remains the source/UI rendering gate and false.
  `CONTACT_FORM_ENABLED` remains the server/runtime delivery gate. Production
  activation must coordinate the WAF, Resend configuration, both gates,
  publication of approved Privacy copy, restoration of discoverable Privacy
  access, and operational testing; the runtime gate cannot waive another
  prerequisite. PF-072 owns that deployment boundary.

## Personal identity and Home hero addendum (2026-08-21)

- `src/config/site.js` owns one frozen `{ displayName, formalName }` object.
  `site.siteName` and `site.profile.identity` reference that contract rather
  than duplicating names in templates. `scripts/site-profile-validation.mjs`
  validates the closed identity object and rejects missing, blank, or unknown
  fields.
- `src/components/profile-card.js` is still the one shared full/compact card
  renderer. Its closed variant deliberately maps compact to `displayName` and
  full to `formalName`; all selected text remains escaped. Home/About templates
  retain their existing card composition and action/content ownership.
- `src/components/hero-visual.js` owns only the complete static, decorative SVG
  markup. `src/pages/templates/home.js` places it in the existing hero media
  position. No other template imports it, and built non-Home routes reject its
  markers.
- `src/styles/components/_hero.scss` owns static geometry, responsive sizing,
  the 800ms reveal, 6s signal/node cycle, paused state, mobile simplification,
  and defensive reduced-motion state. The complete base diagram is never
  conditional on JavaScript.
- `src/scripts/hero-visual.js` validates exact geometry before enhancement,
  owns only viewport/tab/motion lifecycle classes, and initializes only when
  `[data-hero-visual]` exists. `IntersectionObserver` pauses offscreen motion;
  `visibilitychange` pauses hidden-tab motion. With no observer, it chooses a
  safe running enhancement. It creates no timer/frame loop and imports no
  motion dependency. `src/scripts/main.js` adds only this side-effect module.
- `scripts/verify-build-output.mjs` checks the approved public/formal identity,
  decorative temporary mark, exact copyright, Home SVG contract, and absence
  of old identity/Home animation markers from inappropriate routes.

## PF-064 action-link and case-study architecture (2026-08-21)

- `src/components/action-link.js` is a centralized, escaping renderer with a
  closed explicit variant set. `src/pages/icon-registry.js` owns its three
  selectively imported Lucide nodes; templates cannot supply arbitrary icon
  data or infer a variant from an href.
- Current callers are Home standalone actions, Solutions evidence/inquiry
  actions, case-study Back actions, the 404 recovery list, and the optional
  standard-page standalone link contract. Excluded anchors keep their existing
  component/template ownership.
- `src/pages/templates/case-study.js` owns one generic editorial composition.
  Presence of named fields determines the two narrative pairs and optional hero
  media; no route/content identity appears in its layout decisions. The
  `heroMedia` contract is optional so logo-free/media-free cases remain valid.
- `src/pages/content-schema.js` validates `heroMedia` as a closed object with
  only a safe internal `src`, non-empty factual `alt`, and positive-integer
  `width`/`height`. Unknown and malformed media fail before rendering.
- `src/content/pages/work/fes-challenger.js` owns one canonical Homepage image
  descriptor. `heroMedia` and the three-slide project-card carousel reference
  that same object; the lower gallery references only canonical Services and
  Projects descriptors.
- `scripts/case-study-assets.mjs` collects logo, hero, and gallery paths.
  `scripts/registered-assets.mjs` combines them with project-card consumers,
  normalizes physical paths once, and merges provenance. The shared Homepage
  binary therefore produces one filesystem check with route and project-card
  sources rather than duplicate checks.
- `scripts/verify-build-output.mjs` understands the one-container case-study
  architecture and verifies FES build HTML: Homepage once in the hero,
  Services/Projects-only gallery, and no Mobile View or reserved filenames.

## PF-064 Solutions, Process, and content reveal architecture

- `src/pages/templates/solutions.js` owns the Solutions editorial wrappers;
  `src/styles/pages/_solutions.scss` owns only the scoped 72rem boundary,
  grouped detail grid, optional-link row, and existing accent treatment. The
  closed Solutions content schema and all visitor-facing facts are unchanged.
- `src/pages/templates/process.js` owns semantic fact-group wrappers;
  `src/styles/pages/_process.scss` owns the scoped 72rem boundary, stage
  identity/fact grid, CSS-only rail, responsive collapse, and communication
  section treatment. The seven-stage content contract remains closed and in
  its original order.
- `src/components/content-reveal.js` is the sole renderer for reveal metadata;
  it contains no content facts or timing values. `src/scripts/content-reveal.js`
  owns one observer, once-only state, visibility/focus/hash/reduced-motion
  lifecycle, and graceful observer failure. `src/styles/components/_content-reveal.scss`
  owns the transient keyframes and no-JavaScript-safe default. `main.js`
  imports the existing Hero initializer once and the content initializer once;
  the two lifecycles do not share selectors or state.
- Template application is explicit across all 11 routes. The renderer adds
  attributes only to meaningful parent groups; navbar/footer, mobile nav,
  skip link, buttons, tags, carousel controls/slides, form feedback, action
  icons, and Hero SVG internals remain unmarked. Content modules never receive
  animation classes or timing values.
- `src/components/cta.js` and `src/components/profile-card.js` accept optional
  renderer-owned reveal variants while retaining their established shared
  contracts. Home compact profile identity/action content is unchanged.
