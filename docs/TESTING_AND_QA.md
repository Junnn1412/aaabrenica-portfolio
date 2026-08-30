# Testing and QA

Established in PF-012. Documents what's automated, what commands run it, and
what's still manual per `CLAUDE.md`'s validation expectations. See
[`DECISION_LOG.md`](DECISION_LOG.md) for why each tool was chosen.

## Test matrix

| Concern                                | Tool                                         | Command                                  | Covers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------- | -------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JS/Node correctness                    | ESLint (flat config)                         | `npm run lint:js`                        | Every `.js`/`.mjs` file under root configs, `src/`, `scripts/`, `tests/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| SCSS correctness                       | Stylelint (`stylelint-config-standard-scss`) | `npm run lint:styles`                    | `src/styles/**/*.scss`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Formatting                             | Prettier                                     | `npm run format:check` (`format` to fix) | JS, JSON, Markdown, SCSS — **not** HTML (see below)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| HTML standards conformance             | `html-validate`                              | `npm run html:validate`                  | Composed `dist/**/*.html`, plus the `dev/design-system/index.html` preview source directly — validates what's on disk, does **not** build itself; requires a successful, up-to-date `npm run build` immediately beforehand                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Pure-logic unit tests                  | Node built-in `node:test`                    | `npm test`                               | `escapeHtml`, marker counting/composition, `validateContent`, `isSafeInternalPath`/`isSafeEmail`/`isSafeExternalUrl`, `normalizePath`/`resolveEntryPath`, `renderRoute` integration, a `validate-routes.mjs` exit-code smoke test, the preview composer's exact-file boundary (`resolveHtmlRequest`), 25 design-token WCAG contrast pairs compiled from the real `_custom-properties.scss`, the showcase's table-of-contents/heading invariants (PF-030), (PF-031) `renderNav`/`renderHeader`/`renderFooter`'s markup and conditional-rendering rules, the pure mobile-menu state/effect logic (`nav-toggle-state.js`), and the build-time icon renderer's tag/attribute whitelisting and escaping (`icon.js`), (PF-032) `.capability-card`'s body-text/card-boundary/focus-indicator contrast relationships and its `auto-fit`/`minmax()` grid's real column-count/width math at every required review width — both compiled from the real `main.scss` (and, for the container-width check, the real showcase HTML), not asserted against hardcoded hex/pixel values, (PF-033) `.project-card`'s equivalent resolved-cascade `max-width`/`margin`/grid-column-count math (via the shared `tests/helpers/cascade-resolver.mjs`, extracted from the capability-card test for its second real caller), the required link+action pairing and list-parent structure across every showcase specimen, and its full-card single-tone focus ring resolved in both normal and forced-colors contexts, and (PF-034) `.process-steps`/`.trust-list`/`.engagement-options`'s resolved-cascade `max-width`/`margin` list resets (the resolver's third and fourth real callers — `.process-steps` is this project's first `<ol>`-based case, and the one component that received a deliberate-failure mutation pass), single-interactive-element/list-parent structure across every specimen, the `.tag`-exclusion guard on engagement options, decorative-icon attribute checks on trust indicators, and `.cta`'s optional-body/no-competing-focus-system/forced-colors-boundary checks, and (PF-050) `validateContent`'s new `solutions`-template branch (exact section count/id-membership/uniqueness, per-section required-field/icon/accent checks, optional-evidence-validated-only-when-present, required per-section and closing CTA shape via a helper now shared with the `home` branch), `tests/solutions-render.test.mjs`'s real-route-output assertions (heading-count/hierarchy, jump-nav-to-section-id set equality, evidence-omitted-not-rendered-empty on the 5 sections without one, per-section action-link content match, decorative-icon and safe-href checks, escaping, and a negative check that no "technologies" string ever renders), a cross-file test in `tests/home-render.test.mjs` asserting every homepage capability-card link resolves to its matching Solutions-page anchor, and two new compiled-CSS files (`tests/page-section-layout.test.mjs`, `tests/solutions-page-layout.test.mjs`) proving the `.home-section` → `.page-section` rename carries zero computed-value change and resolving the sticky-header anchor offset, section icon-accent-token equality with `.capability-card`, and the jump-nav's `min-height`/`max-width`/`margin` cascade-leak fixes — implementing the last of which also found and fixed a real bug in the shared resolver itself (`::selection`, a pseudo-element selector with no tag/class of its own, was vacuously matching plain tag/class queries), and (PF-053/054/055) the `standard` template's new universal optional `cta` field (`tests/standard-render.test.mjs`, extended `tests/content-schema.test.mjs`), the dedicated `contact` template's site-sourced (not content-sourced) contact-methods list scoped to its `<main>` region specifically — not a whole-document count, since the footer independently renders the same three links (`tests/contact-render.test.mjs`), its page-specific SCSS reset proven via the resolved-cascade method (`tests/contact-page-layout.test.mjs`), the dedicated `not-found` template's fixed 3-link recovery set and `checkExactArray(...,3,...)` schema rule (`tests/not-found-render.test.mjs`), and the real configured `site.contactEmail`/`social.github`/`social.linkedin` values rendering correctly end-to-end (`tests/footer.test.mjs`), and (PF-055 visual-review correction) `.not-found__links`' page-scoped SCSS reset and `.not-found__link` chip styling, resolved-cascade-proven the same way as `.contact-methods` (`tests/not-found-page-layout.test.mjs`), and (PF-060) the rewritten `case-study` template/schema — `checkCaseStudyContent`'s ten independently-optional named sections (each accepting absence, rejecting a malformed-but-present shape, accepting a valid shape), `isSafeCaseStudyExternalUrl`'s closed per-content-key host allowlist, optional-section omission producing zero section headers/gallery/logo markup on a minimal fixture, escaping across every nested list/tag/gallery field, the real FES route's curated 7-section heading list and single main-region-scoped external link, and the gallery grid's resolved-cascade `max-width`/`margin` reset and column math (`tests/case-study-render.test.mjs`, `tests/case-study-layout.test.mjs`, extended `tests/content-schema.test.mjs`/`tests/link-safety.test.mjs`) |
| Production dist/ contents              | `scripts/verify-build-output.mjs`            | `npm run check:build` (auto `postbuild`) | In addition to its per-route checks, walks the real `dist/` output and asserts it contains **exactly** the 11 approved routes — proves, not just configures, that the dev-only design-system preview never leaks into production                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Project-specific route/content rules   | `scripts/validate-routes.mjs`                | `npm run check:routes`                   | Duplicate keys/paths, registry membership, content shape, link resolution, approved-route parity, marker presence, (PF-031) every skeleton's `<main id="main-content" tabindex="-1">` and `site.primaryCta`/`resumePath`/`social.*`/`contactEmail` shape+safety, (PF-053/054/055) `checkNotFoundContent`'s fixed 3-link recovery set and the universal optional `content.cta`/existing `content.link` fields — runs automatically before `dev`/`build`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Project-specific composed-output rules | `scripts/verify-build-output.mjs`            | `npm run check:build`                    | No leftover markers, exactly-one title/description/main/header/footer landmark, exactly one `<nav aria-label="Primary">` (order-independent match), `aria-current` placement incl. Contact CTA and 404 policy, no empty attributes, no canonical markup while unset, no legacy footer navigation/headings/Privacy link, Email/GitHub/LinkedIn/Facebook exactly once per footer with external security attributes, Email/GitHub/LinkedIn exactly once inside Contact main, and (PF-060) for every case-study route, the sole external, non-`mailto:` href inside `<main>` equals exactly that route's own `content.externalLink.url` (read from the real content module, not hardcoded) — runs automatically after `build`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Everything                             | —                                            | `npm run verify`                         | All of the above, in order, stopping at the first failure                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

`npm run html:validate` never builds anything itself — running it standalone
without a preceding `npm run build` validates whatever `dist/` already
contains, which may be stale or absent. `npm run verify` already guarantees
correct ordering: it runs `build` (which fails loudly via `prebuild`/
`postbuild` on any problem) immediately before `html:validate`, so a
successful, current build is always in place by the time HTML validation
runs.

## Why HTML is excluded from Prettier

Prettier's HTML printer always re-adds self-closing slashes to void
elements, but Vite's own injected `<link>` tag in the build output is never
self-closing and isn't configurable — so `void-style: "omit"` is the only
setting `html-validate` can ever pass against real `dist/` output. Fighting
Prettier to keep re-normalizing the source skeletons back to `"omit"` style
on every format run isn't productive; `html-validate` (which _is_
configurable per-project) is the style authority for HTML instead. See the
PF-012 entry in [`DECISION_LOG.md`](DECISION_LOG.md).

## Manual checks (not automated in PF-012)

Per `CLAUDE.md`'s validation expectations, these remain manual until a later
milestone automates them:

- Responsive verification at 320, 375, 768, 1024, 1440, 1920 px
- Keyboard navigation and focus states, including confirming `.btn`'s hover
  lift never appears on `:focus-visible` (PF-021)
- Reduced-motion behavior
- Hover lift absent under a no-hover/touch device profile (PF-021 —
  `@media (hover: hover) and (pointer: fine)` gating)
- Forced-colors/high-contrast mode, particularly native checkbox/radio
  legibility (PF-021)
- Browser console errors
- Heading and landmark structure (beyond what `html-validate`/
  `verify-build-output.mjs` already check structurally)
- Lighthouse/accessibility/performance auditing
- Keyboard operability and visible focus through the showcase's in-page
  table of contents, and that its anchor links actually scroll to the
  right section (PF-030) — the anchor _targets_ are automated
  (`tests/preview-anchors.test.mjs`), but scroll behavior and focus
  visibility are not. The showcase page itself now carries a short
  "How to review this page" checklist mirroring the widths/keyboard/
  motion/contrast items above, as a convenience pointer for whoever is
  reviewing it — this document remains the authoritative, complete list
- (PF-031) Mobile menu: keyboard open/close, Escape closes and returns
  focus to the toggle, no movement/re-focus on a second no-op Escape,
  focus moves to the toggle before the nav is hidden when shrinking from
  desktop with focus inside the nav, no trapped/overflowing content at
  short viewport heights with the menu open, forced-colors sanity
- (PF-031) Skip link: activating it moves focus to `#main-content` (not
  just scrolls to it), and the focused target is not covered by the
  desktop-only sticky header, incl. at 200% zoom
