import { escapeHtml } from '../pages/escape.js';
import { ACTION_LINK_ICONS } from '../pages/icon-registry.js';
import { renderIcon } from './icon.js';

const ACTION_LINK_VARIANTS = new Set(['forward', 'back', 'external']);

export function renderActionLink({ label, href, variant }) {
  if (typeof label !== 'string' || label.length === 0) {
    throw new TypeError('renderActionLink: label must be a non-empty string');
  }
  if (typeof href !== 'string' || href.length === 0) {
    throw new TypeError('renderActionLink: href must be a non-empty string');
  }
  if (!ACTION_LINK_VARIANTS.has(variant)) {
    throw new TypeError(
      `renderActionLink: variant must be one of ${[...ACTION_LINK_VARIANTS].join(', ')}`,
    );
  }

  const labelMarkup = `<span class="action-link__label">${escapeHtml(label)}</span>`;
  const iconMarkup = renderIcon(ACTION_LINK_ICONS[variant], {
    className: 'action-link__icon',
  });
  const contents =
    variant === 'back'
      ? `${iconMarkup}${labelMarkup}`
      : `${labelMarkup}${iconMarkup}`;
  const externalAttrs =
    variant === 'external' ? ' target="_blank" rel="noopener noreferrer"' : '';

  return `<a class="action-link action-link--${variant}" href="${escapeHtml(href)}"${externalAttrs}>${contents}</a>`;
}
