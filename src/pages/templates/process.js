// PF-051 — the Process-page template. Mirrors solutions.js's per-section
// container-ownership shape: intro (bare .container), then each top-level
// block as its own .page-section + .container, closing with the shared
// .cta panel. See docs/DECISION_LOG.md for the full rationale.
import { escapeHtml } from '../escape.js';
import { renderHeader } from '../../components/partials/header.js';
import { renderFooter } from '../../components/partials/footer.js';
import { renderSectionHeader } from '../../components/section-header.js';
import { renderCta } from '../../components/cta.js';
import { contentRevealAttributes } from '../../components/content-reveal.js';

function renderIntro(content) {
  const paragraphs = content.paragraphs
    .map((p) => `<p class="text-lead">${escapeHtml(p)}</p>`)
    .join('');
  return `<div class="container"><div class="process-page__container"><div class="process-page__intro"${contentRevealAttributes('fade-up')}><h1>${escapeHtml(content.heading)}</h1>${paragraphs}</div></div></div>`;
}

// Shared by a stage's own facts and the Working Together section's facts —
// one <dl> markup contract, reused verbatim in both contexts (no wrapper
// <div> per pair: dt immediately precedes its own dd, so the CSS Grid
// desktop layout in src/styles/pages/_process.scss can split the pairs into
// a 2-column term/detail grid via implicit row auto-placement without any
// markup change or DOM-order change).
function renderFacts(pairs) {
  const items = pairs
    .map(
      ([term, detail]) =>
        `<div class="process-facts__item">` +
        `<dt class="process-facts__term">${escapeHtml(term)}</dt>` +
        `<dd class="process-facts__detail">${escapeHtml(detail)}</dd>` +
        `</div>`,
    )
    .join('');
  return `<dl class="process-facts">${items}</dl>`;
}

// stage.next is only pushed `if (stage.next)` — safe by construction, not
// merely by convention: src/pages/render.js re-validates every route's
// content through content-schema.js's checkProcessContent() before this
// renderer ever runs, and that schema already guarantees Support's content
// object carries no "next" property at all (checked via Object.hasOwn, not
// truthiness) while every other stage's "next" is a required non-empty
// string. By the time renderStage() runs, presence and non-empty value
// already coincide by contract, so this plain truthiness check is
// sufficient here without repeating the stricter Object.hasOwn check.
function renderStage(stage, index) {
  const facts = [
    ['What Happens', stage.whatHappens],
    ['What We Need From You', stage.clientInput],
    ['What I Deliver', stage.delivers],
    ['Review & Approval', stage.approval],
  ];
  if (stage.next) {
    facts.push(['What Happens Next', stage.next]);
  }
  return (
    `<li class="process-detail__stage"${contentRevealAttributes('fade-up')}>` +
    `<div class="process-detail__heading-row">` +
    `<span class="process-detail__number" aria-hidden="true">${index + 1}</span>` +
    `<h3 class="process-detail__heading">${escapeHtml(stage.heading)}</h3>` +
    `</div>` +
    renderFacts(facts) +
    `</li>`
  );
}

function renderStagesSection(stages) {
  return (
    `<section class="page-section process-stages"><div class="container"><div class="process-page__container">` +
    `<div${contentRevealAttributes('fade-up')}>${renderSectionHeader(stages)}</div>` +
    `<ol class="process-detail">${stages.items.map(renderStage).join('')}</ol>` +
    `</div></div></section>`
  );
}

function renderWorkingTogetherSection(workingTogether) {
  const facts = workingTogether.items.map((item) => [item.heading, item.body]);
  return (
    `<section class="page-section process-working"><div class="container"><div class="process-page__container"${contentRevealAttributes('fade-up')}>` +
    renderSectionHeader({ heading: workingTogether.heading }) +
    renderFacts(facts) +
    `</div></div></section>`
  );
}

// headingLevel: 2 — this closing CTA is a sibling of the Stages/Working
// Together .page-sections, not nested beneath either of them, so its own
// heading must be a third page-level <h2>, matching them, rather than
// renderCta()'s <h3> default (which every other caller, home.js and
// solutions.js, still uses unchanged — their own CTA sits as the last
// element of a section already opened by its own <h2>).
function renderClosingCtaSection(cta) {
  return (
    `<section class="page-section"><div class="container"><div class="process-page__container">` +
    renderCta({ ...cta, headingLevel: 2, reveal: 'fade-up' }) +
    `</div></div></section>`
  );
}

export function renderProcessPage({ content, navItems, activeKey, site }) {
  const main =
    renderIntro(content) +
    renderStagesSection(content.stages) +
    renderWorkingTogetherSection(content.workingTogether) +
    renderClosingCtaSection(content.cta);

  return {
    header: renderHeader(navItems, activeKey, site),
    main,
    footer: renderFooter(navItems, site),
  };
}
