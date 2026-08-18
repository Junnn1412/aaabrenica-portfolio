// About profile-card task — About moves off the generic standard.js
// template because its composition (a two-column biography + profile-card
// layout) is single-purpose: Privacy is standard.js's only other caller
// and will never need a profile card. Bolting an optional field onto
// standard.js for one of its two callers would be exactly the kind of
// speculative single-use generalization CLAUDE.md's architecture rules
// warn against — a dedicated template, mirroring home.js/work.js/
// process.js/solutions.js, is the smaller, more honest change.
//
// The existing heading/paragraphs/CTA rendering is duplicated from
// standard.js (not imported/shared) — About's own copy of it, since the
// two templates are expected to diverge further, not stay in lockstep.
import { escapeHtml } from '../escape.js';
import { renderHeader } from '../../components/partials/header.js';
import { renderFooter } from '../../components/partials/footer.js';
import { renderCta } from '../../components/cta.js';

// The profile card's own name/role/statement are plain styled text, not
// headings — they restate the page's own subject (already announced by
// <h1>About</h1>), not a new section of content, so a second near-top-level
// heading here would only pollute the page's real heading hierarchy.
//
// `profileCard` is schema-optional (content-schema.js), the same "absent
// renders nothing" pattern as site.brandMark/case-study logo/gallery — this
// task ships it fully populated, not null, but the renderer stays
// defensive rather than assuming a value that the schema itself doesn't
// require.
function renderProfileCard(card) {
  if (!card) return '';
  const highlights = card.highlights
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');
  return (
    `<div class="about-card">` +
    `<div class="about-card__portrait">` +
    `<span class="media-frame media-frame--portrait">` +
    `<img src="${escapeHtml(card.portrait.src)}" alt="${escapeHtml(card.portrait.alt)}" width="${card.portrait.width}" height="${card.portrait.height}">` +
    `</span>` +
    `</div>` +
    `<div class="about-card__body">` +
    `<p class="about-card__name">${escapeHtml(card.name)}</p>` +
    `<p class="about-card__role">${escapeHtml(card.role)}</p>` +
    `<p class="about-card__statement">${escapeHtml(card.statement)}</p>` +
    `<ul class="about-card__highlights">${highlights}</ul>` +
    `<a class="btn btn--primary about-card__cta" href="${escapeHtml(card.cta.path)}">${escapeHtml(card.cta.label)}</a>` +
    `</div>` +
    `</div>`
  );
}

export function renderAboutPage({ content, navItems, activeKey, site }) {
  const paragraphs = content.paragraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');
  // PF-053: headingLevel 2 — a sibling of the page's own <h1>, matching
  // standard.js's identical existing precedent for this same closing CTA,
  // preserved exactly (not restructured by this task).
  const cta = content.cta ? renderCta({ ...content.cta, headingLevel: 2 }) : '';
  // Biography first, card second, in source order — matching the approved
  // plan exactly: visual order, reading order, and focus order all agree,
  // and the desktop two-column split (src/styles/pages/_about.scss) is
  // pure flexbox source-order layout, no CSS `order` property involved.
  // The two-column split only activates with a real card present
  // (`about-layout--with-card`); without one, .about-layout stays a plain
  // single-column block, identical to standard.js's own rendering.
  const layoutClass = content.profileCard
    ? 'about-layout about-layout--with-card'
    : 'about-layout';
  const layout =
    `<div class="${layoutClass}">` +
    `<div class="about-layout__content"><h1>${escapeHtml(content.heading)}</h1>${paragraphs}</div>` +
    renderProfileCard(content.profileCard) +
    `</div>`;

  return {
    header: renderHeader(navItems, activeKey, site),
    main: `<div class="container">${layout}${cta}</div>`,
    footer: renderFooter(navItems, site),
  };
}
