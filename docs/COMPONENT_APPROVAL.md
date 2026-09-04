# Component approval — Gate C (PF-035)

Tracks AAA's approval of the component system per `docs/DEVELOPMENT_WORKFLOW.md`'s
Gate C: **"Approve header, footer, capability cards, project cards, process
elements, and CTAs in representative states and widths."** This record is the
durable artifact PF-040 checks before starting global-shell work. It does not
duplicate `docs/DESIGN_SYSTEM.md` (token/component rationale) or
`docs/TESTING_AND_QA.md` (the authoritative manual-check checklist) — both stay
the source of truth for _how_ to review; this file only tracks sign-off status.

## Status: Gate C approved

AAA completed the browser review and approved the component system on
2026-08-16, without exceptions. See §4 for the final decision.

## 1. Source-level audit (Claude, read-only) — 2026-08-16

### Coverage

Read in full: all `src/styles/settings/` tokens (colors, spacing, typography,
shape, motion); `src/styles/generic/_document.scss` and `_reset.scss`;
`src/styles/elements/` (headings, body-copy, links); `src/styles/objects/`
(container, section-header); `src/styles/components/_button.scss`,
`_tag.scss`, `_media-frame.scss`, `_form-control.scss`, `_skip-link.scss`,
`_site-header.scss`, `_site-nav.scss`, `_site-footer.scss`,
`_capability-card.scss`, `_project-card.scss`, `_process-steps.scss`,
`_trust-list.scss`, `_engagement-options.scss`, `_cta.scss`. Cross-checked
against `dev/design-system/index.html` and `docs/DESIGN_SYSTEM.md`'s
copy-provenance table for provisional-vs-final content markers.

Checked for: typography/spacing token consistency; container/grid breakpoint
consistency; border/surface/radius/depth consistency; interactive-vs-static
affordance boundaries; hover/active/focus/reduced-motion/forced-colors
consistency; optional/missing-content handling; long-content wrap behavior;
generic prose/list cascade leakage (the defect class already found once each
in PF-031 and PF-032, per `docs/DECISION_LOG.md`).

### Findings

**No defects found.** Specifically verified as consistent:

- Every grid/list component (`.capability-cards`, `.project-cards`,
  `.process-steps`, `.trust-list`, `.engagement-options`) resets
  `max-width`/`margin`/`list-style` to escape `elements/_body-copy.scss`'s
  generic `ul, ol, li` prose rules — the exact leak class fixed reactively in
  PF-031/032 has been applied proactively everywhere else.
- Hover-lift `transform` effects (`.btn`, `.capability-card`,
  `.project-card`) are consistently gated behind
  `@media (hover: hover) and (pointer: fine)`; plain color-only hover
  (`elements/_links.scss`, `.site-footer` links) is consistently left
  ungated, matching the established base-element precedent rather than
  representing an inconsistency.
- Focus handling is consistent: a single global `:focus-visible` ring
  (`generic/_document.scss`) applies everywhere except capability-card and
  project-card, which deliberately suppress the local ring in favor of a
  documented card-level equivalent (two-tone for capability-card's bright
  accent fills, single-tone for project-card's neutral surface) — no
  competing or duplicate rings found.
- `forced-colors` handling is present everywhere a fill-only boundary would
  otherwise disappear (`.capability-card`, `.project-card`, `.cta`,
  `.process-steps__number`), and deliberately absent where a real
  `border-color` already auto-recolors (`.engagement-options__item`) or no
  boundary exists at all (`.trust-list__item`) — no gaps found.
- Typography scale, spacing tokens, and touch-target sizing are applied
  consistently across all components audited; no ad hoc magic numbers outside
  documented, justified exceptions (e.g., the project-card frame's decorative
  dot positions).
- Provisional vs. final showcase copy remains correctly and consistently
  distinguished in both `dev/design-system/index.html` and
  `docs/DESIGN_SYSTEM.md`'s copy-provenance table (see §3 below).

No targeted fixes are proposed from this pass.

### `npm run verify`

Result: **pass** — 214/214 tests, lint, format check, build, and
`html-validate` all green. Exit code 0.

**Source audit result: PASS — no defects found.**

## 2. Browser-review matrix (AAA — completed 2026-08-16)

Reuses `docs/TESTING_AND_QA.md:40-128` as the authoritative checklist per
component group; this table only tracks completion.

| Component group              | Widths (320/375/768/1024/1440/1920) | Keyboard | Touch/no-hover | Reduced motion | Forced colors | 200% zoom | Status   |
| ---------------------------- | ----------------------------------- | -------- | -------------- | -------------- | ------------- | --------- | -------- |
| Header/nav/footer            | PASS                                | PASS     | PASS           | PASS           | PASS          | PASS      | **PASS** |
| Capability cards             | PASS                                | PASS     | PASS           | PASS           | PASS          | PASS      | **PASS** |
| Project cards                | PASS                                | PASS     | PASS           | PASS           | PASS          | PASS      | **PASS** |
| Process/trust/engagement/CTA | PASS                                | PASS     | PASS           | PASS           | PASS          | PASS      | **PASS** |

## 3. Provisional vs. final content — confirmed distinguished

Cross-checked `dev/design-system/index.html` against
`docs/DESIGN_SYSTEM.md:888-893`'s verbatim/provisional copy-provenance table:
capability-card descriptions, the process/trust/engagement secondary
sentences and link labels are all still explicitly marked provisional
showcase copy (approved for showcase use only, pending final production
review at PF-041); the four process/trust/engagement stage/assurance/label
strings remain marked verbatim from the requirements doc; the Final CTA copy
remains the one component marked fully approved as final production copy. No
drift found between the two documents.

## 4. Final Gate C decision

- Decision: **Approved**
- Date: 2026-08-16
- Signed: AAA
- Exceptions: None

Gate C approval covers component **structure, behavior, responsiveness, and
accessibility** only — it is not an approval of final production marketing
copy or assets. Final production content/copy approval for capability cards,
project cards, and the provisional PF-034 showcase strings remains a
separate, later review (PF-041), per `docs/DECISION_LOG.md`'s PF-033/034
entries.
