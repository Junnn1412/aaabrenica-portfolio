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

---

_This log will be backfilled with the project's earlier approved decisions
(technology stack, hosting, positioning, information architecture, and
others) under PF-002. Entries added from PF-011 onward are recorded here
as they are made._
