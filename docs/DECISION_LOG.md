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

## 2026-08-16 — Global navigation and footer: menu-control architecture, sticky-header risk, skip-link focus, and footer/icon safety

- **Status:** Accepted
- **Context:** PF-031 asks for "desktop and mobile navigation, active state,
  skip link, highlighted Start a Project action, accessible menu behavior,
  footer navigation, contact links, privacy link, and copyright"
  (`docs/INITIAL_IMPLEMENTATION_TASKS.md`). Planning went through several
  correction rounds before implementation; the material decisions:
- **Menu control — real `<button>`, not `<details>`:** a `<details>` whose
  content is forced visible only through desktop CSS creates two sources of
  truth (the _visual_ state and the native _accessibility_ state can
  diverge). Decision: a real `<button aria-expanded aria-controls>` whose
  `hidden` attribute (button and nav both) is the single authoritative
  state, mirrored into `aria-expanded`. The no-JS baseline ships the button
  `hidden` and the nav never `hidden` — full navigation at every width with
  zero JS; `src/scripts/nav-toggle.js` only adds Escape-to-close-with-
  focus-return and a breakpoint-change auto-close, both additive.
- **Focus as a one-time effect, not persisted state:** an early draft stored
  `focusToggle: true` inside the persisted `{ isDesktop, expanded }` state.
  Found on review: a second consecutive Escape (menu already closed) could
  re-read a stale `true` and refocus the toggle with no new request.
  Redesigned so `deriveNavState()` returns a fresh `{ state, effect }` pair
  on every call — `effect` is never stored, so a no-op action deterministically
  returns `effect: null`. Directly unit-tested
  (`tests/nav-toggle-state.test.mjs`: "a second consecutive ESCAPE does not
  repeat the focus effect").
- **Atomic DOM initialization:** an early draft checked only `toggle`/`nav`
  before proceeding, then queried the label/icons afterward — if either was
  missing, the toggle would already be revealed before the code threw. Fixed
  to resolve and check all five required elements (toggle, nav, label, both
  icons) before any mutation; if any is missing, nothing is touched and the
  safe server-rendered baseline stands.
- **Sticky header, desktop only:** the collapsible mobile nav holds 6 links
  - the CTA (7 rows) — a _pinned_ header containing the fully expanded menu
    could equal or exceed a short viewport's height (e.g. a landscape phone),
    trapping the page with no way to scroll past it. Scoping
    `position: sticky` to `@media (min-width: $bp-md)` only removes the risk
    by construction — desktop's nav is always a short horizontal row.
- **Skip-link focus, a genuine pre-existing gap:** since PF-011, `#main-content`
  had no `tabindex`, so activating the skip link scrolled it into view but
  did not reliably move keyboard focus there. Fixed with `tabindex="-1"` on
  all 11 skeleton files, no JS. Guarded at both the pre-flight
  (`scripts/validate-routes.mjs`, reads the raw skeleton) and build-output
  (`scripts/verify-build-output.mjs`, strengthened the existing
  `<main id="main-content">` check) layers.
- **`--header-offset` — additive CSS, correct settings file:** an early
  draft used `calc(var(--space-3) * 2)` (length-times-number), not reliably
  valid cross-browser CSS. Corrected to pure addition. Placed in
  `settings/_spacing.scss`, not `_shape.scss` — it's a scroll-positioning/
  layout concern, not an element's own geometry.
- **Footer link safety, defined now, not deferred:** `contactEmail`/
  `social.github`/`social.linkedin`/`resumePath` stay `null`
  (PF-003/PF-053), but `src/pages/link-safety.js` gained `isSafeEmail()` and
  `isSafeExternalUrl(url, hostGroup)` now, so a future populated value can't
  silently become an unsafe attribute. `isSafeEmail()`'s local-part
  character class deliberately excludes `%` — an early draft allowed it,
  but combined with raw `mailto:` embedding, a value like
  `local%0d%0abcc%3aevil@evil.com` passes every individual character's
  whitelist yet a mail client percent-decoding the URI could read
  `%0d%0a`/`%3a` as literal CRLF/`:`, enabling mailto header injection.
  `isSafeExternalUrl` requires HTTPS and an explicit per-field host
  allowlist (`github.com`/`www.github.com`, `linkedin.com`/`www.linkedin.com`)
  — not "any HTTPS URL."
- **`renderFooter(navItems, site, { year })` — corrected signature:** an
  early draft was `renderFooter(site, { year })`, which had no way to
  receive `navItems` for the footer's own nav short of importing the
  `primaryNav` config singleton directly — contradicting the stated
  pure/injectable architecture. `navItems` is now threaded through exactly
  like `site` (`render.js` → templates → `renderHeader`/`renderFooter`).
  `footer.js` imports neither config module.
- **Icon renderer — whitelist attribute names, not just escape values:**
  `src/components/icon.js` (finally built — PF-021 deferred it for lack of
  a real call site; the menu icons are that call site) whitelists both tag
  names and attribute names. An early draft escaped attribute _values_ but
  emitted any attribute _name_ — `escapeHtml('onload')` is still the
  literal string `onload`, so escaping alone doesn't stop a dangerous name
  from being emitted as a live attribute. Fixed with a closed
  `ALLOWED_ATTRS` set (the real geometry attributes the whitelisted tags
  use); unexpected names throw, like unexpected tags. `className` is the
  only way to attach an outer class — the renderer itself emits the fixed
  `class` name, so callers can never inject an arbitrary outer-attribute
  object.
- **Manual Git grouping:** the skeleton `tabindex` fix and the validator
  changes (`scripts/validate-routes.mjs`/`verify-build-output.mjs`) are
  separate commits — an early draft bundled both under a message
  mentioning only the skip link, silently absorbing the unrelated
  primary-CTA/contact-safety validation changes.
- **Consequences:** `tests/nav-toggle-state.test.mjs`, `tests/nav.test.mjs`,
  `tests/header.test.mjs`, `tests/footer.test.mjs`, `tests/icon.test.mjs`
  (new); `tests/link-safety.test.mjs` extended. `scripts/verify-build-output.mjs`'s
  existing `<nav aria-label="Primary">` check needed its regex loosened to
  be attribute-order-independent once `nav.js` started emitting `id`/`class`
  before `aria-label` — found and fixed during implementation, not
  anticipated in planning.
- **Revisit condition:** none identified beyond the existing `--header-offset`
  visual-recheck note (component-showcase entry, `docs/DESIGN_SYSTEM.md`).

## 2026-08-16 — Global navigation visual-review corrections: `[hidden]` cascade defect and desktop nav wrapping

- **Status:** Accepted
- **Context:** PF-031 failed visual review after implementation. Two real
  CSS defects were found — neither caught by `npm run verify`, since CSS
  _rendering_ isn't something `node:test` can evaluate, only the compiled
  stylesheet's _content_.
- **Defect 1 — `[hidden]` silently overridden:** `.site-header__menu-toggle`
  set `display: inline-flex` unconditionally. CSS cascade _origin_ ordering
  means a normal-priority author rule always beats a normal-priority
  user-agent rule, regardless of specificity — this one declaration
  permanently defeated the browser's native `[hidden] { display: none }`
  behavior, so the mobile-menu toggle stayed visible in every state, at
  every width (desktop included), which in turn crowded the desktop nav
  row into wrapping (defect 2).
- **Decision — scope the rule, and add one justified `!important`:**
  `.site-header__menu-toggle`'s `display` is now scoped to
  `:not([hidden])`. That alone isn't durable: same-specificity author
  rules are resolved by _source order_, not by which one "should" apply,
  so a future component rule loaded later, at equal specificity, could
  reintroduce the identical bug. `generic/_reset.scss` therefore also
  gained `[hidden] { display: none !important; }` — **an intentional,
  deliberately narrow exception to this project's normal avoidance of
  `!important`**, added only after proving the failure mode above, not
  adopted as a default habit. It is defense in depth: components should
  still scope their own `display` rules correctly (as the toggle now
  does); the `!important` rule exists so the _result_ — `[hidden]`
  elements are never visible — holds project-wide even if a future
  component gets that wrong.
- **Defect 2 — desktop nav wrapped despite available room:** `.site-nav`
  (the `<nav>` element, a flex item of `header`) had no `flex-shrink` of
  its own, defaulting to `flex-shrink: 1` — compressible below its
  content's natural width whenever `header`'s space was even slightly
  tight. Combined with `flex-flow: row wrap` on the desktop `.site-nav ul`
  rule, that compression is what let the "Start a Project" CTA break onto
  a second row; the row was never genuinely out of viewport width, it was
  being squeezed by its own flex item shrinking first. Considered and
  rejected: reducing the gap alone (would have masked the structural
  cause without fixing it) and raising the breakpoint (explicitly
  prohibited — hides the defect rather than fixing it).
- **Decision:** `.site-nav { flex-shrink: 0; }` and
  `.site-nav li { flex-shrink: 0; }` at desktop, plus `flex-flow: row
nowrap` (removing wrapping as an escape valve entirely, not just making
  it less likely). The desktop nav gap was also tightened from
  `--space-5` to `--space-4` — an existing token, applied as a modest
  secondary safety margin alongside the structural fix, not instead of it.
- **Consequences:** `tests/hidden-visibility.test.mjs` and
  `tests/site-nav-layout.test.mjs` (both new) compile the real `main.scss`
  and assert the corrected declarations are present — proving the
  compiled stylesheet is correct, not that any given browser renders it
  correctly. Manual browser review at 1024/1440/1920px remains required.
- **Revisit condition:** if a future component again needs to set
  `display` on a selector that can also carry `hidden`, scope it with
  `:not([hidden])` from the start — the global safety net will catch a
  mistake, but shouldn't be relied on as the primary mechanism.

---

## 2026-08-16 — Capability cards: deferred renderer/content module, not built ahead of a real caller

- **Status:** Accepted
- **Context:** PF-032 needed six capability cards. A first draft proposed
  `src/content/capability-cards.js` (a data module) plus
  `validateCapabilityCards()`, wired into `scripts/validate-routes.mjs`, plus
  a showcase-sync test asserting the showcase's hand-typed text matched the
  data file. On review, none of that had a real consumer: the showcase is
  static exact-file HTML and cannot import a Node module (the composer never
  touches it), and no production template calls a renderer either —
  `solutions.js`/`home.js` are still placeholders. The only "uses" of the
  data module would have been a route-validator check and a test keeping two
  hand-maintained copies of the same content in sync — busywork, not a
  genuine application dependency. This is the same shape of mistake an
  earlier draft of PF-021's icon renderer made: built ahead of any real
  caller, sitting unused until PF-031 finally gave it one (nav icons).
- **Decision:** Ship `.capability-card` as SCSS-only, with a documented
  markup contract, proven by literal hand-authored specimens in
  `dev/design-system/index.html` — no JS render function, no content-data
  module, no route-validator integration, no sync test. Exactly the same
  precedent `.btn`/`.tag`/`.media-frame` already established in PF-021: ship
  CSS-first, add a renderer only once a real page composes the content
  (PF-041/050+).
- **Consequences:** The six showcase descriptions are representative/
  provisional component copy, not approved production content — documented
  explicitly in `docs/DESIGN_SYSTEM.md` so they're never mistaken for final
  Solutions-page copy. All six interactive specimens link to `/solutions/`
  (the one existing, approved route) purely to demonstrate the stretched-
  link pattern; no route content changed. Icons are hand-authored static
  inline SVG (matching the existing `.field--error` circle-alert precedent),
  not `renderIcon()` calls — the showcase has no build step to invoke it
  from.
- **Revisit condition:** When PF-041/050 first composes real capability-card
  content into an actual page, add `renderCapabilityCard()` and a validated
  content-data module then — that milestone is the real caller this
  milestone deliberately didn't invent one for.

## 2026-08-16 — Capability cards: full-bleed accent backgrounds, pattern opacity, and a two-tone focus ring

- **Status:** Accepted
- **Context:** The requirements doc calls for "bold solid... colors" on
  capability cards, but PF-020 reserved the five (now six) capability-accent
  tokens without ever using one as a background — every prior use was a
  small swatch dot. Committing to a full solid accent fill meant verifying,
  not assuming, three things that had never been tested in this role: (1)
  text/icon contrast directly on an accent field, (2) the site's default
  cobalt `--color-focus-ring` against an accent field, and (3) once an
  abstract background pattern was added on top of the fill, contrast against
  the pattern's darkened stripes, not just the flat color.
- **Decision:**
  1. **Dark ink (`--color-canvas`) for all text/icon content on every
     variant.** Light/white text was checked and rejected — it fails badly
     on all six accents (as low as 1.60:1). Dark ink clears 4.5:1 on all six
     with real margin (weakest: `--accent-violet`, 5.43:1 flat).
  2. **A sixth accent, `--accent-magenta` (`#ef4fa0`)**, independently
     defined (not aliased), since six cards needed one more than PF-020
     reserved.
  3. **The background pattern's opacity is 5%, not the initially-assumed
     8%.** At 8%, `--accent-violet`'s margin over the 4.5:1 text floor was
     only 5.6% once composited against the pattern's darkest stripe — thin
     by this project's own established standard, where every other verified
     pair carries a double-digit margin. Reduced to 5%, restoring a real
     11.0% margin.
  4. **A two-tone, full-card focus ring**, not a single dark override. The
     default `--color-focus-ring` (cobalt) fails 3:1 against every accent
     (1.27–2.60:1); a single dark ring alone is equally illegible against
     the surrounding dark canvas/surface page. Two concentric rings — inner
     dark (`--color-canvas`, vs. every accent) and outer light
     (`--color-text-primary`, vs. the surrounding page) — applied around the
     whole card via `.capability-card:has(.capability-card__link:focus-visible)`,
     not just the heading link, so the ring's footprint matches what's
     actually being activated. Under `forced-colors: active`, the same
     card-level selector switches to a real `outline: 2px solid Highlight`
     (box-shadow is dropped under forced-colors; outline is preserved and
     system-recolored) — never collapsing back to a small link-sized box in
     either mode.
  5. **Interactivity is scoped to `.capability-card:has(.capability-card__link)`**,
     not a `--static`/`--interactive` modifier class — a card gets the
     stretched-link hit area, arrow, hover-lift, `:active` feedback, and
     focus ring purely because a real link element is present in its markup,
     never because a modifier was correctly (or incorrectly) applied.
  6. **`:active` sets `transform: translateY(0)` plus a `--shadow-md`
     step-down, not `filter: brightness()`.** `:hover` and `:active` can be
     simultaneously true (mouse held down while hovering); a filter-only
     rule would leave the hover-lift's transform in effect, so the card
     would never visibly "press." The explicit reset, declared after the
     hover block, wins by source order. `filter: brightness()` was rejected
     because it alters the actual rendered text/background colors while
     pressed — outside what the contrast tests cover.
- **Consequences:** `tests/capability-card-contrast.test.mjs` compiles the
  real `main.scss` (tokens and the actual pattern/focus-ring rules together)
  and asserts three named relationship categories — body text/icon contrast,
  card boundary contrast, and focus-indicator contrast — against every
  accent, both flat and pattern-composited, rather than asserting literal
  hex values. It reads the pattern's real opacity and the focus ring's real
  color tokens from the compiled CSS, so a future edit that changes either
  without re-verifying contrast fails the test on its own.
- **Revisit condition:** If a future card variant's accent is added or
  changed, re-run the same flat-and-composite contrast check before shipping
  it — the margin math in `docs/DESIGN_SYSTEM.md`'s capability-cards section
  is specific to the current six colors, not a guarantee that holds for an
  arbitrary future hue.

## 2026-08-16 — Capability cards: desktop grid was viewport-breakpoint-gated, not container-width-aware

- **Status:** Accepted — the exact `minmax(min(20rem, 100%), 1fr)` construct
  in the Decision below was itself superseded the same day (see "full-bleed
  accent backgrounds..." entry's sibling entries further down and
  `docs/DESIGN_SYSTEM.md`'s "Capability cards (PF-032)" section for the
  current implementation: an unconditional `1fr` default plus
  `repeat(auto-fit, minmax(20rem, 1fr))` above `(width >= 36em)`, with no
  nested CSS math function). The breakpoint-vs-container-width diagnosis
  and the `.preview-section--wide` container fix below remain accurate and
  current; only the specific `grid-template-columns` value quoted in this
  entry's Decision does not match what's currently shipped.
- **Context:** Visual review flagged the desktop/tablet capability-card grid: three uncomfortably narrow columns, "Workflow & Process Solutions" wrapping onto four lines, and visibly unused horizontal space beside the grid at wide viewports. Root cause, confirmed by computing the real numbers (not guessed): `.capability-cards` selected its column count from `@media (min-width: $bp-md/$bp-lg)` — i.e. from the raw **viewport** width — but the grid's actual available width is the `.preview-section`'s own `max-width: var(--container-max)` (80rem/1280px), inset further by `--gutter` and the card's own padding. Those are two different measurements. Right at and just above the old 1024px breakpoint (where the container isn't yet capped), three forced columns left only ~231px of real text area per card — narrow enough to produce the observed four-line wrap. Even once the container was capped at wider viewports, three columns landed at ~373px total (~309px text area) while the container itself sat well inside the available viewport, which is the "unused space" half of the report.
- **Decision:** Replace the two fixed, breakpoint-gated `repeat(N, 1fr)` rules with a single `grid-template-columns: repeat(auto-fit, minmax(min(20rem, 100%), 1fr));` — column count is now derived from the grid's real available width, not assumed from viewport width, so it naturally drops to two columns wherever three wouldn't be comfortable rather than forcing a fixed count. The `min(20rem, 100%)` wrapper (not a bare `20rem`) keeps the minimum from ever exceeding the container itself, which is what prevents overflow at the narrowest required width (320px) — an unwrapped `minmax(20rem, 1fr)` is a well-known way to force exactly that kind of overflow. Additionally, the capability-cards section itself now opts into a `.preview-section--wide` modifier (`max-width: var(--container-wide)`, 90rem/1440px — an existing token, not a new one) instead of the page's narrower default, giving genuinely comfortable column widths at large viewports instead of just centering the same cramped columns with more empty margin around them.
- **Consequences:** Real column-count math (via `clamp()`-based gutter, real `--gap-lg`/`--space-6`/`--container-wide` token values) now gives 1 column at 320/375px (unchanged), 2 columns at 768/1024px, and 3 comfortable columns (~427px, ~365px text area) at 1440/1920px — verified in `tests/capability-card-layout.test.mjs`, which simulates the real auto-fit algorithm from the real compiled tokens rather than asserting hardcoded pixel values. All previously verified colors, the background pattern, icon treatment, hover/active/focus behavior, and contrast relationships are untouched — this was purely a grid-track-sizing and container-width correction.
- **Revisit condition:** If the minimum comfortable column width (`20rem`) or the section's container token ever change, re-run the real-number simulation in `tests/capability-card-layout.test.mjs` before assuming the new values are still comfortable at every required review width.

