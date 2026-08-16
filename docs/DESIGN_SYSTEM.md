# Design System

Established in PF-020 (tokens, typography, global document behavior),
extended in PF-021 (base elements: headings, body copy, links, buttons,
labels, tags, lists, media frames, section headers, containers, and
form-control foundations), formalized as the component showcase in PF-030
(table of contents, review checklist), extended again in PF-031 (global
navigation and footer — see "Global navigation and footer (PF-031)" below),
extended again in PF-032 (capability cards), and extended again in PF-033
(project cards — see "Project cards (PF-033)" below). Does **not** yet
define process/trust/CTA components — that's PF-034. See
[`DECISION_LOG.md`](DECISION_LOG.md) for the composition-strategy and
tooling decisions this builds on, and for the
PF-020/PF-021/PF-030/PF-031/PF-032/PF-033 decisions themselves.

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
│   └── _document.scss         — global body/html appearance, focus-visible, reduced-motion
├── elements/                  — PF-021: bare-tag styling (applies site-wide, no opt-in class)
│   ├── _headings.scss         — h1-h4, .text-display
│   ├── _body-copy.scss        — p, strong, em, small, code/kbd, lists, .text-lead, .list--marked
│   └── _links.scss            — a, .link--plain
├── objects/                   — PF-021: structural, non-cosmetic
│   ├── _container.scss        — .container / --wide / --reading
│   └── _section-header.scss   — .section-header
├── components/
│   ├── _skip-link.scss
│   ├── _button.scss           — PF-021: .btn
│   ├── _tag.scss               — PF-021: .tag
│   ├── _media-frame.scss       — PF-021: .media-frame
│   ├── _form-control.scss      — PF-021: .field
│   ├── _site-header.scss / _site-nav.scss / _site-footer.scss — PF-031
│   ├── _capability-card.scss   — PF-032: .capability-card (CSS-only, no JS renderer yet — see docs/DESIGN_SYSTEM.md's "Capability cards (PF-032)" section)
│   └── _project-card.scss      — PF-033: .project-card (CSS-only, no JS renderer yet — see "Project cards (PF-033)" section)
├── utilities/
│   └── _visually-hidden.scss  — PF-021: .visually-hidden
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
content:** `.btn`, `.tag`, `.media-frame`, `.section-header`, `.container`,
`.field`. No PF-021 change touches `src/pages/templates/*.js` or
`src/components/partials/*.js` — these classes exist as proven, reusable CSS
ready for PF-031+ to adopt.

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

`.project-card` (`src/styles/components/_project-card.scss`) is
**CSS-only** — there is no `renderProjectCard()` function and no content
data module. `work/index.js` and all three case-study content files
(`fes-challenger`/`business-workflow-system`/`ebarangay`) are still
placeholders, so there is no real production template to call a renderer
from — the same precedent as `.btn`/`.tag`/`.media-frame`/
`.capability-card`. The showcase specimens are hand-authored, literal
markup using the real compiled component classes — not a live render call.

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
  to generate icon markup dynamically; revisit when PF-031 (nav icons) or
  PF-053 (social links) introduces that first real call site.
- **`.btn--ghost`'s lack of a border** (PF-021) — currently relies on text
  contrast alone, like a plain link; revisit if a future use case needs it
  to read as a bounded shape rather than a text action.
- **Capability-card renderer/data module** (PF-032) — deferred for the same
  reason the PF-021 icon renderer was: no real production template calls it
  yet. Revisit when PF-041/050 first composes real capability-card content
  into an actual page — that milestone is the natural point to add
  `renderCapabilityCard()` and a validated content-data module, following
  the same pattern PF-031 used to finally give the icon renderer its first
  real caller.
