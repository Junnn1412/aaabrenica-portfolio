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

## Project documents

- [`CLAUDE.md`](CLAUDE.md) — project instructions and working method
- [`DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md`](DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md) — approved requirements
- [`docs/DEVELOPMENT_WORKFLOW.md`](docs/DEVELOPMENT_WORKFLOW.md) — task lifecycle and review process
- [`docs/INITIAL_IMPLEMENTATION_TASKS.md`](docs/INITIAL_IMPLEMENTATION_TASKS.md) — milestone and task plan
- [`docs/REUSABLE_PORTFOLIO_ARCHITECTURE.md`](docs/REUSABLE_PORTFOLIO_ARCHITECTURE.md) — reusable-starter architecture direction
- [`docs/SOURCE_ARCHITECTURE.md`](docs/SOURCE_ARCHITECTURE.md) — how routes are composed, validated, and organized
- [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md) — material project decisions and their rationale

## Branch workflow

```text
feature/* -> develop -> main
```

- `feature/*` — one bounded feature, page, or documentation change
- `develop` — integrated development version
- `main` — approved production source

Branch promotion and production release are approved by AAA only.