## 2026-08-16 — Capability cards: the real desktop-width defect was an inherited `ul` prose-width cap, not the section container

- **Status:** Accepted
- **Context:** After the grid/container fix above (auto-fit/minmax, `.preview-section--wide`), visual review — using a clean, self-managed dev server, ruling out stale HMR/tab state — still showed the capability-cards grid rendering single-column, in a section only ~400-550px wide, at desktop viewports up to ~1900px. The previous fix and its test both modeled the _section's_ available width and assumed the grid used exactly that; neither ever checked whether `.capability-cards` (the `<ul>` itself) carried any independent, competing constraint from elsewhere in the stylesheet. It did: `elements/_body-copy.scss` has a project-wide `ul, ol { max-width: var(--width-reading); }` rule (68ch, a sensible reading-length cap for a list of _text_) that applies to every `<ul>`/`<ol>` in the document, `.capability-cards` included. `.capability-cards` (specificity 0,1,0) beats bare `ul` (0,0,1) for any property both rules declare — but the cascade resolves _per property_, not per rule, and `.capability-cards` never declared `max-width` at all. With no competing declaration for that property, the generic ~68ch (~500-550px, depending on the rendered font) constraint applied completely unopposed on the grid element, regardless of how wide its ancestor section was made. Widening the section was a correct, necessary fix for the section's own width — it just wasn't sufficient, because the actual bottleneck was one level further in.
- **Decision:** Add an explicit `max-width: none;` to `.capability-cards`. The same audit (checking every generic `elements/*.scss` element-selector rule against every property `.capability-card`/`.capability-cards` might inherit) found one more instance of the identical bug class: `li { margin-bottom: var(--space-2); }` was leaking onto `.capability-card` (never overridden), stacking extra space under every card on top of the grid's own `gap` — fixed with an explicit `margin: 0;` on `.capability-card`.
- **Consequences:** `tests/capability-card-layout.test.mjs` was rewritten around a real per-property cascade resolver (`resolveProperty()`) that parses every rule in the compiled stylesheet, computes real CSS specificity for each matching selector, and picks the cascade-winning declaration by (specificity, source order) — the same two tie-break axes a browser uses for normal-priority rules. It asserts the _resolved_ value of `max-width` on `<ul class="capability-cards">` and `margin` on `<li class="capability-card">`, not merely that some plausible-looking declaration exists in the file — this is the same gap that let the previous version of this test pass while the browser rendered a single column. Deliberate-failure passes confirmed: removing either fix makes the resolver correctly report the inherited generic value instead, and the downstream column-count simulation (now seeded from the resolver's answer, not an assumed value) correctly collapses back to 1 column. The section-width fix (`.preview-section--wide`) from the prior entry is unchanged and still necessary — this entry is additive, not a replacement.
- **Revisit condition:** Any future card/grid component built as a `<ul>`/`<ol>`/`<li>` should check `elements/_body-copy.scss`'s generic list rules (`max-width`, `margin`, `padding-left`) against its own needs up front, rather than discovering the gap after a visual-review round trip — the resolver in `tests/capability-card-layout.test.mjs` is written generally enough to reuse for that check.

## 2026-08-16 — Project cards: no invented content, CSS-only, reused the capability-card fixes proactively

- **Status:** Accepted
- **Context:** PF-033's own status line is explicit: "Blocked — final graphics depend on PF-003; structural placeholders may proceed." PF-003 (content/asset inventory) is itself still `Blocked` — no image, technology list, or problem/outcome copy has ever been approved for FES Challenger, the anonymized Business Workflow System, or eBarangay. `work/index.js` and all three case-study content files remain foundation placeholders.
- **Decision:**
  1. **No new summary/outcome/tech copy on the three real cards** — the component supports a missing summary anyway, so omitting it costs nothing and can't be misread as an intentional tagline the way reusing the existing case-study placeholder sentence could.
  2. **Category text shown only where the requirements doc gives an exact phrase that reads naturally as a tag** — true for Business Workflow System ("Government/business workflow system," used verbatim) only. eBarangay's approved phrase, "Personal full-stack case study," is a sentence fragment, not a category-shaped noun phrase; an earlier draft turned it into "Personal Project," which is new copy, not a quotation — corrected to omit it instead of paraphrasing approved language.
  3. **Missing-image treatment is a clean empty `.media-frame` panel**, not a decorative pattern standing in for a screenshot — the latter risked being mistaken for real project evidence.
  4. **CSS-only component, no renderer, no content module** — identical reasoning to PF-032's: no real production template exists to call one from yet. Featured and secondary cards are `<li>` siblings of one `<ul class="project-cards">` (`.project-card--featured` spans every column via `grid-column: 1 / -1`), not two separate structures.
  5. **`.project-cards`/`.project-card` reset `max-width: none;`/`margin: 0;` from the first draft**, and `tests/project-card-layout.test.mjs` proves this via real cascade resolution — the exact defect class PF-032 found only after shipping (`elements/_body-copy.scss`'s generic `ul, ol { max-width: var(--width-reading); }` and `li { margin-bottom: var(--space-2); }` apply unopposed to any property a higher-specificity class rule doesn't itself declare).
  6. **Full-card focus ring, single tone** (`.project-card:has(.project-card__link:focus-visible) { outline: ...; }`) — same full-card principle as `.capability-card`'s two-tone ring (a stretched-link card needs a ring that matches its actual click region, not just the heading), but only one tone is needed: the ring only ever touches `--color-surface-1`/`--color-canvas`, both already verified against `--color-focus-ring` in `tests/design-tokens.test.mjs`. Using `outline` (not `box-shadow`) unconditionally also means forced-colors mode needs no separate ring override, unlike `.capability-card`.
  7. **Grid minimum adjusted from the originally-proposed 22rem to 21rem** after computing real column-count math against the actual compiled tokens: 22rem produced only 1 column at 768px (2 columns need `2×minCol + gap ≤` content width, which only holds up to ~21.04rem there) — the plan's own flagged contingency, not a surprise.
  8. **Extracted `tests/helpers/cascade-resolver.mjs`** from `tests/capability-card-layout.test.mjs`'s `resolveProperty()`/`parseRules()`/`specificity()` functions — this is their second real caller, matching the revisit condition the capability-card entry above already anticipated.
- **Consequences:** `tests/project-card-layout.test.mjs` (16 assertions) covers resolved-cascade `max-width`/`margin`, the grid column simulation seeded from the real resolved value, the featured `grid-column` rule, list-parent structure for every card `<li>`, the required link+action pairing (and its absence on non-interactive cards), and resolved-cascade focus-ring rules in both normal and forced-colors contexts. All were run through deliberate-failure passes (removing each fix in turn) and correctly failed, then reverted. `tests/capability-card-layout.test.mjs`'s own 11 assertions were re-verified unchanged after the resolver extraction.
- **Revisit condition:** When PF-041/052/060–062 give project cards a real production caller, add `renderProjectCard()` and real content (technologies, summaries, images) then — not before. If the grid's minimum column width or `--container-wide` ever change, re-run the real column-count simulation in `tests/project-card-layout.test.mjs` before assuming the new values are still comfortable.

## 2026-08-16 — Process, trust, engagement, and CTA components: CSS-only, static-vs-interactive split, no invented per-item copy

- **Status:** Accepted
- **Context:** PF-034's own scope line is terse: "Provide the homepage preview variants and ensure they can expand into dedicated-page presentations without duplicating page copy." `home.js`, `process.js`, and `contact.js` are all still foundation placeholders — no real production template exists to call a renderer from, the same situation PF-032/PF-033 shipped into. An initial draft additionally proposed a one-sentence supporting description per process step and per trust indicator, and rendered the four engagement labels as `.tag` pills; AAA's review flagged both before implementation: the supporting sentences would have been invented copy with no approved source, and `.tag` presentation would misread four meaningful ways of working as filterable technology/category metadata.
- **Decision:**
  1. **Four separate CSS-only components** (`.process-steps`, `.trust-list`, `.engagement-options`, `.cta`), no JS renderer, content-data module, or schema field for any — identical reasoning to PF-032/PF-033. Kept as four separate SCSS/test files rather than merging the two simpler list components, matching the one-file-per-component precedent already established.
  2. **No invented per-item copy.** Process step names, trust assurances, the engagement intro sentence and labels, and the Final CTA are quoted verbatim from `DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md` §9.7/§9.3/§9.8/§9.10. Per-step/per-item supporting sentences are omitted entirely rather than invented — none is approved at that length, and for process steps the fuller explanation belongs to the dedicated Process page (PF-051); reusing it here would duplicate page copy, which PF-034's own scope explicitly forbids. Three strings with no verbatim source remain explicitly marked `provisional` in the showcase prose: the "See the Full Process" link label, the "Learn About My Approach" link label and its target (About, not Process — §9.3 names either as acceptable), and a one-sentence paraphrase of §9.8's explanation instruction. AAA has since approved all three as provisional showcase copy — approved for use in this development showcase, still subject to a separate final production-content review when a real page composes these sections.
  3. **Engagement options render as `.engagement-options__item`, not `.tag`.** A static row block (full border, left accent edge, no pill radius) with no arrow/chevron affordance, so it cannot be mistaken for a filter/tag cloud or imply more detail sits behind it.
  4. **Interactivity is asymmetric, unlike `.capability-card`/`.project-card`.** Those two are whole-card interactive via `:has(...__link)`. Here, `.process-steps__step`, `.trust-list__item`, and `.engagement-options__item` carry no cursor/hover/active/focus treatment and are not focusable — only `.cta`'s `.btn` action link and the single section-level links following the process/trust lists are interactive, via the existing `<a>` pattern. A per-item link on either list would fragment "one keyboard stop per action" and imply per-item destinations that don't exist.
  5. **`max-width: none`/`margin: 0`/`list-style: none` reset from the first draft** on the three list-based components — the same `elements/_body-copy.scss` generic `ul, ol { max-width: var(--width-reading); }` / `li { margin-bottom: var(--space-2); }` leak PF-032 found and PF-033 proactively avoided. Verified via `tests/helpers/cascade-resolver.mjs`, reused for its third and fourth real callers. `.process-steps` is this project's first `<ol>`-based grid component; its reset was the one PF-034 invariant put through a deliberate-failure pass (temporarily removing `max-width: none` from `_process-steps.scss` correctly failed `tests/process-steps-layout.test.mjs`'s resolved-cascade assertion and its "no property won by a lower-specificity generic rule" check, then the fix was restored). `.trust-list`/`.engagement-options` repeat the already-proven `ul`/`li` pattern, so no second deliberate-failure pass was run for either — their resolved-value assertions still run on every `npm test`.
  6. **`.cta` is a restrained contained panel** (`--color-surface-1` fill, `--color-border` boundary), not a full-bleed accent band — deliberately lower-key than `.capability-card`'s solid accent fills. Reusable, not homepage-hardcoded, so PF-050/PF-060-062 can compose it with their own approved inquiry-CTA copy later. Defines no focus system of its own: the action link keeps the global `:focus-visible` ring exactly as `.btn` already declares it, and that ring's contrast against `--color-surface-1` is already verified in `tests/design-tokens.test.mjs` (the same pair `.project-card`'s ring relies on), so no new contrast pair was needed. `.cta__body` is genuinely optional — the second showcase specimen omits the element rather than rendering it empty.
  7. **Forced-colors handling scoped to what each component's boundary actually depends on**, not applied uniformly: `.cta` and `.process-steps__number` get an explicit `border: 1px solid CanvasText` override (their boundary is `background-color`-only in normal mode, which forced-colors drops); `.engagement-options__item` needs no override (it already has a real border in normal mode, and border-color is one of the properties forced-colors mode recolors automatically); `.trust-list__item` needs no override (no background/border boundary exists in either mode). No static container gains a `:focus-visible`/outline rule in any mode.
  8. **Trust icons are hand-authored static inline SVG**, not a call into `src/components/icon.js` — the showcase is static HTML with no access to that build-time renderer. Path data (`package-check`, `handshake`, `workflow`) was copied directly from the installed `lucide` package's source, using the same `fill="none" stroke="currentColor"` attribute set every other inline SVG in this project already uses, marked `aria-hidden="true" focusable="false"`. `icon.js` itself is untouched.
- **Consequences:** Four new test files (`tests/process-steps-layout.test.mjs`, `tests/trust-list-layout.test.mjs`, `tests/engagement-options-layout.test.mjs`, `tests/cta-section.test.mjs`, 22 assertions total) cover resolved-cascade list resets (three components), list-parent/single-interactive-element structure (all four), decorative-icon attributes, the `.tag`-exclusion guard on engagement options, and the CTA's optional-body/no-competing-focus-system/forced-colors-boundary checks. `docs/DESIGN_SYSTEM.md`'s "Process, trust, engagement, and CTA components (PF-034)" section documents the copy-provenance table (verbatim vs. provisional) so the showcase text is never mistaken for approved production copy.
- **Revisit condition:** When PF-041 first composes real homepage content into these four sections, add the corresponding `render*()` functions and content-data modules then — not before. The three provisional strings (link labels, link target, engagement-intro paraphrase) are already approved for showcase use; still route them through final production-content review at that point, since showcase approval is not production approval.

## 2026-08-16 — PF-035 Gate C approved: component system approved without exceptions

- **Status:** Accepted
- **Context:** PF-035 is Gate C (`docs/DEVELOPMENT_WORKFLOW.md`): "Approve header, footer, capability cards, project cards, process elements, and CTAs in representative states and widths," blocking PF-040 (global shell) until complete. Ahead of AAA's browser review, a source-level audit was run across every Gate C component (header/nav/footer, capability cards, project cards, process steps, trust indicators, engagement options, CTA) and their shared PF-021 base elements/tokens, checking cross-component consistency in typography/spacing, container/grid behavior, borders/surfaces/radius/depth, interactive-vs-static affordances, hover/active/focus/reduced-motion/forced-colors handling, optional/missing-content handling, long-content wrap behavior, and generic prose/list cascade leakage (the defect class PF-031/032 each hit once reactively).
- **Decision:**
  1. **Source audit found no defects.** No targeted fixes were proposed or applied; every component's cascade-leak resets, hover/focus/forced-colors handling, and token usage were confirmed consistent with the patterns already established in PF-021/031-034. `npm run verify` passed (214/214 tests, lint, format, build, `html-validate`) prior to review.
  2. **AAA completed the full browser review** in `docs/TESTING_AND_QA.md`'s manual checklist across all four component groups (header/nav/footer; capability cards; project cards; process/trust/engagement/CTA) at 320/375/768/1024/1440/1920px, plus keyboard-only, touch/no-hover, reduced-motion, forced-colors, and 200% zoom — all passed.
  3. **Gate C is approved, without exceptions**, dated 2026-08-16. The approval covers component structure, behavior, responsiveness, and accessibility only — not final production marketing copy or assets, which remain a separate PF-041 review per the PF-033/034 entries above. Recorded in `docs/COMPONENT_APPROVAL.md`, the durable Gate C artifact.
  4. **PF-040 (global page shell) is now unblocked** — its status changes from "Ready after PF-035" to "Ready" in `docs/INITIAL_IMPLEMENTATION_TASKS.md`.
- **Consequences:** `docs/COMPONENT_APPROVAL.md` created as the standing Gate C sign-off record (source-audit findings, browser-review matrix, final decision), separate from `docs/DESIGN_SYSTEM.md` (token/component rationale) and `docs/TESTING_AND_QA.md` (the authoritative manual-check checklist). No component SCSS, showcase markup, or tests were changed by this milestone.
- **Revisit condition:** None for Gate C itself. Final production content/copy for capability cards, project cards, and the provisional PF-034 showcase strings still requires separate approval at PF-041.

## 2026-08-16 — PF-040 global page shell: container ownership and minimum-viewport shell

- **Status:** Accepted
- **Context:** PF-040 wires the already-approved header/main-landmark/footer chrome (PF-011, PF-031, Gate C) into the reusable production shell used by all 11 routes. Two open questions surfaced during planning, neither addressed by any prior decision: (1) where should `.container` (PF-021, previously preview-only) be wired in — the shared skeleton or the templates; (2) short routes had no mechanism keeping the footer at the viewport bottom, leaving empty canvas below it on content shorter than the viewport.
- **Decision — container ownership:**
  1. **Options considered:** (a) wrap `<!--@content-->` in `.container` inside all 11 physical skeleton files, parallel to how `<main id="main-content" tabindex="-1">` itself is skeleton-owned; (b) wrap each template's own `main` output in `.container` (`src/pages/templates/{standard,listing,case-study}.js`).
  2. **Chosen: (b), template-level.** The composed output is byte-identical either way, since `compose.js` substitutes a template's `main` string exactly where the marker sat. But PF-041's homepage brief (hero, capability-card band, CTA) is exactly the shape that commonly wants full-bleed section backgrounds with only the text centered inside — a global skeleton-level wrapper would force every later full-bleed section to fight it with negative-margin break-out hacks. `pages/templates/` already owns "the shape a page takes" (`docs/SOURCE_ARCHITECTURE.md`); container choice belongs there, not in universal chrome.
  3. `.container--wide`/`--reading` variant selection per template is deferred the same way as (b) above — no real content yet demonstrates the need.
- **Decision — minimum-viewport shell:** `body` (`generic/_document.scss`) becomes a flex column with `min-height: 100dvh` (layered onto the existing `100vh` via `@supports (min-height: 100dvh)`, not a second bare declaration — the latter trips `stylelint-config-standard-scss`'s `declaration-block-no-duplicate-properties`), and `#main-content` (new `objects/_page-shell.scss`) gets `flex: 1`. `min-height`, never `height`, was essential: it guarantees no forced-shrink scenario, so a route whose content genuinely exceeds the viewport simply grows past it, with the footer landing immediately after content rather than being fought to the bottom. Verified with Playwright against the real dev server (not assumed): short routes (e.g. `/privacy/`) pin the footer to the exact viewport bottom at 1440/1920px with zero horizontal overflow, no console errors, and the pre-existing mobile-menu open/close and sticky-desktop-header behavior (both untouched — `nav-toggle.js`, `_site-header.scss`) are unaffected.
- **Consequences:** `src/pages/templates/*.js` each gained one wrapping `<div class="container">`; the 11 skeleton HTML files are untouched. `#main-content` also carries `padding-block: var(--space-section)` — a token defined since PF-020 but unused until now — giving every route consistent vertical rhythm; a future flush-to-header section (e.g. a full-bleed hero) will need a local override at that time. `tests/render.test.mjs` gained a route-loop assertion that every template wraps `main` in `.container`; `scripts/verify-build-output.mjs` gained the equivalent composed-output check; `tests/page-shell-layout.test.mjs` (new) asserts the compiled flex-column/`flex: 1`/`padding-block` cascade. No change to `scripts/validate-routes.mjs` — the skeleton files' shape is unchanged, so its existing checks (including the exact-string skip-link-target check) needed no updates.
- **Revisit condition:** If PF-041 needs a section flush against the header, override `#main-content`'s `padding-block` locally for that page rather than removing the shell-level default. If a future template needs `.container--wide`/`--reading`, adopt it in that template only — do not generalize back into the shell.

## 2026-08-17 — PF-041 homepage: renderer additions, icon-registry layering, reduced-field project cards, featured-card rule

- **Status:** Accepted
- **Context:** PF-041 replaces the `home.js` placeholder with the real Version 1 homepage — nine required sections (§9), six of them composing the already-approved, CSS-only Gate C components (capability cards, project cards, process steps, trust list, engagement options, CTA), each of which shipped deliberately with no JS renderer, explicitly naming PF-041 as the milestone that finally justifies building one. Two sections (Hero, Problems preview) and part of a third (About preview) have no prior component at all — never in PF-032/033/034's scope — and were built new, from already-approved base elements only (`.text-display`, `.text-lead`, `.list--marked`, `.section-header`, `.btn`), not a new visual system.
- **Six new renderer modules**, one per Gate C component (`src/components/{capability-card,project-card,process-steps,trust-list,engagement-options,cta}.js`), each reproducing its documented markup contract exactly as proven in `dev/design-system/index.html` — verified directly against the showcase source and each component's SCSS, not assumed. No component SCSS or approved showcase markup was changed.
- **Icon validation layered through a pure registry, not renderer modules.** An early draft had `content-schema.js` (used by both `render.js` and the Node-only `scripts/validate-routes.mjs`) import icon maps directly from `src/components/*.js` — coupling the pure validation layer to UI-rendering code for no functional reason. **Decision:** a new pure data module, `src/pages/icon-registry.js`, sitting alongside `link-safety.js` (which already plays exactly this role — a closed allowlist consumed by both the schema and the renderers). It exports plain objects only (`TRUST_ICONS`, `CAPABILITY_ICONS`, `CAPABILITY_ACCENTS`, `CARD_ARROW_ICON`) — no markup-building, no `escapeHtml`. `content-schema.js` imports only from this registry; the six renderer modules import the identical registry (not a duplicate) to resolve a validated key to a real Lucide iconNode before calling `icon.js`'s `renderIcon()`.
- **Every icon preflighted against `icon.js`'s real whitelist before selection, not after.** Read each candidate icon's actual source in `node_modules/lucide/dist/esm/icons/*.mjs` (v1.31.0): `PackageCheck`, `Handshake`, `Workflow` (trust icons), `Boxes`, `Globe`, `Code`, `RefreshCw`, `LifeBuoy` (capability icons — same visual pairing already shown to and reviewed by AAA in the Gate C showcase), and `ArrowUpRight` (the fixed capability/project-card arrow, matching the showcase's exact path data). All eight use only tags/attrs `icon.js`'s `ALLOWED_TAGS`/`ALLOWED_ATTRS` already permit (`path`/`rect`/`circle` and `d`/`width`/`height`/`x`/`y`/`rx`/`cx`/`cy`/`r`) — **no change to `icon.js` was needed or made.** Trust-list and capability-card icons now go through `renderIcon()` for the first time in production code (a real new call site, same pattern PF-031 gave the renderer for nav icons); the showcase's hand-authored static SVGs remain unchanged, since the static-HTML showcase has no build step to call a renderer from.
- **Selected work ships reduced fields — title/category/link only — matching the real cards already proven in the showcase, not the full field list §9.6 describes.** No problem/outcome/technology copy is approved for any of the three real projects (PF-003 still blocked) — the same gap PF-033 already hit and deferred; PF-041 was always going to be the renderer/composition milestone, not the content-supply one. Business Workflow System keeps its verbatim "Government/business workflow system" category; FES Challenger and eBarangay omit the field rather than inventing or paraphrasing a category (eBarangay's own approved phrase, "Personal full-stack case study," is a sentence fragment, not a category noun phrase — turning it into one would be new copy). All three real cards use a clean empty `.media-frame` (no `<img>`, no decorative stand-in), the same PF-033 clean-empty-frame precedent.
- **Featured-card rule.** FES Challenger is the featured (larger) card — the first-listed project in both §9.6 and §11 of the requirements doc, a defensible, non-arbitrary rule (the showcase's own featured pick was explicitly arbitrary, "for demonstration only"). Revisitable if AAA prefers a different project featured.
- **About preview copy is drafted, not fabricated.** The paragraph uses only facts §9.9/§10.5 already state as approved (about five years of experience, frontend/backend/database/deployment, direct involvement throughout delivery) — no invented specifics, no photo (none approved). Marked provisional pending AAA's content sign-off, same treatment as the capability-card descriptions.
- **Per-section containers, the shape PF-040 anticipated.** `home.js` is the first template that does not wrap its whole `main` in one `<div class="container">` — each top-level `<section>` (`.hero`, `.home-section`) owns its own inner `.container`, exactly the reason the PF-040 entry above gives for making `.container` template-owned rather than skeleton-owned. `.hero` itself (`src/styles/components/_hero.scss`) is a thin two-column/stacked layout wrapper built only from already-approved base elements and tokens — no new color, pattern, or interaction. The hero sits flush against the header via a scoped `body[data-page='home'] #main-content { padding-block-start: 0; }` override, leaving `padding-block-end` at the shell default — the exact narrow, page-scoped override the PF-040 entry's revisit condition anticipated, not a change to the shell default itself.
- **A real defect found during implementation, not anticipated in planning:** `scripts/verify-build-output.mjs`'s existing per-section-container check (added by the PF-040 entry above) unconditionally required every route's composed output to match `<main id="main-content" tabindex="-1">` immediately followed by `<div class="container">` — true for every route except `home`, whose `main` now opens with `<section class="hero">` instead. Fixed by special-casing `route.key === 'home'` in that script to verify the per-section pattern end-to-end instead (every top-level section opens with its own `.container`); `tests/render.test.mjs`'s equivalent route-loop assertion was split the same way. Found and fixed within PF-041's own scope, not deferred — `npm run verify` would otherwise fail on every build.
- **Test strategy — one shared markup contract, two callers.** Structural assertions previously duplicated ad hoc inside each `tests/*-layout.test.mjs`/`cta-section.test.mjs` file (list parentage, item counts, link/action pairing, decorative-icon a11y, section-level action placement) are extracted into `tests/helpers/component-markup.mjs`, the same extraction pattern `tests/helpers/cascade-resolver.mjs` already established for cascade checks. Both the six existing showcase test files (refactored to call the shared helpers, behavior unchanged, still asserting against the same showcase HTML) and the new `tests/home-render.test.mjs` (asserting against the six renderers' real output, plus escaping and optional-field-omission checks only real output can prove) call the identical helper functions. One new test — capability-card link/arrow pairing — was added to `tests/capability-card-layout.test.mjs` via the shared helper, closing a coverage gap relative to `project-card-layout.test.mjs`'s equivalent existing check; no markup change, test-only.
- **Consequences:** `npm run verify` passes (239/239 tests, lint, format, build, `html-validate`). New: `src/pages/icon-registry.js`, `src/pages/templates/home.js`, `src/components/{capability-card,project-card,process-steps,trust-list,engagement-options,cta}.js`, `src/styles/components/_hero.scss`, `tests/helpers/component-markup.mjs`, `tests/home-render.test.mjs`. Modified: `src/content/pages/home.js` (real content), `src/config/routes.js` (home route now `template: 'home'`), `src/pages/templates/index.js`, `src/pages/content-schema.js` (new `home` branch), `src/styles/main.scss`, `scripts/verify-build-output.mjs` (the deviation above), `tests/render.test.mjs`, `tests/content-schema.test.mjs`, and the six existing `tests/*-layout.test.mjs`/`cta-section.test.mjs` files (shared-helper refactor). `docs/INITIAL_IMPLEMENTATION_TASKS.md` was deliberately left untouched, matching the existing convention (PF-040 did not update its own status line there either) — `docs/DECISION_LOG.md` and, at Gate level, `docs/*_APPROVAL.md` are this project's durable completion records.
- **Revisit condition:** Every string marked provisional above (section eyebrows/headings, capability-card descriptions, the About paragraph, the trust/process link labels, the engagement lede, the `<title>`) needs a separate final production-content review from AAA before this can be treated as approved production copy — Gate C approval covered component structure/behavior only, never marketing copy. When PF-003 supplies real project problem/outcome/technology content, extend `renderProjectCard()`'s already-supported optional `summary`/`tags` fields with real data rather than redesigning the renderer. AAA performs the browser, narrative, responsive, accessibility, and final content review (Gate D) — not completed by this entry.

## 2026-08-17 — PF-041 visual-review correction: `.project-cards--featured-pair`, an empty third grid track at 1440/1920px

- **Status:** Accepted
- **Context:** AAA's Gate D browser review of the real homepage found one concrete defect in Selected Work: at desktop width, the featured FES Challenger card correctly spans the full row, but the two remaining secondary cards occupy only two tracks of a three-column grid, leaving an empty third track — the section reads as incomplete.
- **Root cause, diagnosed against the real compiled CSS, not assumed:** `.project-cards`'s `auto-fit`/`minmax(21rem, 1fr)` grid (PF-033) derives its column count purely from the grid's available width, with no knowledge that `.project-card--featured` spans every column (`grid-column: 1 / -1`). At container widths wide enough for 3 auto-fit tracks — true at 1440/1920px, whether the section uses the default `--container-max` (homepage) or `--container-wide` (showcase): `3 × 21rem + 2 × 2rem gap = 67rem` of required content width comfortably fits under either — the grid resolves to 3 columns. With exactly one featured card removed from the count (it occupies its own full row) and only two secondary cards left to place, default `grid-auto-flow: row` fills columns 1–2 of row 2 and leaves column 3 empty. At 768/1024px this never happens: the same auto-fit math already resolves to 2 columns there on its own (confirmed against `tests/project-card-layout.test.mjs`'s existing column simulation), so the defect is specific to the two widest required review widths.
- **Fix — an explicit component modifier, not a homepage-only selector:** `.project-cards--featured-pair` (`src/styles/components/_project-card.scss`), overriding the same `≥36em` breakpoint with a fixed `grid-template-columns: repeat(2, 1fr)` instead of `auto-fit`/`minmax()`. Deliberately fixed, not a second, narrower `auto-fit`: with exactly two non-featured cards there is no "as many columns as fit" question — a fixed 2-track grid is simply correct at every width from 36em up, including where the default grid's own math would otherwise reach 3. `.project-card`, `.project-card--featured`, and every other existing rule are unchanged.
- **Applied by the renderer from real item composition, not hardcoded per page.** `renderProjectCards()` (`src/components/project-card.js`) gained `needsFeaturedPairLayout(items)`, which adds the modifier class only when the passed items are exactly one `featured: true` plus exactly two non-featured — computed from the actual array on every call, not a homepage flag. A different shape (more secondary cards, or none featured) keeps the default `auto-fit` grid unchanged, which already handles those cases correctly. This means any future caller with the same one-featured-plus-two-secondary shape (e.g. a smaller Work-index listing) gets the correct layout automatically.
- **Showcase updated, since it has the identical defect shape.** The showcase's "three real projects" specimen (Business Workflow System featured, FES Challenger and eBarangay secondary) is the exact same one-featured-plus-two-secondary composition, so it inherited the same broken behavior at 1440/1920px even after Gate C's browser-review matrix recorded "PASS" for project cards at that width — the specific empty-third-track case wasn't exercised during that review. Added the modifier class to that one `<ul>` and a short explanatory sentence in the section's descriptive prose; the three unrelated demo-only specimens (long-title, populated, non-interactive — none of them featured) were not touched.
- **A test-helper gap found and fixed while implementing this:** `tests/helpers/component-markup.mjs`'s `expectSingleList`/`expectItemsHaveListParent` matched a list's class attribute with an exact string (`class="project-cards"`), which no longer matches the real-cards list's now-longer `class="project-cards project-cards--featured-pair"`. Both helpers were updated to tolerate trailing modifier classes (`[^"]*` after the base class), matching the tolerance the card/item matchers already had — a strictly more general fix, not a special case, since it doesn't change behavior for any list that carries no modifier. `tests/project-card-layout.test.mjs`'s own local well-formedness regex had the same gap and was fixed the same way.
- **Consequences:** `npm run verify` passes (243/243 tests). New: two focused compiled-CSS tests in `tests/project-card-layout.test.mjs` (the modifier's fixed `repeat(2, 1fr)` rule; that it can never contain a 3-column/`auto-fit` track at any width). New: three tests in `tests/home-render.test.mjs` — the real homepage list carries the modifier class; `renderProjectCards()`'s detection logic is exercised directly across four compositions (1+2 → applied; 1+3 → not applied; 0 featured → not applied; 2 featured+1 → not applied). Modified: `src/styles/components/_project-card.scss` (new rule block only), `src/components/project-card.js`, `dev/design-system/index.html` (one `<ul>` class + one explanatory paragraph), `tests/helpers/component-markup.mjs`, `tests/project-card-layout.test.mjs`, `tests/home-render.test.mjs`. No change to `.project-card`'s markup, interaction, focus-ring, or forced-colors rules, and no change to any approved copy. `docs/COMPONENT_APPROVAL.md` was not touched — this entry, not that record, is where the correction to Gate C's untested edge case is documented, per this task's own scope.
- **Revisit condition:** If a future homepage/listing composition needs a different fixed secondary-card count (e.g. one featured plus three secondary), add the equivalent modifier and a corresponding `needsX()` detection function then — the current `needsFeaturedPairLayout()` is deliberately narrow to the one real, demonstrated shape, not a generalized N-column system.

## 2026-08-17 — PF-050 Solutions page: dedicated template, `.page-section` extraction, and three truthful-content exceptions

- **Status:** Accepted
- **Context:** PF-050 replaces the `solutions.js` placeholder with the real Version 1 Solutions page: one page, six anchored sections, one per approved capability (§7.1/`home.js`), each explaining a problem, its audience, what AAA can build, the expected benefit, optional evidence, and an inquiry CTA (§10.1). Four material decisions were confirmed with AAA before implementation (via the planning session's clarifying questions), all recommended options accepted.
- **Decision:**
  1. **Shared section-pattern extraction, not duplication.** `home.js`'s per-section container-ownership shape and its private `renderSectionHeader()` helper were the proven fit for six anchored sections. Rather than duplicate them into `solutions.js`, `renderSectionHeader()` was extracted into `src/components/section-header.js` (no behavior change, both templates import the same function), and the shared inter-section spacing/divider wrapper — `.home-section`, previously kept homepage-only inside `components/_hero.scss` pending "a real second use" per CLAUDE.md — was renamed to `.page-section` and moved into `src/styles/objects/_page-section.scss`. A compiled-CSS test (`tests/page-section-layout.test.mjs`) proves the rename carried zero computed-value change: it resolves `.page-section`'s `padding-block` and `.page-section + .page-section`'s divider `border-top` and asserts they match the original `.home-section` declarations exactly, and asserts `.home-section` no longer appears anywhere in the compiled stylesheet. `home.js`'s eight section wrappers were updated to the new class name; its rendered structure (section count, heading hierarchy, list/pairing contracts) is otherwise unchanged, proven by the existing `tests/home-render.test.mjs`/`tests/render.test.mjs` assertions continuing to pass unmodified.
  2. **Project evidence appears only under Workflow & Process Solutions.** Case studies for the other real projects (FES Challenger, eBarangay) are still placeholder content (M6, a later milestone) with no documented category; assigning either to a specific one of the six sections without that data would be an unsupported claim. Business Workflow System is the one project with a confidently-known category match — `home.js` itself already tags it "Government/business workflow system," matching the Workflow & Process Solutions section exactly. The other five sections render no evidence element at all, not an empty one, matching the architecture doc's "omit unavailable optional elements cleanly" rule — proven by `tests/solutions-render.test.mjs` (exactly one `.solution-section__evidence` element sitewide, in the correct section).
  3. **Supporting technologies are omitted for V1, not deferred silently.** §10.1 asks each section to name supporting technologies, but no approved per-capability technology list exists anywhere in the requirements docs — §5's Approved Technology Stack governs the portfolio site's own build (Vite/SCSS/vanilla JS), not what AAA offers clients per solution area, and naming frameworks now would be fabricated. No `technologies` field exists in the content module and no corresponding markup/wrapper exists in the template — verified by a negative test asserting the string "technologies" never appears in the rendered output. Tracked as a follow-up once AAA approves a real per-capability list, not implemented as a placeholder.
  4. **Engagement options remain homepage-only.** §8.3's one-line page-responsibility table lists "engagement options" under Solutions, but §10.1 — the specific, later, detailed Solutions-page spec — never mentions it among its 7 required elements. The more specific, more detailed document is treated as authoritative; no Engagement Options section was added to Solutions, avoiding duplicating homepage content per CLAUDE.md's "avoid page-specific duplication when a proven shared component is appropriate."
  5. **A dedicated `solutions` template, not `standard`.** `standard` wraps `heading` + `paragraphs` + one optional `link` in a single container — it cannot express six anchored, individually-structured sections. `src/pages/templates/solutions.js` follows `home.js`'s per-section shape instead, registered in `src/pages/templates/index.js`; `src/config/routes.js`'s `solutions` route changed `template: 'standard'` → `'solutions'` (path/entry/navKey/content untouched). A matching `checkSolutionsContent` branch was added to `content-schema.js`, alongside a `checkCtaShape` helper factored out and shared with the existing `checkHomeContent` branch (both templates close with the same `{heading, body?, action}` CTA shape).
  6. **First real content in the reserved `pages/` ITCSS layer.** The six sections' problem/audience/build/benefit detail list, section icon badges, and jump navigation have no showcase specimen and are not offered as reusable Gate-C components — they live in `src/styles/pages/_solutions.scss`, this project's first real file in the `pages/` layer (reserved since PF-011, empty until now), registered as the new final `@use` in `main.scss`. This mirrors the precedent PF-041's own Hero/Problems-preview sections set: compose page-specific markup from already-approved base elements and narrowly-scoped hooks, not a new component-library entry, when no second real caller is anticipated. Each section's icon badge reuses the exact same `CAPABILITY_ICONS`/`CAPABILITY_ACCENTS` registry the homepage's capability cards already use — no new icon or accent was added. `/solutions/#<slug>` deep links get the same sticky-header protection `#main-content`'s skip-link target already has (`scroll-margin-top: var(--header-offset)`), scoped to `body[data-page='solutions'] .page-section[id]` rather than a bare `[id]` selector for the same reason `_hero.scss`'s `body[data-page='home']` override is scoped that way — `dev/design-system/index.html` shares this compiled CSS and has no sticky header of its own, so a global rule would incorrectly offset its unrelated in-page anchor specimens. No JavaScript/smooth-scroll interception was added.
  7. **`home.js`'s capability-card links now satisfy §9.5.** "Each card links to the relevant Solutions-page section" was not previously met — every capability item linked to the bare `/solutions/` route. All six `capabilities.items[].link` values in `src/content/pages/home.js` now point at `/solutions/#<matching-slug>`. A dedicated cross-file test (`tests/home-render.test.mjs`) asserts every capability link resolves to the Solutions section with the matching heading, derived from both content modules rather than hardcoded twice, so the two pages' cross-links cannot silently drift apart again.
  8. **A real, previously-unexercised bug found and fixed in shared test tooling, not routed around.** Verifying the section icon badges' accent colors required `resolveProperty()` (`tests/helpers/cascade-resolver.mjs`) to resolve `background-color` for the first time in this project's tests. `::selection` (`generic/_document.scss`, also declaring `background-color`) has no tag or class of its own, so it vacuously matched any tag/class query, and its `::` inflated its measured specificity above a real one-class selector — silently winning the resolution over the real `.solution-section__icon--<accent>` rule. Fixed by excluding any selector containing `::` from matching in `elementMatchesSimpleSelector()`. Checked against every other existing caller of the resolver before applying the fix: none queries a property `::selection` also declares, so no other test's result changed.
- **Consequences:** `npm run verify` passes (`npm run check:routes`, lint, format, 276/276 tests, build, `html-validate`). New: `src/pages/templates/solutions.js`, `src/components/section-header.js`, `src/styles/objects/_page-section.scss`, `src/styles/pages/_solutions.scss`, `tests/solutions-render.test.mjs`, `tests/page-section-layout.test.mjs`, `tests/solutions-page-layout.test.mjs`. Modified: `src/content/pages/solutions.js` (real content), `src/content/pages/home.js` (capability-link anchors), `src/config/routes.js`, `src/pages/templates/index.js`, `src/pages/templates/home.js` (shared-helper import, `.page-section` rename), `src/pages/content-schema.js` (new `solutions` branch, shared `checkCtaShape`), `src/styles/components/_hero.scss` (`.home-section` rules removed), `src/styles/main.scss` (two new `@use`s), `tests/render.test.mjs`, `tests/home-render.test.mjs`, `tests/content-schema.test.mjs`, `tests/helpers/cascade-resolver.mjs` (pseudo-element fix). AAA's desktop and mobile visual review of the rendered page passed, including the provisional copy; `docs/TESTING_AND_QA.md` records which specialized manual checks (forced-colors, 200% zoom, reduced-motion) are still pending explicit verification, not assumed passed by extension.
- **Revisit condition:** When M6 supplies real case-study content for FES Challenger/eBarangay, revisit whether either should gain a section-evidence link, using documented category data rather than a guess. When AAA approves a real per-capability technology list, add the `technologies` field and its markup then — not before. Every provisional string (audience/benefit fields, two of six problem/build fields, all six CTA labels, the page heading/intro/closing CTA) needs the same further-revision openness the homepage's own provisional copy already carries — approved for the visible page, not locked as final wording.

## 2026-08-17 — PF-050 visual-review correction: solution-section icon/heading vertical alignment

- **Status:** Accepted
- **Context:** AAA's visual review of the rendered Solutions page found one defect: each section's icon badge rendered visibly lower than its heading text, despite `.solution-section__heading-row` declaring `align-items: center`.
- **Root cause, diagnosed against the real compiled CSS, not assumed:** `.section-header` is a flex item of `.solution-section__heading-row` here, and a flex item establishes its own block formatting context — a child's margin cannot collapse through it. So `.section-header__heading`'s own `margin-bottom: var(--space-3)` stayed real _inside_ `.section-header`'s auto content height, on top of `.section-header`'s own `margin-bottom: var(--space-6)` sitting outside it. Together that inflated the flex item's margin box well past the icon's fixed 3rem box, so `align-items: center` centered the inflated box rather than the visible text.
- **Fix — scoped margin reset, not a redesign:** `.solution-section__heading-row .section-header { margin: 0; }` and `.solution-section__heading-row .section-header__heading { margin: 0; }` (`src/styles/pages/_solutions.scss`), so the flex item's box exactly matches the heading's real rendered height (one line or several) and centers correctly against the icon. No transform, relative positioning, negative margin, or magic number. `.section-header`/`.section-header__heading` in every other context — including `home.js`'s seven section headers — are untouched, proven by a resolver check that both still resolve to their original margins outside this one scoped selector.
- **A real invariant worth recording:** reusing a shared object (`.section-header`, or any block carrying its own trailing margin) as a flex item elsewhere requires resetting that margin locally wherever it's reused inside a new flex wrapper — a flex item's own block-formatting-context boundary traps descendant margins that would otherwise collapse away in normal block flow, so `align-items: center` ends up centering invisible trailing space, not the visible content, if that margin is left in place.
- **Consequences:** Four new tests in `tests/solutions-page-layout.test.mjs` — `align-items: center` still resolves on the row; the two scoped resets resolve to `margin: 0` (asserted directly against the compiled CSS, not via `resolveProperty()`, since a descendant-combinator selector is outside that resolver's documented scope, matching the precedent `tests/page-section-layout.test.mjs`'s sibling-combinator check already set); `.section-header`/`.section-header__heading` alone still resolve to their original margins. Verified with a deliberate-failure pass (temporarily removing the two new rules correctly failed the two new resolved-value assertions; restoring them passed all 15/15 in the file). `npm run verify` passes (276+ tests, lint, format, build, `html-validate`); `scripts/verify-build-output.mjs`'s per-section-container check (fixed in the prior documentation-audit pass) re-confirmed unaffected — still counts all 9 home sections and all 7 Solutions sections correctly, since this fix is CSS-only and changes no markup. `docs/TESTING_AND_QA.md` now records the defect found, the source correction, and AAA's browser confirmation of the corrected rendering (2026-08-17) — the Solutions page's desktop/mobile visual review is recorded as passed.
- **Revisit condition:** None for this fix itself. If a future page reuses `.section-header` inside another flex wrapper, apply the same scoped reset there rather than assuming `align-items: center` alone is sufficient.

## 2026-08-17 — PF-051 Process page: dedicated template, canonical-order schema enforcement, `renderCta()` heading-level extension, and truthful-support-language corrections

- **Status:** Accepted
- **Context:** PF-051 replaces the `process.js` placeholder with the real Version 1 Process page: the full delivery lifecycle (`Discover → Define → Design → Develop → Test → Deploy → Support`, §10.2), each stage explaining what happens, what's needed from the client, what AAA delivers, how review/approval works, and (all but the last) what happens next, plus a Working Together section covering communication, scope management, revisions, and change requests (deployment readiness and post-launch support are covered once each, inside the Deploy/Support stages themselves, not repeated separately). The plan went through three review passes before implementation — a first draft, then two rounds of AAA-identified corrections — covering four material issues, each resolved as follows.
- **Decision:**
  1. **A dedicated `process` template, not `standard`, same reasoning class as PF-050's Solutions decision.** `standard` cannot express seven ordered, individually-structured stages. `src/pages/templates/process.js` follows `home.js`/`solutions.js`'s per-section-container shape (reusing `.page-section`, `.container`, `renderSectionHeader()`, `renderCta()` unmodified), registered in `src/pages/templates/index.js`; `src/config/routes.js`'s `process` route changed `template: 'standard'` → `'process'` only. A matching `checkProcessContent` branch was added to `content-schema.js`, reusing the existing `checkSectionHeader`/`checkCtaShape`/`checkNonEmptyString`/`checkExactArray` helpers.
  2. **Canonical stage order is enforced positionally, with a single exported source of truth.** `content-schema.js` exports `PROCESS_STAGE_NAMES` (`['Discover', 'Define', 'Design', 'Develop', 'Test', 'Deploy', 'Support']`) — the one place the sequence is spelled out. `checkProcessContent()` requires `stages.items[i].heading === PROCESS_STAGE_NAMES[i]` at that exact index, not membership in an unordered set (unlike Solutions' `SOLUTION_SECTION_IDS`, since sequence is the entire point of a lifecycle). `tests/content-schema.test.mjs` and `tests/process-render.test.mjs` both import the same constant rather than re-typing it, so schema and tests cannot silently drift apart. A first draft of this plan validated `next` with a plain, globally-optional truthiness check; AAA correctly identified this as too weak for §10.2 and required the stricter form below.
  3. **The terminal stage's `next` is forbidden by property presence (`Object.hasOwn`), not by value.** Support (the last stage) must not declare a `next` key at all — `next: 'text'`, `next: null`, `next: undefined` (a real own property with an `undefined` value — a plain `!= null` check would wrongly treat this as "absent"), and `next: ''` are all rejected identically, via `hasOwnNextProperty(stage) { return stage != null && typeof stage === 'object' && Object.hasOwn(stage, 'next'); }`. Every non-terminal stage requires the opposite: `Object.hasOwn` true **and** a non-empty string. `src/content/pages/process.js`'s Support object simply never writes a `next:` line. The template renderer (`renderStage()`) still uses a plain `if (stage.next)` truthiness check when deciding whether to push the "What Happens Next" fact pair — this remains correct because `src/pages/render.js` re-validates content through `checkProcessContent()` before any template runs, so only schema-valid content (where presence and non-empty value already coincide) ever reaches the renderer; the stricter check is a schema-layer concern, not a template-layer one.
  4. **No absolute or indefinite promises.** Two rounds of copy correction, both applied before implementation: (a) the meta description's "...and ongoing support" → "...and agreed post-launch support"; (b) the intro paragraph's "...so you always know..." → "...so you can see..."; (c) all four of Support's own facts rewritten to describe an agreed, project-scoped arrangement rather than automatic/indefinite monitoring, a fixed check-in cadence, or permanent availability — no package, price, response time, or SLA introduced as a substitute; (d) Test's "What I Deliver" softened from "issues identified and fixed" (implying a zero-defect guarantee) to "issues found during testing addressed"; (e) Deploy's "What Happens Next" changed from "ongoing support" to "the Support stage" (a stage-name reference, not a standing promise, ahead of Support's own now-correctly-scoped language). No timelines, prices, guarantees, packages, or SLAs appear anywhere on the page.
  5. **The Stages section heading was shortened, not left as a repeated arrow-delimited diagram.** A first draft used the literal `Discover → Define → Design → Develop → Test → Deploy → Support` diagram text as the section's `<h2>` — redundant with the same sequence already appearing in the intro paragraph and as the seven real stage headings, and liable to wrap awkwardly at 320–375px around the arrow glyphs. Replaced with "A Clear, Seven-Stage Process," paraphrasing `home.js`'s existing, already-approved `process.heading` pattern ("A Clear, Four-Stage Process," §9.7) rather than inventing unrelated phrasing.
  6. **Desktop information layout: a mobile-stack/desktop-grid `.process-facts` pattern, not a fixed 68ch column on a full-width page.** Each stage's facts (and the Working Together section's two grouped facts) render as plain stacked block flow below `spacing.$bp-md` (48em/768px — the same already-defined, already-consumed named breakpoint `_site-header.scss`/`_site-nav.scss` use, not a new literal), then switch to a 2-column term/detail CSS Grid at and above it via Grid's implicit row auto-placement (`grid-template-columns: minmax(12rem, 16rem) 1fr`) — no wrapper markup per pair, so DOM/reading/tab order is unchanged at every width; only visual placement splits into two columns. Because each stage owns its own separate `<dl>` nested inside its own `<li>`, the grid can never place two different stages' content side by side. Lives in `src/styles/pages/_process.scss`, this project's second real file in the `pages/` ITCSS layer (after PF-050's `_solutions.scss`), registered as the next `@use` in `main.scss`.
  7. **`.process-detail__heading-row` was audited against PF-050's own icon/heading margin-trap defect and avoids it by construction.** That defect came from a flex item (`.section-header`) carrying its own `margin-bottom` while its child heading carried a second, separately-trapped one (a flex item's block-formatting context prevents descendant margins from collapsing away). `.process-detail__heading-row` never wraps `.section-header` — the per-stage `<h3>` is the row's direct flex child, with `margin: 0` declared explicitly, so there is only one box with one (already-zero) margin. Proven by `tests/process-page-layout.test.mjs` both positively (`align-items: center` resolves, `h3 margin: 0` resolves) and negatively (`.process-detail__heading-row .section-header` asserted to never appear in the compiled stylesheet at all).
  8. **Closing CTA heading level corrected via a `renderCta()` extension, not a fork.** The Process page's three top-level sections (Stages, Working Together, closing CTA) are document-outline siblings; a first draft rendered the closing CTA with `renderCta()`'s fixed `<h3>`, leaving it orphaned a level below its `<h2>` siblings with no intervening heading of its own — AAA correctly flagged this as a real skipped-level defect, not "no skipped levels" as the draft had claimed. Fixed by adding one new optional parameter to `src/components/cta.js`'s `renderCta()`: `headingLevel`, validated against a closed `Set([2, 3])`, default `3` (every prior behavior unchanged). `process.js`'s own closing-CTA call site passes `headingLevel: 2`; `home.js`/`solutions.js` are untouched and keep rendering `<h3 class="cta__heading">`. Any value outside `{2, 3}` throws before any HTML is built — the tag string (`` `h${headingLevel}` ``) is only ever computed after validation passes, so no input can reach the interpolation unvalidated. No `_cta.scss` change was needed: `.cta__heading` already declared `font-size: var(--font-size-h2)` explicitly, independent of tag (the same pattern `.text-display` already uses for `<h1>`), so the tag promotion is a pure markup/semantics fix with zero visual change — confirmed by reading the file before deciding, not assumed.
  9. **`.process-facts` is one shared pattern, reused by two different sections.** Both a stage's own facts and Working Together's two grouped facts render through the same `renderFacts()` template helper and the same `.process-facts`/`.process-facts__term`/`.process-facts__detail` markup/CSS — avoids two near-identical `<dl>` patterns for what is structurally the same "term explains detail" shape.
- **Consequences:** `npm run verify` passes (`npm run check:routes`, lint, format, 320/320 tests — up from 280, 40 new — build, `html-validate`). New: `src/pages/templates/process.js`, `src/styles/pages/_process.scss`, `tests/process-render.test.mjs`, `tests/process-page-layout.test.mjs`, `tests/cta-render.test.mjs`. Modified: `src/content/pages/process.js` (real content), `src/components/cta.js` (`headingLevel` parameter), `src/config/routes.js`, `src/pages/templates/index.js`, `src/pages/content-schema.js` (`PROCESS_STAGE_NAMES` export, `checkProcessContent`), `src/styles/main.scss` (one new `@use`), `scripts/verify-build-output.mjs` (per-section-container check extended to `process`), `tests/render.test.mjs` (`PER_SECTION_CONTAINER_TEMPLATES` extended), `tests/content-schema.test.mjs`, `docs/SOURCE_ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`. Not modified, confirmed rather than assumed: `src/styles/components/_cta.scss` (zero visual change from the heading-level fix); `tests/home-render.test.mjs`/`tests/solutions-render.test.mjs` (existing `<h3 class="cta__heading">` assertions pass unmodified, proving every prior `renderCta()` caller's default behavior is genuinely unchanged). Every deliberate-failure pass was run and confirmed correct before being restored: canonical-order mismatch (2 tests), both `next`-invariant directions (Support rejecting a non-empty string/`null`/`undefined`/`''`, 4 tests; a non-terminal stage's missing `next`, 1 test), `renderCta()`'s heading-level validation (3 throw tests), and three SCSS resets (`.process-detail`'s `max-width: none`, `.process-detail__stage`'s `margin: 0`, the desktop `.process-facts__detail` margin reset) — each mutation applied, its matching test(s) confirmed to fail, then reverted; `grep`-verified afterward that no mutation marker (`false &&`) was left in any source file. AAA's browser review of the rendered page (all six required widths, keyboard-only pass, forced-colors, reduced-motion, 200% zoom, and explicit confirmation that the closing CTA's `<h2>` reads visually identical to the prior `<h3>` pages') is recorded as pending in `docs/TESTING_AND_QA.md`, not assumed passed by extension of the automated suite.
- **Revisit condition:** Every stage's five facts, both Working Together items, and the closing CTA's heading/body remain provisional pending AAA's content sign-off — the same further-revision openness the homepage's and Solutions page's own provisional copy already carry. If a future page ever needs a `renderCta()` heading level outside `{2, 3}`, extend the `Set` deliberately (with a stated reason for the new level) rather than loosening the validation to accept arbitrary values.

## 2026-08-17 — PF-052 Work index: template rename, dual heading-level accessibility correction, and a growth-safe exact-set-equality route check

- **Status:** Accepted
- **Context:** PF-052 replaces the `work/index.js` placeholder (a plain link list through the generic `listing` template) with the real Version 1 Work index: the three approved real projects rendered as real `.project-card`s, reusing the exact Gate-C-approved renderer/CSS PF-041 already gave a first production caller (the homepage's Selected Work section), plus a closing `.cta` panel. Per §10.3 and the task's own scope line ("Add filtering only if the final project count demonstrates a genuine need"), this ships as one flat, unfiltered grid, not the 6-category breakdown §10.3 describes for a mature list — 3 real projects doesn't meet that bar, the same V1 simplification precedent PF-050 set for Solutions. The plan went through two review rounds before implementation, the second explicitly widening scope from "flag and defer" to "fix now" on one item (decision 2 below).
- **Decision:**
  1. **Template renamed `listing` → `work`, file deleted not deprecated.** `listing.js` had exactly one caller ever (confirmed by grep across the whole repo) and PF-052 changes its content shape entirely. Kept the generic name would have misrepresented it as reusable when it never was. Renamed to `work`, matching `home`/`solutions`/`process`'s established single-purpose naming convention (template key = route key = content key); `src/pages/templates/listing.js` deleted, `src/pages/templates/work.js` created; `templates/index.js`'s `listing:` entry became `work:`; `routes.js`'s `work` route's `template` became `'work'`.
  2. **Both `renderProjectCard()`'s and `renderCapabilityCard()`'s heading levels corrected together, in this same task — not deferred.** Diagnosed while building this page: both renderers rendered an unconditional `<h4>`, while both are nested directly under a page-level `<h2>` on every real caller (`home.js`'s Capabilities and Projects sections; `work.js`'s new Projects section) — a skipped heading level, and a **real defect on the already-shipped homepage**, not something this task introduced. An initial draft fixed only `renderProjectCard()` (in scope for Work) and explicitly flagged `renderCapabilityCard()`'s identical defect as a known, out-of-scope follow-up; on review, the follow-up was pulled into this same task rather than left open, since the fix pattern, risk, and verification method are identical for both. Both gained the identical closed-set `headingLevel` parameter PF-051 proved on `renderCta()` (`Set([3, 4])`, default `4` unchanged for every caller that doesn't opt in — the Gate-C showcase's static markup keeps its exact prior contract). `home.js` now explicitly requests `headingLevel: 3` on both its calls; `work.js` requests `3` on its one call. Any value outside `{3, 4}` throws before any HTML is built on either renderer, proven by new `tests/project-card-render.test.mjs`/`tests/capability-card-render.test.mjs` (default-`h4`, explicit-`h3`, and three reject cases each). **Zero visual change on either component** — verified directly against source: `.capability-card__heading` already declared `font-size: var(--font-size-h3)` (styled at H3 size while rendered as `<h4>`); `.project-card__heading`'s desktop featured-card override is class-scoped, not tag-scoped. Framed explicitly as an accessibility correction to both components, not a redesign of either.
  3. **Schema: `checkProjectCardItem` extracted for its second real caller**, reused by `checkHomeContent`'s existing `projects` branch (refactored, identical resulting problem messages — proven by a dedicated refactor-safety test — its own `checkExactArray(..., 3, ...)`/"exactly one featured" rules unchanged) and the new `checkWorkContent`. Work's `projects.items` is validated as a non-empty array, not a fixed count of 3 — Work's job is "every real project," a count tied to how many case studies exist, not an editorial constant like Home's curated preview — and "at most one featured," not Home's "exactly one," for the same forward-looking reason. Completeness is deliberately not this schema's job (decision 4).
  4. **Cross-file route completeness moved to a new, small, pure module — `scripts/work-project-routes.mjs` — not `content-schema.js`.** A first draft placed `findWorkProjectRouteProblems()` inside `content-schema.js`; on review, reconsidered: no import cycle was ever actually at risk (the function takes plain arrays, imports neither `routes.js` nor `contentByKey`), but `content-schema.js` is documented as per-route content-shape validation reused by `render.js` at request time, which never has the full route-manifest context completeness-checking needs — `docs/SOURCE_ARCHITECTURE.md`'s "Validation, at three points" section already scopes this exact class of check to the **pre-flight** validator. `scripts/validate-routes.mjs` itself can't safely export functions for testing, since its top level runs its whole check sequence (including a possible `process.exit(1)`) unconditionally on import — its own header comment states this is deliberate. The new module has no top-level side effects, so it's safe to import directly from a test. `checkWorkProjectLinks()` (renamed from `checkWorkListingLinks()`) stays exactly where it lived in `validate-routes.mjs`, now a thin wrapper importing and calling the new pure function with real data. The check itself was also strengthened from "every Work link matches _some_ case-study route" to **exact set equality**: every registered case-study route must appear exactly once — no missing, duplicate, or unregistered/extra destination — derived dynamically from whatever route list is passed in, never a hardcoded count, so it stays correct as PF-060–063 registers more case studies.
  5. **Featured-card behavior reused, not reimplemented.** Work's real composition (one featured, two secondary) is identical in shape to `home.js`'s own, so `renderProjectCards()`'s existing `needsFeaturedPairLayout()` (PF-041) applies `.project-cards--featured-pair` automatically — zero new detection logic or page-specific CSS. No new page-specific SCSS file exists for this page at all; every visual element is already-approved, already-tested component/object CSS.
  6. **No visitor-facing commentary about deferred categorization, project-count growth, or task numbers.** The page's copy (user-approved-as-provisional for this task) states only what's true and useful to a visitor; the V1-simplification reasoning above lives in this log and the plan, not on the rendered page.
- **Consequences:** `npm run verify` passes (`npm run check:routes`, lint, format, 355/355 tests — up from 320, 35 net new — build, `html-validate`). New: `src/pages/templates/work.js`, `scripts/work-project-routes.mjs`, `tests/work-render.test.mjs`, `tests/project-card-render.test.mjs`, `tests/capability-card-render.test.mjs`, `tests/work-project-routes.test.mjs`. Deleted: `src/pages/templates/listing.js`. Modified: `src/content/pages/work/index.js` (real content), `src/config/routes.js`, `src/pages/templates/index.js`, `src/components/project-card.js`/`capability-card.js` (`headingLevel` parameter), `src/pages/templates/home.js` (both calls now pass `headingLevel: 3`), `src/pages/content-schema.js` (`checkProjectCardItem`, `checkWorkContent`; `checkHomeContent`'s `projects` branch refactored), `scripts/validate-routes.mjs` (`checkWorkProjectLinks`, now importing the new module), `scripts/verify-build-output.mjs` (per-section-container check extended to `work`), `tests/render.test.mjs` (`PER_SECTION_CONTAINER_TEMPLATES` extended), `tests/content-schema.test.mjs`, `tests/home-render.test.mjs` (new H3/zero-H4 assertions for both card types), `docs/SOURCE_ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`. Not modified, confirmed rather than assumed: `src/styles/components/_project-card.scss`/`_capability-card.scss` (zero visual change); `tests/project-card-layout.test.mjs`/`tests/capability-card-layout.test.mjs` (all existing class-based assertions remain valid); `dev/design-system/index.html` (showcase keeps the default `headingLevel: 4` on both components); all three case-study content files/routes. Every deliberate-failure pass was run and confirmed correct before being restored: both renderers' heading-level validation (3 throw tests each, 6 total), the schema's "at most one featured" rule, and a real end-to-end check (temporarily pointing the real eBarangay card at a nonexistent path, confirming `node scripts/validate-routes.mjs` failed with both the expected "missing" and "unregistered" messages, then restoring it) — `grep`-verified afterward that no mutation marker (`false &&`) or temporary path (`TEMP-MUTATED`) was left in any source file.
- **Revisit condition:** The page-level `title`/`description`/`heading`/intro/section-header/closing-CTA strings remain provisional pending AAA's content sign-off, the same further-revision openness every other dedicated page's provisional copy carries. When PF-060–063 supplies real case-study content, extend `checkProjectCardItem`'s already-supported optional `summary`/`tags` fields with real data rather than redesigning the schema or renderer, and add the new project as a fourth `projects.items` entry — `checkWorkContent`'s non-fixed-count schema and `findWorkProjectRouteProblems`'s exact-set-equality check both already handle that growth with no further edit.

## 2026-08-19 — PF-053/054/055 supporting pages: real contact values, About's `cta` extension, a dedicated `contact` template, and a dedicated `not-found` template

- **Status:** Accepted
- **Context:** This combined milestone unblocks PF-053 ("Blocked by biography, portrait, résumé facts, and links") and PF-054 ("Blocked by final public contact details") and implements PF-055 ("Ready after global shell"). AAA resolved both blockers directly: About ships using only the fact set already approved in `DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md` §9.9/§10.5 (no photo, no résumé, no invented narrative, no industries/working-style specifics), and Contact launches with three verified real values (email, GitHub, LinkedIn), no résumé, no form. All four routes, content stubs, and template/schema wiring already existed end-to-end on the generic `standard` template with placeholder copy — this was a content-and-shape task, not a scaffolding task. A first draft of `scripts/verify-build-output.mjs`'s contact-link check asserted "exactly once in the whole document," which was caught in review as wrong for the `contact` route specifically — that route legitimately renders each link twice (once in `<main>`, once in `<footer>`) — and was corrected to two region-scoped checks before implementation began.
- **Decision:**
  1. **Real contact values centralized in `src/config/site.js`, replacing the three `null` placeholders**: `contactEmail: 'website@aaabrenica.site'`, `social.github: 'https://github.com/Junnn1412'`, `social.linkedin: 'https://www.linkedin.com/in/antonio-iii-abrenica-b17b181a7'`. All three verified to pass `isSafeEmail`/`isSafeExternalUrl` before being written. `resumePath` stays `null` — no résumé asset exists yet; deferred to a later milestone, not by placeholder oversight. `src/components/partials/footer.js` needed no code change — it already read and safety-gated these fields.
  2. **`scripts/verify-build-output.mjs`'s contact-link check replaced with two region-scoped invariants, not one whole-document count.** The prior PF-011-era check asserted `mailto:`/`github.com`/`linkedin.com` never appear anywhere (placeholder-era). A naive "exactly once in the whole document" replacement would itself be wrong for `contact`, where each link legitimately appears twice. Instead: (a) every route's `<footer>` region contains each of the three real links exactly once; (b) the `contact` route's `<main>` region additionally contains each exactly once. Built dynamically from the real `site` import, not hardcoded literals, so the check can't silently drift from `site.js`.
  3. **About (PF-053): `standard` template extended with one new universal optional field, `content.cta`, not a dedicated `about` template.** The approved fact set is thin — no structured multi-section content is approved for this milestone — so a dedicated template would be over-engineering. `content.cta` follows the exact precedent `content.link` already sets: validated unconditionally in `validateContent()` (not gated by `route.template`), reusing the existing `checkCtaShape()` helper and `renderCta()` component. Rendered at `headingLevel: 2` (a sibling of the page's own `<h1>`, matching Process's closing-CTA precedent). About's real paragraphs restate the approved facts (~5 years experience, frontend/backend/database/deployment, direct end-to-end involvement, business-problem-first approach) in wording distinct from `home.js`'s existing About-preview sentence — required by §8.3's "must not repeat identical long-form content," confirmed by a dedicated regression test. No photo, no résumé link, no named industries/working-style specifics, no named frameworks beyond the approved category words.
  4. **Contact (PF-054): dedicated `template: 'contact'`, not a `standard` extension.** The page's defining element — the three contact destinations — is sourced from `site`, not `content`, mirroring `footer.js`'s existing `renderContactLink`/`renderSocialLink` pattern (site-singleton facts, one source of truth, no second copy to keep in sync inside `contact.js`). Because the list is site-sourced, no new schema branch was needed — `contact.js`'s content only needs the universal base fields. New `src/styles/pages/_contact.scss` was added (the one genuinely new structural hook this milestone required — no existing component fits "N independent clickable destinations"; `.trust-list` always pairs icon+heading+one trailing link, a different shape) resetting the generic `ul`/`li` prose rules, proven via `tests/contact-page-layout.test.mjs`'s resolved-cascade checks with a deliberate-failure pass run and reverted before acceptance. No résumé, no contact form — both deferred by explicit product decision; the requirements doc's own "a direct email link is the launch-safe fallback" (§10.6) and "form infrastructure must not delay Version 1" (task scope) support this directly.
  5. **Privacy (PF-054): content-only change, still `template: 'standard'`.** Every sentence is phrased as an implementation-specific statement about what the current site code verifiably does (no analytics/tracking code, no nonessential cookies, no contact form, self-hosted fonts not requested from Google Fonts), not a categorical or platform-wide claim — deliberately excluding any hosting/server-log, Cloudflare-processing, data-retention, or legal-compliance statement, since none of that is configured or verified (`site.baseUrl` is still `null`; Cloudflare Pages connects in PF-072). `description` stays omitted, preserving the existing `site.defaultDescription`-fallback test unmodified.
  6. **404 (PF-055): dedicated `template: 'not-found'`, not a `standard.links` array extension.** `standard` is meant to stay thin (already gaining one optional field in decision 3); a second, differently-shaped optional-link mechanism would push it the wrong direction. The project's established pattern — every time content has genuinely diverged, a dedicated template — applies here: a fixed 3-link recovery set (Home/Work/Contact) is exactly that kind of divergence. New `checkNotFoundContent()` uses `checkExactArray(..., 3, ...)`, a deliberately fixed-count rule (a curated navigational set, not a growing collection, unlike Work's non-fixed-count `projects.items`). No search box, no `<meta http-equiv="refresh">`, no client-side redirect — a design choice (either could mask a real broken link), not a documented requirement being satisfied. No new SCSS — `.not-found__links` renders as a plain list styled by the existing generic `ul`/`li` rules; AAA's browser review will confirm whether that default bulleted presentation is acceptable or whether a small page-specific reset is warranted later.
  7. **`dist/404.html` vs. `vite dev`/`vite preview` vs. Cloudflare Pages' own custom-404 convention — three distinct things, this task owns only the first.** `dist/404.html` already flowed through `vite.config.js`'s `rollupOptions.input` (derived from `routes.js`) before this task; only its content changed. `vite dev`'s own fallback for unknown routes is not equivalent to a real static host's behavior and was not used as a manual-QA proxy. `npm run preview` with `/404.html` visited explicitly by path proves the page's own content/assets/shell render correctly from the real build output, but does **not** prove that an arbitrary unmatched path automatically falls back to this file — that host-level rewrite convention belongs to Cloudflare Pages, configured and verified only in **PF-072**. No Cloudflare-specific config (`_redirects`, headers) was added here.
- **Consequences:** `npm run verify` passes (`npm run check:routes`, lint, format, 388/388 tests — up from 355, 33 net new — build, `html-validate`). New: `src/pages/templates/contact.js`, `src/pages/templates/not-found.js`, `src/styles/pages/_contact.scss`, `tests/standard-render.test.mjs`, `tests/contact-render.test.mjs`, `tests/contact-page-layout.test.mjs`, `tests/not-found-render.test.mjs`. Modified: `src/config/site.js` (real contact values), `scripts/verify-build-output.mjs` (region-scoped contact-link checks), `src/config/routes.js` (`contact`/`not-found` template fields), `src/pages/templates/index.js` (both new templates registered), `src/pages/templates/standard.js` (optional `cta`), `src/pages/content-schema.js` (universal `content.cta` check; `checkNotFoundContent`), `src/content/pages/{about,contact,privacy,not-found}.js` (real content), `src/styles/main.scss` (`@use 'pages/contact';`), `tests/footer.test.mjs` (real-site-config test), `tests/content-schema.test.mjs`, `tests/render.test.mjs` (new About/regression tests added; the stale `renderRoute("not-found") renders its optional link` test removed, since `not-found.js` no longer has a `content.link` field). Every deliberate-failure pass was run and confirmed correct before being restored: `.contact-methods`'s SCSS reset (all 3 cascade-resolver tests failed with the reset removed, then passed again once restored) — `git diff` afterward confirmed no leftover mutation.
- **Revisit condition:** About's paragraphs and closing-CTA copy remain provisional pending AAA's final content sign-off, the same openness every other dedicated page's provisional copy carries — when approved, also add `resumePath` and a résumé download action. Contact's résumé link and any contact form remain deferred until AAA approves a submission backend; adding either later is a content/config change, not a template rewrite. Privacy's notice must be revisited the moment analytics, cookies, a contact form, or a form-processing service are actually added — and again once PF-072 connects real hosting, to add a truthful, verified hosting/server-log statement (not before). PF-072 verifies `dist/404.html` against the real Cloudflare Pages custom-404 convention; no source change is expected there, verification only. If browser review finds `.not-found__links`' default bulleted presentation needs adjusting, add a small `src/styles/pages/_not-found.scss` then, following the same reset pattern `_contact.scss` already established.

## 2026-08-19 — PF-055 visual-review correction: 404 recovery links gain page-scoped SCSS

- **Status:** Accepted
- **Context:** AAA reviewed desktop/mobile screenshots of About and Contact and structurally approved both. One defect remained on 404: `.not-found__links` (three recovery links) still rendered under the generic `ul`/`li` prose rules — bulleted, indented, no visual treatment — and read as unfinished relative to the rest of the design system. The prior entry's decision 6 explicitly deferred this ("AAA's browser review will confirm whether that default bulleted presentation is acceptable"); it wasn't.
- **Decision:**
  1. **New `src/styles/pages/_not-found.scss`, registered in `main.scss` after `pages/contact`.** Presents the three links as a responsive `flex-wrap` group of button-like chips reusing `.btn--secondary`'s already contrast-verified border/text token pairing (`--color-border-interactive`/`--color-accent-text`, PF-021) rather than inventing a new color combination — not a new shared component, since only this one page's markup uses these class names. Resets the same generic `ul`/`li` prose rules (`max-width`, `margin`, `padding`, `list-style`) that `.process-steps`/`.trust-list`/`.engagement-options`/`.contact-methods` already needed the identical fix for. Relies on the existing global `:focus-visible` ring (`generic/_document.scss`) rather than redeclaring focus styling. `prefers-reduced-motion`'s existing global rule already disables the one `background-color` transition added, so no separate reduced-motion handling was needed.
  2. **`src/pages/templates/not-found.js` gained two explicit BEM classes — `.not-found__link` (anchor) and `.not-found__link-item` (li) — not a `.not-found__links li` descendant selector.** This is a markup/styling-hook change, not a content change (`src/content/pages/not-found.js`'s copy/links data is untouched). Every other styled list in this codebase (`.contact-methods__item`, `.trust-list__item`, `.process-detail__stage`) already puts an explicit class on the exact node being styled rather than a bare descendant selector — followed here for the same reason discovered directly while writing the layout test: `tests/helpers/cascade-resolver.mjs` only matches single simple/compound selectors, and a `.not-found__links li` descendant selector gets misparsed as a compound selector on class `not-found__links` alone — which not only fails to prove the `<li>` reset but pollutes resolution of the real `.not-found__links` block rule too (confirmed directly: it made the `<ul>`'s own margin test report the `<li>` rule's `0` instead of the block rule's real value, before this fix). The anchor remains the only interactive/clickable element — the `<li>` carries no click handling, hover, or focus styling of its own.
  3. **Layout proven via the resolved-cascade method**, not presence-only checks: new `tests/not-found-page-layout.test.mjs` (4 tests — `<ul>` `max-width`/`margin`, `<li>` `margin`, anchor `border`/`border-radius`/`background-color`/`text-decoration`). A deliberate-failure pass was run before acceptance: the three reset declarations were temporarily removed, all 3 corresponding tests failed with the real inherited generic-rule values (confirming they were actually testing something), then restored — `git diff`-equivalent inspection afterward confirmed the file matches its intended final state with no leftover mutation.
  4. **`tests/not-found-render.test.mjs`'s existing markup-matching regexes updated** to include the two new classes (`<li class="not-found__link-item"><a class="not-found__link" href="...">`) — no assertions changed in intent, only the literal markup they match against.
- **Consequences:** `npm run verify` passes (392/392 tests — up from 388, 4 net new). New: `src/styles/pages/_not-found.scss`, `tests/not-found-page-layout.test.mjs`. Modified: `src/pages/templates/not-found.js` (two BEM classes added, no content/data change), `src/styles/main.scss` (`@use 'pages/not-found';`), `tests/not-found-render.test.mjs` (markup-matching regexes updated for the new classes). Supersedes the prior entry's decision 6 statement that 404 needed no new page-specific SCSS — About and Contact's "no new SCSS" and "one new SCSS file" outcomes from that same entry are unaffected.
- **Revisit condition:** None outstanding for this specific correction — AAA completed the desktop and mobile browser review on 2026-08-19 and confirmed the corrected presentation: the three links form a clean responsive group with no visible overflow (`docs/TESTING_AND_QA.md`). Keyboard-only, forced-colors, `prefers-reduced-motion`, the full six-width sweep, and Cloudflare's arbitrary-unmatched-path fallback (PF-072) remain open — the same shared pending-checks list the PF-053/054/055 entry above carries, not specific to this correction.

## 2026-08-17 — PF-060 FES Challenger case study: real case-study schema/template, curated content, and a region-scoped external-link invariant

- **Status:** Accepted
- **Context:** PF-060 is explicitly marked "Blocked by approved public assets and verified project narrative" in `docs/INITIAL_IMPLEMENTATION_TASKS.md`. Before this task, no fact or asset for FES Challenger existed anywhere in the repository beyond the project name itself (already live on Home/Work since PF-041/052) — `docs/DECISION_LOG.md`'s PF-033/041 entries document this gap explicitly, and no `docs/CONTENT_INVENTORY.md` existed. AAA supplied a written fact/decision manifest (verified business context, problem, goals, role, delivered scope, verified technology stack, implementation decisions, qualitative-only outcomes, the approved public URL) and confirmed a supplied logo image as the correct, approved asset. This resolves the FES Challenger sub-set of PF-003/PF-060's blocker for narrative and logo; screenshots have not yet been supplied, so the gallery ships empty. **PF-003 itself remains globally Blocked** — only its FES Challenger sub-group is resolved by this task; the anonymized workflow-system and eBarangay sub-groups (PF-061/062) are untouched.
- **Decision:**
  1. **One shared `case-study` template/schema, extended with named, independently optional sections — not a generic "sections[]" DSL.** `DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md` §10.4 itself frames case-study sections as "where applicable," so optional-by-design is the approved shape, not an invention. Matches this project's established precedent (PF-032/033/034: build the concrete shape a real first caller needs; generalize only once a second real caller demonstrates it) rather than pre-building abstraction PF-061/062 haven't yet proven they need. `src/pages/content-schema.js` gained `checkCaseStudyContent()` (replacing the prior bare `backLink`-only branch, backLink behavior unchanged) validating ten independently optional top-level fields: `logo`, `client`, `problem`, `role`, `solution`, `technologyStack`, `decisions`, `outcomes`, `gallery`, `externalLink`. Absent is always valid; present gets its own required sub-fields checked (e.g. `role` present requires both `role.body` and `role.responsibilities`; `solution.features` stays optional even when `solution` is present). `goals` and `discovery` were deliberately **not** added as separate fields — once FES's real copy was curated (decision 3 below), neither had a real caller of its own; their content lives as prose inside `problem`/`role` instead. Keeping an unused field would itself be the speculative generalization `CLAUDE.md` warns against.
  2. **`src/pages/templates/case-study.js` rewritten** to render one `<section class="page-section"><div class="container">` per present named field (reusing `renderSectionHeader()`, the same per-section-container shape `solutions.js`/`work.js` already establish), a decorative logo beside the `<h1>` when `content.logo` is present, an external-link button under the intro when `content.externalLink` is present, and the Gallery section only when `content.gallery.items` is non-empty — never an empty heading, frame, or "coming soon" placeholder for any absent section. `tests/render.test.mjs`'s `PER_SECTION_CONTAINER_TEMPLATES` and `scripts/verify-build-output.mjs`'s matching per-route-key check were both extended to include case-study routes — but with a case-study-specific relaxation: unlike home/solutions/process/work (which always render at least one fixed, required section), a case-study route with **zero** approved sections yet (e.g. Business Workflow System/eBarangay's still-placeholder content) is a legitimate, honest state, not a bug, so `verify-build-output.mjs`'s `sectionCount === 0` check is now gated behind `route.template !== 'case-study'`.
  3. **FES's real content is curated, not a per-fact dump of the manifest.** Each verified fact appears exactly once, in the section it fits best — an earlier draft repeated the theme/responsive/deployment/SEO/cookie-access facts across a Goals list, Solution features, Decisions, and Outcomes; the shipped version drops the standalone Goals section (folded into `problem.body`'s second sentence), trims the 11-item manifest responsibility list to 6 grouped `role.responsibilities` bullets, keeps `solution.body` to one sentence naming only the delivered areas not already covered under Role, and trims "decisions" to the 3 items that are genuinely decisions with a stated rationale. The full uncurated fact list (all 11 responsibilities, every manifest decision, etc.) is kept in the new `docs/CONTENT_INVENTORY.md` for traceability. No numeric or business-performance outcome is claimed anywhere — none is verified; `outcomes.items` are phrased as delivered capabilities only. Every string is either quoted/lightly-combined AAA-supplied fact or directly derived wording AAA explicitly reviewed and corrected before implementation (exact edits: "The Challenge" reworded to avoid restating the Solution section, "What I Built" rewritten, "Key Decisions" corrected to remove a "generic page builder" comparison, Outcomes reduced from 5 to 4 items, "with a controlled" changed to "supported by a controlled" in the card summary/meta description).
  4. **External-link safety: a closed, per-route-content-key host allowlist, not an open "any HTTPS URL" check.** `src/pages/link-safety.js` gained `isSafeCaseStudyExternalUrl(url, contentKey)` and a private `CASE_STUDY_EXTERNAL_HOSTS` map (`{'work-fes-challenger': ['feschallenger.com', 'www.feschallenger.com']}`), keyed by `route.content` — never a content-supplied value — so a future content edit alone can never grant itself a new allowed host; only a code change can. PF-061/062 add their own map entry only once either has an approved public URL.
  5. **The external-link invariant is region-scoped to `<main>`, not whole-document.** An early plan draft proposed asserting every href in the _entire composed page_ equals the one approved URL — wrong, because the shared footer legitimately links to GitHub/LinkedIn on every route, case studies included. Corrected before implementation: unit tests inspect only `render.js`'s returned `main` string (naturally excludes header/footer, no extraction needed); `scripts/verify-build-output.mjs` (which inspects the fully composed `dist/*.html`, where header/footer are inlined) reuses its existing `extractRegion(html, 'main')` helper — the same one the `contact` route's region-scoped link checks already established — to assert, generically for any case-study route, that every non-`/`, non-`mailto:` href inside `<main>` equals exactly the route's own `content.externalLink.url`, read from the real content module rather than hardcoded a second time. Header/footer external links keep their own existing, independent validation.
  6. **Home/Work card consistency: `fes-challenger.js` exports a `card` sub-object; `home.js`/`work/index.js` spread it rather than retyping category/summary/tags a second time.** `card: { category: 'Marine Services Corporate Website', summary: '...', tags: ['WordPress', 'Custom Theme'] }` — all three strings are AAA-reviewed provisional copy (paraphrased from the manifest, not verbatim), explicitly approved by AAA before being written to source. Business Workflow System and eBarangay entries are untouched.
  7. **Logo and gallery both ship absent from real FES content.** AAA confirmed the attached logo image as approved, but plan mode (and this implementation session, which had no access to the pasted attachment's actual bytes) cannot place a real binary file into the repository — `content.logo` is left unset in `fes-challenger.js` pending the real file being placed at `public/images/case-studies/fes-challenger/` and a small follow-up edit adding the field. No screenshots have been supplied/reviewed yet, so `content.gallery` stays absent — the schema/template/tests fully support it (exercised now via synthetic fixtures in `tests/case-study-render.test.mjs`/`tests/case-study-layout.test.mjs`), but no placeholder, empty frame, or "coming soon" text stands in for it.
- **Consequences:** `npm run verify` passes (422/422 tests — up from 392, 30 net new — lint, format, build, `html-validate`). New: `src/styles/pages/_case-study.scss`, `tests/case-study-render.test.mjs`, `tests/case-study-layout.test.mjs`, `docs/CONTENT_INVENTORY.md`. Modified: `src/pages/content-schema.js` (`checkCaseStudyContent` + helpers), `src/pages/link-safety.js` (`isSafeCaseStudyExternalUrl`), `src/pages/templates/case-study.js` (full rewrite), `src/content/pages/work/fes-challenger.js` (real curated content + `card`), `src/content/pages/home.js`/`src/content/pages/work/index.js` (FES item spreads `card`), `src/styles/main.scss` (`@use 'pages/case-study';`), `scripts/verify-build-output.mjs` (region-scoped external-link invariant; per-section-container check extended with the case-study zero-sections relaxation), `tests/render.test.mjs` (`PER_SECTION_CONTAINER_TEMPLATES` extended; new case-study container-shape test), `tests/content-schema.test.mjs`, `tests/link-safety.test.mjs`, `tests/home-render.test.mjs`/`tests/work-render.test.mjs` (updated category/summary/tags counts now that FES's card is populated). Not modified: `docs/INITIAL_IMPLEMENTATION_TASKS.md` — matching this project's established precedent (this log is the durable record; prior milestones didn't touch their own status lines either).
- **Revisit condition:** Add `content.logo` to `fes-challenger.js` once the real approved file is placed in the repository (path/format to be confirmed against the actual file). Add `content.gallery` once AAA supplies and this task's screenshot-review workflow (documented in `docs/CONTENT_INVENTORY.md`) approves specific files — a separate, later commit, not a schema/template change. When PF-061/062 reuse this template, add their own `CASE_STUDY_EXTERNAL_HOSTS` entry only if either gets an approved public URL — otherwise `externalLink` stays absent for that route. The curated copy above (and the `card` short-copy) remains provisional pending the PF-064 final polish pass, the same openness every other dedicated page's provisional copy carries.

## 2026-08-17 — PF-060 logo-integration follow-up: real asset verified, asset-existence checks added, keyboard-order correction

- **Status:** Accepted
- **Context:** The prior PF-060 entry's revisit condition named this exact follow-up: add `content.logo` once the real approved file is placed in the repository. AAA placed it at `public/images/case-studies/fes-challenger/fes-challenger-logo.png`. Separately, this follow-up's own review of the rendered DOM found `docs/TESTING_AND_QA.md`'s PF-060 keyboard-checklist bullet listed "back-to-Work link, external link" in that order — backwards from the real DOM: `case-study.js`'s `renderIntro()` places the external link immediately after the intro paragraphs, before any section content, while the back-to-Work link renders only after every section, right before the closing CTA.
- **Decision:**
  1. **The logo file was inspected directly** (PNG signature bytes, IHDR chunk, full chunk list) rather than assumed from its extension: valid PNG, 140×137px (~1.02 aspect ratio, effectively square), 8-bit truecolor+alpha (RGBA), no interlacing, 19,767 bytes. Small enough for direct delivery — no conversion or optimization was needed, and none was performed.
  2. **`content.logo = { src: '/images/case-studies/fes-challenger/fes-challenger-logo.png', alt: '' }` added to `fes-challenger.js`** — no schema or template change, since both already supported this optional field (see the original PF-060 entry). `alt` stays empty: decorative, per AAA's own stated preference for keeping the visible `<h1>` as the real identity.
  3. **No template/CSS change.** `.case-study-hero__logo`'s existing `width: 3rem; height: 3rem; object-fit: contain;` (`src/styles/pages/_case-study.scss`, written in the original PF-060 pass, never exercised against a real image until now) already guarantees the real aspect ratio is preserved with no distortion, regardless of the source file's exact dimensions — confirmed correct by inspection rather than by adding new markup.
  4. **New `scripts/case-study-assets.mjs`** — pure, side-effect-free helpers (`collectCaseStudyAssetPaths`, `findMissingCaseStudyAssets`), the same "separate tiny module with no top-level side effects, safe to import from tests" pattern `scripts/work-project-routes.mjs` already established (both `validate-routes.mjs` and `verify-build-output.mjs` run their full check sequence, including a possible `process.exit(1)`, unconditionally on import). Wired into both scripts: `validate-routes.mjs` checks every case-study route's `logo.src`/`gallery.items[].src` resolves under `public/` (pre-flight, catches a missing file before any build); `verify-build-output.mjs` checks the same paths resolve under `dist/` (post-build, proves Vite's verbatim `public/` → `dist/` copy actually happened). Both reject a path that would resolve outside the checked root (a defensive check beyond `isSafeInternalPath`, which only rejects `//`-prefixed/non-`/`-prefixed values, not an embedded `../`) — dev-controlled content, not attacker input, but cheap to get right.
  5. **Keyboard-checklist correction, verified from source, not assumed.** Read `case-study.js`, `header.js`, `nav.js`, and `footer.js` directly to derive the real interactive DOM order: skip link → header (brand, menu toggle, 6 primary nav links, "Start a Project") → **main**: external link (first — `renderIntro()`) → seven curated sections (no interactive elements) → "Back to Work" → closing CTA button → footer (6 nav links again, Privacy, Email, GitHub, LinkedIn). `docs/TESTING_AND_QA.md`'s PF-060 bullet corrected to state this exact order and explicitly flag that the external link precedes Back to Work, not the reverse.
- **Consequences:** `npm run verify` passes (431/431 tests — up from 422, 9 net new). New: `scripts/case-study-assets.mjs`, `tests/case-study-assets.test.mjs`. Modified: `src/content/pages/work/fes-challenger.js` (`logo` added), `scripts/validate-routes.mjs`/`scripts/verify-build-output.mjs` (asset-existence checks), `tests/case-study-render.test.mjs` (logo-present assertions replace the old logo-absent one), `docs/CONTENT_INVENTORY.md` (logo reclassified Publishable — supplied, verified, integrated; explicit confirmation that screenshots/gallery remain Missing and absent), `docs/TESTING_AND_QA.md` (logo bullet updated; keyboard-order bullet corrected).
- **Revisit condition:** None for the logo itself — supplied, verified, and integrated. `content.gallery` remains the only open PF-060 asset item; add it only once AAA supplies and `docs/CONTENT_INVENTORY.md`'s screenshot-intake workflow approves specific files, per the original PF-060 entry's still-standing revisit condition.

## 2026-08-18 — PF-061 Business Workflow System case study: second real case-study caller, fully anonymized, PF-062 deferred

- **Status:** Accepted
- **Context:** PF-061 is marked "Blocked by confidentiality review" in `docs/INITIAL_IMPLEMENTATION_TASKS.md`. AAA supplied a verified fact/decision manifest under strict anonymization constraints and confirmed the curated content manifest before implementation. PF-062 (eBarangay) was audited in the same planning session: AAA confirmed the project is in planning/design stage only (nothing built) and explicitly chose to leave it as the existing foundation placeholder — **not implemented, not touched, not deferred-with-a-thin-entry.**
- **Decision:**
  1. **PF-060's architecture reused with zero changes** — this is exactly the "second real caller proves the abstraction" moment: `src/pages/content-schema.js`, `src/pages/templates/case-study.js`, `src/styles/pages/_case-study.scss`, `scripts/case-study-assets.mjs`, and the `link-safety.js`/`CASE_STUDY_EXTERNAL_HOSTS` mechanism needed no redesign or extension. `business-workflow-system.js` uses the identical named-optional-section shape FES uses, minus `logo`/`gallery`/`externalLink` (none approved for this project).
  2. **Full anonymization enforced by an explicit, automated word-list guard**, not just careful writing. `tests/business-workflow-system-render.test.mjs` checks the real rendered case-study output, the content module itself (`JSON.stringify`, catching fields not yet rendered), and the Home/Work card fields for `government`, `agency`/`agencies`, `accreditation`, `regional`, `contract`, `department`, `sector`, `industry`, `program`, `office`, `location` (word-bounded, case-insensitive). The same guard was added to `tests/home-render.test.mjs`/`tests/work-render.test.mjs` since Business Workflow System's card renders on both composed pages. Real organizational names/acronyms can't be guarded programmatically (unknown by construction) — the safeguard there is AAA's own fact-approval step.
  3. **Curation, not a per-fact dump — the same discipline PF-060 established.** Of 6 AAA-supplied technical decisions, 2 were excluded from the published Key Decisions section (capped at 4) because each already appears once under What I Built as a feature ("role- and permission-based review stages," "map-based site-inspection records") — restating them as decisions too would repeat the same fact a second time, which AAA's own curation requirements explicitly ruled out. Both excluded decisions are preserved in full in `docs/CONTENT_INVENTORY.md`.
  4. **One wording correction AAA made before approval**: "stored procedures and paginated API queries for structured, **efficient** data access" was corrected to "...to organize data access and handle large result sets in manageable pages" — the original phrasing implied an unverified performance claim; the corrected version describes only the verified implementation pattern.
  5. **The prior PF-033-era literal category "Government/business workflow system" is retired**, replaced by `business-workflow-system.js`'s own `card.category` ("Internal Workflow System"), spread into `home.js`/`work/index.js` exactly like FES's `card` pattern. The word "Government" is removed from every current visitor-facing string, test fixture, and the dev-only design-system showcase specimen (`dev/design-system/index.html`) that mirrored it. It is **retained** in `docs/DECISION_LOG.md`'s and `docs/DESIGN_SYSTEM.md`'s own PF-033/041/052 historical entries, which describe a past decision, and in `DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md`'s §11 table, the original approved-requirements source-of-truth document — neither is current visitor-facing content, metadata, tests, or generated output, so neither was edited.
  6. **Shared test-file reorganization, bundled into this implementation as instructed, not split into a separate task.** `tests/case-study-render.test.mjs` is now purely the generic, fixture-based template contract (protects any case-study route). FES's real-content assertions were extracted into `tests/fes-challenger-render.test.mjs`; Business Workflow System's equivalent real-content assertions live in the new `tests/business-workflow-system-render.test.mjs` — matching this repo's established one-file-per-real-route convention (`home-render`, `work-render`, `solutions-render`, etc.), which the original single case-study file no longer fit once a second real case study existed.
  7. **PF-062 (eBarangay) deferred, not implemented in any form.** The audit found eBarangay has no built implementation to document; AAA was offered a thin "in development" framing and explicitly declined it, choosing to leave the route exactly as its PF-011 foundation placeholder. No file under `work/ebarangay*` was touched.
- **Consequences:** `npm run verify` passes (440/440 tests — up from 431, 9 net new). New: `tests/fes-challenger-render.test.mjs`, `tests/business-workflow-system-render.test.mjs`. Modified: `tests/case-study-render.test.mjs` (trimmed to generic-only), `src/content/pages/work/business-workflow-system.js` (real anonymized content + `card`), `src/content/pages/home.js`/`src/content/pages/work/index.js` (Business Workflow System item spreads `card`, replacing the literal prohibited category), `tests/content-schema.test.mjs` (fixture value updated), `tests/home-render.test.mjs`/`tests/work-render.test.mjs` (updated category/summary/tags counts and text; new prohibited-wording guard tests), `dev/design-system/index.html` (specimen text updated), `docs/CONTENT_INVENTORY.md` (full PF-061 fact/redaction record; PF-062 explicitly marked deferred-untouched). Not modified: `src/pages/content-schema.js`, `src/pages/templates/case-study.js`, `src/styles/pages/_case-study.scss`, `scripts/case-study-assets.mjs`, `src/pages/link-safety.js` (no URL approved, no new host-map entry needed), `docs/SOURCE_ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `package.json` — confirms PF-060's architecture needed zero changes for a second real caller.
- **Revisit condition:** Screenshots remain deferred to a separate, later sanitization-and-approval round, following the exact workflow `docs/CONTENT_INVENTORY.md` already documents for FES — add `content.gallery` only once specific files clear that review, not before. PF-062 stays untouched until AAA reports a working implementation to document; revisit this decision then, not on a timer. The curated copy above remains provisional pending the PF-064 final polish pass, the same openness every other dedicated page's provisional copy carries.

---

_This log will be backfilled with the project's earlier approved decisions
(technology stack, hosting, positioning, information architecture, and
others) under PF-002. Entries added from PF-011 onward are recorded here
as they are made._
