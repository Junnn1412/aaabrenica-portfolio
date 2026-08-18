# Design System

Established in PF-020 (tokens, typography, global document behavior),
extended in PF-021 (base elements: headings, body copy, links, buttons,
labels, tags, lists, media frames, section headers, containers, and
form-control foundations), formalized as the component showcase in PF-030
(table of contents, review checklist), extended again in PF-031 (global
navigation and footer — see "Global navigation and footer (PF-031)" below),
extended again in PF-032 (capability cards), extended again in PF-033
(project cards — see "Project cards (PF-033)" below), extended again in
PF-034 (process steps, trust indicators, engagement options, and a reusable
CTA panel — see "Process, trust, engagement, and CTA components (PF-034)"
below), extended again in PF-041 (the real homepage — six new render*()
modules composing the PF-032/033/034 components, plus a new `.hero`
layout wrapper — see "Homepage (PF-041)" below), and extended again in
PF-050 (the real Solutions page — a dedicated template, the `.home-section`
wrapper generalized into the shared `.page-section` object, and this
project's first page-specific SCSS layer — see "Solutions page (PF-050)"
below). See [`DECISION_LOG.md`](DECISION_LOG.md) for the composition-strategy
and tooling decisions this builds on, and for the
PF-020/PF-021/PF-030/PF-031/PF-032/PF-033/PF-034/PF-041/PF-050 decisions
themselves.

## Token architecture

Two tiers, one place values cross from Sass to runtime CSS:

- **Tier 1 — `$palette-*`** (`src/styles/settings/_colors.scss`): raw color
  anchors. Internal only, never emitted directly. Every literal color value
  in the system is authored exactly once.
- **Tier 2 — semantic tokens** (`--color-*`, `--status-*`, `--accent-*`,
  `--space-*`, `--radius-*`, `--shadow-*`, `--motion-*`, `--z-*`,
  `--font-*`): the public API. Components and any future themed/profession
  variant reference only these names — never Tier 1, never a raw hex.

`src/styles/generic/_custom-properties.scss` is the **only** place values
cross from Sass into real CSS — it `@each`-loops every `settings/*.scss` map
onto `:root`, so nothing is ever duplicated between Sass and CSS.

```text
src/styles/
├── settings/
│   ├── _colors.scss           — Tier 1 + Tier 2 color map
│   ├── _typography.scss       — font stacks, fluid scale, line-height/letter-spacing
│   ├── _spacing.scss          — spacing scale, containers, $bp-* breakpoints (Sass-only)
│   ├── _shape.scss            — radii, shadows, border/focus-ring width, touch-target-min
│   ├── _motion.scss           — durations, easings, distances
│   └── _layers.scss           — z-index scale
├── generic/
│   ├── _reset.scss            — box-sizing/margin reset; header/footer link color:inherit
│   ├── _fonts.scss            — @font-face (real CSS output, not a "setting")
│   ├── _custom-properties.scss — emits every settings/ value to :root
│   └── _document.scss         — global body/html appearance, focus-visible, reduced-motion; PF-040: body is a flex column (minimum-viewport shell)
├── elements/                  — PF-021: bare-tag styling (applies site-wide, no opt-in class)
│   ├── _headings.scss         — h1-h4, .text-display
│   ├── _body-copy.scss        — p, strong, em, small, code/kbd, lists, .text-lead, .list--marked
│   └── _links.scss            — a, .link--plain
├── objects/                   — PF-021: structural, non-cosmetic
│   ├── _container.scss        — .container / --wide / --reading
│   ├── _page-shell.scss       — PF-040: #main-content's flex: 1 + padding-block: var(--space-section)
│   ├── _section-header.scss   — .section-header
│   └── _page-section.scss     — PF-050: .page-section, generalized out of _hero.scss's homepage-only .home-section for its second real caller (solutions.js)
├── components/
│   ├── _skip-link.scss
│   ├── _button.scss           — PF-021: .btn
│   ├── _tag.scss               — PF-021: .tag
│   ├── _media-frame.scss       — PF-021: .media-frame
│   ├── _form-control.scss      — PF-021: .field
│   ├── _site-header.scss / _site-nav.scss / _site-footer.scss — PF-031
│   ├── _capability-card.scss   — PF-032: .capability-card, rendered by src/components/capability-card.js since PF-041
│   ├── _project-card.scss      — PF-033: .project-card, rendered by src/components/project-card.js since PF-041
│   ├── _process-steps.scss / _trust-list.scss / _engagement-options.scss / _cta.scss — PF-034, each rendered by its matching src/components/*.js module since PF-041
│   └── _hero.scss              — PF-041: .hero (thin layout wrapper only, no new tokens); no longer carries .home-section — see objects/_page-section.scss above
├── utilities/
│   └── _visually-hidden.scss  — PF-021: .visually-hidden
├── pages/                     — PF-050: page-specific overrides that don't belong in a shared object or component
│   └── _solutions.scss        — jump-nav chips, section icon badges, the problem/audience/build/benefit detail list, and the sticky-header-safe anchor offset — see "Solutions page (PF-050)" below
└── main.scss
```

**Breakpoints are Sass-only** (`$bp-sm`…`$bp-xxl` in `_spacing.scss`) —
CSS custom properties cannot be used inside `@media` conditions, so this is
a hard CSS limitation, not a style choice.

**Future theme/profession override path:** because components only ever
reference Tier-2 `--` names, a future themed variant only needs to redefine
the `:root` block (or scope an override under e.g. `[data-theme="..."]`) —
no component code changes, no Tier-1 renaming. This is the seed of a theme
mechanism, not a theme engine — no runtime switching JS, no config-driven
theme loader exists.

**Future JS access:** none is wired up yet (no Motion-for-JS init), but
since every token is a real `:root` custom property, future JS reads via
`getComputedStyle(document.documentElement).getPropertyValue('--motion-duration-base')`
— JS never gets its own parallel token file.

## Color tokens

| Token                                                                                                            | Value                                                                 | Role                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-canvas`                                                                                                 | `#0b0f17`                                                             | Page background                                                                                                                                                                                                                                                                                     |
| `--color-surface-1`                                                                                              | `#161d2c`                                                             | Card/panel background                                                                                                                                                                                                                                                                               |
| `--color-surface-2`                                                                                              | `#1d2540`                                                             | Dropdown/modal background                                                                                                                                                                                                                                                                           |
| `--color-border`                                                                                                 | `#2a3350`                                                             | Subtle content dividers (decorative)                                                                                                                                                                                                                                                                |
| `--color-text-primary`                                                                                           | `#f2eee6`                                                             | Warm off-white primary text                                                                                                                                                                                                                                                                         |
| `--color-text-secondary`                                                                                         | `#a7b0c4`                                                             | Muted blue-gray secondary text                                                                                                                                                                                                                                                                      |
| `--color-text-muted`                                                                                             | `#838caa`                                                             | Tertiary but still **meaningful** text — captions, placeholders, timestamps. Approved on `--color-canvas`/`--color-surface-1` only; measured 4.53:1 on `--color-surface-2`, too close to the 4.5:1 floor to approve there without a lighter override                                                |
| `--color-accent`                                                                                                 | `#2e6bff`                                                             | Large text, icons, borders, focus ring — **not** small/body text (4.26:1, below the 4.5:1 body-text floor)                                                                                                                                                                                          |
| `--color-accent-text`                                                                                            | `#6e9bff`                                                             | Small/body-size accent text and links (7.13:1)                                                                                                                                                                                                                                                      |
| `--color-accent-hover`                                                                                           | `color.adjust($palette-cobalt-500, $lightness: 6%)` → `#4d81ff`       | Hover (derived, not hand-picked) — also the link-hover text color (PF-021)                                                                                                                                                                                                                          |
| `--color-accent-active`                                                                                          | `color.adjust($palette-cobalt-500, $lightness: -8%)` → `#054eff`      | Pressed link text (derived)                                                                                                                                                                                                                                                                         |
| `--color-accent-fill`                                                                                            | `color.adjust($palette-cobalt-500, $lightness: -8%)` → `#054eff`      | PF-021: `.btn--primary` fill, default. Independently defined from `--color-accent-active` despite an identical current value — same precedent as the capability accents below                                                                                                                       |
| `--color-accent-fill-hover`                                                                                      | `color.adjust($palette-cobalt-500, $lightness: -14%)` → `#0043e6`     | PF-021: `.btn--primary` fill, hover                                                                                                                                                                                                                                                                 |
| `--color-accent-fill-active`                                                                                     | `color.adjust($palette-cobalt-500, $lightness: -20%)` → `#003ac7`     | PF-021: `.btn--primary` fill, active                                                                                                                                                                                                                                                                |
| `--color-border-interactive`                                                                                     | `color.adjust($palette-slate-600, $lightness: 28%)` → `#5e70ab`       | PF-021: the interactive-boundary color for bordered/filled buttons and form controls — `--color-border` stays reserved for purely decorative dividers                                                                                                                                               |
| `--status-success` / `--status-warning` / `--status-danger` / `--status-info`                                    | `#3ddc84` / `#f5b942` / `#f0576b` / `#22c3d6`                         | Status text/icon — always paired with an icon or text label, never color alone                                                                                                                                                                                                                      |
| `--accent-lime` / `--accent-amber` / `--accent-coral` / `--accent-violet` / `--accent-cyan` / `--accent-magenta` | `#8dd941` / `#f5b942` / `#f0576b` / `#9b6bff` / `#22c3d6` / `#ef4fa0` | The six capability-card accents (PF-032) — used as each card's full solid background fill. `--accent-magenta` was added in PF-032: PF-020 reserved only five, PF-032 needed six. Independently defined, not aliased to status colors — a future change to one role never silently changes the other |
| `--color-focus-ring`                                                                                             | `var(--color-accent)`                                                 | Focus outline                                                                                                                                                                                                                                                                                       |
| `--color-selection-bg`                                                                                           | `rgba(46, 107, 255, 0.35)`                                            | `::selection`                                                                                                                                                                                                                                                                                       |
| `--color-scrim`                                                                                                  | `rgba(11, 15, 23, 0.72)`                                              | Modal backdrop (future)                                                                                                                                                                                                                                                                             |

**Format:** plain hex/rgb shipped as CSS custom properties — universal
browser support, no fallback complexity. OKLCH was considered (better
perceptual uniformity for programmatic palette generation) but isn't needed
for a fixed, hand-tuned palette with no current need for wide-gamut color or
runtime palette math — noted as a revisit condition below, not implemented.

## Contrast matrix

WCAG relative-luminance method, re-verified programmatically against the
real compiled tokens by `tests/design-tokens.test.mjs` (not just documented
by hand) — the test compiles the real `_custom-properties.scss`, parses
whatever color format Dart Sass emits (`#hex`, comma-form `rgb()`/`rgba()`
with either 0–255 or percentage component values — Dart Sass emits
percentage form for `color.adjust()`-derived tokens, which PF-020's
`--color-accent-hover`/`-active` and PF-021's new tokens all are, and this
format was a real gap in the parser until PF-021 exercised it — or modern
space-form `rgb(r g b / a%)`), and asserts each ratio meets its threshold.

| Foreground                   | Background             | Type            | Ratio   | Target                     | Result                                                                                       |
| ---------------------------- | ---------------------- | --------------- | ------- | -------------------------- | -------------------------------------------------------------------------------------------- |
| `--color-text-primary`       | `--color-canvas`       | TEXT            | 16.58:1 | 4.5:1                      | Pass (AAA)                                                                                   |
| `--color-text-primary`       | `--color-surface-1`    | TEXT            | 14.56:1 | 4.5:1                      | Pass (AAA)                                                                                   |
| `--color-text-secondary`     | `--color-canvas`       | TEXT            | 8.82:1  | 4.5:1                      | Pass (AAA)                                                                                   |
| `--color-text-secondary`     | `--color-surface-1`    | TEXT            | 7.75:1  | 4.5:1                      | Pass (AAA)                                                                                   |
| `--color-text-muted`         | `--color-canvas`       | TEXT            | 5.75:1  | 4.5:1                      | Pass                                                                                         |
| `--color-text-muted`         | `--color-surface-1`    | TEXT            | 5.05:1  | 4.5:1                      | Pass                                                                                         |
| `--color-accent`             | `--color-canvas`       | LARGE-TEXT/UI   | 4.26:1  | 3.0:1 (large-text/UI only) | Pass — restricted role                                                                       |
| `--color-accent`             | `--color-surface-1`    | LARGE-TEXT/UI   | 3.74:1  | 3.0:1                      | Pass — restricted role                                                                       |
| `--color-accent-text`        | `--color-canvas`       | TEXT            | 7.13:1  | 4.5:1                      | Pass (AAA)                                                                                   |
| `--color-accent-text`        | `--color-surface-1`    | TEXT            | 6.26:1  | 4.5:1                      | Pass                                                                                         |
| `--status-success`           | `--color-canvas`       | TEXT            | 10.75:1 | 4.5:1                      | Pass                                                                                         |
| `--status-warning`           | `--color-canvas`       | TEXT            | 10.88:1 | 4.5:1                      | Pass                                                                                         |
| `--status-danger`            | `--color-canvas`       | TEXT            | 5.74:1  | 4.5:1                      | Pass                                                                                         |
| `--status-danger`            | `--color-surface-1`    | TEXT            | 5.04:1  | 4.5:1                      | Pass                                                                                         |
| `--status-info`              | `--color-canvas`       | TEXT            | 8.99:1  | 4.5:1                      | Pass                                                                                         |
| `--color-accent-hover`       | `--color-canvas`       | TEXT            | 5.37:1  | 4.5:1                      | Pass — link hover text (PF-021)                                                              |
| `--color-accent-hover`       | `--color-surface-1`    | TEXT            | 4.72:1  | 4.5:1                      | Pass — tighter margin, still real                                                            |
| `--color-accent-fill`        | `--color-text-primary` | TEXT            | 5.12:1  | 4.5:1                      | Pass — `.btn--primary` label, default (PF-021)                                               |
| `--color-accent-fill-hover`  | `--color-text-primary` | TEXT            | 6.17:1  | 4.5:1                      | Pass — `.btn--primary` label, hover                                                          |
| `--color-accent-fill-active` | `--color-text-primary` | TEXT            | 7.46:1  | 4.5:1                      | Pass — `.btn--primary` label, active                                                         |
| `--color-border-interactive` | `--color-canvas`       | NON-TEXT        | 4.01:1  | 3.0:1                      | Pass — button/form-control boundary (PF-021)                                                 |
| `--color-border-interactive` | `--color-surface-1`    | NON-TEXT        | 3.53:1  | 3.0:1                      | Pass                                                                                         |
| `--color-focus-ring`         | `--color-canvas`       | FOCUS-INDICATOR | 4.26:1  | 3.0:1                      | Pass — same value as `--color-accent`, asserted under its own name for traceability (PF-021) |
| `--color-focus-ring`         | `--color-surface-1`    | FOCUS-INDICATOR | 3.74:1  | 3.0:1                      | Pass                                                                                         |
| `--color-text-secondary`     | `--color-surface-2`    | TEXT            | 6.94:1  | 4.5:1                      | Pass — `.tag` label (PF-021)                                                                 |

`--color-border` is outside this matrix — WCAG 1.4.11 exempts purely
decorative dividers; real interactive boundaries use
`--color-border-interactive` instead (PF-021), which is in the matrix. State
is never communicated by color alone: status colors and `.field--error` must
always be paired with an icon or text label when actually used, never color
alone.

**`.btn--primary`'s fill is not its own component boundary.** Verified
during PF-021 planning: `--color-accent-fill`/`-hover`/`-active` against
`--color-canvas`/`--color-surface-1` range from 3.24:1 down to 1.95:1,
failing the 3:1 non-text floor in 5 of 6 state/background combinations. The
persistent `--color-border-interactive` border — present in every fill
state, not just added on hover — is the button's actual WCAG 1.4.11
boundary instead. This is why `--color-accent-fill*` appears in the matrix
only as a TEXT pair (the label on top of the fill), never as a NON-TEXT pair
(the fill against the page behind it, which was deliberately not asserted
since it would fail by design).

