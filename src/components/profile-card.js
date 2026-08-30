import { escapeHtml } from '../pages/escape.js';
import { contentRevealAttributes } from './content-reveal.js';

const PROFILE_CARD_VARIANTS = new Set(['full', 'compact']);

export function renderProfileCard({
  variant,
  profile,
  statement,
  highlights,
  action,
  reveal,
}) {
  if (!PROFILE_CARD_VARIANTS.has(variant)) {
    throw new Error(
      `renderProfileCard: variant must be one of ${[...PROFILE_CARD_VARIANTS].join(', ')}, received ${JSON.stringify(variant)}`,
    );
  }

  const profileName =
    variant === 'full'
      ? profile.identity.formalName
      : profile.identity.displayName;
  const loadingAttribute = variant === 'compact' ? ' loading="lazy"' : '';
  const statementMarkup =
    variant === 'full'
      ? `<p class="profile-card__statement">${escapeHtml(statement)}</p>`
      : '';
  const highlightsMarkup =
    variant === 'full'
      ? `<ul class="profile-card__highlights">${highlights
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join('')}</ul>`
      : '';
  const actionMarkup =
    variant === 'compact'
      ? `<a class="btn btn--primary profile-card__action" href="${escapeHtml(action.path)}">${escapeHtml(action.label)}</a>`
      : '';
  const revealMarkup = reveal ? contentRevealAttributes(reveal) : '';

  return (
    `<div class="profile-card profile-card--${variant}"${revealMarkup}>` +
    `<div class="profile-card__portrait">` +
    `<span class="media-frame media-frame--portrait">` +
    `<img src="${escapeHtml(profile.portrait.src)}" alt="${escapeHtml(profile.portrait.alt)}" width="${profile.portrait.width}" height="${profile.portrait.height}"${loadingAttribute}>` +
    `</span>` +
    `</div>` +
    `<div class="profile-card__body">` +
    `<p class="profile-card__name">${escapeHtml(profileName)}</p>` +
    `<p class="profile-card__role">${escapeHtml(profile.role)}</p>` +
    statementMarkup +
    highlightsMarkup +
    actionMarkup +
    `</div>` +
    `</div>`
  );
}