- (PF-032) Capability cards: grid column count at 320/375/768/1024/1440/
  1920px with no horizontal overflow; the longest real title at 320px;
  keyboard tab order reaches each interactive card's link exactly once; the
  two-tone focus ring is legible against every one of the six accents and
  against the surrounding page; pressing a card with a mouse while hovered
  visibly returns it to rest (not left lifted) with a distinct pressed
  shadow; tapping a card on a touch device shows the same pressed shadow
  without any hover state ever applying; hover-lift present only on
  hover-capable/pointer:fine devices, absent on touch; forced-colors mode —
  border/outline/text/icon all remain visible with the accent fill and
  pattern stripped, and the focus outline wraps the whole card, not just
  the heading text's box; `prefers-reduced-motion` — no lift/transform
  plays; the long-copy demo specimen wraps without truncation or overflow;
  the non-interactive demo specimen shows no pointer/hover/focus affordance
  at all
- (PF-033) Project cards: `.project-cards`'s generic grid can auto-fit
  across its supported column range depending on item count and available
  width. The three real cards (Business Workflow System featured, FES
  Challenger and eBarangay secondary) are the one-featured-plus-two-
  secondary composition, which instead activates
  `.project-cards--featured-pair`: at 320/375px all three stack in one
  column with no horizontal overflow; from the applicable breakpoint
  (`36em`/~576px) up through 768/1024/1440/1920px the featured card spans
  the full row and the two secondary cards form exactly two columns — never
  a third, so no track is ever left empty; the two demo specimens remain
  visually distinct from the three real cards; keyboard tab order reaches
  each linked card's heading link
  exactly once; the focus ring visibly wraps the whole card (not just the
  heading text), legible against both the card surface and the surrounding
  page, in both normal and forced-colors modes; hover-lift only on
  hover-capable/pointer:fine devices; `:active` pressed feedback (shadow
  step-down, card returns to rest) works identically for mouse-held-while-
  hovering and touch; `prefers-reduced-motion` — no lift/transform plays;
  long-title/long-summary demo wraps without truncation or overflow;
  FES alone renders the approved lazy-loaded screenshot with browser chrome;
  Business Workflow System renders as a deliberate text-only card;
  eBarangay renders no media subtree and shows "Case study in development";
  no empty frame or image placeholder appears; missing-category/missing-summary/missing-tags real cards show
  no blank space where an omitted element would have been
- (PF-034) Process steps/trust indicators/engagement options: confirm the
  `<li>` items themselves show no cursor change, hover, active state, or
  focus outline at any width — only the process link, the trust link, and
  the CTA button should ever respond to hover/focus/press; process steps at
  320/375px (1 column), 768px (2 columns), 1024–1920px (4 columns); trust
  indicators and engagement options at 320/375px (1 column), 768–1920px (3
  and 2 columns respectively); keyboard tab order reaches the process link,
  the trust link, and the CTA button, each exactly once, in that order
  relative to the surrounding page; forced-colors mode — the process-step
  number badges and the CTA panel keep a visible boundary once their fill
  is dropped, engagement-option items keep their boundary via automatic
  border-color recoloring; `prefers-reduced-motion` has nothing to disable
  on these three components (they define no motion)
- (PF-034) CTA panel: both specimens (with and without supporting copy) at
  320–1920px with no horizontal overflow or awkward centering at narrow
  widths; the action button's focus ring is legible against the panel's
  `--color-surface-1` fill and against the surrounding page; hover-lift
  only on hover-capable/pointer:fine devices, `:active` pressed feedback on
  both mouse-held-while-hovering and touch, `prefers-reduced-motion`
  disables the lift (inherited from `.btn`); forced-colors mode keeps the
  panel boundary visible
- (PF-050) Solutions page — **desktop and mobile visual review passed**
  (AAA, 2026-08-17), including the provisional copy for this version. The
  same review's initial pass found one defect — each section's icon badge
  rendering visibly lower than its heading text — since source-corrected
  and **re-confirmed by AAA in the browser (2026-08-17)**. Root cause:
  `.section-header` (a flex item of `.solution-section__heading-row`)
  establishes its own block formatting context, so its own margin-bottom
  and its child heading's margin-bottom both stayed real inside it instead
  of collapsing away — inflating the flex item's box past the icon's fixed
  height and making `align-items: center` center that inflated box instead
  of the visible text. Fixed by resetting both margins to `0`, scoped to
  `.solution-section__heading-row .section-header`/`.section-header__heading`
  only (`src/styles/pages/_solutions.scss`) — `.section-header`'s normal
  (non-flex) usage elsewhere, including all seven of `home.js`'s section
  headers, is unaffected. Covered by four new tests in
  `tests/solutions-page-layout.test.mjs` (`align-items: center` still
  holds; the scoped reset resolves correctly; `.section-header`/
  `.section-header__heading` alone keep their original margins), verified
  via a deliberate-failure pass before being accepted. Still open, not yet
  explicitly verified:
  - Full responsive pass at 320/375/768/1024/1440/1920px beyond the
    desktop/mobile widths already reviewed
  - Every jump-nav link and every homepage capability-card link lands on
    its matching section, with the section heading fully clear of the
    sticky desktop header — not partially hidden beneath it (the
    `scroll-margin-top: var(--header-offset)` fix is automatically
    verified at the compiled-CSS level by
    `tests/solutions-page-layout.test.mjs`; actual on-screen clearance
    still needs a real browser check)
  - Keyboard-only pass: skip link → nav → jump-nav links → each section's
    evidence/action link (Workflow & Process Solutions has both; the other
    five have only the action link) → closing CTA → footer, with visible
    focus throughout and no trap
  - Forced-colors mode: the jump-nav chip boundary and each section's icon
    badge remain visible once fills/accents are dropped
  - `prefers-reduced-motion` — nothing to disable (no new motion
    introduced; jump-nav navigation is native anchor scrolling only)
  - 200% zoom — jump-nav chips wrap without overlap or clipping, and the
    sticky-header anchor offset still clears each section heading
- (PF-051) Process page — **desktop, mobile, and tablet visual review
  passed**, including the 768px breakpoint (`spacing.$bp-md`) where each
  stage's facts switch from a single stacked column to a 2-column term/detail
  grid — the term column reads clearly and the detail column isn't
  excessively wide at 1920px. **Correction (PF-064, 2026-08-18):** this
  review was completed by AAA during PF-051 itself, before PF-051 was
  merged; this entry incorrectly stood as "pending AAA's browser review" in
  the interim and is corrected here to reflect what was already true, not a
  new review performed now. All 7 stages, Working Together, the meta
  description, and the closing CTA were also read for tone/accuracy and
  approved as final V1 copy during the PF-064 checkpoint (`docs/DECISION_LOG.md`).
  Still **not yet performed** and not assumed to pass by extension of the
  above, per PF-064's revised scope (these remain PF-071's job, not
  PF-064's):
  - Keyboard-only pass: skip link → nav → closing CTA button → footer
  - Forced-colors mode: the stage number badges keep a visible boundary once their fill is dropped
  - `prefers-reduced-motion`
  - 200% zoom
- (PF-052) Work index, plus a corrected homepage — **desktop, tablet, and
  mobile visual review passed** (AAA, 2026-08-18). `npm run verify` passes
  (355/355 automated tests, lint, format, build, `html-validate`).
  Confirmed in the browser:
  - **Desktop**: one full-width featured card (FES Challenger) plus two
    equal secondary columns, with no empty third track — the
    `.project-cards--featured-pair` fixed 2-column grid, not the generic
    grid's 1/1/2/2/3/3 pattern, which this one-featured-plus-two-secondary
    composition never exercises.
  - **Tablet**: the same correct featured-pair composition.
  - **Mobile**: all three cards stack in a single column with no overflow
    or clipping.
  - CTA, typography, spacing, navigation, and footer integration are
    visually consistent with the rest of the site.
  - Empty `.media-frame`s render cleanly and read as intentionally empty
    (no approved screenshots exist yet) — not a broken or fabricated
    placeholder.
  - The project-card and capability-card `headingLevel` corrections (H4 →
    H3) produced **no visible styling change** on the homepage, confirmed
    directly in the browser, matching the source-level prediction (both
    `__heading` classes already set their font-size independent of tag).
  - No browser-visible defect was found.

  Still **not yet performed** and not assumed to pass by extension of the
  above:
  - Keyboard-only pass (skip link → nav → project-card links → closing CTA
    → footer, visible focus throughout, no trap)
  - Forced-colors mode (card boundaries and focus rings)
  - `prefers-reduced-motion` (hover-lift disabled)
  - Touch/no-hover behavior
  - 200% zoom

