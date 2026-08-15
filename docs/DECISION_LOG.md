# Decision Log

Material project decisions: context, alternatives, reasons, consequences, and
the condition under which a decision should be revisited.

## 2026-08-15 — Page composition strategy: in-memory Vite plugin (transformIndexHtml)

- **Status:** Accepted
- **Context:** PF-010 duplicated header/nav/footer markup across all 11 static
  HTML routes. PF-011 needed a package-free way to share that markup without
  adding an npm dependency or a Vite HTML plugin package.
- **Options considered:**
  1. Pre-build Node script generating real HTML files to disk before `vite build`.
  2. A Vite inline plugin (no package) using the `transformIndexHtml` hook to
     compose shared markup in memory, for both dev and build.
  3. Status quo — keep duplicating markup per file.
- **Decision:** Option 2 — an inline `transformIndexHtml`-based composer.
- **Reasons:** Uses only the already-installed `vite` package's own plugin
  API; nothing is ever written to the source tree, eliminating the entire
  generated-file staleness/lifecycle/cleanup risk category that option 1
  would introduce.
- **Trade-offs:** The 11 physical HTML skeleton files remain intentionally
  identical (~10 lines each) rather than fully eliminated, since removing
  even that would require generating files to disk. Vite does not
  auto-restart the dev server on changes to files statically imported by
  `vite.config.js` (a real, confirmed limitation — vitejs/vite#5780,
  #21655), so an explicit file watcher + `server.restart()` was added
  (`src/pages/dev-watcher.js`), trading a short full-restart per content
  edit for guaranteed freshness.
- **Consequences:** Content/template/partial edits during `npm run dev`
  cause a brief full server restart rather than instant HMR. Route,
  content, and template registration is validated by a dedicated script
  (`scripts/validate-routes.mjs`) run automatically before `dev` and
  `build`; the actual composed HTML output is separately verified by
  `scripts/verify-build-output.mjs`, run automatically after `build`.
- **Revisit condition:** If per-edit restart latency becomes a real
  friction point, or if a second profession's content needs genuinely
  diverge from this shape, reconsider Option 1 or a more granular
  cache-invalidation approach.

## 2026-08-15 — Quality tooling: ESLint + Stylelint + Prettier + html-validate + node:test

- **Status:** Accepted
- **Context:** PF-012 needed the smallest effective setup providing JS
  linting, SCSS linting, consistent formatting, standards-based validation
  of the composed production HTML, and automated tests for the package-free
  architecture logic added in PF-011 — without a large or redundant
  toolchain.
- **Options considered:**
  - JS lint: ESLint flat config + `@eslint/js` recommended vs. an opinionated
    preset (e.g. Airbnb).
  - SCSS lint: `stylelint` + `stylelint-config-standard-scss` vs. hand-rolled
    rules vs. no SCSS linting.
  - Formatting: Prettier vs. folding stylistic rules into the linters.
  - HTML validation: `html-validate` (pure Node, rule-based) vs. `vnu-jar`/Nu
    Html Checker (requires Java) vs. the hosted W3C API (requires network).
  - Tests: Node 22's built-in `node:test` vs. adding Vitest/Jest.
- **Decision:** ESLint (flat config, correctness only, two environments —
  browser for `src/scripts/`, Node for everything else) + Stylelint
  (`stylelint-config-standard-scss`) + Prettier (JS/JSON/Markdown/SCSS) +
  `html-validate` (`dist/**/*.html` only) + `node:test`. `html-validate` is
  pinned to `10.17.0`, not "latest" — every `11.x` release compatible with
  Node `v22.18.0` tops out at `11.4.0` (`^22.17.0`), and current latest
  (`11.6.2`) requires `^22.22.0 || >=24.8.0`, which our verified Node version
  does not satisfy; `10.17.0` matches this project's own declared `engines`
  range most closely.
- **Reasons:** Each tool maps to exactly one required capability with no
  overlap (`eslint-config-prettier` exists only to prevent a conflict, not
  to duplicate one); `html-validate` checks general HTML5 conformance, which
  is a genuinely different concern from `verify-build-output.mjs`'s
  project-specific business-rule checks; `node:test` needed zero new
  dependency and had no unmet requirement (no DOM, no snapshots).
- **Trade-offs:** HTML is excluded from Prettier's scope — Prettier's HTML
  printer always re-adds self-closing slashes to void elements, but Vite's
  own injected `<link>` tag in the build output is never self-closing and
  isn't configurable, so `html-validate`'s `void-style: "omit"` is the only
  style achievable project-wide; fighting that with Prettier just produces
  permanent disagreement between the two tools. `html-validate` is the style
  authority for the committed HTML skeletons instead. `npm run verify`'s
  `build` step re-runs `check:routes` a second time via its own `prebuild` —
  a cheap, accepted redundancy for fail-fast ordering.
- **Consequences:** `npm run verify` is the single feature-gate command
  (`docs/DEVELOPMENT_WORKFLOW.md` §5.4); no CI wiring exists yet, so these
  checks are only enforced when run locally.
- **Revisit condition:** When the project's Node baseline moves past
  `v22.17.0`/`v22.22.0`, reconsider upgrading `html-validate` to a current
  `11.x`/`12.x` release. If CI is introduced, wire `npm run verify` into it
  directly rather than re-deriving the check list.

## 2026-08-15 — Foundational design system: colors, typography, tokens, preview strategy

- **Status:** Accepted (typography provisional — see below)
- **Context:** PF-020 needed a dark, premium, original visual foundation
  (color/typography/spacing/shape/motion/layering tokens plus global
  document behavior) reviewable at real, compiled, responsive fidelity
  before AAA's sign-off, without weakening the strict route/composer
  architecture built in PF-011 or adding an indexed production route.
- **Color format:** hex/rgb shipped as CSS custom properties, not OKLCH —
  universal browser support, no fallback complexity, and no current need
  for wide-gamut color or programmatic palette generation at scale. Hover/
  active accent states are derived at Sass-compile time via `sass:color`
  functions from the anchor token, not hand-invented hex, so their exact
  values (`#4d81ff`, `#054eff`) are traceable to a formula, not guessed.
- **`--color-text-muted` correction:** the first authored value (`#6e7794`)
  measured 4.32:1 against `--color-canvas` — below the 4.5:1 AA floor for
  normal-size text — and risked being treated as decorative when captions/
  placeholders/timestamps are still meaningful text. Lightened to `#838caa`
  (5.75:1 canvas / 5.05:1 surface-1) with real margin, not a razor-thin
  pass; approved for canvas/surface-1 only (4.53:1 on surface-2, too close
  to the floor).
- **Typography — provisional:** Space Grotesk (display) + Inter (body/UI),
  compared against Sora + IBM Plex Sans and Archivo + Public Sans (all SIL
  OFL 1.1, Google Fonts, locally hostable). Chosen for matching all eight
  approved brand adjectives simultaneously; the alternatives each traded
  away one ("technical edge" for Sora, "approachable" for Archivo). Both
  families were served by Google Fonts as a single variable-font file per
  family for the requested weight range, not separate static instances —
  self-hosted as-is (`public/fonts/*.woff2`) rather than forcing artificial
  static splitting. **Final visual sign-off is pending** AAA reviewing the
  real rendering in the preview page, not this comparison alone.
- **Preview strategy:** compared adding a 12th route (rejected — explicitly
  prohibited, would need an `APPROVED_PATHS` change too), a `public/`
  static file (rejected — `publicDir` ships verbatim to `dist/`, so it
  would reach production even if unlinked), and the chosen approach: a
  hand-authored page at `dev/design-system/index.html`, reachable only via
  `npm run dev`, never in `rollupOptions.input`. Required one narrow,
  explicit composer change — `transformIndexHtml` now passes through
  **exactly one file** (an exact-string match, not a directory or prefix
  match) via a pure, tested function (`src/pages/route-resolution.js`)
  instead of throwing; every other unregistered HTML file still throws
  exactly as before PF-011. Proven safe empirically, not just by
  configuration: `scripts/verify-build-output.mjs` now walks the real
  `dist/` output after every build and asserts it contains exactly the 11
  approved routes.
- **Global document styling applied now, to all 11 live routes:** dark
  canvas/text/focus-ring/reduced-motion apply globally as of this task —
  the first visually-material change to the production site. Heading-tag
  styling (applying the type scale to actual `<h1>`–`<h4>` elements) is
  deliberately deferred to PF-021's "production base elements" scope, not
  this task's.
- **Consequences:** `tests/design-tokens.test.mjs` and
  `tests/route-resolution.test.mjs` run inside the existing `npm test`
  step; `npm run html:validate` additionally checks the preview source file
  directly; no new npm dependency (`sass` and `html-validate` were already
  installed).
- **Revisit condition:** reconsider OKLCH if palette generation needs grow;
  revisit `--color-text-muted` on `--color-surface-2` if that surface is
  lightened; typography remains provisional until AAA's visual sign-off,
  with the two alternatives as valid fallbacks if it doesn't hold up
  visually; the current variable-font weight range may be narrowed later if
  payload measurement shows benefit.

## 2026-08-16 — Base elements: button boundary, deferred icon renderer, and link/tag scope

- **Status:** Accepted
- **Context:** PF-021 needed to apply PF-020's tokens to real headings,
  body copy, links, buttons, labels, tags, lists, media frames, section
  headers, containers, and form-control foundations, with every
  default/hover/focus-visible/active/disabled/error state demonstrated and
  keyboard/touch/reduced-motion-safe, without weakening the composer's
  exact-file preview boundary or introducing a JS component framework.
- **Primary-button boundary — fill fails, border used instead:** the
  initial design assumed `.btn--primary`'s solid fill was self-evidently
  distinct enough from the page background to serve as its own WCAG 1.4.11
  component boundary. Real `sass.compileString()` verification during
  planning disproved this: `--color-accent-fill`/`-hover`/`-active` against
  `--color-canvas`/`--color-surface-1` measure 3.24:1 down to 1.95:1,
  failing the 3:1 non-text floor in 5 of 6 state/background combinations.
  **Decision:** give `.btn--primary` (and `.btn--secondary`) a persistent
  `--color-border-interactive` border, present in every fill state, as the
  actual boundary — verified 4.01:1/3.53:1 regardless of fill state, so one
  pair of automated checks covers every button state at once. `.btn--ghost`
  gets no border; it relies on text contrast alone, like a plain link.
  **Consequence:** the primary button's visual weight changed from a pure
  solid fill to a solid-fill-with-border. **Revisit condition:** if
  `.btn--ghost` later needs to read as a bounded shape, give it the same
  border treatment.
- **Icon renderer deferred, not built:** the dev preview
  (`dev/design-system/index.html`) is one exact-file passthrough in the
  composer — no Node build step ever touches it (`vite.config.js` →
  `resolveHtmlRequest`). A build-time icon-rendering helper would therefore
  be unreachable by the preview and uncalled by any real partial/template in
  this milestone's scope — dead code either way. **Decision:** the one
  supplemental icon actually needed (`.field__error`'s decoration,
  alongside the required persistent visible text) is a single hand-authored
  static inline SVG sourced from Lucide's `circle-alert` path data
  (`lucide@1.31.0`, already installed, still uncalled as a package import).
  External links get no icon at all, for the same reason. **Revisit
  condition:** build the real renderer when a composed partial first needs
  to generate icon markup from content data (PF-031 nav icons, PF-053
  social links).
- **No auto-injected `rel="noreferrer"`; `rel="noopener"` only on explicit
  `target="_blank"`:** the first draft over-specified external-link
  handling. **Decision:** a default external link gets no `target`/`rel` at
  all — same tab, normal referrer behavior. Only a caller that explicitly
  chooses `target="_blank"` gets an automatically-added `rel="noopener"`
  (XSS/reverse-tabnabbing protection) plus a `.visually-hidden` "(opens in a
  new tab)" indication; `noreferrer` is not added by default since
  suppressing referrer data has no demonstrated requirement here.
