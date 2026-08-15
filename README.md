# AAA Portfolio

AAA's professional developer portfolio — a multi-page static website built with Vite, semantic HTML5, custom SCSS, and vanilla JavaScript ES modules.

## Prerequisites

- Node.js `v22.18.0` (see [`.nvmrc`](.nvmrc))
- npm

## Installation

```bash
npm install
```

## Local development

```bash
npm run dev
```

Starts the Vite development server.

## Route validation

```bash
npm run check:routes
```

Validates the route manifest, content, templates, and navigation — runs
automatically before `dev` and `build`.

## Production build

```bash
npm run build
```

Builds the static multi-page site into `dist/`. Automatically runs
`npm run check:routes` first and `npm run check:build` (validates the
composed HTML output) afterward.

## Preview the production build

```bash
npm run preview
```

Serves the contents of `dist/` locally.

## Linting

```bash
npm run lint        # lint:js + lint:styles
npm run lint:js     # ESLint — JS/Node correctness
npm run lint:styles  # Stylelint — SCSS
```

## Formatting

```bash
npm run format        # write formatting fixes
npm run format:check  # check only, no changes
```

Prettier covers JS, JSON, Markdown, and SCSS. HTML is intentionally excluded
(see [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md)) — `html-validate` is the
style authority for the committed HTML skeletons instead.

## Tests

```bash
npm test
```

Runs the Node.js built-in test runner against `tests/`. See
[`docs/TESTING_AND_QA.md`](docs/TESTING_AND_QA.md) for what's covered.

## HTML standards validation

```bash
npm run html:validate
```

Validates the **composed** production output (`dist/**/*.html`) against
`html-validate:recommended`. This validates whatever is currently on disk in
`dist/` — it does **not** trigger a build itself, so it requires a
**successful, up-to-date** `npm run build` immediately beforehand; a stale or
failed build will produce misleading results. Run `npm run build` first, or
use `npm run verify`, which already guarantees this exact ordering (`build`
runs immediately before `html:validate`, and `build` itself fails loudly via
`prebuild`/`postbuild` before `html:validate` would ever run against broken
output).

## Verify everything

```bash
npm run verify
```

Runs `check:routes`, `lint`, `format:check`, `test`, `build`, and
`html:validate` in order, stopping at the first failure. This is the
feature-gate command referenced in
[`docs/DEVELOPMENT_WORKFLOW.md`](docs/DEVELOPMENT_WORKFLOW.md).

## Project documents

- [`CLAUDE.md`](CLAUDE.md) — project instructions and working method
- [`DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md`](DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md) — approved requirements
- [`docs/DEVELOPMENT_WORKFLOW.md`](docs/DEVELOPMENT_WORKFLOW.md) — task lifecycle and review process
- [`docs/INITIAL_IMPLEMENTATION_TASKS.md`](docs/INITIAL_IMPLEMENTATION_TASKS.md) — milestone and task plan
- [`docs/REUSABLE_PORTFOLIO_ARCHITECTURE.md`](docs/REUSABLE_PORTFOLIO_ARCHITECTURE.md) — reusable-starter architecture direction
- [`docs/SOURCE_ARCHITECTURE.md`](docs/SOURCE_ARCHITECTURE.md) — how routes are composed, validated, and organized
- [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md) — material project decisions and their rationale
- [`docs/TESTING_AND_QA.md`](docs/TESTING_AND_QA.md) — test matrix, commands, and manual checks not yet automated

## Branch workflow

```text
feature/* -> develop -> main
```

- `feature/*` — one bounded feature, page, or documentation change
- `develop` — integrated development version
- `main` — approved production source

Branch promotion and production release are approved by AAA only.
