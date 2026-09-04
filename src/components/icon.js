import { escapeHtml } from '../pages/escape.js';

const SVG_ATTRS =
  'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

// Closed set matching Lucide's own icon-data shape. Anything else is
// rejected rather than emitted, so malformed/unexpected icon data can
// never smuggle arbitrary markup through this renderer.
const ALLOWED_TAGS = new Set([
  'path',
  'circle',
  'line',
  'rect',
  'polyline',
  'polygon',
  'ellipse',
]);

// Closed set of geometry attributes actually used by the tags above.
// Anything else — onload, onclick, style, Lucide's framework-only "key"
// (never present in the raw iconNode data this renderer consumes — see
// node_modules/lucide/dist/esm/icons/*.mjs — only added by Lucide's own
// createElement()/React wrappers, which this project never uses), or a
// typo — throws rather than being silently stripped or merely escaped.
const ALLOWED_ATTRS = new Set([
  'd',
  'cx',
  'cy',
  'r',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'width',
  'height',
  'rx',
  'ry',
  'points',
]);

function renderAttrs(attrs) {
  return Object.entries(attrs)
    .map(([name, value]) => {
      if (!ALLOWED_ATTRS.has(name)) {
        throw new TypeError(`renderIcon: unexpected attribute "${name}"`);
      }
      return `${name}="${escapeHtml(String(value))}"`;
    })
    .join(' ');
}

// Build-time-only static SVG string renderer for the small, fixed set of
// Lucide icons this project selectively imports (never the whole
// package, never Lucide's runtime createElement()/DOM-replacement path).
// className is the only way to attach an outer class — callers cannot
// inject an arbitrary outer-attribute object; the fixed `class` attribute
// name is emitted by this function, never by the caller.
export function renderIcon(
  iconNode,
  { decorative = true, className = '', hidden = false } = {},
) {
  if (!Array.isArray(iconNode)) {
    throw new TypeError('renderIcon: iconNode must be a Lucide-shaped array');
  }
  const children = iconNode
    .map(([tag, attrs]) => {
      if (
        !ALLOWED_TAGS.has(tag) ||
        typeof attrs !== 'object' ||
        attrs === null
      ) {
        throw new TypeError(`renderIcon: unexpected icon node "${tag}"`);
      }
      return `<${tag} ${renderAttrs(attrs)}></${tag}>`;
    })
    .join('');
  const classAttr = className ? ` class="${escapeHtml(className)}"` : '';
  const a11y = decorative ? ' aria-hidden="true" focusable="false"' : '';
  // A fixed boolean flag, not caller-supplied content — mirrors the
  // JS-driven hidden-attribute toggle nav-toggle.js performs at runtime
  // for the same two icons, so the server-rendered initial state matches
  // what JS would set on first render.
  const hiddenAttr = hidden ? ' hidden' : '';
  return `<svg ${SVG_ATTRS}${classAttr}${a11y}${hiddenAttr}>${children}</svg>`;
}