- (PF-053/054/055) About, Contact, Privacy, 404 — **desktop and mobile
  visual review passed** (AAA, 2026-08-19). `npm run verify` passes
  (392/392 automated tests, lint, format, build, `html-validate`).
  Confirmed in the browser:
  - **About**: desktop and mobile visual review passed.
  - **Contact**: desktop and mobile visual review passed; the approved
    email, GitHub, and LinkedIn methods render correctly with no visible
    overflow.
  - **Privacy**: desktop and mobile visual review passed; text remains
    readable, appropriately restrained, and responsive.
  - **404**: desktop and mobile visual review passed **after** the
    page-scoped recovery-link correction (`src/styles/pages/_not-found.scss`,
    `docs/DECISION_LOG.md`'s PF-055 visual-review correction); the three
    links now form a clean responsive group with no visible overflow.

  Still **not yet performed** and not assumed to pass by extension of the
  above — desktop/mobile screenshots confirm rendering at those two
  widths only, not the following:
  - Keyboard-only pass on each page: skip link → nav → page-specific
    interactive elements (About's CTA button; Contact's email/GitHub/
    LinkedIn links; 404's Home/Work/Contact links) → footer, visible focus
    throughout, no trap
  - Full responsive sweep at all six required widths
    (320/375/768/1024/1440/1920px) — only desktop and mobile were reviewed
  - Read About's and Contact's copy for tone/accuracy sign-off — every
    sentence remains provisional pending AAA's separate content approval,
    distinct from the visual review just completed
  - Contact: confirm mailto/GitHub/LinkedIn actually resolve to the
    correct real destinations by clicking through (the visual review
    confirmed rendering and no overflow, not click-through resolution)
  - 404: Cloudflare Pages' arbitrary-unmatched-path fallback to
    `/404.html` — desktop/mobile review confirmed the page's own content,
    assets, and recovery links render correctly; it does **not** prove
    that an arbitrary unmatched path automatically falls back to this
    file, which remains PF-072's job against the real Cloudflare Pages
    deployment
  - Forced-colors mode and `prefers-reduced-motion` on all four pages (no
    new motion was introduced on any of them)
  - Footer: Email/GitHub/LinkedIn links now render on every page — a full
    11-route visual sweep at 1024px to confirm no cross-page regression
    (only the four supporting pages were reviewed, not all 11 routes)

- (PF-060) FES Challenger case study — **desktop and mobile browser review
  passed** (AAA, 2026-08-17). `npm run verify` passes (431/431 automated
  tests, lint, format, build, `html-validate`). Confirmed in the browser:
  - The approved logo (`public/images/case-studies/fes-challenger/
fes-challenger-logo.png`, verified 140×137px PNG with alpha — see
    `docs/CONTENT_INVENTORY.md`) renders clearly beside the `<h1>`,
    preserving its aspect ratio with no cropping or distortion, and
    visually aligned with the heading
  - No horizontal overflow on mobile
  - All case-study sections, lists, technology tags, the closing CTA, and
    the footer render cleanly
  - Responsive desktop and mobile presentation passed
  - Home's and Work's FES card appearance remains visually consistent

  **(PF-063) Gallery — desktop and mobile browser review passed** (AAA,
  2026-08-18). Confirmed in the browser:
  - All four approved screenshots render in the correct order: Homepage,
    Services, Projects, Mobile view
  - The three landscape screenshots are consistently framed, with no
    unexpected cropping, stretching, or distortion
  - The portrait mobile screenshot preserves its aspect ratio and is not
    stretched or cropped
  - Captions are correctly associated with their images and remain readable
  - The gallery grid stacks cleanly on mobile, with no broken images and no
    horizontal overflow
  - Gallery spacing and its relationship to Back to Work, the closing CTA,
    and the surrounding sections are visually clean
  - The existing logo and all earlier case-study content remain unchanged

  Noted, not a defect or blocker: the empty area beside the portrait mobile
  screenshot in the desktop grid layout is acceptable for V1 — recorded as
  a possible PF-064 visual-polish consideration only.

  Still **not yet performed** and not assumed to pass by extension of the
  above — desktop/mobile screenshots confirm rendering at those two widths
  only, not the following:
  - Full six-width sweep (320/375/768/1024/1440/1920px) — only desktop and
    mobile were reviewed
  - Forced-colors mode
  - `prefers-reduced-motion`
  - Full 11-route regression sweep (only the case-study page and its
    immediate Home/Work card context were reviewed, not all 11 routes)
  - (PF-063) Gallery: the complete six-width sweep beyond the reviewed
    desktop/mobile views, keyboard-only verification, forced-colors,
    `prefers-reduced-motion`, and `loading="lazy"` behavior specifically
    confirmed through browser network/devtools observation (not yet
    performed for the gallery images)
  - Read every published sentence against the curated copy AAA approved
    (`docs/CONTENT_INVENTORY.md`) for tone/accuracy — confirm nothing reads
    as a business-performance claim, a team-size statement, or an "I was
    the designer/sole owner" implication (content sign-off, distinct from
    the visual review just completed)
  - "Visit the FES Challenger website" link resolution: confirm it goes to
    exactly `https://feschallenger.com/`, opens in the same tab, and no
    staging URL, admin path, or internal address appears anywhere in the
    case-study main content, header, or footer (the visual review confirmed
    rendering, not click-through/source verification)
  - Keyboard-only pass, in the confirmed DOM order (skip link → header →
    external link → sections → "Back to Work" → closing CTA → footer — see
    the PF-060 logo-integration follow-up entry in `docs/DECISION_LOG.md`
    for the full confirmed order)
  - Heading hierarchy semantic correctness (beyond the visual read already
    confirmed above)

- (PF-061) Business Workflow System case study — **desktop and mobile
  browser review passed** (AAA, 2026-08-18). `npm run verify` passes. Fully
  anonymized: no organization, agency, department, sector, industry,
  program, office, location, real internal system name, or acronym
  anywhere in the published content — an automated word-list guard
  (`tests/business-workflow-system-render.test.mjs`, plus matching checks
  in `tests/home-render.test.mjs`/`tests/work-render.test.mjs`) proves the
  prohibited terms are absent from the real rendered output, the content
  module, and the Home/Work card fields. Confirmed in the browser:
  - The fully anonymized presentation reads coherently
  - No organization, sector, government identifier, internal acronym,
    logo, gallery, external link, placeholder, or empty media frame
    appears
  - All approved case-study sections render cleanly; long lists remain
    readable
  - Technology tags wrap correctly on mobile
  - No visible horizontal overflow
  - Section hierarchy, dividers, Back to Work, closing CTA, and footer are
    visually consistent with PF-060
  - The omission of visual assets appears intentional, not broken
  - Desktop and mobile presentation passed

  Still **not yet performed** and not assumed to pass by extension of the
  above — desktop/mobile screenshots confirm rendering at those two widths
  only, not the following:
  - Full six-width sweep (320/375/768/1024/1440/1920px) — only desktop and
    mobile were reviewed
  - Keyboard-only pass: back-to-Work link and closing CTA reachable and
    operable (no external link exists on this route), visible focus
    throughout, no trap
  - Forced-colors mode
  - `prefers-reduced-motion`
  - Sanitized screenshot/gallery review — still deferred; no files
    supplied
  - Complete 11-route regression sweep — including a separate confirmation
    that the Home/Work card displays "Internal Workflow System," tags
    Angular and ASP.NET Core, and that the retired "Government/business
    workflow system" text is absent at both routes; not yet confirmed
    independently of the case-study page review above
  - Read every published sentence for tone/accuracy against
    `docs/CONTENT_INVENTORY.md`'s approved curation (content sign-off,
    distinct from the visual review just completed)

