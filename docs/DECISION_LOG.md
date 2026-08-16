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

---

_This log will be backfilled with the project's earlier approved decisions
(technology stack, hosting, positioning, information architecture, and
others) under PF-002. Entries added from PF-011 onward are recorded here
as they are made._