- **Tags have no interactive state:** the first draft gave `.tag` the same
  hover lift as `.btn`. **Decision:** removed entirely — a `<span class="tag">`
  is not interactive and must not imply an affordance it doesn't have. Only
  `.btn` gets the hover lift, and only under
  `@media (hover: hover) and (pointer: fine)`, never on `:focus-visible` (a
  keyboard user must never see a control move when it receives focus).
- **No distinct `:visited` link style:** deliberate, not an oversight —
  common in modern dark UIs, no strong functional need identified. A style
  preference, reversible without token changes if AAA prefers otherwise.
- **BEM class names required a stylelint config fix:** `stylelint-config-standard-scss`'s
  default `selector-class-pattern` rejects BEM's `__`/`--` delimiters as
  "not kebab-case" — a latent conflict with CLAUDE.md's BEM requirement that
  never surfaced before PF-021 because the only class that existed until
  now (`.skip-link`) happens to also be valid plain kebab-case.
  **Decision:** added an explicit BEM-compatible `selector-class-pattern`
  regex to `.stylelintrc.json` rather than abandoning BEM naming.
- **`header a, footer a { color: inherit }` replaces blanket `body a`:**
  `generic/_reset.scss` previously set `color: inherit` on every link in
  `body`, which would have silently overridden `elements/_links.scss`'s new
  default link color for every content link (higher-specificity `body a`
  beats a bare `a` regardless of source order). **Decision:** scope the
  inherit rule to the two structural chrome landmarks (`header`, `footer`)
  that are still unstyled pending PF-031, so nav/footer appearance is
  unchanged while real content links (in `<main>`, e.g. `standard.js`'s
  optional link, `listing.js`'s link list, `case-study.js`'s back-link) pick
  up the new styling.
