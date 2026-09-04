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
import { renderProfileCard } from '../../components/profile-card.js';
import { renderSectionHeader } from '../../components/section-header.js';
import { contentRevealAttributes } from '../../components/content-reveal.js';

function renderTechnologyStack(stack) {
  const groups = stack.groups
    .map(
      (group) =>
        `<div class="about-stack__group">` +
        `<h3 class="about-stack__group-heading">${escapeHtml(group.heading)}</h3>` +
        `<ul class="about-stack__tags">${group.items
          .map(
            (item) =>
              `<li class="about-stack__tag-item"><span class="tag">${escapeHtml(item)}</span></li>`,
          )
          .join('')}</ul>` +
        `</div>`,
    )
    .join('');

  return (
    `<section class="about-stack" aria-labelledby="about-stack-heading"${contentRevealAttributes('fade-up')}>` +
    `<h2 class="about-stack__heading" id="about-stack-heading">${escapeHtml(stack.heading)}</h2>` +
    `<div class="about-stack__groups">${groups}</div>` +
    `</section>`
  );
}

function renderExperienceDates(dates) {
  const start = `<time datetime="${escapeHtml(dates.start.datetime)}">${escapeHtml(dates.start.label)}</time>`;
  const end = dates.end.datetime
    ? `<time datetime="${escapeHtml(dates.end.datetime)}">${escapeHtml(dates.end.label)}</time>`
    : `<span>${escapeHtml(dates.end.label)}</span>`;

  return (
    `<p class="experience-card__dates">` +
    start +
    `<span aria-hidden="true">–</span>` +
    end +
    `</p>`
  );
}

function renderExperience(experience) {
  const entries = experience.entries
    .map((entry, index) => {
      const headingId = `experience-role-${index + 1}`;
      const responsibilities = entry.responsibilities
        .map((responsibility) => `<li>${escapeHtml(responsibility)}</li>`)
        .join('');
      const technologies = entry.technologies
        .map(
          (technology) =>
            `<li class="experience-card__tag-item"><span class="tag">${escapeHtml(technology)}</span></li>`,
        )
        .join('');

      return (
        `<li class="experience-timeline__item"${contentRevealAttributes('fade-up', { stagger: Math.min(index, 3) })}>` +
        `<article class="experience-card" aria-labelledby="${headingId}">` +
        `<div class="experience-card__header">` +
        `<div class="experience-card__identity">` +
        `<h3 class="experience-card__role" id="${headingId}">${escapeHtml(entry.role)}</h3>` +
        `<p class="experience-card__employer">${escapeHtml(entry.employer)}</p>` +
        `</div>` +
        renderExperienceDates(entry.dates) +
        `</div>` +
        `<div class="experience-card__main">` +
        `<p class="experience-card__summary">${escapeHtml(entry.summary)}</p>` +
        `<ul class="experience-card__responsibilities">${responsibilities}</ul>` +
        `</div>` +
        `<ul class="experience-card__technologies">${technologies}</ul>` +
        `</article>` +
        `</li>`
      );
    })
    .join('');

  return (
    `<section class="about-experience" aria-labelledby="experience-heading">` +
    `<div class="about-experience__inner">` +
    `<div${contentRevealAttributes('fade-up')}>${renderSectionHeader({ ...experience, headingId: 'experience-heading' })}</div>` +
    `<ol class="experience-timeline">${entries}</ol>` +
    `</div>` +
    `</section>`
  );
}

export function renderAboutPage({ content, navItems, activeKey, site }) {
  const paragraphs = content.paragraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');
  const technologyStack = renderTechnologyStack(content.technologyStack);
  const experience = renderExperience(content.experience);
  // PF-053: headingLevel 2 — a sibling of the page's own <h1>, matching
  // standard.js's identical existing precedent for this same closing CTA,
  // preserved exactly (not restructured by this task).
  const cta = content.cta
    ? renderCta({
        ...content.cta,
        headingLevel: 2,
        reveal: 'fade-up',
      })
    : '';
  // Biography/stack and full card form the first composition. Experience is
  // the next full-width section, followed by the closing CTA. Visual, reading,
  // and focus order agree at every width; no CSS `order` is involved.
  const layout =
    `<div class="about-layout about-layout--with-card">` +
    `<div class="about-layout__content"><div class="about-biography"${contentRevealAttributes('fade-up')}><h1>${escapeHtml(content.heading)}</h1>${paragraphs}</div>${technologyStack}</div>` +
    renderProfileCard({
      ...content.profileCard,
      variant: 'full',
      profile: site.profile,
      reveal: 'fade-in',
    }) +
    `</div>`;

  return {
    header: renderHeader(navItems, activeKey, site),
    main: `<div class="container about-page">${layout}${experience}${cta}</div>`,
    footer: renderFooter(navItems, site),
  };
}