## Typography

**Recommended, provisional:** Space Grotesk (display) + Inter (body/UI) —
pending AAA's final visual sign-off on the real, self-hosted rendering in
the preview page. Two alternatives were compared and rejected: Sora + IBM
Plex Sans (warmer, leans more "enterprise" than "technical edge") and
Archivo + Public Sans (bold/editorial but trades away "friendly/
approachable"). All three are SIL OFL 1.1, Google Fonts, locally hostable.

**What's actually shipped:** Google Fonts served both families as a single
variable-font file per family for the requested weight range (not separate
static instances per weight) — self-hosted as-is rather than forcing
artificial static splitting:

| File                                       | Family        | Weight range used | Source                                                                   |
| ------------------------------------------ | ------------- | ----------------- | ------------------------------------------------------------------------ |
| `public/fonts/Inter-Variable.woff2`        | Inter         | 400–600           | `fonts.gstatic.com` via the official Google Fonts CSS API (Latin subset) |
| `public/fonts/SpaceGrotesk-Variable.woff2` | Space Grotesk | 500–700           | same                                                                     |

- **License:** SIL OFL 1.1, committed at `THIRD_PARTY_LICENSES/OFL-Inter.txt`
  and `THIRD_PARTY_LICENSES/OFL-SpaceGrotesk.txt` (fetched from the
  authoritative `google/fonts` GitHub repository, which mirrors each
  designer's own upstream repo).
- **No runtime third-party requests:** `@font-face` (`src/styles/generic/_fonts.scss`)
  points at `/fonts/...` on our own origin — no `<link>` to
  `fonts.googleapis.com`/`fonts.gstatic.com`, no Google Fonts API call at
  request time.
- **Fallback stacks** (usable immediately, before the font loads):
  display `'Space Grotesk', 'Segoe UI', system-ui, sans-serif`; body
  `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`.

**Scale** (`src/styles/settings/_typography.scss`, fluid via `clamp()`,
no JS):

| Token                 | Range       | Use                                                      |
| --------------------- | ----------- | -------------------------------------------------------- |
| `--font-size-display` | 40–80px     | Hero headline only                                       |
| `--font-size-h1`      | 32–52px     | Page H1                                                  |
| `--font-size-h2`      | 24–36px     | Section headings                                         |
| `--font-size-h3`      | 20–28px     | Subsection headings                                      |
| `--font-size-h4`      | 18–22px     | Minor headings                                           |
| `--font-size-body-lg` | 17–19px     | Lead paragraphs                                          |
| `--font-size-body`    | 16px, fixed | Body copy — fixed, not fluid, to protect reading comfort |
| `--font-size-small`   | 14px        | Captions/meta                                            |
| `--font-size-label`   | 12px        | Eyebrow/uppercase labels                                 |

Line height: display/H1 1.05–1.15; body 1.6; label 1.4. Letter spacing:
headings -0.02em; body 0; labels +0.08em. Max reading width:
`--width-reading: 68ch`.

**PF-020/PF-021 boundary:** PF-020 defined and exposed this scale as tokens
without applying it to real elements; PF-021 applies it — `elements/_headings.scss`
and `elements/_body-copy.scss` now style real `<h1>`–`<h4>`/`<p>`/list
elements site-wide (see "Base elements" below). `generic/_document.scss`
still only sets `html`/`body`-level appearance (canvas background, primary
text color, base body font/size/line-height, focus-visible, reduced-motion).

## Spacing, layout, shape, motion, layering

Unchanged from the plan — see inline comments in
`src/styles/settings/{_spacing,_shape,_motion,_layers}.scss` for the exact
values and rationale (spacing scale, container widths, five content-driven
breakpoints, radii, dark-appropriate shadow levels, `:focus-visible`
treatment, motion durations/easings/distances, and the gapped z-index
scale). `--motion-distance-sm` is `6px`, matching the requirements doc's
approved 4–6px card-lift range exactly (the upper bound, for a clearly
perceptible but still restrained hover lift). `--shape.scss` also carries
`--touch-target-min: 2.75rem` (44px, PF-021) — the minimum hit area for
`.btn`, icon-only buttons, and the checkbox/radio label row; inline links in
running text are exempt (WCAG 2.5.5's inline-text exception).

Reduced motion is enforced globally now (`generic/_document.scss`), even
though nothing animates yet — zero risk, and every future animation
automatically respects it without needing to remember later:

```scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

No Motion-for-JS is initialized in PF-020 — these are CSS-level tokens only.

## Preview workflow

`dev/design-system/index.html` — a hand-authored, dev-only page that reuses
the production `/src/scripts/main.js` → `main.scss` pipeline for real
compiled tokens and fonts, plus minimal preview-specific `<style>` (one
utility class per token/specimen being arranged — swatches, type samples, a
spacing ruler, shape/shadow samples, a motion/focus demo, a table of
contents). Not a self-contained or parallel design system.

As of PF-030 this one file formally serves two roles at once — the PF-020
design-token reference and the PF-021+ component showcase — rather than a
second page or route (see "Component showcase (PF-030)" below for why no
new file was created).

**View it:** `npm run dev`, then visit `http://localhost:<port>/dev/design-system/`.

**Why it's safe:**

- Never listed in `vite.config.js`'s `rollupOptions.input` → never emitted
  by `npm run build` (proven, not just configured — `scripts/verify-build-output.mjs`
  walks the real `dist/` output after every build and asserts it contains
  **exactly** the 11 approved routes, nothing extra).
- `dev/` is not one of `scripts/validate-routes.mjs`'s 10 named
  `ROUTE_PARENT_DIRS` → invisible to its unexpected-file scan.
- The composer's `transformIndexHtml` only passes through **one exact
  file** — `dev/design-system/index.html` — via the pure, tested
  `resolveHtmlRequest()` function (`src/pages/route-resolution.js`).
  Any other unregistered HTML file, including a different file under
  `dev/`, still throws exactly as before PF-020.
- The preview HTML itself is checked by `npm run html:validate`
  (`html-validate` against the source file directly, same project config,
  without adding it to `dist/` or the route manifest).

**Retain, committed, documented** — useful for PF-021+ and for future
second-profession validation (PF-082).

## Base elements (PF-021)

Headings, body copy, links, buttons, labels, tags, lists, media frames,
section headers, containers, and form-control foundations — all demonstrated
at real compiled fidelity in the preview above.

**Applied site-wide now, by bare-tag selector** (no opt-in class needed —
the second visually-material production change after PF-020's global dark
theme): `<h1>`–`<h4>`, `<p>`/`<strong>`/`<em>`/`<small>`/`<code>`/`<kbd>`,
`<ul>`/`<ol>`/`<li>`, and `<a>` (content links only — `header a`/`footer a`
are explicitly exempted in `generic/_reset.scss` and remain unstyled until
PF-031's nav/header/footer redesign).

**Class-based, preview-only until a later milestone wires them into real
content:** `.btn`, `.tag`, `.media-frame`, `.section-header`, `.field`. No
PF-021 change touches `src/pages/templates/*.js` or
`src/components/partials/*.js` — these classes exist as proven, reusable CSS
ready for PF-031+ to adopt. (`.container` was in this list until PF-040
wired it into every template — see "Page shell (PF-040)" below.)

**Icon rendering is deferred, deliberately.** The dev preview is an
exact-file composer passthrough (see "Preview workflow" above) — no
build-time Node function can inject markup into it, so a `src/components/icon.js`
renderer would be dead code with no real caller in this milestone. The one
supplemental icon actually used — the `.field__error` indicator, decoration
only alongside the required persistent visible error text — is a single
hand-authored static inline SVG, sourced from Lucide's `circle-alert` icon
(`lucide@1.31.0`, path data at `node_modules/lucide/dist/esm/icons/circle-alert.mjs`):

```html
<svg
  aria-hidden="true"
  focusable="false"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="12" cy="12" r="10"></circle>
  <line x1="12" x2="12" y1="8" y2="12"></line>
  <line x1="12" x2="12.01" y1="16" y2="16"></line>
</svg>
```

External links get no icon at all in PF-021, for the same reason. A real
build-time renderer (importing named exports from the already-installed
`lucide` package, converting `[tag, attrs]` iconNode arrays to SVG strings)
is deferred until a real composed partial needs to generate icon markup
dynamically — e.g. PF-031 nav icons or PF-053 social links.

**Button boundary — border, not fill.** See the contrast matrix note above:
`.btn--primary`'s and `.btn--secondary`'s persistent `--color-border-interactive`
border, present in every state, is each button's WCAG 1.4.11 component
boundary. `.btn--ghost` has neither fill nor border and relies on its
already-verified text contrast, like a plain link.

**Hover lift is pointer-gated and never attached to focus.** `.btn`'s
`translateY` lift is scoped inside `@media (hover: hover) and (pointer: fine)`
and only fires on `:hover` — never on `:focus-visible`, so a keyboard user
tabbing to a button never sees it move. `:active` returns the transform to
`translateY(0)`. `.tag` has no transition or transform at all — it is not
interactive and must not look clickable.

**External links stay in the same tab by default.** No `rel` is added
unless a caller explicitly opts into `target="_blank"`, in which case
`rel="noopener"` (not `noreferrer` — no demonstrated need to suppress
referrer data) is added along with a `.visually-hidden` "(opens in a new
tab)" indication.

**Form semantics.** `.field--error` is a visual hook only (border color) —
it never sets `aria-invalid` or `aria-describedby` itself; calling markup is
always responsible for both. Checkbox/radio keep native semantics and
keyboard behavior; only `accent-color` is themed, no custom replacement
markup — this is also why forced-colors mode needs no special handling,
native controls re-skin themselves automatically. The `.field__choice`
`<label>` wraps its control directly (no separate `for`/`id` pairing, which
`html-validate`'s `no-redundant-for` rule flags when both are present), so
padding on the label genuinely enlarges the clickable area, not just its
visual footprint.

**No distinct `:visited` link style** — a deliberate style choice, not an
oversight (see `docs/DECISION_LOG.md`).

## Component showcase (PF-030)

PF-030's task is to create "a development-only or non-indexed showcase that
renders representative components, states, copy lengths, and responsive
behavior" (`docs/INITIAL_IMPLEMENTATION_TASKS.md`). That environment already
existed: PF-020 built the exact-file-scoped, `dist/`-excluded preview
mechanism and PF-021 substantially populated it with representative,
state-complete base-element specimens. PF-030 did not create a second page
or file — doing so would duplicate the exact-file composer exception this
project deliberately keeps to exactly one file (see the PF-020 entry in
`docs/DECISION_LOG.md`). Instead it formalized the existing preview as the
showcase:

- A real `<h1 id="page-title">` and short intro paragraph state the page's
  dual role and name the milestones (PF-031–PF-034) that will extend it.
- A grouped in-page table of contents (`<nav aria-label="On this page">`)
  organizes the current 17 specimen sections into "Design tokens (PF-020)"
  and "Base elements (PF-021)" — each future milestone adds its own group
  when it adds sections, rather than the page requiring a redesign later.
- A short static "How to review this page" checklist points at the six
  required widths, keyboard/focus, reduced motion, forced-colors, and 200%
  zoom — a convenience pointer, not a duplicate of the authoritative list in
  `docs/TESTING_AND_QA.md`.
- The whole specimen area is wrapped in `<main>`; the TOC `<nav>` is
  deliberately **not** nested inside a `<header>`/`<footer>` element, since
  `generic/_reset.scss`'s `header a, footer a { color: inherit }` rule
  (PF-021) is scoped exactly to real site chrome and must not silently apply
  to showcase-only navigation.
- `tests/preview-anchors.test.mjs` guards the two invariants this
  introduces: every TOC `href="#..."` resolves to a real `id`, every `id`
  in the file is unique, and exactly one `<h1 id="page-title">` exists (the
  "Headings & body copy" section's own `<h1>`–`<h4>` specimen is
  intentional demo content, not the page's title, and is excluded by that
  scoping).

No capability cards, project cards, nav/footer, or process/CTA components
were built or stubbed at the time — those were PF-031–PF-034's own scope
(PF-031 and PF-032 are now done — see below). No placeholder "coming soon"
sections were added either: an empty labeled section for a component that
doesn't exist yet risks implying it does — the same reason PF-032 added no
empty PF-033/PF-034 sections when it extended the showcase.

## Global navigation and footer (PF-031)

`src/components/partials/{header,nav,footer}.js` now render real,
production chrome: a brand link, a highlighted "Start a Project" CTA
(`site.primaryCta`), an accessible mobile menu, and a footer with
navigation, a privacy link, validated optional contact links, and a
copyright line.

**Menu control — a real `<button>`, not `<details>`.** An earlier draft of
this milestone used `<details>`/`<summary>` with desktop CSS forcing the
content open. Rejected: a closed `<details>` whose content is only _visually_
forced open creates a mismatch between the visible state and the native
accessibility state — two sources of truth that can diverge. Corrected to a
real `<button aria-expanded aria-controls="primary-navigation">` whose
`hidden` attribute (on both the button and `#primary-navigation`) is the
single authoritative visibility state, always mirrored into `aria-expanded`.
Server-rendered baseline: the button ships `hidden`; the nav never does — the
site is fully navigable at every width with zero JS. `src/scripts/nav-toggle.js`
only adds Escape-to-close-and-return-focus and a breakpoint-change
auto-close, both additive, neither required for baseline usability.
`src/scripts/nav-toggle-state.js` holds the pure `{ isDesktop, expanded } ->
{ state, effect }` decision logic — focus requests are a one-time returned
effect, never stored inside persisted state, so a second consecutive Escape
(menu already closed) can't re-trigger a stale focus move. `initNavToggle()`
resolves all five required elements (toggle, nav, label, both icons) before
touching the DOM at all — if any is missing, it bails out having mutated
nothing, leaving the safe server-rendered baseline intact.

**Sticky header, desktop only.** `header { position: sticky; }` is scoped to
`@media (min-width: $bp-md)` only. The collapsible mobile nav holds 6 links

- the CTA (7 rows) — a _pinned_ header containing the fully expanded menu
  could equal or exceed a short viewport's height (e.g. a landscape phone),
  trapping the page with no way to scroll past it. At desktop the nav is
  always a short horizontal row, so sticky there carries none of that risk.

**Skip-link focus, actually fixed.** All 11 skeleton files now use
`<main id="main-content" tabindex="-1">` — previously the skip link scrolled
`#main-content` into view but did not reliably move keyboard focus there
(a plain `<main>` isn't natively focusable). No JS added solely for this;
native fragment-navigation focus handling is sufficient once the target is
explicitly focusable. Paired with `--header-offset`
(`settings/_spacing.scss`, additive `calc()` built from `--touch-target-min`
and existing spacing tokens — no length-times-number multiplication, which
isn't reliably valid cross-browser CSS) via `scroll-margin-top` on
`#main-content`, so the desktop sticky header can't cover the target.
Scoped to that one selector, not a global `[id]` rule, so it never affects
the showcase's own unrelated TOC-anchor jumps.

**Active-route indication beyond color.** `[aria-current="page"]` existed
since PF-011 but was never visually styled. Now: `--color-accent-text` +
`font-weight: 600` + a persistent underline — never color alone.

**Footer link safety.** `contactEmail`/`social.github`/`social.linkedin`/
`resumePath` are still `null` (PF-003/PF-053), but the validation rules are
defined and tested now, in `src/pages/link-safety.js`, so a future populated
value can't silently become an unsafe attribute: `isSafeEmail()` rejects any
`%`, whitespace, or CR/LF (a `%`-bearing local part combined with raw
`mailto:` embedding could otherwise carry an encoded-CRLF header-injection
payload like `local%0d%0abcc%3aevil@evil.com` — every individual character
in that string passes a looser whitelist); `isSafeExternalUrl(url, hostGroup)`
requires HTTPS and a host from an explicit per-field allowlist
(`github.com`/`www.github.com`, `linkedin.com`/`www.linkedin.com` — never
"any HTTPS URL"). `footer.js` imports neither `site.js` nor `navigation.js`
directly — `navItems` and `site` are always caller-injected
(`renderFooter(navItems, site, { year })`), which is what keeps it pure and
testable with fixture data instead of the real singleton.

**Copyright.** `© {year} {siteName}. All rights reserved.`, `year` defaulting
to `new Date().getFullYear()` but overridable
(`renderFooter(navItems, site, { year: 2026 })`) for deterministic tests. A
production build run in a later calendar year intentionally produces a
different static copyright year with no source edit — expected, not a
regression.

**Icon renderer, finally built.** PF-021 deferred a build-time icon renderer
for lack of a real call site; the menu button's Menu/Close icons are that
call site. `src/components/icon.js` whitelists both tag names (`path`,
`circle`, `line`, `rect`, `polyline`, `polygon`, `ellipse`) and attribute
names (`d`, `cx`/`cy`/`r`, `x`/`y`/`x1`/`y1`/`x2`/`y2`,
`width`/`height`/`rx`/`ry`, `points`) — escaping alone would not stop a
dangerous attribute _name_ like `onload`/`onclick`/`style` from being
emitted as a live attribute, so unexpected names throw, exactly like
unexpected tags. `className` is the only way to attach an outer class — the
function itself emits the fixed `class` attribute name; callers can never
inject an arbitrary outer-attribute object. Lucide's `key` attribute is
confirmed absent from the raw `iconNode` data this renderer consumes (only
Lucide's own `createElement()`/React wrappers add it) — no special-casing
needed, since an unexpected attribute is rejected regardless of which one it
is.

**Visual review found two real CSS cascade defects, both fixed.** Neither
was caught by `npm run verify` — CSS _rendering_ isn't something `node:test`
can evaluate, only the _compiled stylesheet's content_, which is what the
new regression tests below check.

1. **`[hidden]` was silently overridden by a component rule.**
   `.site-header__menu-toggle` set `display: inline-flex` unconditionally.
   CSS cascade _origin_ ordering means a normal-priority author rule always
   beats a normal-priority user-agent rule, regardless of specificity — so
   this one declaration permanently defeated the browser's native
   `[hidden] { display: none }` behavior for the toggle button. It stayed
   visible in every state, at every width, which in turn crowded the
   desktop nav row into wrapping (defect 2 below). Fixed two ways:
   - `.site-header__menu-toggle`'s `display` is now scoped to
     `:not([hidden])`, so no author rule competes with `[hidden]` for this
     element at all.
   - `generic/_reset.scss` gained a project-wide safety net:
     `[hidden] { display: none !important; }` — **the one intentional
     exception to this project's normal avoidance of `!important`**,
     added only after proving it necessary, not by default. Scoping the
     specific rule (above) isn't sufficient on its own: same-specificity
     author rules are resolved by _source order_, not by which one
     "should" apply, so a _future_ component rule loaded later, at equal
     specificity, could reintroduce the exact same bug without a hard
     override. This rule guarantees `[hidden]` always wins project-wide,
     even if that happens — defense in depth, not a substitute for
     components scoping their own `display` rules correctly.
   - Guarded by `tests/hidden-visibility.test.mjs`, which compiles the
     real `main.scss` and asserts both the safety net's presence and that
     the specific rule stays well-behaved.
2. **The desktop nav row wrapped even though there was room.** `.site-nav`
   (the `<nav>` element, a flex item of `header`) had no `flex-shrink` of
   its own, defaulting to `flex-shrink: 1` — allowed to be compressed
   below its content's natural width whenever `header`'s available space
   was even slightly tight. Combined with `flex-flow: row wrap` on the
   desktop `.site-nav ul` rule, that compression is what let the "Start a
   Project" CTA break onto a second line — the row was never genuinely
   out of viewport width, it was being squeezed by its own flex item
   shrinking first. Fixed with `.site-nav { flex-shrink: 0; }` and
   `.site-nav li { flex-shrink: 0; }` at desktop, plus `flex-flow: row
nowrap` (removing wrapping as an escape valve entirely, rather than
   just making it less likely). The desktop nav gap was also tightened
   from `--space-5` to `--space-4` (an existing token, not a new one) as
   a modest additional safety margin — secondary to the structural fix,
   not a substitute for it. Guarded by `tests/site-nav-layout.test.mjs`.

## Header/navigation visual polish

A focused follow-up to PF-064 redesigned the header/nav's visual language.
Nav routes/labels/order and `nav-toggle-state.js`'s pure state logic are
exactly as PF-031 built them; `nav-toggle.js`'s DOM wiring and the desktop
breakpoint were both corrected in a second, defect-fix round (below) after
AAA's first browser review — see `docs/DECISION_LOG.md`'s dated entries for
the full rationale and all deliberate-failure passes across both rounds;
this section covers the resulting component contract.

**Brand mark — a replaceable, optional slot.** `site.brandMark`
(`src/config/site.js`) follows the same "absent renders nothing" pattern as
`site.resumePath`: `null` today, so `header.js`'s `renderBrandMark()` renders
nothing and the brand link shows `"AAA Portfolio"` alone. When set, the mark
renders as a purely decorative `<img alt="">` inside the same single
`<a class="site-header__brand" href="/">` as the visible text — one keyboard
stop, one accessible name, never two. `.site-brand__mark`
(`_site-header.scss`) fixes the slot's visual bounds independent of the
source image's real proportions — `height: 2.25rem; width: auto;
max-width: 3rem; object-fit: contain;` — so a future asset with a different
aspect ratio (a temporary legacy placeholder today, eventually the final
SBTech PH / Silver Bullet Tech emblem) can occupy the same slot with a
one-line config change, no markup or CSS change required. The temporary
placeholder's actual file is not yet in the repository — see
`docs/TESTING_AND_QA.md`.

**Active-route indicator — reserved space, not layout shift.** `.site-nav
a:not(.btn)` reserves a transparent `border-bottom: var(--focus-ring-width)
solid transparent` on **every** link, not only the active one; `.site-nav
a[aria-current='page']` then sets `border-bottom-color: var(--color-accent)`
plus `font-weight: 600` and `color: var(--color-accent-text)`. Reserving the
same space on every link means the active link never occupies a taller box
than an inactive one — switching which link is active causes zero layout
shift. `--color-accent` (not `--color-accent-text`) is used for the border
specifically because this design system's own token documentation already
scopes `--color-accent` to "large text, icons, borders, focus ring," and a
border is exactly that role. A real `border` property, not `box-shadow`, was
chosen so forced-colors mode auto-recolors it to the system highlight color
with no separate override — the same reasoning already established for
`.project-card`'s focus ring. Conveying the active state through
border+weight+color together (not color alone) satisfies the
color-cannot-be-the-only-signal requirement. `text-decoration: none` is
scoped to `.site-header__brand` and `.site-nav a:not(.btn)` only —
`elements/_links.scss`'s global underline rule is untouched everywhere else.

**Desktop link padding.** `.site-nav a:not(.btn)` gained `padding-inline` at
every width and `padding-block: var(--space-2)` at the desktop breakpoint
(replacing a prior `padding-block: 0`), giving every link real hover/active
surface and a larger click/touch target without materially growing the
header height. The existing anti-wrap architecture
(`.site-nav`/`.site-nav ul`/`.site-nav li { flex-shrink: 0; }`, `flex-flow:
row nowrap`, from the PF-031 defect fix above) was re-verified against the
added padding — but this same padding was also part of what pushed the
desktop breakpoint's minimum content width past 768px, requiring the
breakpoint correction described below. `tests/site-nav-layout.test.mjs`
still passes unchanged; the breakpoint it runs against changed.

### Defect-fix round: desktop overflow and mobile initial-open state

AAA's first browser review of the above found two release-blocking
defects, both fixed — full width-derivation math and root-cause tracing in
`docs/DECISION_LOG.md`'s dated entry; this is the resulting contract.

**Desktop breakpoint moved from `$bp-md` (768px) to `$bp-lg` (1024px).**
The nowrap/no-shrink desktop layout (`header`'s `flex-wrap: nowrap` +
sticky, and `.site-nav`'s `flex-shrink: 0` block) structurally could not
fit its own content at 768px once the link padding above and the brand
mark slot were both added — verified from real compiled token values in
`tests/site-header-overflow.test.mjs`, which computes the row's exact
fixed non-text overhead at a given viewport width and asserts it leaves
real headroom at 1024px, and did not at 768px. `$bp-lg` is an existing
token, not a new one. Three places had to move together and must stay in
sync: `_site-header.scss`'s `header` block, `_site-nav.scss`'s desktop
block, and `nav-toggle.js`'s hardcoded `window.matchMedia('(min-width:
64em)')` (JS cannot reference a Sass variable directly, so this is a
manually-kept-in-sync literal, documented at the call site). Desktop sticky
positioning is unchanged in behavior — it now simply begins at 1024px
alongside the rest of the layout it was always bundled with.

**`nav-toggle.js`'s initial render now actually collapses the nav on
mobile.** The bug: `initNavToggle()`'s first render called `applyDom()`
directly, but `applyDom()` never touched `nav.hidden` — only `dispatch()`
did, which the initial render never went through. `nav-toggle-state.js`'s
pure `deriveNavState`/`toDom` functions were already correct and already
fully tested; the untested gap was entirely in this DOM-wiring file. Fixed
by explicitly syncing `nav.hidden` from `applyDom()`'s own return value on
the initial render, the same way `dispatch()` already does after every
later state change. `tests/nav-toggle.test.mjs` (new) hand-rolls a minimal
`document`/`window` mock — no DOM library is installed — to exercise the
real wiring: fresh mobile/desktop loads, toggle activation, and a
desktop↔mobile resize round-trip.

**Mobile toggle redesign — icon-only, no visible "Menu"/"Close" text.**
Replaces the previous Lucide `Menu`/`X` icon swap with three plain
`<span class="site-header__menu-bar">` lines inside one
`aria-hidden="true"` wrapper, styled entirely in `_site-header.scss` — no
external icon dependency. The button's one real accessible name is now a
dynamically synchronized `aria-label` (`"Open navigation"` /
`"Close navigation"`), set by the same `applyDom()` function that already
syncs `aria-expanded`. The bars morph into an X purely via a
`[aria-expanded='true']` attribute-selector rule (the outer bars rotate
±45deg, the middle bar fades to `opacity: 0`) — driven by the identical
attribute `nav-toggle.js` sets, so there is exactly one canonical source of
truth for both the accessible state and the icon's visual state, unlike
the removed icon-swap approach, which tracked `openIcon.hidden`/
`closeIcon.hidden` as separate JS state. Removing the header's Lucide
usage doesn't orphan `src/components/icon.js` — it now has three other
real call sites (`capability-card.js`, `trust-list.js`, `solutions.js`).
Reduced motion needs no new rule: the bars' `transition` is already
covered by the existing global `@media (prefers-reduced-motion: reduce)`
rule in `generic/_document.scss`. Forced-colors mode gets an explicit
`@media (forced-colors: active) { .site-header__menu-bar { background-color:
CanvasText; } }` override, since the bars use `background-color:
currentcolor` (not a `border`/`outline` property like the button's own
boundary or the active-route indicator), so default forced-colors
visibility isn't guaranteed the same way for them.

**Asset-existence validation, generalized correctly.** The brand-mark slot
needed the same "does this public/-relative path exist on disk" check
`scripts/case-study-assets.mjs` already provided for case-study
`logo`/`gallery` fields — but importing a case-study-named module for an
unrelated content shape would have been a semantic mismatch. The generic
half of that logic (`findMissingAssets`) was extracted into a new
`scripts/asset-existence.mjs`; `case-study-assets.mjs` now re-exports it as
`findMissingCaseStudyAssets` for full backward compatibility, keeping only
`collectCaseStudyAssetPaths` (genuinely case-study-shape-specific) for
itself. `scripts/validate-routes.mjs`/`scripts/verify-build-output.mjs` each
call the generic helper directly for `site.brandMark`, checked against
`public/` and `dist/` respectively.

## Capability cards (PF-032)

`.capability-card` (`src/styles/components/_capability-card.scss`) is
**CSS-only** — there is no `renderCapabilityCard()` function and no content
data module. `solutions.js`/`home.js` are still placeholders, so there is no
real production template to call a renderer from — the same precedent as
`.btn`/`.tag`/`.media-frame` in PF-021, which shipped CSS-first and were
proven only in the showcase until a real call site existed. Building a
renderer now, with nothing to call it, would repeat the exact mistake an
earlier draft of PF-021's icon renderer made (built ahead of any real
caller, sitting unused until PF-031 finally gave it one). The six cards
currently live only as hand-authored, literal markup in
`dev/design-system/index.html` — **not** a live render call — using the
real compiled component classes.

**PF-052 — `renderCapabilityCard()` gained an optional `headingLevel`
parameter** (closed `Set([3, 4])`, default `4` unchanged), the identical
pattern PF-051 gave `renderCta()` and PF-052 also gave `renderProjectCard()`
— see "Work index (PF-052)" below for the full rationale. This corrected a
real, already-shipped defect: `home.js`'s Capabilities section nests these
cards directly under its own `<h2>`, so the cards' own heading needed to be
`<h3>`, not the component's prior unconditional `<h4>`. `.capability-card__heading`
already declared its own explicit `font-size: var(--font-size-h3)`
independent of tag, so the fix is a pure markup/semantics correction with
zero visual change.

**Grid: `auto-fit`/`minmax()`, not viewport-breakpoint-gated column
counts.** An earlier version used `@media (min-width: $bp-md/$bp-lg)` to
force 2 then 3 fixed columns — but that only knows the viewport's width,
not the grid's actual available width. Right around the old 1024px
breakpoint, three forced columns left only ~231px of real text area per
card, enough to wrap "Workflow & Process Solutions" onto four lines. Fixed
with a mobile-first `grid-template-columns: 1fr` default, overridden only
above `@media (width >= 36em)` with `repeat(auto-fit, minmax(20rem, 1fr))`
— column count is derived from the real available width, dropping to fewer
columns exactly when more wouldn't be comfortable.

**Two separate, stacked width bugs — the section's own width was
necessary but not sufficient.** Visual review then found the grid still
rendering single-column at desktop widths after the above fix, in a
section only ~400-550px wide despite far more room being available. The
real cause: `elements/_body-copy.scss` has a project-wide
`ul, ol { max-width: var(--width-reading); }` rule (68ch — a sensible
reading-length cap for a list of _text_, wrong for a card grid) that
applies to every `<ul>`/`<ol>` in the document, `.capability-cards`
included. `.capability-cards` (specificity 0,1,0) beats bare `ul` (0,0,1)
for any property _both_ rules declare — but the cascade resolves per
property, not per rule: `.capability-cards` never declared `max-width` at
all, so that property had no competing declaration and the generic ~68ch
constraint applied completely unopposed, regardless of how wide its
_ancestor_ section was made. `.preview-section--wide` (`--container-wide`,
90rem/1440px — an existing token, applied to the outer `<section>` instead
of the page's narrower default) was a real, correct fix for the section's
own width, but it doesn't help if the grid element one level in is
independently capped narrower than that. Fixed with an explicit
`max-width: none;` on `.capability-cards` itself. The same audit found one
more of the same bug class: `elements/_body-copy.scss`'s generic
`li { margin-bottom: var(--space-2); }` was leaking onto `.capability-card`
(never overridden), stacking extra space under every card on top of the
grid's own `gap` — fixed with an explicit `margin: 0;`.

Real column-count/width math — 1 column at 320/375px, 2 at 768/1024px, 3
comfortable columns at 1440/1920px — is verified in
`tests/capability-card-layout.test.mjs`, which resolves the actual
cascade-winning value for the properties above from the real compiled
stylesheet (matching every applicable rule by specificity and source
order, the same two tie-break axes a browser uses) rather than assuming a
declaration that merely exists somewhere in the file is the one that
applies. See `docs/DECISION_LOG.md`.

**The six descriptions in the showcase are representative/provisional
component copy, not final production marketing content.** Final category
copy is decided when a real page composes these cards (PF-041/050+); do not
treat the showcase text as approved Solutions-page content. Likewise, every
interactive specimen links to `/solutions/` — the one existing, approved
route — purely to demonstrate the stretched-link pattern navigating
somewhere real. It is not a hint at final information architecture, and no
route content changed as part of PF-032.

**Full solid accent backgrounds, not a neutral surface with an accent
border.** The requirements doc calls for "bold solid... colors," and PF-020
reserved the capability-accent tokens without ever using them as a
background — so before committing to that, every accent was verified in
that specific role rather than assumed safe. One uniform rule covers all
six: **dark ink (`--color-canvas`) is used for title, description, icon,
and the inner focus ring on every variant.** Light/white text was checked
and rejected — it fails badly on all six (as low as 1.60:1); dark ink
clears the 4.5:1 body-text floor on all six with real margin (weakest:
`--accent-violet` at 5.43:1 flat).

**Sixth accent — `--accent-magenta` (`#ef4fa0`).** PF-032 needs six card
variants; PF-020 reserved only five. Independently defined, not aliased to
any existing token, following the same precedent as
`--color-accent-fill`/`--color-accent-active`.

**Abstract background pattern, and why its opacity is 5%, not 8%.** Each
card has a diagonal-line pattern (`repeating-linear-gradient` +
`color-mix(in srgb, var(--color-canvas) 5%, transparent)`) — dark ink laid
over the accent fill at low opacity, satisfying "custom abstract line...
background pattern" without a new asset (no image pipeline exists yet,
confirmed by inspection). Because title, description, icon, and the inner
focus ring can all sit on top of this pattern, their contrast has to be
checked against the **darkest composited stripe**, not just the flat
accent. At an initially-assumed 8% opacity, `--accent-violet`'s margin over
the 4.5:1 floor was only 5.6% — thin by this project's own established
standard, where every other verified pair carries a double-digit margin.
Reduced to **5%**, restoring real margin (weakest, `--accent-violet`:
4.996:1, +11.0%).

**Contrast matrix**, verified programmatically by
`tests/capability-card-contrast.test.mjs` (compiles the real `main.scss`,
including the actual pattern rule, so a future opacity change that isn't
re-verified fails the test on its own rather than silently going
unchecked):

| Accent  | Dark ink vs flat (4.5:1 floor) | Dark ink vs 5% pattern composite (4.5:1 floor) | vs `--color-canvas` boundary (3:1 floor) | vs `--color-surface-1` boundary (3:1 floor) |
| ------- | ------------------------------ | ---------------------------------------------- | ---------------------------------------- | ------------------------------------------- |
| lime    | 11.082                         | 10.054                                         | 11.082                                   | 9.737                                       |
| amber   | 10.869                         | 9.862                                          | 10.869                                   | 9.549                                       |
| coral   | 5.736                          | 5.262                                          | 5.736                                    | 5.040                                       |
| violet  | 5.426                          | 4.996                                          | 5.426                                    | 4.767                                       |
| cyan    | 8.991                          | 8.187                                          | 8.991                                    | 7.900                                       |
| magenta | 5.750                          | 5.274                                          | 5.750                                    | 5.052                                       |

**Focus indicator — two-tone, full-card, and applied identically in
forced-colors mode.** The site's default `--color-focus-ring` (cobalt,
`#2e6bff`) fails the 3:1 non-text floor against every one of the six
accents (1.27–2.60:1) — a gap only visible once an accent could be a card's
own background. A single dark ring alone isn't sufficient either: it's
illegible against the surrounding dark canvas/surface page. The fix is two
concentric rings — an inner dark ring (`--color-canvas`, contrasts against
every accent: 4.996–11.082:1) and an outer light ring
(`--color-text-primary`, contrasts against the surrounding page:
15.585–17.738:1) — applied around the **whole card**, not just the heading
link, via `.capability-card:has(.capability-card__link:focus-visible)`; the
link's own local outline is suppressed so exactly one ring system is ever
visible. Under `forced-colors: active`, `box-shadow` is dropped, so the
same card-level selector switches to a real `outline: 2px solid Highlight`
instead — the full-card footprint is preserved in both modes, never
collapsing back to a small link-sized box.

**Forced-colors treatment beyond focus.** Background/pattern disappear
under `forced-colors: active`, so `.capability-card` gains an explicit
`border: 1px solid CanvasText` as its boundary — nothing else supplies one
once the fill is gone. Icon/arrow SVGs use `stroke="currentColor"` (Lucide
icons are stroke-based outlines, not filled silhouettes — confirmed
directly from the installed package's `defaultAttributes.mjs`), inheriting
`color` from the wrapping element, which is what lets forced-colors
recolor them automatically.

**Interactivity is driven by link presence, not a modifier class.** Every
interactive rule (stretched hit area, arrow visibility, hover-lift,
`:active` feedback, the focus ring) is scoped to
`.capability-card:has(.capability-card__link)` — a card gets none of it
just because a real `.capability-card__link` element is absent, regardless
of what modifier classes are or aren't present. Full-card click area uses
the "stretched link" pattern: only the heading text is a real `<a>`; its
`::after` extends the hit area to the whole card, keeping the accessible
name to just the title rather than the whole paragraph. Decorative layers
(the pattern, the icon, the arrow) all carry `pointer-events: none` with
explicit `z-index` stacking, so the stretched link's `::after` is always
the actual click target regardless of paint order.

**`:active` sets an explicit rest transform, not a color filter.** `:hover`
and `:active` can be true simultaneously (mouse held down while hovering);
a filter-only pressed state would leave the hover-lift's transform in
effect, so the card would never visibly "press." `:active` is declared
after the hover block (same specificity, source order wins) and sets
`transform: translateY(0)` plus a `--shadow-md` step-down — no
`filter: brightness()`, which would alter the actual rendered text/
background colors while pressed, outside what the contrast tests cover.
`:active` is not nested inside the hover media query, so touch gets the
same pressed shadow feedback without depending on hover capability at all.

## Project cards (PF-033)

`.project-card` (`src/styles/components/_project-card.scss`) was
originally **CSS-only** — no `renderProjectCard()` function and no content
data module, since `work/index.js` and all three case-study content files
were still placeholders and there was no real production template to call
a renderer from (the same precedent as `.btn`/`.tag`/`.media-frame`/
`.capability-card`). PF-041 gave it a real first caller
(`home.js`'s Selected Work section) and PF-052 gave it a real second
caller (`work.js`'s Work index) — the three case-study content files
themselves remain placeholders (PF-060–062). The showcase specimens
(`dev/design-system/index.html`) remain hand-authored, literal markup
using the real compiled component classes — still not a live render call.

**PF-052 — `renderProjectCard()` gained an optional `headingLevel`
parameter** (closed `Set([3, 4])`, default `4` unchanged), the identical
pattern PF-051 gave `renderCta()` and PF-052 also gave
`renderCapabilityCard()` — see "Work index (PF-052)" below. This corrected
a real, already-shipped defect: both `home.js`'s Projects section and
`work.js`'s Projects section nest these cards directly under their own
`<h2>`, so the cards' own heading needed to be `<h3>`, not the component's
prior unconditional `<h4>`. The desktop featured-card override
(`.project-card--featured .project-card__heading { font-size:
var(--font-size-h3); }`) is class-scoped, not tag-scoped, so the fix is a
pure markup/semantics correction with zero visual change.

**Deliberately NOT full-bleed bold color like `.capability-card`.**
Requirements §7.2 frames project cards as _evidence_, not decoration
("Project cards must provide evidence rather than decorative claims"), and
no approved per-project brand colors exist to fill a card with even if
that were the direction. Cards use the neutral dark system —
`--color-surface-1` background, `--color-text-primary`/`-secondary` for
title/summary, `--color-accent-text` for the action label — and every one
of those pairings is already asserted, unmodified, in
`tests/design-tokens.test.mjs`. No new contrast surface was introduced by
this component.

**Content: no invented summaries, technologies, outcomes, or images.**
None of that content has been approved for any of the three real projects
— `DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md` only ever names them, it
never supplies problem/outcome/tech copy. The three real showcase cards
carry title and link only. Category text is shown only where the
requirements doc gives an exact phrase that reads naturally as a short
tag — true for Business Workflow System ("Government/business workflow
system," used verbatim) only. eBarangay's only approved phrase, "Personal
full-stack case study," is a sentence fragment describing the case-study
document, not a category-shaped noun phrase; turning it into something
like "Personal Project" would be new copy, not a quotation, so it is
omitted rather than paraphrased. FES Challenger has no category term at
all. This makes the three real cards the genuine, non-contrived specimens
for the missing-category/missing-summary/missing-tags states.

**Missing-image treatment.** All three real cards need this today — the
primary state this milestone ships, not a rare edge case. An empty
`.media-frame` (its existing `background-color: var(--color-surface-1)`,
no `<img>`) is a clean, honest, visibly-empty "viewport," not a disguised
fake screenshot. No decorative pattern was added to stand in for a
screenshot — that risked being mistaken for real project evidence. One
demo-only, clearly-fictional specimen shows the populated path instead,
with an original inline-SVG abstract composition (not a screenshot).

**"Browser or device frame created with HTML and CSS"** (§7.2): an
original `.project-card__frame-dots` chrome bar (three CSS radial-gradient
dots, no new asset) sits above the existing `.media-frame`.

**One shared list, not two.** Featured and secondary cards are `<li>`
siblings of the same `<ul class="project-cards">` — `.project-card--featured`
spans every column (`grid-column: 1 / -1`) instead of living in a second,
disconnected structure. One list means one place to get the
generic-`ul`/`li` reset right, not two.

**Grid minimum: 21rem, not the originally-proposed 22rem.** Computed
against the real compiled tokens (`--container-wide`, `--gap-lg`, the
showcase's `clamp()` gutter): 22rem produced only 1 column at 768px (2
columns need `2×minCol + gap ≤` content width, which only holds up to
~21.04rem at that breakpoint) — exactly the contingency the original plan
flagged ("if 22rem doesn't cleanly produce 2 columns at 768px... the value
is adjusted and re-verified"). 21rem restores the intended 1/1/2/2/3/3
column pattern with a comfortable ~227–412px text area at every required
width. Mobile-first `1fr` default, overridden only above
`@media (width >= 36em)` — same plain, no-nested-math-function pattern as
`.capability-card`, for the same reason (avoids relying on a more exotic
CSS construct than necessary).

**Generic-list leak, reset from the start, not discovered after a review
round-trip.** `.project-cards`/`.project-card` explicitly set
`max-width: none;`/`margin: 0;` in the first draft — `elements/_body-copy.scss`'s
generic `ul, ol { max-width: var(--width-reading); }` and
`li { margin-bottom: var(--space-2); }` apply unopposed to any `<ul>`/`<li>`
that doesn't explicitly override those specific properties, regardless of
the class's own higher specificity (cascade resolves per property, not per
rule) — the exact defect PF-032 found and fixed after shipping. Verified
by real cascade resolution (`resolveProperty()`,
`tests/helpers/cascade-resolver.mjs` — extracted from
`tests/capability-card-layout.test.mjs` for this, its second real caller),
not presence.

**Every linked card carries exactly one `.project-card__action`, and
never one without the other.** "View Case Study →" is a visible,
`aria-hidden="true"` text affordance — decorative reinforcement of the
heading link, not a second focusable control. Markup omits both together
on non-interactive cards; CSS additionally gates the action's visibility
on `.project-card:has(.project-card__link)` (`display: none` by default)
as a second, independent safeguard.

**Full-card focus ring — single tone, not `.capability-card`'s two.** The
stretched link makes the entire card the click target, so a ring drawn
only around the heading text would misrepresent the actual interactive
region — applied at the card level exactly like `.capability-card`'s:

```scss
.project-card__link:focus-visible {
  outline: none; // replaced by the card-level ring below
}
.project-card:has(.project-card__link:focus-visible) {
  outline: var(--focus-ring-width) solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

Only one tone is needed here, unlike `.capability-card`'s inner/outer
pair: this ring only ever touches `--color-surface-1` (the card's own
fill) on one side and `--color-canvas`/`--color-surface-1` (the page
behind it) on the other, and `--color-focus-ring` is already verified
against both, unmodified, in `tests/design-tokens.test.mjs` under
`FOCUS_INDICATOR_MIN`. `.capability-card` needed two tones because its
background _is_ a bright, varying accent color the default ring fails
against; this card's neutral surface doesn't create that problem.
**Forced-colors gets no separate ring override** — because `outline` (not
`box-shadow`) is used unconditionally, outline-color is already one of
the properties forced-colors mode recolors to the system highlight
automatically, and the full-card footprint carries over for free since
the same `:has()` rule applies in every mode. (Contrast with
`.capability-card`, which uses `box-shadow` normally — dropped under
forced-colors — and needs an explicit `outline` swap just for that mode.)
`.project-card` still gains `border: 1px solid CanvasText` under
`forced-colors: active` for the card boundary, a separate concern.

**Interactivity is link-presence-driven**, identical pattern to
`.capability-card`: every interactive rule scoped to
`.project-card:has(.project-card__link)`, never a modifier class.
Stretched-link `::after`, decorative layers (`__frame-dots`, `__media`,
`__action`) carrying `pointer-events: none` under an explicit `z-index`
stacking order, hover-lift gated to `(hover: hover) and (pointer: fine)`,
`:active` declared after it with an explicit `transform: translateY(0)`
reset (never `filter`) so touch gets its own pressed feedback without
depending on hover.

**`.project-cards--featured-pair` (PF-041) — a documented grid variant,
not a workaround.** AAA's browser review of the real homepage found the
default `auto-fit`/`minmax(21rem, 1fr)` grid resolving to 3 columns at
1440/1920px (the container is wide enough for 3 tracks), but with exactly
one featured card (`grid-column: 1 / -1`, spanning the full row) plus two
secondary cards, the two secondary cards filled only 2 of those 3 tracks —
the third sat empty and the section read as unbalanced. `auto-fit` derives
its column count purely from available width; it has no way to know a
featured item removes itself from that count. **Fix:** an explicit
modifier, applied to the same `<ul class="project-cards">` at the same
`≥36em` breakpoint:

```scss
@media (width >= 36em) {
  .project-cards--featured-pair {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

A fixed `repeat(2, 1fr)` — not a second, narrower `auto-fit`/`minmax()` —
because with exactly two non-featured cards there is no "as many columns
as fit" question to ask; there are only ever two cards to place, so a
fixed 2-track grid is correct at every width from 36em up, including
1440/1920px where the default grid's own math would otherwise reach 3.
Below 36em the unconditional single-column base rule (unchanged) still
governs, so 320/375px is unaffected.

**Applied by the renderer from the real item composition, not a
page-specific selector.** `renderProjectCards()`
(`src/components/project-card.js`) adds the modifier class only when the
items passed to it are exactly one `featured: true` item plus exactly two
non-featured items — detected from the actual array, not a homepage flag —
so any future caller with the same shape (e.g. a smaller Work-index
listing) gets the same correct layout automatically, and a different shape
(more secondary cards, or none featured) keeps the default `auto-fit`
grid, which already handles those cases correctly. No component SCSS
outside this one new rule block was changed; `.project-card`,
`.project-card--featured`, and every other existing rule are untouched.

**Showcase updated to match.** The showcase's own "three real projects"
specimen (`dev/design-system/index.html`) demonstrates the identical
one-featured-plus-two-secondary shape, so it carries the same modifier now
— the only showcase markup change; the three demo-only specimens (no
featured card among them) are untouched.

## Process, trust, engagement, and CTA components (PF-034)

Four components — `.process-steps`, `.trust-list`, `.engagement-options`
(`src/styles/components/_process-steps.scss`, `_trust-list.scss`,
`_engagement-options.scss`) and `.cta` (`_cta.scss`) — are all **CSS-only**,
same precedent as `.capability-card`/`.project-card`: no `renderX()`
function, no content data module, no schema fields. `home.js`, `process.js`,
and `contact.js` are all still placeholders, so there is no real production
template to call a renderer from. Specimens live only as hand-authored,
literal markup in `dev/design-system/index.html` — not a live render call.

**Interactivity is asymmetric, unlike the two card components.**
`.capability-card`/`.project-card` are whole-card interactive via
`:has(...__link)`. Here, only `.cta`'s `.btn` action link and the single
section-level links following `.process-steps`/`.trust-list` are
interactive — the `<li>` items themselves (`.process-steps__step`,
`.trust-list__item`, `.engagement-options__item`) carry no cursor change,
hover, active state, or focus/keyboard stop of their own, and are not
focusable. A per-item link on process steps or trust indicators would
fragment "one keyboard stop per action" and imply destinations that don't
exist; engagement options have no link at all.

**No invented per-item copy.** Every string in the four showcase specimens
is either quoted verbatim from `DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md`
or explicitly marked `provisional` in the showcase's own prose. AAA has
approved all three provisional strings for use as **provisional showcase
copy** — approved for this development showcase, but still subject to
final production-content review when a real page composes these sections
(PF-041), not yet approved as final production copy:

| Component          | Verbatim source                                                | Provisional (approved for showcase use)                            |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------ |
| Process steps      | Four stage names (§9.7)                                        | "See the Full Process" link label                                  |
| Trust indicators   | Three assurances (§9.3)                                        | "Learn About My Approach" link label + target (About, not Process) |
| Engagement options | "Start with what creates the most value." + four labels (§9.8) | The one-sentence paraphrase of §9.8's explanation instruction      |
| CTA                | Full Final CTA copy (§9.10)                                    | — (fully approved already, as final production copy)               |

No per-step/per-item supporting sentence is shown for process steps or trust
indicators — none is approved at that length, and for process steps the
fuller wording belongs to the dedicated Process page (PF-051); reusing it
here would duplicate page copy, which PF-034's own scope explicitly rules
out ("expand into dedicated-page presentations without duplicating page
copy").

**Engagement options are deliberately not composed from `.tag`.** The four
labels (Fixed scope, Minimum viable solution, Phased development,
Existing-system improvement) are meaningful ways of working, not
filterable category/technology metadata — rendering them as pills would
misread the section as a tag cloud. `.engagement-options__item` is a
static row block (full border + left accent edge, `border-radius-sm`, no
pill shape), with no arrow/chevron implying more detail sits behind it.

**Trust icons are hand-authored static SVG, not a renderer call.** The
showcase is static HTML with no access to the build-time icon renderer
(`src/components/icon.js`), so each icon's path data was copied directly
from the installed `lucide` package's source (`package-check`, `handshake`,
`workflow`), rendered with the same `fill="none" stroke="currentColor"`
attribute set every other inline SVG in this project already uses, and
marked `aria-hidden="true" focusable="false"` — decorative, adding no
information beyond the heading text beside it. `icon.js` itself is
untouched; there is still no real production caller for it beyond nav.

**`max-width: none`/`margin: 0`/`list-style: none` reset from the first
draft** on all three list-based components (`.process-steps`, `.trust-list`,
`.engagement-options`) — the same `elements/_body-copy.scss` generic
`ul, ol { max-width: var(--width-reading); }` / `li { margin-bottom:
var(--space-2); }` leak already documented for `.capability-card`/
`.project-card` above. Verified via the shared `tests/helpers/cascade-resolver.mjs`
in each component's own test file. `.process-steps` is this project's first
`<ol>`-based grid component; its reset was the one PF-034 invariant put
through a deliberate-failure pass (temporarily reverting `max-width: none`
correctly failed the resolved-cascade assertion, then was restored) — the
other two components repeat an already-proven `ul`/`li` pattern, so no
second deliberate-failure pass was run for them (`docs/DECISION_LOG.md`).

**`.cta` is a restrained contained panel, not a full-bleed accent band.**
`--color-surface-1` fill plus a `--color-border` boundary — deliberately
lower-key than `.capability-card`'s solid accent fills, since an invitation
reads differently from a decorated showcase item. Not hardcoded to the
homepage: PF-050/PF-060-062 can reuse it once they have their own approved
inquiry-CTA copy. The action button defines no focus system of its own —
it keeps the global `:focus-visible` ring exactly as `.btn` already
declares it, and that ring's contrast against `--color-surface-1` is
already verified in `tests/design-tokens.test.mjs` (the same pair
`.project-card`'s ring relies on), so no new contrast check was needed.
`.cta__body` is genuinely optional: the second showcase specimen omits the
element entirely rather than rendering it empty.

**PF-051 — `renderCta()` gained an optional `headingLevel` parameter**
(closed `Set([2, 3])`, default `3` unchanged) so a CTA that is itself a
top-level sibling section (Process's closing CTA, which needed `<h2>`, not
a `<h3>` orphaned beneath its sibling `<h2>` sections) can request a
different heading tag without duplicating the component. `.cta__heading`'s
`font-size: var(--font-size-h2)` was already declared explicitly and
independent of tag, so the tag change carries zero visual/CSS change. See
this document's "Process page (PF-051)" section below for the full
rationale and `docs/DECISION_LOG.md`'s PF-051 entry for the decision
record.

**Forced-colors boundaries, handled per component depending on what the
boundary depends on in normal mode:**

- `.cta` already has a real border in normal mode; an explicit
  `border: 1px solid CanvasText` override is added anyway, belt-and-
  suspenders, matching the same rule already established for
  `.capability-card`/`.project-card`.
- `.engagement-options__item` also already has a real border in normal
  mode — border-color is one of the properties forced-colors mode recolors
  automatically, so it needs **no** explicit override, unlike the two
  components above (which relied on `background-color`-only boundaries
  before their overrides were added).
- `.process-steps__number`'s only boundary is its `background-color` fill;
  an explicit `border: 1px solid CanvasText` keeps the badge shape visible
  once that fill is dropped.
- `.trust-list__item` has no background/border boundary in either mode —
  nothing to preserve.
- No static container (`.process-steps__step`, `.trust-list__item`,
  `.engagement-options__item`) gains a `:focus-visible`/`outline` rule in
  any mode — only real interactive elements keep that treatment.

## Page shell (PF-040)

Assembles the already-approved header/main-landmark/footer chrome (PF-011,
PF-031, Gate C) into the reusable production shell that every route uses.

**`.container` is now wired, at the template layer.** Each of
`src/pages/templates/{standard,listing,case-study}.js` wraps its own `main`
output in `<div class="container">...</div>`, rather than the skeleton (the
11 physical route HTML files, e.g. `index.html`) wrapping `<!--@content-->`
directly. The composed output is identical either way — `compose.js`
substitutes a template's `main` string exactly where the marker sat, inside
`<main id="main-content" tabindex="-1">` — but template-level ownership
keeps container choice a per-template/per-section decision. This matters
because PF-041's homepage brief (hero, capability-card band, CTA) is
exactly the shape that commonly wants full-bleed section backgrounds with
only the text centered inside; a single global wrapping container would
force every later full-bleed section to fight it with negative-margin
break-out hacks. `.container--wide`/`--reading` variant selection per
template is deferred the same way — no real content demonstrates the need
yet.

**Minimum-viewport shell.** `body` (`generic/_document.scss`) is a flex
column with `min-height: 100dvh` (upgraded from `100vh` via `@supports`,
not a second bare declaration, which would trip
`declaration-block-no-duplicate-properties`), and `#main-content`
(`objects/_page-shell.scss`) carries `flex: 1`. This pins the footer to the
viewport bottom on short routes (there was previously no mechanism for
this — footer sat wherever content ended, leaving empty canvas below it)
without constraining long ones: `min-height`, never `height`, means there's
never a forced-shrink scenario, so a page whose content genuinely exceeds
the viewport just grows past it, footer landing naturally after content.

**Vertical rhythm.** `#main-content` also carries `padding-block:
var(--space-section)` — a token defined since PF-020 (`clamp(4rem, 3rem +
5vw, 8rem)`) but unused until now. Gives every route consistent breathing
room between chrome and content. If a future section needs to sit flush
against the header (a full-bleed hero with no gap), that page's template
will need a local override — not solved speculatively here.

## Homepage (PF-041)

The real caller every capability-card/project-card/process-steps/
trust-list/engagement-options/CTA revisit condition above pointed to.
`src/content/pages/home.js` now carries real content; `src/pages/templates/home.js`
composes it via six new renderer modules in `src/components/`
(`capability-card.js`, `project-card.js`, `process-steps.js`,
`trust-list.js`, `engagement-options.js`, `cta.js`) — each emitting exactly
the markup contract documented in this file's own component sections above
and proven in `dev/design-system/index.html`, with no change to any
component's SCSS or approved showcase markup.

**Hero and Problems preview have no prior component — genuinely new,
built only from already-approved base elements.** Unlike the six Gate-C
components, `.hero` (`src/styles/components/_hero.scss`) and the Problems
preview section were never part of PF-032/033/034's scope. `.hero` is a
thin two-column (stacked on mobile) layout wrapper using only
`.text-display`, `.text-lead`, `.btn`, and existing spacing/breakpoint
tokens — no new color, pattern, or interaction. Problems preview uses
`.list--marked` and `.text-lead` directly, no new component CSS at all.
About preview likewise reuses `.section-header` and base body copy only.

**Per-section containers, not one page-level wrapper.** `home.js` is the
first template that doesn't wrap its whole `main` in one
`<div class="container">` — each top-level `<section>` (`.hero`,
`.home-section`) owns its own inner `.container`, exactly the shape the
PF-040 decision-log entry anticipated when it made `.container`
template-owned rather than skeleton-owned. `scripts/verify-build-output.mjs`
and `tests/render.test.mjs` both special-case the home route to verify this
end-to-end instead of the single-wrapper invariant every other route keeps.
(`.home-section` was later generalized to `.page-section` in PF-050 for its
second real caller, `solutions.js` — see "Solutions page (PF-050)" below;
the class name here reflects what PF-041 itself shipped.)

**Hero sits flush against the header.** `body[data-page='home'] #main-content`
locally zeroes `padding-block-start` (leaving `padding-block-end` at the
shell default so the CTA section still gets normal breathing room before
the footer) — the exact narrow, page-scoped override the PF-040 decision
log's revisit condition described, not a change to the shell default itself.

**Icon validation is layered through a pure registry, not through
renderer modules.** `src/pages/icon-registry.js` is the single closed-set
source of truth for every icon key (`TRUST_ICONS`, `CAPABILITY_ICONS`) and
capability accent (`CAPABILITY_ACCENTS`) a route's content may reference,
plus the fixed `CARD_ARROW_ICON` every linked capability/project card uses.
It exports plain data only — no markup-building, no `escapeHtml` — so
`src/pages/content-schema.js` can validate against it without depending on
any `src/components/*` renderer module, the same role `link-safety.js`
already plays for link fields. Renderers import the identical registry
(not a duplicate) to resolve a validated key to a real Lucide iconNode
before calling `icon.js`'s `renderIcon()`. Every icon in the registry was
preflighted against `icon.js`'s real `ALLOWED_TAGS`/`ALLOWED_ATTRS` by
reading each icon's source in `node_modules/lucide/dist/esm/icons/*.mjs`
(v1.31.0) — all use only already-whitelisted `path`/`rect`/`circle` tags
and `d`/`width`/`height`/`x`/`y`/`rx`/`cx`/`cy`/`r` attributes, so `icon.js`
itself needed no change. Trust-list and capability-card icons now go
through `renderIcon()` for the first time in production code — the
showcase's hand-authored static SVGs (no build step to call a renderer
from) remain unchanged and untouched.

**Selected work uses reduced fields, matching the existing real-card
state exactly.** Same content gap PF-033 already documented — no
problem/outcome/technology copy is approved for any of the three real
projects (PF-003 still blocked). The homepage ships the identical
title/category/link fields already proven in the showcase's real cards, an
empty `.media-frame` (no `<img>`, no decorative stand-in), and the same
missing-category treatment (Business Workflow System only, verbatim
"Government/business workflow system"; FES Challenger and eBarangay omit
it rather than paraphrase). **FES Challenger is the featured card** — the
first-listed project in both §9.6 and §11 of the requirements doc, a
non-arbitrary rule (the showcase's own featured pick was explicitly
arbitrary). This exact one-featured-plus-two-secondary shape is also what
`.project-cards--featured-pair` exists for — see "Project cards (PF-033)"
above for the grid defect AAA's browser review found and the fix.

**Content provenance.** Every homepage string is one of: quoted/approved
verbatim from `DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md`, existing
approved project/site data, or provisional copy pending AAA's production
content sign-off. Verbatim: the hero headline/supporting copy/CTA labels
(§3.4), the three trust assurances (§9.3), the four problem items and
reassurance sentence (§9.4), the six capability-card headings (§7.1), the
"Explore All Work" and "Government/business workflow system" project
strings (§9.6/PF-033), the four process stage names (§9.7), the engagement
lead sentence and four labels (§9.8), and the full Final CTA copy (§9.10,
already marked fully approved above). Provisional, pending sign-off: the
`<title>`/meta-description pairing (the meta description itself is
verbatim §3.2), every section eyebrow/heading, the six capability-card
descriptions (carried over unchanged from their existing PF-032 provisional
flag), the About preview paragraph (drafted only from the facts §9.9/§10.5
already state as approved — no fabricated specifics), and the "Learn About
My Approach"/"See the Full Process"/engagement-lede strings (already
approved for provisional showcase use per the PF-034 entry above, now
proposed as production copy). The full string-by-string table is recorded
in the PF-041 implementation record, not duplicated here to avoid a second,
driftable copy of the same classification.

**Test strategy — one shared markup contract, two callers.** Structural
assertions previously duplicated ad hoc inside each
`tests/*-layout.test.mjs`/`cta-section.test.mjs` file (list parentage, item
counts, link/action pairing, decorative-icon a11y, section-level action
placement) are extracted into `tests/helpers/component-markup.mjs` — the
same extraction pattern `tests/helpers/cascade-resolver.mjs` already
established for cascade checks. Both the six existing showcase test files
and the new `tests/home-render.test.mjs` call the identical helper
functions, the former against `dev/design-system/index.html`, the latter
against the six new renderers' real output — so the showcase and the
production renderer can never silently drift into two different
descriptions of the same contract. Cascade-resolution and grid
column-count/pixel-simulation checks stay local to each `*-layout` file,
since those are about the compiled stylesheet or the showcase's own
specific wide-container arrangement, not the general markup contract a
renderer must reproduce.

## Solutions page (PF-050)

`src/content/pages/solutions.js` now carries real content — six anchored
sections, one per approved capability — composed by a new dedicated
`solutions` template (`src/pages/templates/solutions.js`), registered
alongside `standard`/`listing`/`case-study`/`home` in
`src/pages/templates/index.js`. AAA's desktop and mobile visual review of
the rendered page passed, including the provisional copy; see
`docs/TESTING_AND_QA.md` for the full manual-check ledger, including which
specialized modes (forced-colors, 200% zoom, reduced-motion) are still
pending explicit verification.

**A dedicated template, not `standard`.** `standard` wraps `heading` +
`paragraphs` + one optional `link` in a single container — it cannot
express six anchored, individually-structured sections. `solutions.js`
follows `home.js`'s per-section-container shape instead (see "Per-section
containers" above) rather than inventing a third page-composition pattern.

**`.page-section`, the generalized successor to `.home-section`.** PF-041
shipped `.home-section` (the shared inter-section spacing/divider wrapper)
inside `_hero.scss` with an explicit note that it was homepage-only pending
a real second caller, per CLAUDE.md's "extract reusable patterns only after
a real second use demonstrates the need." Solutions is that second caller.
The two rules moved, unchanged, from `src/styles/components/_hero.scss`
into `src/styles/objects/_page-section.scss` (renamed `.home-section` →
`.page-section`, no other change) — a rename, not a redesign, proven by a
compiled-CSS test (`tests/page-section-layout.test.mjs`) that resolves both
`.page-section`'s `padding-block` and `.page-section + .page-section`'s
divider `border-top` and asserts they match the original `.home-section`
declarations exactly, plus a check that `.home-section` no longer appears
anywhere in the compiled stylesheet. `home.js`'s own eight section wrappers
were updated to the new class name; its rendered output, section count, and
heading structure are otherwise unchanged. The shared `renderSectionHeader()`
helper was extracted the same way, from a private function inside
`home.js` into `src/components/section-header.js`, imported unmodified by
both templates.

**Solutions-page-only structural hooks, not new reusable Gate-C
components.** Every prior component addition (capability cards, project
cards, process/trust/engagement/CTA) went through a showcase specimen in
`dev/design-system/index.html` and a Gate-C-style visual approval before a
real page consumed it. The six sections' problem/audience/build/benefit
detail list, the section icon badges, and the jump navigation have no such
specimen and are not offered as reusable design-system components — they
live in `src/styles/pages/_solutions.scss`, this project's first real file
in the `pages/` ITCSS layer (reserved since PF-011/PF-021 but empty until
now — see `docs/SOURCE_ARCHITECTURE.md`'s SCSS-layering section). This
mirrors the precedent PF-041's own Hero/Problems-preview sections already
set: compose new page-specific markup from already-approved base elements
and narrowly-scoped page hooks, not a new component-library entry, when no
second real caller is anticipated.

**Icon/accent reuse, no new registry entries.** Each section's icon badge
reuses the exact same `CAPABILITY_ICONS`/`CAPABILITY_ACCENTS` registry
(`src/pages/icon-registry.js`) the homepage's capability cards already use
— same six icon keys, same six accent tokens, same visual identity carried
from the homepage card straight through to its matching Solutions section.
`.solution-section__icon--<accent>` reads the identical `--accent-<accent>`
custom properties `.capability-card--<accent>` does, verified equal by
`tests/solutions-page-layout.test.mjs`, so the two can never silently
drift apart. No new icon or accent was added to the registry.

**Sticky-header anchor offset.** `/solutions/#<slug>` deep links (jump-nav
clicks, external links, browser back/forward) needed the same protection
`#main-content`'s skip-link target already has: `scroll-margin-top:
var(--header-offset)`, so a landed section's heading is never hidden
beneath the sticky desktop header. Scoped to
`body[data-page='solutions'] .page-section[id]` rather than a bare `[id]`
selector — the same reasoning already documented on `#main-content`'s own
rule (`_site-header.scss`) and on `_hero.scss`'s `body[data-page='home']`
override: `dev/design-system/index.html` shares this compiled CSS and has
no sticky header of its own, so a global rule would incorrectly offset its
unrelated in-page anchor specimens. No JavaScript/smooth-scroll
interception was added — native anchor navigation handles the rest once
`scroll-margin-top` is set.

**Evidence is omitted, not rendered empty, when unavailable.** Only one of
the six sections (Workflow & Process Solutions) carries a project-evidence
link, to Business Workflow System — the one project with a documented
category match; case studies for the other two real projects are still
placeholder content (M6, a later milestone), and assigning them to a
specific section without documented category data would be an unsupported
claim. The other five sections render no `.solution-section__evidence`
element at all — not an empty wrapper — matching the same
omit-cleanly rule the architecture doc already states and the same pattern
`renderCta`'s optional `body`/`capability-card`'s optional icon-link
already use. `tests/solutions-render.test.mjs` proves this end-to-end:
exactly one evidence element exists sitewide, inside the correct section.

**Supporting technologies are intentionally absent, not deferred
silently.** §10.1 asks each section to name supporting technologies, but no
approved per-capability technology list exists anywhere in the requirements
docs — §5's Approved Technology Stack governs the portfolio site's own
build, not what AAA offers per solution area. Naming frameworks now would
be fabricated. No `technologies` field exists in `solutions.js`'s content,
no markup/wrapper for it exists in the template, and
`tests/solutions-render.test.mjs` asserts the string "technologies" never
appears anywhere in the rendered output. See `docs/DECISION_LOG.md`'s
PF-050 entry for the full decision record, including why engagement
options also remain homepage-only rather than duplicated here.

**Content provenance.** Every string is one of: verbatim reuse of an
already-approved `home.js` capability heading/description (all six section
headings; four of the six "what I can build" fields, carried over
unchanged), a paraphrase of `DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md`
§4.2's typical-client-problems list (four of the six problem statements) or
of §10.1's organizing principle (the page-level intro paragraph), or
provisional copy drafted for this task (every audience/benefit field, the
remaining two problem/build fields, all six CTA labels, and the page-level
heading/closing CTA heading and body) — no invented outcomes, technologies,
or project-category claims anywhere. AAA's visual review approved the
rendered page including this provisional copy; it remains provisional
production copy in the same sense the homepage's own capability-card
descriptions were at PF-041 (approved for the visible page, still subject
to further wording revision if AAA requests it later).

**Test strategy.** `tests/solutions-render.test.mjs` mirrors
`tests/home-render.test.mjs`'s approach — real `renderRoute()` output
asserted against the shared structural helpers in
`tests/helpers/component-markup.mjs`, plus escaping and optional-field-
omission checks only real output can prove. Two new compiled-CSS files
(`tests/page-section-layout.test.mjs`, `tests/solutions-page-layout.test.mjs`)
extend the existing `sass.compile()` + `resolveProperty()` method
(`tests/helpers/cascade-resolver.mjs`) to the rename-invariant and
sticky-header-offset/jump-nav-cascade checks above. Implementing the
icon/accent-token equality check surfaced a real, previously-unexercised
bug in `resolveProperty()` itself: a pseudo-element selector with no tag or
class of its own (`::selection`, `generic/_document.scss`) vacuously
matched any tag/class query and its `::` inflated its measured specificity
above a real one-class selector, silently winning `background-color`
resolution it never actually declared for the queried element. Fixed by
excluding any selector containing `::` from matching in
`elementMatchesSimpleSelector()` — verified against every other existing
caller of the resolver, none of which queried a property `::selection`
also declares, so no other test's result changed. See
`docs/DECISION_LOG.md`'s PF-050 entry.

## Process page (PF-051)

`src/content/pages/process.js` now carries real content — the full delivery
lifecycle, `Discover → Define → Design → Develop → Test → Deploy → Support`
(§10.2), each stage explaining what happens, what's needed from the client,
what AAA delivers, how review/approval works, and (for all but the last
stage) what happens next — composed by a new dedicated `process` template
(`src/pages/templates/process.js`), registered in
`src/pages/templates/index.js` alongside `standard`/`listing`/
`case-study`/`home`/`solutions`. `src/config/routes.js`'s `process` route
changed `template: 'standard'` → `'process'`; `path`/`entry`/`navKey`/
`content` unchanged.

**A dedicated template, not `standard`, same reasoning as Solutions.**
`standard` cannot express seven ordered, individually-structured stages.
`process.js` follows `home.js`/`solutions.js`'s per-section-container shape
(see `docs/SOURCE_ARCHITECTURE.md`'s "Per-section containers" section) —
reusing `.page-section`, `.container`, and `renderSectionHeader()`
unmodified — rather than inventing a fourth page-composition pattern.

**`.process-steps` (the homepage's 4-stage preview) is deliberately not
reused or extended.** This section's own earlier PF-034 entry already
states the reason: "the fuller wording belongs to the dedicated Process
page (PF-051); reusing [`.process-steps`] here would duplicate page copy."
`process.js` composes entirely new, page-specific markup instead —
`src/styles/pages/_process.scss`, this project's second real file in the
`pages/` ITCSS layer (after PF-050's `_solutions.scss`).

**Canonical stage order is enforced, not just documented.**
`src/pages/content-schema.js` exports `PROCESS_STAGE_NAMES` — the single
place the 7-stage sequence is spelled out — and `checkProcessContent()`
requires `stages.items[i].heading === PROCESS_STAGE_NAMES[i]` **at that
exact index**, not merely membership in a set (unlike Solutions'
unordered `SOLUTION_SECTION_IDS` allow-list, because sequence is the whole
point of a lifecycle). Tests import the same exported constant rather than
re-typing the sequence, so schema and tests can never silently drift apart.

**The terminal stage's `next` is forbidden by property presence, not by
value.** Support (the last stage) must not declare a `next` key at all.
`hasOwnNextProperty()` checks `Object.hasOwn(stage, 'next')` — deliberately
not a truthiness or `!= null` check — so `next: 'text'`, `next: null`,
`next: undefined` (a real own property with an `undefined` value; a plain
`!= null` check would wrongly treat this as "absent"), and `next: ''` are
all rejected identically. Every other stage requires the opposite: a
present, non-empty string. `src/content/pages/process.js`'s Support object
simply never writes a `next:` line — the only form that passes. The
template renderer (`renderStage()` in `process.js`) still uses a plain
`if (stage.next)` truthiness check when deciding whether to render the
"What Happens Next" pair; this stays correct because
`src/pages/render.js` re-validates content through `checkProcessContent()`
before any template runs (`docs/SOURCE_ARCHITECTURE.md`'s "Validation, at
three points" — render-time re-validation), so by the time the template
runs, presence and non-empty value already coincide by contract. The
stricter `Object.hasOwn` check is a schema-layer concern; the
template-layer check does not need to repeat it.

**Shared `.process-facts` term/detail pattern, reused across two different
sections.** Each stage's own facts (`whatHappens`/`clientInput`/`delivers`/
`approval`/optional `next`) and the Working Together section's two grouped
facts (Communication; Scope, Revisions & Change Requests) both render
through the same `renderFacts()` helper and the same `.process-facts`
markup/CSS — one `<dl>` pattern, not two near-identical ones.

**Mobile-stack, desktop-grid — no full-width page collapsing into one
narrow reading column.** `.process-facts` renders as plain stacked block
flow (`dt` immediately above its own `dd`) below `spacing.$bp-md` (48em/
768px), then switches to a 2-column term/detail CSS Grid at and above it
(`grid-template-columns: minmax(12rem, 16rem) 1fr`), via Grid's own
implicit row auto-placement — no wrapper `<div>` per pair, so DOM/reading/
tab order is identical at every width; only visual placement changes.
Because each stage owns its own separate `<dl>` nested inside its own
`<li>`, this grid can never place two different stages' content side by
side. `spacing.$bp-md` is the same already-defined, already-used named
breakpoint `_site-header.scss`/`_site-nav.scss` consume (not a new
literal). `.process-facts__term`/`.process-facts__detail`'s `margin` is
declared once at the base (mobile) level and reset again inside the media
query — the one property in this file that
`tests/helpers/cascade-resolver.mjs`'s `resolveProperty()` cannot safely
answer (it resolves the whole cascade, including media-nested rules, by
ordinary specificity/source order, without modeling whether the media
condition is true), so both values are asserted via direct regex against
the compiled CSS in `tests/process-page-layout.test.mjs` instead — same
reasoning already documented for `tests/solutions-page-layout.test.mjs`'s
own sticky-anchor-offset check.

**No anchors, unlike Solutions.** §10.2 carries no anchor/deep-link
requirement (unlike §10.1's explicit "one page with anchored sections"),
and the seven stages are read in fixed sequential order rather than looked
up independently, so `process.js` has no jump navigation and no per-stage
`id`/`scroll-margin-top` handling.

**Heading-row alignment audited against PF-050's own defect, not just
copied.** PF-050's visual review found `.solution-section__heading-row`
centering its icon against an inflated box, because its flex child
(`.section-header`) carried its own `margin-bottom` _and_ its own child
heading carried a second, separately-trapped `margin-bottom` (a flex item
establishes its own block-formatting context, so neither margin collapses
away). `.process-detail__heading-row` avoids this defect class by
construction rather than by a second scoped reset: it never wraps
`.section-header` at all — the per-stage `<h3>` is the row's direct flex
child, with `margin: 0` declared explicitly, so there is only one box with
one (already-zero) margin, never two nested ones. The page's three real
`<h2>`s (Stages, Working Together, closing CTA) still use
`renderSectionHeader()`/`renderCta()` completely unmodified from their
proven PF-041/PF-050 shape — the audit confirms nothing new interacts with
`.section-header` at all.

**Closing CTA heading level — `renderCta()` extended, not forked.** The
Process page's three top-level sections (Stages, Working Together, closing
CTA) are document-outline siblings — all three are `.page-section`s
hanging directly off `<main>`, and Stages/Working Together each open with
their own `<h2>`. Rendering the closing CTA with `renderCta()`'s prior
fixed `<h3>` would have left it a level deeper than its sibling sections
with no intervening `<h2>` of its own — an orphaned/skipped level, not
valid heading hierarchy. `src/components/cta.js`'s `renderCta()` gained one
new optional parameter, `headingLevel`, validated against a closed
`Set([2, 3])` — 2 for a top-level sibling section's own heading (Process's
closing CTA), 3 for the prior default (nested inside a page-level `<h2>`
section, every other caller: `home.js`, `solutions.js`). The default is
unchanged, so both prior callers keep rendering `<h3 class="cta__heading">`
with zero code change. Any value outside `{2, 3}` throws before any HTML is
built — the tag string is only ever computed as literally `"h2"` or `"h3"`
after validation passes, so no input can reach the template-literal
interpolation unvalidated (`tests/cta-render.test.mjs` proves this directly,
including a script-injection-shaped `headingLevel` value). No `_cta.scss`
change was needed: `.cta__heading` already declared its own explicit
`font-size: var(--font-size-h2)`, fully decoupled from whichever tag
renders it (the same pattern `.text-display` already uses for `<h1>`), so
promoting the tag produces zero visual change.

**No absolute or indefinite promises — corrected during planning, not
after a defect report.** An early draft of this page's meta description
("...and ongoing support") and intro paragraph ("...so you always know...")
read as automatic/indefinite commitments; both were rewritten before
implementation ("...and agreed post-launch support"; "...so you can see...").
Support's own stage facts describe an agreed, project-scoped arrangement —
no monitoring guarantee, no fixed check-in cadence, no permanent
availability claim, and no package/price/SLA introduced as a substitute.

**Content provenance.** The page heading is verbatim §3.3's Core Promise;
the seven stage names are verbatim §10.2; the Stages/Working Together
section headings and every stage's five facts are provisional copy pending
AAA's content sign-off (§10.2 specifies what each facet must cover, not its
exact wording); the closing CTA's action label/path is approved reuse,
identical to `home.js`'s and `solutions.js`'s own closing CTA. No
timelines, prices, guarantees, packages, or SLAs appear anywhere.

**Test strategy.** `tests/process-render.test.mjs` mirrors
`tests/solutions-render.test.mjs`'s approach: real `renderRoute()` output
against the shared structural helpers, plus this page's own canonical-order
assertion (rendered `<h3>` stage headings, in DOM order, equal
`PROCESS_STAGE_NAMES`), the exact 34-fact-pair count (5 × 6 + 4, Support's
missing "What Happens Next" proven absent specifically from its own
extracted `<li>`, not just undercounted overall), and the corrected
heading-hierarchy contract (exactly 3 `<h2>`s, exactly 7 `<h3>`s, zero
`<h3 class="cta__heading">`). `tests/content-schema.test.mjs` proves both
directions of the `next` invariant separately — a non-terminal stage
missing `next` fails, and Support declaring `next` as a non-empty string,
`null`, `undefined`, or `''` each independently fails, plus the valid
"key fully absent" case passes. `tests/cta-render.test.mjs` is new: direct
unit coverage of `renderCta()` itself (previously only exercised indirectly
through page renderers), proving the default is unchanged and out-of-set
`headingLevel` values throw. `tests/process-page-layout.test.mjs` extends
the `sass.compile()` + `resolveProperty()` method to the new ol/li/h3/dl/dd
resets, the sibling-divider rule, the forced-colors badge boundary, and the
mobile/desktop `.process-facts` contract. Every deliberate-failure pass
(canonical order, both `next`-invariant directions, three SCSS resets, and
`renderCta()`'s heading-level validation) was run and confirmed correct
before being restored — see `docs/DECISION_LOG.md`'s PF-051 entry.

## Work index (PF-052)

`src/content/pages/work/index.js` now carries real content — the three
approved real projects (FES Challenger, Business Workflow System,
eBarangay), each rendered as a real `.project-card`, plus a closing `.cta`
panel — composed by a new dedicated `work` template
(`src/pages/templates/work.js`), registered in
`src/pages/templates/index.js` alongside `standard`/`case-study`/`home`/
`solutions`/`process`. `src/config/routes.js`'s `work` route changed
`template: 'listing'` → `'work'`.

**Template renamed `listing` → `work`, not kept generic.** `listing`
(`src/pages/templates/listing.js`) had exactly one caller ever (confirmed
by grep across the repo), and PF-052 changes its content shape entirely —
from a plain link list to project cards. Keeping a generic name for a
permanently single-purpose template would misrepresent it as reusable when
it never was and never will be. Renamed to `work`, matching `home`/
`solutions`/`process`'s established single-purpose naming convention
(template key = route key = content key). `listing.js` was deleted, not
deprecated in place.

**Two heading-level defects corrected together, as one accessibility
fix, not deferred and not a redesign.** Diagnosed while building this
page: `renderProjectCard()`/`renderCapabilityCard()`
(`src/components/project-card.js`/`capability-card.js`) both rendered an
unconditional `<h4>`, while both are nested directly under a page-level
`<h2>` on every real caller (`home.js`'s Capabilities and Projects
sections; `work.js`'s Projects section) — a skipped heading level on the
**already-shipped homepage**, not something this task introduced. Fixed
by giving both renderers the identical closed-set `headingLevel` pattern
PF-051 already proved on `renderCta()`:

```js
const ALLOWED_PROJECT_CARD_HEADING_LEVELS = new Set([3, 4]);
// ...and the identical shape on capability-card.js:
const ALLOWED_CAPABILITY_CARD_HEADING_LEVELS = new Set([3, 4]);
```

`headingLevel` defaults to `4` on both (every caller that doesn't opt in —
the Gate-C showcase's static markup — keeps its exact prior contract);
`home.js` now explicitly requests `3` on both its calls
(`renderCapabilityCards(capabilities.items, 3)`,
`renderProjectCards(projects.items, 3)`); `work.js` requests `3` on its one
call. Any value outside `{3, 4}` throws before any HTML is built on either
renderer — the tag string is only ever computed as literally `"h3"` or
`"h4"` after validation passes, proven directly by
`tests/project-card-render.test.mjs`/`tests/capability-card-render.test.mjs`
(default-`h4`, explicit-`h3`, and three reject cases each, including a
script-injection-shaped value). **Zero visual change on either
component** — verified directly against source, not assumed:
`.capability-card__heading` already declared `font-size:
var(--font-size-h3)` (styled at H3 size while rendered as `<h4>`), and
`.project-card__heading`'s desktop featured-card override is class-scoped,
not tag-scoped. `headingLevel` is a template-authored render parameter on
both renderers, never content-driven — no content-schema field exists for
it.

**Schema: `checkProjectCardItem` extracted for its second real caller.**
`content-schema.js` gains a shared `checkProjectCardItem(item, fieldPrefix,
problems)` helper (validates `heading`/`link`/optional
`category`/`summary`/`tags`/`featured`-type), reused by both
`checkHomeContent`'s existing `projects` branch (refactored, identical
resulting messages — proven by a dedicated refactor-safety test —
`checkExactArray(..., 3, ...)` and "exactly one featured" unchanged) and
the new `checkWorkContent`. Unlike Home's fixed, curated 3-project preview,
Work's `projects.items` is validated as a non-empty array only — Work's
job is "every real project," a count tied to how many case studies exist,
not an editorial constant, so hardcoding today's count of 3 would create
avoidable schema churn as PF-060–063 registers more. Featured-card
validation is "at most one," not Home's "exactly one," for the same
forward-looking reason.

**Cross-file route completeness lives in a new, small, pure module —
`scripts/work-project-routes.mjs` — not `content-schema.js`.** An initial
draft placed the completeness check inside `content-schema.js`; on review,
that was the wrong home even though no import cycle was ever actually at
risk (the function takes plain arrays, never imports `routes.js`/
`contentByKey`). `content-schema.js` is documented as per-route content
shape validation, reused by `render.js` at request time, which never has
the full route-manifest context to check completeness against.
`docs/SOURCE_ARCHITECTURE.md`'s "Validation, at three points" section
already scopes exactly this class of check ("Work-listing links match
registered case studies") to the **pre-flight** validator. `scripts/
validate-routes.mjs`'s own top level runs its full check sequence
(including a possible `process.exit(1)`) unconditionally on import — its
own header comment states this is deliberate — so a named export added
directly to that file would be unsafe to import from a test. The new
module has no top-level side effects at all, so `findWorkProjectRouteProblems(
projectLinks, caseStudyRoutePaths)` is safe to unit-test directly:

```js
export function findWorkProjectRouteProblems(
  projectLinks,
  caseStudyRoutePaths,
) {
  // every registered path must appear in projectLinks exactly once —
  // reports missing, duplicate, and unregistered/extra destinations
}
```

`scripts/validate-routes.mjs`'s `checkWorkListingLinks()` was renamed
`checkWorkProjectLinks()` and now imports and calls this function with the
real `contentByKey.work`/`routes` data — it stays exactly where it already
lived, just with its reusable logic factored out. Growth-safe by
construction: the expected destination set is derived from whatever
`caseStudyRoutePaths` is actually passed, never a hardcoded count —
`tests/work-project-routes.test.mjs` proves this directly with a
synthetic 4-route scenario. Because the function is pure, its five unit
tests (valid exact set; missing link; duplicate link; unregistered/extra
link; growth-safety) directly exercise every failure path — this _is_ the
deliberate-failure proof for this invariant, alongside a real end-to-end
check performed during implementation (temporarily pointing the real
`eBarangay` card at a nonexistent path, confirming `node
scripts/validate-routes.mjs` failed with both the expected "missing" and
"unregistered" messages, then restoring it).

**Featured-card behavior — reused, not reimplemented.** Work's real
project composition (one featured, two secondary) is identical in shape to
`home.js`'s own — `renderProjectCards()`'s existing
`needsFeaturedPairLayout()` (PF-041) applies `.project-cards--featured-pair`
automatically from the real item array, so Work's grid gets the same fixed
2-column secondary layout with no empty third track at any width, with
zero new detection logic or page-specific CSS.

**Content provenance.** The three project items' `heading`/`category`/
`featured` values are approved reuse of `home.js`'s own already-approved
`projects.items` fields (same order: FES Challenger featured, Business
Workflow System with its verbatim "Government/business workflow system"
category, then eBarangay) — not new copy. The page-level `title`/
`description`/`heading`/intro paragraph/section eyebrow-heading/closing-CTA
strings are approved-as-provisional copy for this task (the same status
category PF-034/041/050/051's own provisional strings carry), pending
final production-content sign-off. No screenshot, outcome, technology, or
result claim appears anywhere — none is approved for any of the three real
projects (PF-003 still blocked) — and no visitor-facing sentence mentions
deferred categorization, project-count growth, or task numbers; that
context lives only in `docs/DECISION_LOG.md`.

**No new page-specific SCSS file.** Every visual element on this page —
`.container`, `.page-section`, `.section-header` (via
`renderSectionHeader()`), `.project-cards`/`.project-card` (via
`renderProjectCards()`), `.cta` (via `renderCta()`) — is already-approved,
already-tested component/object CSS, unchanged except the one heading-tag
fix above (which changes no declaration). `tests/project-card-layout.test.mjs`'s
20 existing assertions (cascade resets, grid column simulation, the
featured-pair modifier, focus/forced-colors) required no changes and
continue to cover this page's one list unmodified.

**Test strategy.** `tests/work-render.test.mjs` mirrors
`tests/process-render.test.mjs`'s/`tests/solutions-render.test.mjs`'s
approach: real `renderRoute()` output against the shared structural
helpers, plus this page's own contract — exactly 3 `<h3
class="project-card__heading">`/zero `<h4>`, exactly 2 `<h2>`s, DOM-order
card composition (FES Challenger featured, then the other two), the
featured-pair modifier class present, a cross-file check that every
rendered project-card link matches a real registered `case-study` route
and that the set of links equals the set of registered case-study routes
exactly, category shown only on Business Workflow System's card, empty
`.media-frame` on all three, and a hostile-content escaping test.
`tests/home-render.test.mjs`'s existing capability-card and project-card
structural tests each gained the corresponding H3/zero-H4 assertion.

## Supporting pages: About, Contact, Privacy, 404 (PF-053/054/055)

All four routes, content stubs, and template/schema wiring already existed
end-to-end on the generic `standard` template with placeholder copy before
this milestone — this was a content-and-shape task, not a scaffolding task.

**About (PF-053): `standard` gains one new universal optional field,
`content.cta`, not a dedicated template.** The approved fact set (~5 years
experience, frontend/backend/database/deployment, direct end-to-end
involvement, business-problem-first approach) is thin — no structured
multi-section content is approved for this milestone — so a dedicated
`about` template would be over-engineering. `content.cta` follows the exact
precedent `content.link` already set in `validateContent()`: validated
unconditionally, not gated by `route.template`, reusing the existing
`checkCtaShape()` helper and `renderCta()` component at `headingLevel: 2` (a
sibling of the page's own `<h1>`, matching Process's closing-CTA
precedent — `standard.js` has no `<h2>` section header of its own for the
CTA to nest under). `about.js`'s real paragraphs restate the approved facts
in wording distinct from `home.js`'s existing About-preview sentence, per
`DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md` §8.3's "must not repeat
identical long-form content" — enforced by a dedicated regression test
comparing the two paragraph arrays directly, not just checked at review
time.

**Contact (PF-054): a dedicated `contact` template
(`src/pages/templates/contact.js`), because its defining content is
site-sourced, not content-sourced.** The three contact destinations
(email/GitHub/LinkedIn) are read directly from `site` inside
`renderContactMethods(site)`, mirroring `footer.js`'s existing
`renderContactLink`/`renderSocialLink` pattern exactly — same
`isSafeEmail`/`isSafeExternalUrl` gating, same conditional-rendering
contract (an unsafe value is omitted entirely, never rendered escaped-but-
present). This keeps `src/config/site.js` the single source of truth for
these three values; `contact.js`'s own content only carries the universal
base fields (`title`/`heading`/`paragraphs`), so no new schema branch was
needed. New markup contract: an `<h2 class="contact-methods__heading">Ways
to Reach Me</h2>` followed by `<ul class="contact-methods">`, one
`<li class="contact-methods__item">` per available method, all inside the
page's single `.container` (no `.page-section` wrapper — `contact` is not
one of the per-section-container templates).

**Why not `.trust-list` for Contact's method list.** `.trust-list` always
pairs an icon + heading + one trailing action link — a different shape from
"N independent clickable destinations," each itself the interactive
element. Reusing it would have forced an artificial icon/heading wrapper
around what is really just a link. A new, narrowly-scoped
`src/styles/pages/_contact.scss` was added instead — the one genuinely new
structural hook this milestone required:

```scss
.contact-methods {
  list-style: none;
  max-width: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-3);
}

.contact-methods__item {
  margin-bottom: 0;
}
```

Resets the same generic `ul`/`li` prose rules
(`elements/_body-copy.scss`'s `~68ch` max-width and `li` bottom margin) that
every prior list-based component (`.process-steps`, `.trust-list`,
`.engagement-options`) has needed the identical fix for. Proven via the
resolved-cascade method (`tests/contact-page-layout.test.mjs`,
`tests/helpers/cascade-resolver.mjs`), with a deliberate-failure pass run
(reset temporarily removed, all three tests failed with the actually-
inherited values, then restored) before being accepted.

**Privacy (PF-054): content-only, still `template: 'standard'`.** Every
sentence in `privacy.js` is phrased as an implementation-specific statement
about what the current site code verifiably does — no analytics/tracking
code exists anywhere in `src/`; no nonessential cookies are set; no contact
form exists (Contact links directly to email/GitHub/LinkedIn); fonts are
self-hosted `.woff2` files under `public/fonts/`, never requested from
Google Fonts. Deliberately excludes any hosting/server-log, Cloudflare-
processing, data-retention, or legal-compliance claim, since none of that
is configured or verified (`site.baseUrl` is still `null`; Cloudflare Pages
connects in PF-072). `description` stays omitted, preserving the existing
`site.defaultDescription`-fallback contract unmodified.

**404 (PF-055): a dedicated `not-found` template
(`src/pages/templates/not-found.js`), not a `standard.links` array
extension.** `standard` is meant to stay thin — About just gained one
optional field, and a second, differently-shaped optional-link mechanism
(`links` alongside the existing singular `link`) would push it the wrong
direction. `checkNotFoundContent()` in `content-schema.js` uses
`checkExactArray(content.links, 'links', 3, problems)` — a deliberately
fixed-count rule, since Home/Work/Contact is a curated navigational set, not
a growing collection like Work's `projects.items`. Markup:
`<ul class="not-found__links">`, one `<li class="not-found__link-item">`
containing one `<a class="not-found__link">` per recovery link. **Follow-up
(PF-055 visual-review correction, `docs/DECISION_LOG.md`):** AAA's browser
review found the initial default `ul`/`li` presentation (bulleted,
indented) read as unfinished, so `src/styles/pages/_not-found.scss` was
added — the same page-specific-reset pattern `_contact.scss` established —
presenting the three links as a responsive `flex-wrap` group of
button-like chips reusing `.btn--secondary`'s already contrast-verified
border/text tokens. No search box, no `<meta http-equiv="refresh">`, no
client-side redirect. `navKey: null`'s existing zero-`aria-current` policy
(`docs/SOURCE_ARCHITECTURE.md`) applies unchanged — this task confirmed it
still holds, it did not need new enforcement.

**Real contact values (`src/config/site.js`) and the build-output check
they broke.** `contactEmail`/`social.github`/`social.linkedin` moved from
`null` placeholders to AAA's verified real values. This immediately broke
`scripts/verify-build-output.mjs`'s PF-011-era check, which asserted
`mailto:`/`github.com`/`linkedin.com` never appear anywhere in composed
output. The replacement is two region-scoped invariants, not one
whole-document count — extracting the `<footer>...</footer>` substring per
route and asserting each of the three links appears exactly once inside it,
plus, on the `contact` route specifically, extracting `<main>...</main>`
and asserting the same three links appear exactly once inside it too. A
naive single whole-document "exactly once" check would have been wrong for
`contact`, which legitimately renders each link twice (once in its own
`.contact-methods` list, once in the shared footer) — this was caught and
corrected during planning, before implementation began.

## Accessibility rationale summary

- Every text/background pairing whose use is documented above is
  programmatically verified (`tests/design-tokens.test.mjs`) against its
  WCAG floor, not just hand-computed once — including, as of PF-021, the
  NON-TEXT and FOCUS-INDICATOR pair types, not just TEXT pairs.
- `--color-accent`'s restricted role (large text/icons/UI only) is a rule
  component work must respect, not just a documentation note.
- `:focus-visible` (not `:focus`) keeps keyboard focus rings without
  showing them on mouse clicks; ring color verified ≥3:1 against both
  approved backgrounds, and never moves the element it's shown on (PF-021).
- Reduced motion is enforced globally; PF-021's button hover lift is the
  first real motion to actually respect it.
- Full 320–1920px responsive review, keyboard/focus movement checks, and
  forced-colors sanity checks are manual (`docs/TESTING_AND_QA.md`) — no new
  tooling for these.

## Revisit conditions

- **OKLCH color format** — considered again in PF-032 when the capability
  accents grew from five to six; six flat, hand-picked, individually
  contrast-verified tokens didn't need generated/derived palette math, so
  hex stays sufficient. Revisit if a future milestone needs many more
  variants generated programmatically rather than hand-picked one at a
  time.
- **`--color-text-muted` on `--color-surface-2`** — currently unapproved
  (4.53:1, too close to the floor); revisit if surface-2 is lightened or a
  dedicated lighter caption token is introduced.
- **Typography** — provisional until AAA's final visual sign-off on the
  real rendered preview; the alternative pairings in the decision log
  remain valid fallbacks if the recommendation doesn't hold up visually.
- **Font weight range** — currently using Google's served variable-font
  files as-is (400–600 for Inter, 500–700 for Space Grotesk); revisit if a
  narrower static subset would meaningfully reduce payload once real usage
  is measured.
- **Icon renderer** (PF-021) — deferred until a real composed partial needs
  to generate icon markup dynamically; anticipated to debut at PF-031 (nav
  icons) or PF-053 (social links), but PF-053/054's Contact page ended up
  following `footer.js`'s existing plain-text-link pattern for Email/
  GitHub/LinkedIn (no icon, matching the footer's own established contract)
  rather than introducing icon markup — still deferred until a real
  composed partial actually needs it.
- **`.btn--ghost`'s lack of a border** (PF-021) — currently relies on text
  contrast alone, like a plain link; revisit if a future use case needs it
  to read as a bounded shape rather than a text action.
- **Capability-card renderer/data module** (PF-032) — **resolved by
  PF-041.** `renderCapabilityCard()` (`src/components/capability-card.js`)
  and real content in `src/content/pages/home.js` now exist, following the
  same pattern PF-031 used to finally give the icon renderer its first real
  caller. The six descriptions remain provisional pending final
  production-content sign-off (see "Homepage (PF-041)" above) — the
  deferral was about the renderer/data-module's existence, not the copy's
  approval status.
- **Project-card renderer/data module** (PF-033) — **resolved by PF-041**
  the same way: `renderProjectCard()` now exists, composing the same
  reduced (title/category/link, no summary/tags) fields already proven in
  the showcase's real cards — still no summary/tech/outcome copy, since
  none is approved (PF-003 still blocked).
- **Process-steps/trust-list/engagement-options/CTA renderers, data
  modules, and schema fields** (PF-034) — **resolved by PF-041.**
  `render*()` functions now exist for all four
  (`src/components/{process-steps,trust-list,engagement-options,cta}.js`),
  composing real `src/content/pages/home.js` content validated by a new
  `home`-template branch in `src/pages/content-schema.js`. The three
  strings previously flagged as approved-for-provisional-showcase-use only
  (the process/trust link labels, the trust link's target, and the
  engagement-lede paraphrase) are now proposed as production copy, carried
  over verbatim — still pending final production-content sign-off, per
  "Homepage (PF-041)" above.

## Case study page (PF-060)

The first real case study (FES Challenger) extends the previously-minimal
`case-study` template/schema. See `docs/DECISION_LOG.md`'s PF-060 entry for
the full decision record and `docs/CONTENT_INVENTORY.md` for the evidence
audit; this section documents the resulting contract.

**Schema — ten independently optional named sections**
(`src/pages/content-schema.js`'s `checkCaseStudyContent()`), on top of the
unchanged universal base fields and the required `backLink`:

```
content.logo             optional  { src, alt? }
content.client           optional  { body: string[] }
content.problem          optional  { body: string[] }
content.role             optional  { body: string[], responsibilities: string[] }
content.solution         optional  { body: string[], features?: string[] }
content.technologyStack  optional  { items: string[] }
content.decisions        optional  { items: string[] }
content.outcomes         optional  { items: string[] }
content.gallery          optional  { items: [{ src, alt, width, height, caption? }], non-empty when present }
content.externalLink     optional  { label, url }
content.cta              already universal/optional — reused as-is
```

Absent is always valid — the template omits that section entirely, never
an empty heading, frame, or "coming soon" placeholder. A section object
present with a malformed shape is a validation error. `goals` and
`discovery` are deliberately not separate fields: once FES's real copy was
curated, neither had a real caller of its own (their content lives as
prose inside `problem`/`role`) — matching this project's established
"don't generalize ahead of a real, demonstrated need" precedent
(PF-032/033/034).

**Template** (`src/pages/templates/case-study.js`): one
`<section class="page-section"><div class="container">` per present named
field, each headed by the shared `renderSectionHeader()` (`<h2>`) — the
same per-section-container shape `solutions.js`/`work.js` already
establish, now joined by `case-study` in both `tests/render.test.mjs`'s
`PER_SECTION_CONTAINER_TEMPLATES` and
`scripts/verify-build-output.mjs`'s matching check. Unlike those three
routes, a case-study route legitimately renders **zero** sections when no
content is approved yet (Business Workflow System/eBarangay's current
placeholder state) — `verify-build-output.mjs`'s "at least one section"
check is gated behind `route.template !== 'case-study'` for exactly this
reason. The closing CTA renders at `headingLevel: 2`, the same top-level-
sibling-section pattern `work.js`/`process.js` already use.

**External link — closed per-content-key host allowlist, region-scoped
enforcement.** `src/pages/link-safety.js`'s `isSafeCaseStudyExternalUrl(url,
contentKey)` checks against a private `CASE_STUDY_EXTERNAL_HOSTS` map keyed
by `route.content` (never a content-supplied value), the same
single-purpose-per-field pattern `isSafeExternalUrl`'s `github`/`linkedin`
groups already establish. The invariant that only the one approved URL may
appear is scoped to `<main>` only, not the whole composed document — the
shared footer legitimately links to GitHub/LinkedIn on every route,
including case studies. Unit tests get this for free from `render.js`'s
already-separate `{ header, main, footer }` return shape;
`scripts/verify-build-output.mjs` reuses its existing `extractRegion(html,
'main')` helper (the same one the `contact` route's region-scoped checks
already use) against the real content module's `externalLink.url`, so the
check is generic across any case-study route, not FES-specific.

**Logo — decorative by default.** `content.logo.alt` defaults to `''` at
the template level; the visible `<h1>` stays the real accessible identity,
matching AAA's own stated preference for FES ("prefer keeping the visible
text heading and using the logo decoratively"). A future case study that
needs the logo to _replace_ visible text identity somewhere would set a
real `alt` on that specific `<img>` — not a schema change.

**Gallery/media semantics.** `gallery.items[]`: `src` a safe root-relative
path (recommended convention: `public/images/case-studies/<slug>/
<descriptive-name>.webp`, manually pre-optimized — no new image-processing
dependency), `alt` required non-empty (content quality is a manual Gate E
review item, not something a shape check can verify), `width`/`height`
required positive integers rendered as native `<img width height>`
attributes (prevents layout shift), every image `loading="lazy"` (the
gallery always sits near the end of a long page, below the fold), `caption`
optional. Rendered as `<ul class="case-study-gallery">` — a mobile-first
`1fr` default, `auto-fit`/`minmax(21rem, 1fr)` above `36em` (identical
pattern to `.project-cards`), with the same proactive `max-width: none;
margin: 0;` reset this project now always applies to `<ul>`-based grids
from the first draft (`src/styles/pages/_case-study.scss`,
`tests/case-study-layout.test.mjs`). Only real, reviewed, sanitized
screenshots are acceptable evidence — no placeholder, empty frame, or
AI-generated/reconstructed imagery ever stands in for a missing one; when
`gallery` is absent, the whole section (heading included) is omitted.

**Technology stack — a plain tag row, not a `<ul>`/`<li>` list.**
`.case-study-tech-stack` mirrors `.project-card__tags`'s existing
declarations (`display: flex; flex-wrap: wrap; gap: var(--space-2);`)
without depending on that component's class, for the same "short technology
label" shape already established there — a second component reusing the
identical pattern rather than inventing a new one.

**Content curation, not a per-fact dump.** The requirements doc's §10.4
case-study section list is explicitly "where applicable" — this project
reads that as license to curate, not an obligation to publish every fact
in AAA's evidence manifest as its own list item. FES's real content assigns
each verified fact to exactly one section (see `docs/DECISION_LOG.md`'s
PF-060 entry and `docs/CONTENT_INVENTORY.md`'s curated-vs-full mapping for
the specific consolidations made). Every visible string is provisional —
AAA-reviewed and corrected before implementation, still subject to the
PF-064 final polish pass, the same status every other dedicated page's
copy carries.

## Footer redesign

A focused follow-up to the header/nav polish restructured the footer from a
single flat block into three labeled columns — Brand, Quick Links, Connect
— plus a bottom row (copyright, Privacy). Full rationale in
`docs/DECISION_LOG.md`'s dated entry; this section covers the resulting
component contract.

**Layout — no `.container` wrapper, matching the header exactly.**
`.site-footer__columns` is a single-column CSS Grid at mobile/tablet
(Brand → Quick Links → Connect in document order, for free from source
order) and a 3-column grid from `spacing.$bp-md` (768px). `footer` itself
stays full-bleed with `padding-inline: var(--gutter)` directly on the
element — the same architecture the three-round header overflow
investigation proved correct for `header`, reused rather than introducing
a second footer-only pattern.

**Real `<h2>` headings, reusing the eyebrow recipe.** "Quick Links" and
"Connect" are genuine `<h2>` elements, not styled `<p>`/`<span>` text —
confirmed safe first: every test that counts `<h2>`s across this codebase
scopes its check to `renderRoute(route).main` specifically (`main` and
`footer` are separate strings this architecture already returns
separately), so footer headings never touch those assertions. Visual
treatment reuses `objects/_section-header.scss`'s `.section-header__eyebrow`
recipe verbatim (`text-transform: uppercase`, `letter-spacing:
var(--letter-spacing-label)`, `color: var(--color-accent-text)`,
`font-size: var(--font-size-label)`) rather than inventing a new heading
style — proven identical via a compiled-CSS test comparing both rules
directly, not just visually similar.

**Preventing the same `max-width` leak proactively.** The header/nav
overflow defect's round 3 found `.site-nav ul` silently capped at 68ch by
`elements/_body-copy.scss`'s generic `ul, ol { max-width:
var(--width-reading); }` rule. Both new footer lists
(`.site-footer__nav ul`, `.site-footer__links`) reset `max-width: none`
unconditionally from the start, alongside `margin`/`padding`/`list-style`
(all also set by that same generic rule) — the identical fix shape already
established by `.project-cards`/`.capability-cards`/`.trust-list`/
`.process-steps`/`.engagement-options`/`.site-nav ul`. The generic
`p { margin: 0 0 var(--space-4); }` rule was also found leaking into the
bottom row's two paragraphs (asymmetric bottom margin inside an
`align-items: center` flex row) and reset via
`.site-footer__meta, .site-footer__privacy { margin: 0; }`.

**Icon-only Connect links — two different icon renderers, deliberately not
merged.** Email uses the existing Lucide `Mail` icon via `icon.js`'s
`renderIcon()` (stroke-based, `stroke="currentColor" fill="none"`).
GitHub/LinkedIn use a new, separate `src/components/social-icons.js` —
Simple Icons' official monochrome brand marks (MIT License, `simple-icons`
v16.28.0, fetched live 2026-08-18; exact source URLs recorded in that
file's own header comment), single filled `<path>` per mark
(`fill="currentColor"`). These are structurally different icon shapes
(multi-shape stroke outlines vs. one filled path) and Lucide itself
doesn't ship brand/logo icons at all — `renderSocialIcon()` is a closed
two-entry map that throws on an unknown key, the same fail-loud precedent
`icon.js`'s own allowlists already establish. Both renderers always emit
`aria-hidden="true"` on the icon; the parent `<a>`'s `aria-label` ("Email",
"GitHub", "LinkedIn") is the one real accessible name — the icon never
carries its own name, matching the pattern already established for the
header/case-study logos.

`.site-footer__connect-link` sizes each control to
`min-width`/`min-height: var(--touch-target-min)` (44px, an existing
token) with `border-radius: var(--radius-full)`. Hover is pointer-gated
(`@media (hover: hover) and (pointer: fine)`) and restrained —
`background-color: var(--color-surface-2)` only, no transform/movement,
matching the header's icon-only menu toggle's own "quieter than the
primary CTA" treatment rather than `.btn`'s lift. Focus-visible, forced-
colors, and reduced-motion all need zero new CSS: the existing global
`:focus-visible` rule, the link's real `color` property, and the existing
global `@media (prefers-reduced-motion: reduce)` rule already cover a
control whose only animated property is a color transition.

**Résumé unchanged.** `site.resumePath` stays `null` and continues to
render nothing when absent, exactly as before — its eventual placement
(icon vs. text, inside or outside Connect) is deferred to whenever a real
résumé asset is actually approved, not decided now for content that
doesn't exist yet.

## About page profile card

A focused follow-up to the footer redesign gave the About page a premium
two-column composition — existing biography content plus a new profile
card (portrait, identity, restrained facts, one CTA). Full rationale,
portrait provenance, and approved copy in `docs/DECISION_LOG.md`'s dated
entry; this section covers the resulting component contract.

**Dedicated `about` template, not a `standard.js` field.** `standard.js`
stays exactly as it was — generic, shared by Privacy — because a profile
card is single-purpose and Privacy will never need one. `src/pages/templates/about.js`
duplicates (not imports) `standard.js`'s heading/paragraph/CTA rendering
rather than sharing it, since the two are expected to diverge further.

**Two-column layout reuses `.hero__inner`'s exact pattern.** `.about-layout`
is a single-column flex stack by default; `.about-layout--with-card`
(added only when a real card is present) switches to `flex-direction: row`
at `width >= 64em` — the identical breakpoint `.hero__inner` already uses,
not a new one. Biography content is always first in source order, the card
always second — the split is `flex: 1 1 58%` / `flex: 1 1 42%`, and no
rule anywhere uses the CSS `order` property, so visual order, DOM order,
reading order, and focus order are always identical by construction.

**Card surface — neutral, not `.capability-card`'s bold accent-fill.**
`.about-card` reuses `.capability-card`'s dimensional recipe (`padding:
var(--space-6); border-radius: var(--radius-lg);`) but with a plain
`--color-surface-1` background and `--color-border` border — a dark,
premium, neutral surface consistent with the rest of this theme, not a
second visual language. `.about-card__name`/`role`/`statement` are styled
`<p>` tags, not headings: they restate the page's own subject (already
announced by `<h1>About</h1>`), so a second near-top-level heading would
only pollute the real hierarchy. `.about-card__role` reuses
`.section-header__eyebrow`'s exact uppercase/letter-spaced/accent-colored
recipe, proven identical via a compiled-CSS test comparing both rules
directly.

**Portrait — `.media-frame`'s first real production caller.** `.media-frame`
(PF-021) had zero real callers anywhere in `src/` until this task —
only the dev showcase referenced it. The About portrait is genuinely the
first real use, proving the abstraction the same way PF-032/PF-060 did for
capability cards/case studies. The real supplied photo is ~1.14:1
(landscape-ish, not 4:5), so a new `.media-frame--portrait { aspect-ratio:
4/5; }` variant safely center-crops it via the base component's existing
`object-fit: cover` — no distortion, a modest, visually safe trim given
the photo's generous background margin around its centered subject.

**Corner accent — one L-shaped border bracket, restrained and static.**
`.about-card__portrait::after` (a generated pseudo-element, never exposed
to the accessibility tree — no `aria-hidden` needed or possible to add to
it) draws two 2px `border-right`/`border-bottom` sides in `--color-accent`
at the portrait frame's bottom-right corner. A real `border` property, not
`box-shadow`/gradient, so forced-colors mode auto-recolors it the same way
already established for `.project-card`'s focus ring and the active
nav-route indicator. No transition or animation — static, per this task's
explicit scope boundary; site-wide motion remains a separate, later pass.

**Generic-cascade resets applied only where they genuinely matter.**
`.about-card__highlights` gets no `max-width: none` reset: `.about-card`
is structurally capped to 42% of an 80rem container (~538px), already
under `elements/_body-copy.scss`'s generic 68ch (~544px) `ul, ol` cap
before subtracting any padding — the leak already found twice elsewhere in
this project (`.site-nav ul`, the same generic rule) cannot occur here for
a real structural reason, not by luck, so no reset or test was manufactured
for it. `margin`/`padding`/`list-style` (the list and its `li` items) and
`margin` (the name/role/statement paragraphs) genuinely do affect the
rendered result and are reset, the same fix shape already used for
`.site-footer__meta`/`.site-footer__privacy`.

**Homepage About preview untouched**, confirmed by a dedicated regression
test — this task's scope was the About page only.
