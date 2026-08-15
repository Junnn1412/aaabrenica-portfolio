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

---

_This log will be backfilled with the project's earlier approved decisions
(technology stack, hosting, positioning, information architecture, and
others) under PF-002. Entries added from PF-011 onward are recorded here
as they are made._