- **A latent test-infrastructure gap, found and fixed:** `tests/design-tokens.test.mjs`'s
  `parseColor()` claimed to support comma-form `rgb(r, g, b)` but only
  handled plain 0–255 component values — Dart Sass actually emits
  percentage-form `rgb(r%, g%, b%)` for every `color.adjust()`-derived
  color, which no PF-020 pair ever exercised (all of PF-020's tested pairs
  were literal hex tokens). PF-021's new pairs are the first to test
  `color.adjust()`-derived tokens, which surfaced the gap immediately as
  every new pair failing with "unrecognized color format". Fixed by adding
  percentage-component parsing (×2.55 scale) to `parseColor()`.
- **Consequences:** `tests/design-tokens.test.mjs` grows from 15 to 25
  pairs, with threshold constants split into `BODY_TEXT_MIN`,
  `LARGE_TEXT_MIN`, `NON_TEXT_MIN`, and `FOCUS_INDICATOR_MIN` (all but the
  first are numerically 3.0, named separately so failure messages stay
  accurate to what's actually being checked). `elements/_headings.scss`,
  `elements/_body-copy.scss`, and `elements/_links.scss` are the first
  bare-tag-selector styling applied site-wide since PF-020's global document
  theme — this is the second visually-material change to all 11 live
  routes.

## 2026-08-16 — Component showcase: formalize the existing preview instead of duplicating it

- **Status:** Accepted
- **Context:** PF-030 asks for "a development-only or non-indexed showcase
  that renders representative components, states, copy lengths, and
  responsive behavior" that "must not ship as an indexed public portfolio
  page" (`docs/INITIAL_IMPLEMENTATION_TASKS.md`) — no separate acceptance-criteria
  list this time, unlike PF-020/PF-021. Before implementing anything, the
  question was whether that environment already exists.
- **Finding:** it does, almost entirely. PF-020 built the exact-file-scoped,
  `dist/`-excluded, `html-validate`-checked preview mechanism
  (`dev/design-system/index.html`, `resolveHtmlRequest()` in
  `src/pages/route-resolution.js`); PF-021 populated it with 9 base-element
  sections demonstrating default/hover/focus-visible/active/disabled/error
  states, real keyboard/reduced-motion behavior, and some long-content/
  narrow-width examples, all rendered from the real compiled production CSS.
  The only PF-030-relevant gaps found: the page had grown to 17 sections
  with no way to navigate between them, no `<h1>`/landmark structure, and no
  structured review aid for the approval gates PF-035 will require.
- **Decision:** do not create a new file, route, or second composer
  exact-file exception. Extend the one existing preview file with a real
  `<h1>`, `<main>`/`<nav>` landmarks, a grouped in-page table of contents
  (grouped by the milestone that added each section — PF-020 tokens vs.
  PF-021 base elements, with room for PF-031–PF-034 to each add their own
  group), and a short static review checklist. No SCSS, JS, token, or
  component change was needed — every addition is styled by real classes
  the page already demonstrates (`h1`, `p`, `a`) plus the file's own
  existing preview-only arrangement `<style>` block.
- **Alternatives considered:** a separate `/dev/component-showcase/` page
  (rejected — a second exact-file exception is exactly the kind of "broader
  composer bypass" this project has deliberately avoided since PF-020, and
  would fragment the single source of truth for compiled tokens); empty
  "coming in PF-031" placeholder sections for nav/footer/cards/CTAs
  (rejected — the acceptance criteria don't require them, and an empty
  labeled section risks implying an unfinished component is implemented,
  which CLAUDE.md's "do not generalize speculative variants" and "avoid
  placeholder" guidance both counsel against); a JS viewport-width readout
  widget to aid responsive review (rejected — the fluid CSS is already
  genuinely responsive; verifying at the six required widths has always
  been, and remains, a manual resize/DevTools step, not something the page
  itself needs to instrument).
- **Consequences:** `tests/preview-anchors.test.mjs` (new) guards two
  invariants introduced by the TOC: every in-page anchor resolves to a real
  `id`, and every `id` in the file is unique — both read the real committed
  file, not a fixture, so they stay accurate as PF-031+ adds more sections.
  The "exactly one `<h1>`" check is scoped to `id="page-title"` specifically,
  because the "Headings & body copy" section's own demo content
  intentionally contains a literal `<h1>`–`<h4>` specimen that must not be
  mistaken for the page's title heading.
- **Revisit condition:** if the page becomes unwieldy once PF-031–034 have
  each added their sections (plausibly 30+ sections total), reconsider a
  sticky TOC or splitting by milestone — but only as a CSS/organization
  change to this same file, not a second file or route.

---

_This log will be backfilled with the project's earlier approved decisions
(technology stack, hosting, positioning, information architecture, and
others) under PF-002. Entries added from PF-011 onward are recorded here
as they are made._
