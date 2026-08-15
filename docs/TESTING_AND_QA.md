# Testing and QA

Established in PF-012. Documents what's automated, what commands run it, and
what's still manual per `CLAUDE.md`'s validation expectations. See
[`DECISION_LOG.md`](DECISION_LOG.md) for why each tool was chosen.

## Test matrix

| Concern                                | Tool                                         | Command                                  | Covers                                                                                                                                                                                                           |
| -------------------------------------- | -------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JS/Node correctness                    | ESLint (flat config)                         | `npm run lint:js`                        | Every `.js`/`.mjs` file under root configs, `src/`, `scripts/`, `tests/`                                                                                                                                         |
| SCSS correctness                       | Stylelint (`stylelint-config-standard-scss`) | `npm run lint:styles`                    | `src/styles/**/*.scss`                                                                                                                                                                                           |
| Formatting                             | Prettier                                     | `npm run format:check` (`format` to fix) | JS, JSON, Markdown, SCSS — **not** HTML (see below)                                                                                                                                                              |
| HTML standards conformance             | `html-validate`                              | `npm run html:validate`                  | Composed `dist/**/*.html` only, after a build                                                                                                                                                                    |
| Pure-logic unit tests                  | Node built-in `node:test`                    | `npm test`                               | `escapeHtml`, marker counting/composition, `validateContent`, `isSafeInternalPath`, `normalizePath`/`resolveEntryPath`, `renderRoute` integration, a `validate-routes.mjs` exit-code smoke test                  |
| Project-specific route/content rules   | `scripts/validate-routes.mjs`                | `npm run check:routes`                   | Duplicate keys/paths, registry membership, content shape, link resolution, approved-route parity, marker presence — runs automatically before `dev`/`build`                                                      |
| Project-specific composed-output rules | `scripts/verify-build-output.mjs`            | `npm run check:build`                    | No leftover markers, exactly-one title/description/main/nav-landmark, `aria-current` placement incl. 404 policy, no empty attributes, no canonical/contact markup while unset — runs automatically after `build` |
| Everything                             | —                                            | `npm run verify`                         | All of the above, in order, stopping at the first failure                                                                                                                                                        |

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
- Keyboard navigation and focus states
- Reduced-motion behavior
- Browser console errors
- Heading and landmark structure (beyond what `html-validate`/
  `verify-build-output.mjs` already check structurally)
- Lighthouse/accessibility/performance auditing

These are out of scope for PF-012 by design — see the task's explicit scope
boundaries (no browser automation, visual regression, end-to-end tests,
accessibility auditing tools, or Lighthouse automation).