- (PF-064) V1 content and visual polish pass — **implementation complete;
  awaiting AAA's browser confirmation before PF-064 can be marked Complete**
  in `docs/INITIAL_IMPLEMENTATION_TASKS.md`. `npm run verify` passes.
  Final-copy sign-off is **complete**: AAA reviewed the exact current copy
  for Home, Solutions, Process, Work, Contact, FES Challenger, and Business
  Workflow System (a dedicated checkpoint, referenced in
  `docs/DECISION_LOG.md`'s PF-064 entry) and approved all of it as final V1
  copy, with one correction (Home's hero paragraph — see below). This
  **supersedes** the still-open "content sign-off" / "tone and accuracy"
  bullets in the FES Challenger and Business Workflow System entries above —
  both are now approved final, not pending.

  Implemented and covered by focused automated tests:
  - eBarangay's dev-facing placeholder replaced with a neutral, fact-free
    holding message — no logo, gallery, external link, or narrative
    section renders (guarded by `tests/ebarangay-render.test.mjs`)
  - `site.defaultDescription` replaced (Privacy's fallback meta description)
  - Solutions gained 2 new `evidence` links (Corporate Websites, WordPress
    Development → FES Challenger), alongside the existing Workflow &
    Process Solutions → Business Workflow System link (guarded by
    `tests/solutions-render.test.mjs`)
  - Home's hero paragraph corrected: "...deployment, and ongoing support"
    → "...deployment, and agreed post-launch support," for consistency
    with Process's own approved rule that support is agreed and scoped per
    project

  **Still required before PF-064 can close** — exactly four items, per the
  approved plan's right-sized scope (not a full sitewide re-review):
  1. eBarangay's new holding page, at desktop and mobile — never reviewed in this state
  2. The 2 new Solutions evidence links render and navigate correctly
  3. Privacy's new fallback meta description, confirmed through page source
  4. Home's corrected hero paragraph reads correctly (low-risk single-word-phrase change)

  **Explicitly not required for PF-064 closure** — deferred to PF-071
  sitewide, not per-page blockers here: keyboard-only testing,
  forced-colors mode, `prefers-reduced-motion`, Lighthouse/accessibility
  auditing, performance auditing, and the full 11-route/6-width regression
  sweep. This applies retroactively to every "still not yet performed"
  bullet above that names one of these — none of them blocks PF-064; they
  remain tracked here as PF-071's starting checklist.

- Header/navigation visual polish — **implementation complete; AAA
  confirmed the corrected desktop rendering (no clipping, no horizontal
  overflow) and the mobile hamburger/X behavior in the browser after round
  3's fix.** Several items in the checklist below remain unconfirmed (see
  the per-item status) — this task does not close PF-064 or any broader
  visual-polish milestone; see `docs/DECISION_LOG.md`'s dated entries for
  the full rationale. `npm run verify` passes.

  **Round 1 — AAA's first browser review found two release-blocking
  defects:**
  1. **Desktop horizontal overflow** — the desktop non-wrapping layout was
     keyed to a 768px breakpoint that the row's real content (padded nav
     links + brand mark + CTA) no longer fit inside once shrink/wrap were
     both disabled. Moved to 1024px (`spacing.$bp-lg`).
  2. **Mobile navigation was already expanded on a fresh page load** —
     `nav-toggle.js`'s initial render never set `nav.hidden` (only
     `dispatch()` did, which the initial render didn't go through). Fixed;
     covered by a new hand-rolled DOM-mock test suite
     (`tests/nav-toggle.test.mjs`) that exercises the real wiring code, not
     just the already-correct pure state functions. **Confirmed by AAA as
     fixed in round 2's review, along with the icon-only toggle redesign
     below — neither is revisited by round 2.**

  **Also implemented in round 1, per AAA's approval:** the mobile toggle's
  visible "Menu"/"Close" text and Lucide icon swap were replaced with an
  icon-only, pure-CSS hamburger/X control, driven entirely by the same
  `aria-expanded` attribute the toggle already sets, with a dynamically
  synchronized `aria-label` ("Open navigation"/"Close navigation") as its
  one real accessible name (`tests/site-header-menu-icon.test.mjs`,
  `tests/header.test.mjs`). **AAA confirmed this looks correct in round
  2's review.**

  **Round 2 — AAA's second browser review found the desktop overflow
  defect was NOT actually fixed at 1024px**: the brand logo clipped past
  the left viewport edge, "Start a Project" clipped at the right edge, and
  the header's own border-bottom fell short of the right edge. Re-audited
  the full geometry (box-sizing, absence of any header wrapper, no
  `.container` cascade interaction — all confirmed clean and now proven by
  tests, not just asserted) and found no _second_ geometry defect: the
  symptom is the expected appearance of a still-too-wide row once the
  browser scrolls to reveal the off-screen CTA. Round 1's fixed-overhead
  math was exact, but its text-width floor (400px) undershot real
  rendering. Moved the breakpoint again, this time to `spacing.$bp-xl`
  (1280px), backed by a recalibrated, explicitly wider text-width floor
  (700px) that correctly predicts 1024px as insufficient (matching what
  AAA saw) while showing 1280px+ with genuine, growing margin (150px+ at
  1280px, 1000px+ at 1920px). Full derivation in `docs/DECISION_LOG.md`.

  **Round 3 — AAA's third browser review supplied real resolved-geometry
  measurements at 1440px** (`documentElement.scrollWidth` 1513 vs.
  `clientWidth` 1440; `.site-nav` resolved to `width: 544` with
  `flex-shrink: 0`; the CTA's right edge resolved to `1512.9375`) proving
  the overflow was never a viewport-width problem at all: `.site-nav`
  itself safely ended at 1395.2px, well inside 1440px, but its own `<ul>`
  content extended 117.7px past `.site-nav`'s own right edge — a fixed,
  breakpoint-independent shortfall present at every desktop width rounds 1
  and 2 tested, which is exactly why moving the breakpoint three times
  never fixed anything. **Root cause: `.site-nav ul` never reset
  `max-width`, so `elements/_body-copy.scss`'s generic `ul, ol { max-width:
var(--width-reading); }` (68ch ≈ 544px at 16px Inter — matching AAA's
  544px measurement almost exactly) silently capped it**, even though
  `.site-nav ul`'s own selector has higher specificity — the cascade
  resolves per property, and `.site-nav ul` had no competing `max-width`
  declaration to win with. Every other list-shaped component in this
  codebase already resets `max-width: none` against this same generic
  rule; `.site-nav ul` was the one that never got it, since its original
  PF-031 build. Fixed with one line (`max-width: none;` added to
  `.site-nav ul`); **no breakpoint was touched** — `spacing.$bp-xl`
  (1280px) is unchanged from round 2, per AAA's explicit instruction.
  `tests/site-header-overflow.test.mjs`'s estimated text-width-budget
  assertions (which never had any way to catch an inner element capped
  smaller than its own content) were removed entirely and replaced with
  tests of the actual cascade relationship: the generic rule's existence
  and specificity, `.site-nav ul`'s explicit override, and a check that
  68ch is genuinely narrower than the real measured content width. Full
  derivation in `docs/DECISION_LOG.md`.

  Focused automated tests also still cover, unchanged since round 1: the
  brand link's single accessible name/keyboard stop
  (`tests/header.test.mjs`); the header-scoped underline removal and
  active-route border indicator resolved against the real compiled cascade
  (`tests/site-nav-active-state.test.mjs`); `.site-brand__mark`'s bounded
  dimensions; the desktop no-wrap/no-shrink architecture, re-verified at
  the corrected breakpoint (`tests/site-nav-layout.test.mjs`); the
  brand-mark asset-existence guard (`tests/asset-existence.test.mjs`).
  Six deliberate-failure passes total have now been run and fully restored
  across the three rounds — see `docs/DECISION_LOG.md` for detail.

  **The temporary placeholder logo is now integrated.** AAA placed the real
  file at `public/images/brand/aaa-placeholder-logo.png`; its bytes were
  inspected directly (not assumed from the extension) — valid PNG,
  231×140px, 1.65:1 aspect ratio, 8-bit RGBA (real alpha transparency), not
  interlaced, 8,853 bytes, byte-identical between `public/` and the built
  `dist/` output. `site.brandMark` now points at it (`src/config/site.js`)
  and the header renders it decoratively inside the same link as the
  visible "AAA Portfolio" text — proven end to end against the real
  production config by a new focused test in `tests/header.test.mjs`. **This
  image remains a temporary placeholder only** — it is explicitly not the
  final SBTech PH / Silver Bullet Tech identity, and was not cropped,
  redrawn, recolored, resized, optimized, or upscaled in any way (confirmed
  by direct byte comparison between the source file and the build output).
  Because the source lockup is wide (1.65:1) against `.site-brand__mark`'s
  bounded slot (`height: 2.25rem; max-width: 3rem;`), the mark's visible
  contribution at navbar size is modest — `object-fit: contain` keeps it
  undistorted rather than stretching it to fill the slot, which is the
  correct, accepted trade-off for a temporary asset AAA has already
  approved under these exact bounds. Swapping in the final SBTech PH emblem
  later remains a one-line config change with no markup or CSS
  restructuring required.

  **Required before this task can be considered browser-confirmed** —
  supersedes the pre-fix checklist this replaces; items 1–3 target the two
  newly-fixed defects specifically, the rest repeat and extend the original
  round now that the layout has changed:
  1. **✅ Confirmed by AAA.** Desktop overflow, at 1280, 1440, and 1920px
     (the desktop composition now activates at 1280px/`spacing.$bp-xl`): no
     horizontal document scrollbar; `.site-nav`'s own box now visibly
     contains its entire `<ul>`, every nav link, and the CTA — "Start a
     Project" fully visible, not clipped at either edge; brand lockup fully
     visible; no nav label cropped; no forced wrapping. Spot-check just
     below 1280px (e.g. 1024–1200px) confirming the mobile-stacked form is
     folded into this same confirmation.
  2. **✅ Confirmed by AAA.** Mobile initial load: navigation starts closed
     (not expanded).
  3. **✅ Confirmed by AAA.** Icon-only toggle: hamburger/X behavior is
     correct — first activation opens and morphs to an X, second closes and
     reverts to hamburger lines, no visible "Menu"/"Close" word.
     Screen-reader announcement of "Open navigation"/"Close navigation" was
     not explicitly re-confirmed in this round and remains open.
  4. Desktop, tablet, and mobile: the brand lockup (placeholder mark +
     "AAA Portfolio" text) renders correctly, with no distortion and no
     overflow of its bounded slot; confirm the mark's real, modest visual
     contribution at navbar size reads as acceptable for a temporary asset;
     is one keyboard stop; href targets `/`
  5. Desktop nav: the base underline is gone; the current route shows the
     bottom-border indicator (not a default underline), with no layout
     shift when switching which link is active
  6. Desktop nav: hover shows a subtle, restrained surface change only, no
     movement/elevation; padding gives a comfortable click/hover target
     without wrap at any supported width from 1024px up
  7. Keyboard focus is clearly visible on every nav link, the brand link,
     the toggle, and the CTA, with no trap
  8. Forced-colors mode: the active-route border-bottom and the toggle's
     hamburger/X lines both remain visible and distinct (the lines have an
     explicit `CanvasText` override; the active-route border and toggle
     boundary are expected to auto-recolor per the `.project-card`
     focus-ring precedent) — none yet confirmed in an actual forced-colors
     session
  9. `prefers-reduced-motion`: the hamburger-to-X transformation happens as
     an immediate state swap, with no visible rotation animation
  10. No browser console errors on any of the 11 routes

  Once AAA completes the checks above, this follow-up's confirmation status
  should be updated here and in `docs/DECISION_LOG.md`'s corresponding
  entry — the same two-step pattern PF-060's logo used.

- Historical footer redesign (superseded 2026-08-21) — **implementation complete; AAA completed the desktop
  and mobile browser review and approved the presentation.** Several
  checklist items remain unconfirmed (see the per-item status below) —
  this task does not close PF-064 or any broader visual-polish milestone;
  see `docs/DECISION_LOG.md`'s dated entry for the full rationale.
  `npm run verify` passes.

  Restructured into three columns (Brand, Quick Links, Connect) plus a
  bottom row (copyright, Privacy). No profile photo; no new footer copy —
  the brand column is mark + "AAA Portfolio" only. GitHub/LinkedIn are now
  icon-only, using the official Simple Icons brand marks (fetched live,
  CC0-1.0, v16.28.0 — full source recorded in
  `src/components/social-icons.js` and `docs/DECISION_LOG.md`); Email is
  icon-only using the existing Lucide `Mail` icon. Focused automated tests
  cover: exactly one Brand/Quick-Links/Connect group each
  (`tests/footer.test.mjs`); Quick Links contains exactly the real 6
  `primaryNav` destinations, Privacy never duplicated into it; Connect
  contains exactly Email/GitHub/LinkedIn when configured, with no visible
  text and exactly one accessible name (`aria-label`) per icon link; safe
  email/URL filtering unchanged (invalid/null values still render
  nothing); the `max-width: none` cascade reset proactively applied to
  both new footer lists against the same generic `ul, ol` leak already
  found on `.site-nav ul` (`tests/site-footer-layout.test.mjs`); desktop
  3-column grid / mobile single-column stack; touch-target sizing,
  pointer-gated no-movement hover, and the absence of any new
  reduced-motion/forced-colors override (relies on the existing global
  rules). Two deliberate-failure passes were run and fully restored — see
  `docs/DECISION_LOG.md` for detail. Automated tests establish the CSS
  invariants only — they do not by themselves prove no horizontal overflow
  or correct rendering in a real browser; that confirmation is AAA's to
  perform below.

  **Browser-confirmation status:**
  1. **✅ Confirmed by AAA.** Desktop (≥768px): three columns render in the
     Brand / Quick Links / Connect order, clear and balanced; Quick Links'
     2-column list is fully legible; Connect's three icon-only controls are
     recognizable and appropriately restrained.
  2. **✅ Confirmed by AAA.** Mobile: columns stack in the order Brand →
     Quick Links → Connect → bottom row; Quick Links' 2-column list remains
     readable; no visible clipping or horizontal overflow.
  3. Icon-only Connect links: hovering (fine-pointer only) shows a subtle
     surface-color change, no movement; a screen reader announces "Email",
     "GitHub", "LinkedIn" (not a generic "link" or duplicated name);
     keyboard focus is clearly visible on all three, tabbing through in
     order with no trap. **Not yet confirmed** — keyboard-only review is
     still pending.
  4. Touch targets: on a touch device or narrow viewport, each Connect icon
     is comfortably tappable, not visually cramped against its neighbors.
     **Not yet independently confirmed.**
  5. **✅ Confirmed by AAA.** Bottom row: copyright and Privacy are both
     legible but visually subordinate to the columns above; Privacy
     appears once, not duplicated inside Quick Links.
  6. Forced-colors mode: the Connect icons and their link boundaries remain
     visible and distinct. **Not yet confirmed** — no forced-colors session
     performed.
  7. `prefers-reduced-motion`: no motion is introduced by this footer
     beyond the existing color-transition hover. **Not yet confirmed.**
  8. No browser console errors on any of the 11 routes; the footer renders
     identically (content-wise) on every route. **Not yet confirmed** —
     full-route sweep still pending.
  9. **✅ Confirmed by AAA.** The temporary placeholder brand mark's
     presentation in the footer remains modest but acceptable until the
     final SBTech PH / Silver Bullet Tech asset is ready.

  Items 3, 4, 6, 7, and 8 remain open. Once AAA completes those checks,
  this task's confirmation status should be updated here and in
  `docs/DECISION_LOG.md`'s corresponding entry — the same two-step pattern
  PF-060's logo and the header/nav polish task both used.

- About page profile card — **implementation complete; awaiting AAA's
  browser confirmation.** This task does not close PF-064 or any broader
  visual-polish milestone; see `docs/DECISION_LOG.md`'s dated entry for
  the full rationale, including the rejected first portrait candidate and
  the approved replacement's real inspected properties. `npm run verify`
  passes.

  About moved to a dedicated `template: 'about'` (Privacy stays on
  `standard`, completely unaffected). Desktop (≥1024px, matching
  `.hero__inner`'s own breakpoint): biography content and a new profile
  card form a two-column composition, biography first in DOM/reading/focus
  order at every width — no CSS `order` property involved. The card:
  portrait (real photo, `.media-frame--portrait`, 4:5 crop via
  `object-fit: cover`, no distortion), name "AAA", role "Full-Stack
  Software Developer", a statement reused verbatim from the page's own
  already-approved meta description, three AAA-approved highlight facts,
  one CTA to Contact, and a single static, restrained corner-accent border
  — no social icons, no résumé link. Focused automated tests cover: exactly
  one `<h1>`, no second heading introduced by the card's name/role;
  `profileCard` absent renders identically to the pre-existing
  `standard.js` output (the core regression guard); the real approved copy
  renders exactly, including that the rejected "every project" phrasing
  never appears; portrait asset-existence pre-build (`public/`) and
  post-build (`dist/`); compiled-CSS proofs for the two-column breakpoint,
  no `order` property anywhere, the corner accent's single-bracket/
  no-glow/no-transition/real-border shape, and the homepage About preview
  left completely untouched. One deliberate-failure pass was run and fully
  restored — see `docs/DECISION_LOG.md` for detail.

  **Required before this task can be considered browser-confirmed:**
  1. Desktop (≥1024px): biography and card form a balanced, readable
     two-column composition; the card doesn't visually overpower the
     biography text
  2. Portrait: the 4:5 crop reads correctly (face/subject well-framed, no
     awkward crop of the real photo); the corner accent is visible but
     clearly subordinate to the portrait, not competing with it
  3. Mobile/tablet (320/375/768px): biography and card stack naturally,
     card follows biography, no horizontal overflow
  4. Keyboard-only: logical tab order (biography has no interactive
     elements → card's CTA → existing closing CTA → footer), visible focus
     throughout, no trap
  5. Screen reader: exactly one `<h1>` announced for the page; the card's
     name/role do not announce as headings; the portrait announces "Portrait
     of AAA," not silently skipped
  6. 200% browser zoom: content reflows to the single-column stack cleanly,
     no clipped/overlapping text
  7. Forced-colors mode: the card's border and the corner accent both
     remain visible and distinct — not yet confirmed in an actual
     forced-colors session
  8. `prefers-reduced-motion`: no motion is introduced by the card (the
     corner accent is static by construction)
  9. No browser console errors on any of the 11 routes; the homepage About
     preview section is visually unchanged

  Once AAA completes the checks above, this task's confirmation status
  should be updated here and in `docs/DECISION_LOG.md`'s corresponding
  entry — the same two-step pattern PF-060's logo and the header/nav polish
  task both used.

These are out of scope for PF-012 by design — see the task's explicit scope
boundaries (no browser automation, visual regression, end-to-end tests,
accessibility auditing tools, or Lighthouse automation).

## 2026-08-19 profile-card correction verification

Implementation and automated verification are complete; PF-064 remains open
pending browser review. The corrected contract supersedes the earlier
About-only checklist where it mentions an internal card CTA or an unchanged
homepage preview.

Automated coverage proves:

- exact-case asset mismatches fail independently of host filesystem casing;
- both `public/` and built `dist/` contain the lowercase portrait path;
- About's full portrait preserves `/images/profile/aaa-portrait.jpg`,
  `alt="Portrait of AAA"`, 1665×1464 dimensions, and no lazy-loading;
- About main contains exactly one `/contact/` action, in the unchanged closing
  CTA, while the full card has no action;
- the homepage About copy is unchanged, appears before the card, and contains
  no link;
- that homepage section contains exactly one `/about/` action inside the
  compact card and its portrait uses `loading="lazy"`;
- the About wrapper is a real grid with `gap: var(--space-8)`;
- Home/About use the established 64em 58/42 composition, mobile/tablet source
  order remains copy then card, and relevant rules contain no CSS `order`;
- the 4:5 centered cover crop and single static electric-blue bracket remain.

AAA must still repeat the manual responsive, accessibility, and browser checks
listed in the completion report for this correction. No dev/preview server or
browser automation was run as part of implementation.

## 2026-08-19 project-card carousel follow-up verification

Implementation and automated verification are complete. AAA has visually
approved the latest Home/Work presentation on desktop and mobile: one visible
FES card, the corrected media edge, balanced carousel composition,
BWS/eBarangay absent from emitted Home/Work pages, no empty project tracks,
the corrected Explore-link spacing, and an acceptable responsive presentation.
This is a visual confirmation only; PF-064 remains open.

Automated coverage proves the canonical visibility state, unfiltered exact-set
route completeness, absence of BWS/eBarangay from emitted Home/Work HTML, the
single real grid track, three canonical slides/indicators, intrinsic dimensions,
exact-case public/dist asset checks, first-slide no-JavaScript fallback, atomic
control reveal, inactive-slide accessibility state, persistent button/keyboard
selection, unique accessible names, no nested controls, no navigation side
effect, no autoplay/timers/hover/swipe/drag, explicit reduced motion, resolved
edge clipping, 16:9 contain framing, and the Home `var(--space-6)` grid gap.

Still pending unless separately verified: keyboard and focus interaction,
JavaScript-disabled fallback, forced-colors behavior, reduced motion, 200% zoom,
and accessibility-tree exposure/announcements. The visual approval above does
not mark any of those checks passed.

Deliberate failures were executed and restored:

- removing the project-media radius reset failed 1/7 layout checks and exposed
  the competing `var(--radius-md)` result;
- setting BWS visible failed 8/35 Home/Work/visibility checks;
- emitting a fourth indicator without a fourth slide failed 2/40 structural
  rendering checks;
- changing the canonical Services screenshot to a nonexistent path produced
  exactly one public finding and exactly one dist finding;
- removing the Home gap failed 1/7 layout checks.

## 2026-08-21 disabled Contact-form verification

**Implemented and disabled; not yet operationally enabled.** Automated
repository coverage proves the closed field contract and limits, normalization,
email/control-character checks, unknown-field and honeypot handling, disabled
rendering with direct methods preserved, progressive markup associations,
client response classification (including HTTP `429` with one request and no
retry), Function method/content-type/body-size/configuration enforcement,
generic errors, no-JavaScript HTML responses, safe email content, validated
Reply-To, idempotency forwarding/generation, Resend adapter request shape, safe
logging, and exact `public/_routes.json` scope.

Verification results on 2026-08-21:

- focused Contact suite: 36/36 passed;
- deliberate disabled-gate failure: forced `site.contactForm.enabled` to
  `true`; 2/8 Contact-render tests failed, including the explicit disabled
  default assertion; restored suite passed 8/8;
- deliberate `429` failure: changed the client branch away from `429`; 1/3
  client tests failed with `failure` instead of `rate-limited`; restored suite
  passed 3/3;
- deliberate runtime-config failure: bypassed the missing-configuration stop;
  the targeted 1/1 test failed with `200` instead of generic `503`; restored
  targeted test passed 1/1;
- full `npm run verify`: 606/606 tests passed, all 11 registered routes and all
  11 built HTML outputs passed, and build/HTML validation completed cleanly.

An earlier full pass correctly stopped at 605/606 because the pre-form schema
test still asserted that Contact required base fields only. The test was
updated to the approved complete form-content contract; the final full pass is
the result reported above.

Repository coverage does **not** prove any external Cloudflare or Resend state.
Still required:

- configure and verify the Resend domain, sender, API key, destination, and
  Pages runtime values;
- send a real message and verify delivery and Reply-To behavior;
- create the exact `/api/contact` WAF rate-limiting rule on AAA's
  Cloudflare-zone hostname and verify `429` blocking/recovery in browser/network
  tools and Cloudflare events;
- use a Cloudflare-managed staging hostname in the zone if preview protection
  is required; do not assume a generic `*.pages.dev` preview is covered;
- verify provider/account retention facts and obtain approval before publishing
  `docs/CONTACT_FORM_PRIVACY_DRAFT.md` into the live Privacy page;
- complete responsive widths, keyboard, screen-reader, JavaScript-disabled,
  focus, zoom, forced-colors, console, overflow, failure/recovery, and deployed
  CSP/network checks.

PF-064 remains open. PF-072 still owns broader deployment and CSP work. See
`docs/CONTACT_FORM_OPERATIONS.md` for the ordered gate.

### 2026-08-21 pre-handoff Contact security audit

The narrow audit found and corrected six omissions without enabling the form:

- added a safe, empty `.dev.vars.example` plus ignore/exception rules for real
  `.dev.vars` and environment-specific variants;
- made the disabled client initializer explicitly conditional on form markup;
- added same-origin enforcement when an `Origin` header is present;
- bounded the single Resend fetch with an 8-second native abort signal;
- reduced provider logging from a raw status to `4xx`/`5xx`/`other`;
- added post-build checks for exact `/api/contact` Function routing, disabled
  Contact markup, live Privacy isolation, and deployment variable markers.

Focused regression coverage also directly proves actual 16 KiB byte bounding,
normalization before field limits, null/control/CR-LF rejection, the closed
two-gate truth table, timeout/ambiguous-outcome no-retry behavior, honeypot
non-delivery, captured-log exclusions (submission values/body, configured
addresses, API key, and raw IP), and unpublished Privacy-draft isolation.

Deliberate failures and restoration results:

- removed the `.dev.vars.example` ignore exception: 1/2 secret-file tests
  failed; restored 2/2 passed;
- bypassed Origin enforcement: targeted 1/1 failed (`200` instead of `403`);
  restored 1/1 passed;
- removed the timeout signal: 2/4 adapter tests failed; restored 4/4 passed;
- restored raw provider-status logging: targeted 1/1 safe-log test failed;
  restored 1/1 passed;
- removed the explicit no-form initializer guard: targeted 1/1 enablement test
  failed; restored 1/1 passed;
- temporarily copied a runtime-variable marker through `public/`: post-build
  verification reported exactly one deployment leak; the temporary file was
  removed and the clean rebuild passed all 11 outputs.

Final restored totals: focused Contact suite 49/49; full `npm run verify`
619/619; 11/11 registered routes; 11/11 build outputs; build and HTML
validation clean. These results prove repository behavior only. External WAF,
Resend, browser/network, delivery/Reply-To, provider-retention, and Privacy
approval checks remain unperformed.

## 2026-08-19 FES case-study hero-logo sizing follow-up

Implementation and automated verification are complete. AAA visually approved
the corrected FES hero logo in the supplied desktop and mobile browser views;
PF-064 remains open. Confirmed: stronger and appropriate logo weight beside the
H1, optical logo/heading centering, preserved source aspect ratio without
visible distortion, a horizontal mobile row with no clipping or overflow,
balanced title wrapping and post-heading spacing, a desktop logo that does not
dominate the heading, and correctly positioned lead copy and external-link
button. The shared case-study logo contract requires and renders content-owned
intrinsic dimensions. FES emits one decorative 140×137 logo beside its
unchanged H1. Compiled-cascade coverage proves `width: auto`, `object-fit:
contain`, a nonshrinking 3.5rem default height, a 4.5rem height from 48em,
centered alignment, `var(--space-3)` row gap, a scoped zero H1 margin, and
`var(--space-4)` post-row spacing.

The deliberate-failure pass restored the old 3rem height in both responsive
states: the targeted layout suite failed 1/10 on the resolved mobile value
(`3rem` instead of `3.5rem`). The approved values were then restored.

Still pending unless separately performed: the full required-width sweep beyond
the supplied views, 200% zoom, screen-reader confirmation that the decorative
logo remains silent, throttled-load layout-shift observation, forced-colors and
reduced-motion checks, and the complete route-regression sweep. None of these is
inferred from the confirmed visual review.

## 2026-08-21 About core-technologies and profile-copy verification

Implementation and automated repository verification are complete. PF-064
remains open pending AAA's browser checks. Coverage proves the exact two
biography paragraphs, stack heading, four group headings/order, all 14
technology strings/order, absence of extra or prohibited technologies, exact
About-only full-card statement/highlights, and the single intended biography
duration reference. It also proves biography → stack → full card → closing CTA
source order; the H1/H2/H3 hierarchy; static escaped tags; closed generic schema
validation; no CSS `order` or animation; flexible wrapping; modeled fit at
320/375/390px; and the unchanged Home compact-card contract.

Deliberate failures and restoration results:

- inserted React: 3/11 About-render tests failed on exact content, prohibited
  technology, and tag count; restored;
- swapped Backend and Data: both 2/2 targeted order/hierarchy tests failed;
  restored;
- restored “about five years” in the full-card statement: both 2/2 targeted
  copy/duration tests failed; restored;
- moved the stack after the profile card: the targeted 1/1 DOM-order test
  failed; restored;
- removed `flex-wrap: wrap`: the targeted 1/1 responsive-style test failed;
  restored;
- made Home's compact card render the About statement: both 2/2 targeted Home
  and shared-renderer regression tests failed; restored;
- bypassed group unknown-field validation and technology-string escaping while
  supplying malformed/hostile fixtures: both 2/2 targeted schema/escaping tests
  failed; restored.

Final restored totals: focused About/profile/Home/schema/layout suite 120/120;
full `npm run verify` 633/633, with all 11 registered routes, all 11 built HTML
outputs, lint, formatting, build verification, and HTML validation clean.

AAA browser checks still required:

- 320/375/390px: one-column groups, natural tag wrapping, readable long labels,
  and no horizontal overflow;
- 768px: compact two-column stack groups and natural biography → stack → card →
  CTA order;
- 1024/1440/1920px: preserved 58/42 biography/card composition, balanced left
  column, and no second competing surface card;
- confirm the portrait crop, electric-blue bracket, full-card surface, closing
  CTA, header/footer, Home compact card, and project carousel remain visually
  unchanged;
- keyboard and screen-reader review: logical navigation order, one About H1,
  `Core Technologies` and closing CTA as H2s, four technology groups as H3s,
  static tags announced as list content, and no false interactive affordance;
- 200% zoom/text enlargement, forced-colors, reduced motion, touch/no-hover,
  CSS-disabled source order, and browser-console checks.

These browser checks are not inferred from repository tests. The Contact form,
unpublished Privacy draft, and live Privacy content were outside this change and
remain untouched.

## 2026-08-21 About Experience timeline verification

Implementation and repository verification are complete; browser approval and
PF-064 remain open. Automated coverage proves the exact four-entry production
content/order, plain-text employers, date data/markup, responsibilities, tags,
semantic section/ordered-list/article hierarchy, CSS-only decoration, placement
between intro/card and CTA, Home isolation, escaped hostile strings, and the
closed generic schema. It also proves the maintenance-safe biography, absence of
“about five years” from About content/output, preserved Core Technologies and
profile cards, mobile-first date flow, 48em upper-right dates, no CSS `order` or
animation, wrapping safeguards, and modeled fit at 320/375/390px.

Deliberate failures and restoration results:

- disclosed a Materials Engineer Accreditation application in the DPWH summary:
  both 2/2 targeted exact-content/confidentiality tests failed; restored;
- inserted `BankComTK` in the Bank of Commerce summary: both 2/2 targeted
  exact-content/confidentiality tests failed; restored;
- reversed the four Experience entries: both 2/2 targeted production-order and
  heading-order tests failed; restored;
- removed Experience technology-tag wrapping: the targeted 1/1 mobile-safety
  test failed; restored;
- emitted Experience markup and a DPWH employer name on Home: the targeted 1/1
  Home-isolation test failed; restored;
- wrapped employers in external links with logo images: the targeted 1/1 exact
  plain-text employer/no-branding test failed; restored.

Final restored totals: focused About/Experience/profile/Home/schema/layout suite
137/137; full `npm run verify` 650/650, with all 11 registered routes, all 11
built HTML outputs, lint, formatting, build verification, and HTML validation
clean.

AAA browser checks still required:

- 320/375/390px: restrained visible axis/nodes, adequate left offset, stacked
  dates below employer, natural wrapping for `Microsoft SQL Server` and
  `SolidService Electronics Corporation`, no fixed-height clipping, and no
  horizontal overflow;
- 768px: dates move upper-right without compressing role/employer text, cards
  retain readable rhythm, tags wrap, and newest-to-oldest order remains clear;
- 1024/1440/1920px: Experience remains full-width below the 58/42 intro/profile
  composition, cards use a readable measure, line/nodes align consistently, and
  the closing CTA follows with balanced spacing;
- visual regression: portrait/crop, electric-blue bracket, Core Technologies,
  full and compact profile cards, navbar, footer, CTA, carousel, Contact/Privacy,
  and case studies remain unchanged; Contact remains disabled;
- accessibility: one H1, Experience H2, four H3 roles, ordered-list semantics,
  article labels, sensible date announcements, responsibility/tag list output,
  CSS-only decoration silence, logical keyboard/source order, and no employer
  link or false card interaction;
- 200% zoom/text enlargement, forced-colors, reduced motion, touch/no-hover,
  CSS-disabled source order, and browser-console checks.

These real-browser checks are not established by repository tests. No browser
automation was run, and PF-064 must not be closed from this implementation.

### Desktop full-row corrective pass

AAA accepted the supplied mobile Experience presentation and rejected the
initial supplied desktop presentation because the header/timeline remained
capped at the left-column reading measure. Repository inspection proved
Experience was already outside the closed 58/42 layout. The full-row centered
correction is implemented and repository-tested. AAA subsequently approved the
supplied corrected desktop result on 2026-08-21. This is visual approval of the
corrected Experience composition only; PF-064 remains open because additional
polish remains.

Focused cascade/layout coverage resolves the winning width values and proves:
the section and inner composition use full available width; the inner boundary
is centered and capped at 70rem; the Experience header and timeline share it;
cards fill the timeline width; narrative text retains body sizing/readable
measures; the main card content is one column by default and 2fr/3fr only from
64em; no CSS `order` exists; the source order and CTA sibling placement remain
unchanged; and modeled geometry fits at 320/375/390/768/1024/1440/1920px. Home
isolation and exact approved Experience content remain covered.

Corrective-pass deliberate failures and restoration results:

- restored the narrow `--width-reading` cap on the centered inner composition:
  the targeted winning-width assertion failed with the actual narrow value;
- removed `margin-inline: auto`: the targeted cascade assertion failed because
  no centering value won;
- removed the 64em 2fr/3fr card grid: the targeted desktop-composition assertion
  failed;
- applied the 2fr/3fr grid in the default mobile rule: the targeted one-column
  mobile assertion failed;
- introduced CSS `order`: the compiled About-rule guard failed.

Every mutation was restored before the focused About/Experience/profile/Home/
schema/layout suite passed 151/151.

The supplied corrected desktop view established the first two checks below at
the reviewed desktop size(s); the remaining width matrix and accessibility/
environment checks are still required from AAA:

- 1024/1440/1920px: Experience forms a distinct centered full row beneath the
  58/42 intro/profile composition; the header, axis, and cards share one coherent
  boundary; the right-side dead area is removed without stretching to 100vw;
- desktop cards: role/employer remain upper-left, dates upper-right, summary and
  responsibilities read as balanced left/right columns, and tags form a separate
  wrapping row below with comfortable padding and entry rhythm;
- 320/375/390px: compare against the accepted supplied view and confirm the
  one-column card internals, dates below identity, axis/node placement, wrapping,
  content order, and lack of horizontal overflow remain unchanged;
- 768px: dates remain comfortably upper-right while summary/responsibilities stay
  one-column; role, dates, lists, and tags must not compress or overflow;
- repeat 200% zoom/text enlargement, keyboard/source order, screen-reader
  hierarchy/date announcements, forced-colors, reduced-motion, touch/no-hover,
  CSS-disabled order, browser-console, and non-About visual-regression checks.

Repository tests and modeled widths did not establish these browser results.
AAA's supplied corrected desktop evidence now establishes visual approval for
that composition; it does not establish the remaining checks or close PF-064.

## 2026-08-21 compact navigation/footer and primary-gradient verification

AAA supplied and approved the corrected desktop Experience result. That visual
approval is recorded above; PF-064 remains open for additional polish.

Repository coverage now proves the exact five-link ordinary navigation plus the
sole Contact CTA; Contact-route CTA current semantics; unchanged mobile toggle
state; modeled header fit; the compact footer DOM/exclusions; exact four-link
order and Facebook URL; closed HTTPS hosts/security attributes; decorative,
unfocusable SVGs with one anchor name; 44px targets and 320px modeled fit;
scoped reset/overflow behavior; unchanged registered/live Privacy route and
copy; source-disabled Contact; and the required public Privacy restoration gate.
The shared primary-button tests compile the real Sass and prove all six gradient
stops, boundary contrast on canvas/surface-1, centralized 135-degree ownership,
anchor/native-button coverage, non-primary exclusions, pointer hover, disabled/
forced-colors neutralization, existing focus/reduced-motion systems, and absence
of an animated gradient, glow, scale, or large shadow. Build verification covers
all 11 header/footer landmarks.

Deliberate failures and restoration results:

- restored ordinary Contact: 2/8 nav tests failed on exact order and sole-CTA
  count;
- restored a Home Quick Links item: 2/11 footer tests failed on compact DOM and
  footer-navigation absence;
- removed Facebook's `rel`: 1/11 footer tests failed on external protection;
- reduced the social-link minimum height below 44px: 1/8 footer-layout tests
  failed on target sizing;
- rendered footer Privacy: 3/11 footer tests failed on compact DOM, exclusion,
  and copyright/Privacy contract;
- applied the gradient to `.btn--secondary`: 1/13 gradient tests failed on
  non-primary isolation;
- changed the default endpoint to `#6e9bff`: 2/44 combined gradient/token tests
  failed, reporting 2.33:1 against the required 4.5:1;
- removed all three shared gradient images: 2/13 gradient tests failed on the
  central declaration and required centralized declaration count;
- marked Contact operations “Operationally ready” while Privacy access remained
  absent: 1/5 enablement tests failed on the disabled operational status.

Every mutation was restored before the focused header/footer/button/contrast/
route suite passed 141/141. Full `npm run verify` passed 665/665 tests, all 11
registered routes, all 11 built HTML outputs, JavaScript/SCSS lint, formatting,
build-output checks, and HTML validation.

### Rejected-footer corrective pass

AAA approved the primary-button gradient without implementation changes, but
rejected the centered brand/social/copyright footer because it repeated the
sticky-navbar identity and used too much vertical space. The amended footer
removes all footer branding and emits copyright before the unchanged four-link
social list. Mobile resolves to two centered rows; from 48em it resolves inside
the established site container to one vertically centered row with copyright
left, socials right, and `justify-content: space-between`. Corrected browser
approval remains pending, and PF-064 remains open.

Focused emitted-output, compiled-cascade, route, header, Privacy, navigation,
toggle, and approved-gradient regression coverage passed 95/95. It proves the
footer brand is absent while the navbar lockup remains once; copyright-first
DOM order; exact social destinations/order/security/accessibility; compact
padding/divider; mobile column and desktop row; 44px targets; modeled fit at
320/375/390/768/1024/1440/1920px; no CSS `order` or overflow hiding; unchanged
Privacy route/copy; unchanged primary gradient; and route validation.

Corrective deliberate failures and restoration results:

- restored the footer brand: 2/11 footer tests failed on exact markup and brand
  absence;
- reversed copyright/social DOM order: 1/11 footer tests failed on the required
  emitted order;
- forced the mobile footer into one row: 1/10 layout tests failed on the mobile
  column contract;
- reduced a social target below 44px: 1/10 layout tests failed on target sizing;
- restored the Privacy footer link: 3/11 footer tests failed on exact markup,
  prohibited footer content, and Privacy absence.

Every mutation was restored before final verification. Full `npm run verify`
passed 667/667 tests, all 11 registered routes, all 11 built HTML outputs,
JavaScript/SCSS lint, formatting, build-output checks, and HTML validation.

AAA browser checks still required:

- 320/375/390px: copyright is the first centered row; the four comfortably
  tappable Email/GitHub/LinkedIn/Facebook targets form the second centered row;
  spacing remains compact, text stays readable, and nothing clips or overflows;
- 768/1024/1440/1920px: the footer is one compact container-bound row with
  copyright left, social icons right, vertical centering, balanced
  `space-between` separation, the top divider, restrained padding, and no large
  empty area;
- all widths: no footer logo, brand link/wrapper, hidden identity, headings,
  navigation, Contact, Quick Links, Connect, or Privacy; the sticky-navbar brand
  remains visually intact and appears once;
- Contact route: `Start a Project` alone has a recognizable current-page state;
  mobile menu starts closed, toggles hamburger/X correctly, preserves logical
  keyboard order, and returns to deterministic closed state across resizing;
- keyboard/screen reader: visible focus on the navbar brand, all nav items/CTA,
  and four separate footer links; each icon announces exactly Email, GitHub,
  LinkedIn, or Facebook with no duplicated SVG name;
- primary buttons across navbar, hero, closing CTAs, profile-card action, and a
  future enabled native Contact submit: consistent restrained gradient, readable
  label, persistent boundary, darker pointer-only hover/active behavior, no
  unexpected gradient on secondary/icon/tag/nav/timeline elements;
- disabled native primary button, forced-colors, reduced motion, touch/no-hover,
  200% zoom/text enlargement, CSS-disabled order, and browser-console checks;
- external links open the exact destinations with safe new-tab behavior, while
  Email remains a `mailto:` link; `/privacy/` remains directly reachable even
  though it is not currently in the footer;
- repeat a visual-regression sweep of Contact, live Privacy, carousel, case
  studies, About/profile content, and the already-approved Experience layout.

Repository tests and modeled widths do not establish these browser results. No
server or browser automation was run. PF-064 and PF-072 remain open.

## 2026-08-21 personal identity and progressive Home hero verification

The approved public identity is `Antonio Abrenica`; the formal About identity
is `Antonio A. Abrenica III`. Focused renderer, route, schema, emitted-output,
lifecycle, compiled-cascade, footer, and responsive-model coverage proves the
explicit variant mapping, escaping, exact portrait alt, decorative temporary
navbar asset, old-name absence, unchanged routes/contact destinations, complete
static SVG, atomic enhancement validation, offscreen/hidden-tab pause, runtime
reduced-motion behavior, restrained timings, and Home-only initialization.

Approved deliberate failures and restoration results:

- restored `AAA Portfolio` as the public/site name: 4/15 focused identity/header
  tests failed;
- selected the concise name for About's full card: 4/22 focused
  About/identity/profile tests failed;
- made the SVG announced and focusable: 1/5 render tests failed;
- hid the base SVG before JavaScript: 2/9 compiled layout/static-baseline tests
  failed;
- allowed animation in reduced motion: 1/9 compiled motion tests failed;
- removed offscreen pause state: 2/8 lifecycle tests failed;
- added a resize hook that reset introduction state: 1/8 lifecycle/source tests
  failed;
- shortened the continuous signal loop to 2s: 1/9 timing tests failed;
- forced a 40rem mobile media minimum: 1/9 responsive layout tests failed.

Every mutation was restored before final focused and full verification.

The final focused identity/Home/hero/profile/About/footer/header/Contact-Privacy/
gradient/route suite passed 167/167. Full `npm run verify` passed 698/698 tests,
all 11 registered routes, all 11 built HTML outputs, JavaScript/SCSS lint,
formatting, build-output checks, production build, and HTML validation.

AAA browser checks still required:

- navbar/metadata/Home/footer: visible concise name is exactly `Antonio
Abrenica`; copyright is exactly `© 2026 Antonio Abrenica. All rights
reserved.`; the temporary PNG remains decorative and visually unchanged;
- About: full-card name is exactly `Antonio A. Abrenica III`, portrait alt is
  correct in accessibility inspection, and Home's compact card remains concise;
- JavaScript disabled or blocked: the complete final 400×400 diagram is visible
  with no layout shift, clipped content, missing line, or missing node;
- normal motion: first viewport entry produces one restrained approximately
  800ms line reveal, followed by a slow approximately 6s signal and subtle node
  response; focus and resize do not replay the introduction;
- scroll the hero fully offscreen and back: animation pauses and resumes without
  a reset; hide/show the tab and confirm equivalent pause/resume behavior;
- toggle operating-system reduced motion while open: the complete diagram is
  immediately static with no reveal, signal, breathing, pulse, or delayed
  movement, and safely resumes eligible enhancement when preference is removed;
- 320/375/390/768/1024/1440/1920px: original hero text/CTA order and positions
  remain stable, the visual retains its weight/aspect ratio, and no path, node,
  focus stop, or page content overflows horizontally;
- keyboard/screen reader: hero adds no focus stop or announcement; heading and
  paragraph remain the semantic explanation; temporary logo text is not exposed
  as an image name;
- performance/devtools: no external hero request, filter-heavy rendering,
  console error, timer/frame loop, unexpected work on non-Home routes, CSP
  change, or layout shift;
- separately supply the corrected compact-footer screenshot; that footer result
  remains browser-pending while the primary-button gradient remains approved.

Repository tests and modeled dimensions do not establish these browser results.
No server or browser automation was run. PF-064 and PF-072 remain open.

## PF-064 action-link and rich case-study verification (2026-08-21)

Automated repository coverage now proves the closed action-link variants,
ordering, decorative/unfocusable icons, label-only accessible names, escaped
content, exact converted-action inventory, excluded link/control families,
scoped styling, fine-pointer hover translation, reduced motion, forced colors,
and continued global focus-visible behavior.

Case-study tests prove the scoped centered 72rem boundary, readable text
measures, presence-driven hero and narrative grids, copy-first mobile DOM,
media-free cases without empty tracks, single pair-member expansion, full-row
Role/Technology/Outcomes/Gallery sections, no CSS `order` or fixed section
height, and modeled 320–1920px fit. Content/asset tests prove the closed
`heroMedia` schema, escaped hostile media, canonical Homepage identity and
dimensions, one physical registered-asset check, exact Services/Projects
gallery order, archived Mobile View omission, absent reserved content entries,
unchanged Homepage/Services/Projects card carousel, and intact BWS/eBarangay
routes. Post-build validation independently checks the production HTML state.

AAA browser review still must verify:

1. At 1440 and 1920px, FES uses the centered editorial width; hero copy/image
   and both narrative pairs feel balanced without overlong paragraph lines.
2. At 320, 375, 390, 768, and 1024px, hero copy precedes the fully visible
   screenshot, all sections stack in semantic order, tags/lists/gallery wrap,
   and no horizontal scroll or clipped focus ring appears.
3. The 2880×1388 Homepage screenshot is contained with clean joined corners,
   no distortion/crop/layout shift, and acceptable above-fold loading despite
   its 4,339,585-byte size.
4. Services and Projects are the only gallery frames, remain legible, and lazy
   loading does not leave persistent blank frames.
5. All converted actions show the correct left/right icon placement, at least
   a 44px target, scoped hover affordance, 3px fine-pointer icon movement only,
   unchanged focus ring, no movement with reduced motion, and clear forced-
   colors rendering.
6. Navbar, footer, buttons, inline/Privacy/contact links, tags, carousel
   controls, and project-card stretched links remain visually unchanged.

Repository modeling and automated checks do not constitute browser approval.
No server or browser automation was run, and PF-064 remains open.

## PF-064 Solutions, Process, and shared reveal verification

Focused coverage now includes:

- scoped 72rem centered boundaries and unchanged global reading width;
- Solutions semantic Problem/Audience and Build/Benefit grouping, optional
  evidence omission, readable measures, desktop two-column/mobile source order,
  action-link preservation, and modeled 320–1920px fit;
- all seven Process stages and their canonical five/four fact counts/order,
  desktop identity-plus-facts grid, mobile stacking, CSS-only rail, odd final
  group expansion, Working Together facts, and modeled fit;
- closed reveal variants/stagger bounds, all 11 route applications, no-JavaScript
  visible defaults, one observer, once-only state, initial vs below-fold
  behavior, observer failure, hidden-tab handling, runtime reduced motion,
  focus/hash reveal, no loops/dependencies, and Home hero single initialization;
- exclusion of header/footer, controls, buttons, tags, action icons, carousel,
  form feedback, and Hero SVG internals.

Deliberate failures were run and restored for the narrow page cap, mobile
two-column Solutions, empty evidence track, Process CSS order, missing stage,
JavaScript-only hiding, reduced-motion animation, replay on re-entry,
navbar/footer targeting, and duplicate Home hero initialization. Every
mutation was restored before the final focused and full verification.

AAA browser checks remain required at 320/375/390/768/1024/1280/1440/1920px:
confirm no horizontal scroll, readable measures, natural source/focus order,
balanced desktop whitespace, wrapped Solutions pills/facts, the Process rail
and five-field grid, and the Working Together collapse. With JavaScript
disabled, content must remain complete; with normal motion, intro groups should
fade/translate once without layout shift; with reduced motion (including a
runtime preference change), all content must remain static. Confirm hidden-tab
behavior, keyboard focus/hash navigation, forced colors, screen-reader output,
and no console errors. Repository tests and modeled widths do not constitute
browser approval; PF-064 remains open.
