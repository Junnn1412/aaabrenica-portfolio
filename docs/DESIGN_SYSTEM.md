# Design System

Established in PF-020. Defines the foundational visual system — color,
typography, spacing, shape, motion, layering — and the global document
behavior every route now uses. Does **not** define finished components
(buttons, cards, nav, forms) — that's PF-021 ("production base elements")
and later component milestones. See
[`DECISION_LOG.md`](DECISION_LOG.md) for the composition-strategy and
tooling decisions this builds on, and for the PF-020 token/typography/preview
decisions themselves.

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
│   ├── _shape.scss            — radii, shadows, border/focus-ring width
│   ├── _motion.scss           — durations, easings, distances
│   └── _layers.scss           — z-index scale
├── generic/
│   ├── _reset.scss            — box-sizing/margin reset only, no visual opinion
│   ├── _fonts.scss            — @font-face (real CSS output, not a "setting")
│   ├── _custom-properties.scss — emits every settings/ value to :root
│   └── _document.scss         — global body/html appearance, focus-visible, reduced-motion
├── components/
│   └── _skip-link.scss
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

| Token                                                                                       | Value                                                            | Role                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-canvas`                                                                            | `#0b0f17`                                                        | Page background                                                                                                                                                                                                                                      |
| `--color-surface-1`                                                                         | `#161d2c`                                                        | Card/panel background                                                                                                                                                                                                                                |
| `--color-surface-2`                                                                         | `#1d2540`                                                        | Dropdown/modal background                                                                                                                                                                                                                            |
| `--color-border`                                                                            | `#2a3350`                                                        | Subtle content dividers (decorative)                                                                                                                                                                                                                 |
| `--color-text-primary`                                                                      | `#f2eee6`                                                        | Warm off-white primary text                                                                                                                                                                                                                          |
| `--color-text-secondary`                                                                    | `#a7b0c4`                                                        | Muted blue-gray secondary text                                                                                                                                                                                                                       |
| `--color-text-muted`                                                                        | `#838caa`                                                        | Tertiary but still **meaningful** text — captions, placeholders, timestamps. Approved on `--color-canvas`/`--color-surface-1` only; measured 4.53:1 on `--color-surface-2`, too close to the 4.5:1 floor to approve there without a lighter override |
| `--color-accent`                                                                            | `#2e6bff`                                                        | Large text, icons, borders, focus ring — **not** small/body text (4.26:1, below the 4.5:1 body-text floor)                                                                                                                                           |
| `--color-accent-text`                                                                       | `#6e9bff`                                                        | Small/body-size accent text and links (7.13:1)                                                                                                                                                                                                       |
| `--color-accent-hover`                                                                      | `color.adjust($palette-cobalt-500, $lightness: 6%)` → `#4d81ff`  | Hover (derived, not hand-picked)                                                                                                                                                                                                                     |
| `--color-accent-active`                                                                     | `color.adjust($palette-cobalt-500, $lightness: -8%)` → `#054eff` | Pressed (derived)                                                                                                                                                                                                                                    |
| `--status-success` / `--status-warning` / `--status-danger` / `--status-info`               | `#3ddc84` / `#f5b942` / `#f0576b` / `#22c3d6`                    | Status text/icon — always paired with an icon or text label, never color alone                                                                                                                                                                       |
| `--accent-lime` / `--accent-amber` / `--accent-coral` / `--accent-violet` / `--accent-cyan` | `#8dd941` / `#f5b942` / `#f0576b` / `#9b6bff` / `#22c3d6`        | Reserved for capability cards (PF-032). Independently defined, not aliased to status colors — a future change to one role never silently changes the other                                                                                           |
| `--color-focus-ring`                                                                        | `var(--color-accent)`                                            | Focus outline                                                                                                                                                                                                                                        |
| `--color-selection-bg`                                                                      | `rgba(46, 107, 255, 0.35)`                                       | `::selection`                                                                                                                                                                                                                                        |
| `--color-scrim`                                                                             | `rgba(11, 15, 23, 0.72)`                                         | Modal backdrop (future)                                                                                                                                                                                                                              |

**Format:** plain hex/rgb shipped as CSS custom properties — universal
browser support, no fallback complexity. OKLCH was considered (better
perceptual uniformity for programmatic palette generation) but isn't needed
for a fixed, hand-tuned palette with no current need for wide-gamut color or
runtime palette math — noted as a revisit condition below, not implemented.

## Contrast matrix

WCAG relative-luminance method, re-verified programmatically against the
real compiled tokens by `tests/design-tokens.test.mjs` (not just documented
by hand) — the test compiles the real `_custom-properties.scss`, parses
whatever color format Dart Sass emits (`#hex`, comma-form `rgb()`/`rgba()`,
or modern space-form `rgb(r g b / a%)`), and asserts each ratio meets its
threshold.

