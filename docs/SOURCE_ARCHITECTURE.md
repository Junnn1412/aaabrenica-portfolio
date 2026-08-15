# Source Architecture

Established in PF-011. Describes how the site's 11 static routes are
composed from shared markup and structured content without any templating
package or generated files on disk. See [`DECISION_LOG.md`](DECISION_LOG.md)
for the reasoning behind the approach.

## Directory responsibilities

```text
src/
├── config/
│   ├── site.js         — site name, default description, base URL, contact/social/résumé (currently null)
│   ├── navigation.js    — primary nav items [{ key, label, path }]
│   └── routes.js        — single source of truth: every route's path, entry file, nav key, template, content key
├── content/
│   └── pages/            — one plain-data module per route (title, description?, heading, paragraphs, ...)
├── components/
│   └── partials/          — shared structural markup: header, nav, footer
├── pages/
│   ├── templates/          — standard / listing / case-study: the *shape* a page takes
│   ├── render.js            — route -> composed { head, header, main, footer }
│   ├── compose.js           — marker validation + safe substitution into the HTML skeleton
│   ├── escape.js             — escapeHtml — the only way content reaches HTML
│   ├── link-safety.js        — isSafeInternalPath — rejects javascript:, external, protocol-relative URLs
│   ├── content-schema.js     — per-template required-field/type + link-safety checks
│   └── dev-watcher.js         — attaches the dev-server file watcher that restarts on architecture edits
├── scripts/
│   └── main.js                — global JS entry (imports the SCSS entry; no page-specific JS yet)
└── styles/                     — ITCSS-lite (see below)

scripts/                         — Node-only build tooling, deliberately outside src/scripts/ (which is browser code)
├── validate-routes.mjs           — pre-flight validator, runs automatically before dev and build
└── verify-build-output.mjs       — composed-output verifier, runs automatically after build
```

`src/assets/`, and the `elements/`, `objects/`, `utilities/`, `pages/`
layers under `src/styles/`, are not created yet — no real content exists for
them. They're created only when a later milestone (PF-020 design system,
PF-032+ components) needs them.

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

## Validation, at three points

1. **Pre-flight** (`scripts/validate-routes.mjs`, runs automatically as
   `predev`/`prebuild`, also `npm run check:routes`): checks the whole
   manifest at once — duplicate keys/paths/entries, template/content
   registry membership, content shape and types, internal-link safety and
   resolution (nav agrees with its route, Work-listing links match
   registered case studies, every `backLink` points at `/work/`), exactly
   one `/` and one `/404.html`, the manifest matches the 11 approved routes
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
   meta description, exactly one `<main id="main-content">` and one
   navigation landmark, correct `aria-current="page"` placement (including
   the documented 404 policy below), no empty attributes, and no canonical
   or contact/social markup while those config values are unset.

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
`scripts/verify-build-output.mjs`.

## SCSS layering

`src/styles/` follows an ITCSS-lite order — settings, generic, elements,
objects, components, utilities, pages — but only `settings/`, `generic/`,
and `components/` currently have real content (the one existing font-stack
token, the reset, and the skip-link rule). `main.scss` is a thin `@use`
aggregator. The remaining layers are created only when PF-020 introduces
real design tokens and components.

## Deferred

- `src/assets/`, `public/` — no images/static assets yet.
- Reusable content components (capability/project cards), decorative
  visuals — component-showcase milestone (PF-032+).
- Page-specific browser JS — `data-page` on `<body>` is a ready, documented,
  currently-unused seam for this.
- External social/contact link rendering and its safety policy (allowed
  protocols, `rel` attributes) — once PF-003 supplies real values.