| Foreground               | Background          | Ratio   | Target                     | Result                 |
| ------------------------ | ------------------- | ------- | -------------------------- | ---------------------- |
| `--color-text-primary`   | `--color-canvas`    | 16.58:1 | 4.5:1                      | Pass (AAA)             |
| `--color-text-primary`   | `--color-surface-1` | 14.56:1 | 4.5:1                      | Pass (AAA)             |
| `--color-text-secondary` | `--color-canvas`    | 8.82:1  | 4.5:1                      | Pass (AAA)             |
| `--color-text-secondary` | `--color-surface-1` | 7.75:1  | 4.5:1                      | Pass (AAA)             |
| `--color-text-muted`     | `--color-canvas`    | 5.75:1  | 4.5:1                      | Pass                   |
| `--color-text-muted`     | `--color-surface-1` | 5.05:1  | 4.5:1                      | Pass                   |
| `--color-accent`         | `--color-canvas`    | 4.26:1  | 3.0:1 (large-text/UI only) | Pass — restricted role |
| `--color-accent`         | `--color-surface-1` | 3.74:1  | 3.0:1                      | Pass — restricted role |
| `--color-accent-text`    | `--color-canvas`    | 7.13:1  | 4.5:1                      | Pass (AAA)             |
| `--color-accent-text`    | `--color-surface-1` | 6.26:1  | 4.5:1                      | Pass                   |
| `--status-success`       | `--color-canvas`    | 10.75:1 | 4.5:1                      | Pass                   |
| `--status-warning`       | `--color-canvas`    | 10.88:1 | 4.5:1                      | Pass                   |
| `--status-danger`        | `--color-canvas`    | 5.74:1  | 4.5:1                      | Pass                   |
| `--status-danger`        | `--color-surface-1` | 5.04:1  | 4.5:1                      | Pass                   |
| `--status-info`          | `--color-canvas`    | 8.99:1  | 4.5:1                      | Pass                   |

`--color-border` is outside this matrix — WCAG 1.4.11 exempts purely
decorative dividers, and no interactive component exists yet to require a
scored boundary (PF-021). State is never communicated by color alone: status
colors must always be paired with an icon or text label when actually used
in a component (PF-021+ responsibility to uphold, not verifiable until
components exist).

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

**PF-020/PF-021 boundary:** this scale is defined and exposed as tokens now,
but is **not** applied to actual `<h1>`–`<h4>` elements site-wide — that's
PF-021's "production base elements" work. `global/_document.scss` only sets
`html`/`body`-level appearance (canvas background, primary text color, base
body font/size/line-height, focus-visible, reduced-motion). The scale is
demonstrated now via the preview page's own demo styles.

## Spacing, layout, shape, motion, layering

Unchanged from the plan — see inline comments in
`src/styles/settings/{_spacing,_shape,_motion,_layers}.scss` for the exact
values and rationale (spacing scale, container widths, five content-driven
breakpoints, radii, dark-appropriate shadow levels, `:focus-visible`
treatment, motion durations/easings/distances, and the gapped z-index
scale). `--motion-distance-sm` is `6px`, matching the requirements doc's
approved 4–6px card-lift range exactly (the upper bound, for a clearly
perceptible but still restrained hover lift).

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

`dev/design-system/index.html` — a hand-authored, dev-only preview page
that reuses the production `/src/scripts/main.js` → `main.scss` pipeline
for real compiled tokens and fonts, plus minimal preview-specific `<style>`
(one utility class per token being demonstrated — swatches, type samples,
a spacing ruler, shape/shadow samples, a motion/focus demo). Not a
self-contained or parallel design system.

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

## Accessibility rationale summary

- Every text/background pairing whose use is documented above is
  programmatically verified (`tests/design-tokens.test.mjs`) against its
  WCAG floor, not just hand-computed once.
- `--color-accent`'s restricted role (large text/icons/UI only) is a rule
  PF-021+ component work must respect, not just a documentation note.
- `:focus-visible` (not `:focus`) keeps keyboard focus rings without
  showing them on mouse clicks; ring color verified ≥3:1 against both
  approved backgrounds.
- Reduced motion is enforced globally, before any motion exists to respect
  it.
- Full 320–1920px responsive review and forced-colors sanity checks are
  manual (`docs/TESTING_AND_QA.md`) — no new tooling for these.

## Revisit conditions

- **OKLCH color format** — if the system later needs generated/derived
  palettes at scale (e.g. many capability-card variants), reconsider OKLCH
  over hex for better perceptual uniformity.
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
