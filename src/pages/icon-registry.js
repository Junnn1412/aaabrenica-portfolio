// PF-041 — the single closed-set source of truth for every icon key and
// capability accent a route's content is allowed to reference. Pure data
// only (no markup-building, no escapeHtml) so src/pages/content-schema.js
// can validate against it without depending on any src/components/*
// renderer module — the same role src/pages/link-safety.js already plays
// for link fields. Renderers import this same registry (not a duplicate)
// to resolve a validated key to a real Lucide iconNode before calling
// src/components/icon.js's renderIcon(). See docs/DECISION_LOG.md's PF-041
// entry for why this replaced an earlier draft that imported icon maps
// directly from renderer modules.
//
// Every icon below was preflighted against icon.js's ALLOWED_TAGS
// ({path, circle, line, rect, polyline, polygon, ellipse}) and
// ALLOWED_ATTRS ({d, cx, cy, r, x, y, x1, y1, x2, y2, width, height, rx,
// ry, points}) by reading each icon's real source in
// node_modules/lucide/dist/esm/icons/*.mjs (v1.31.0) — every one uses only
// already-whitelisted tags/attrs, so no icon.js change was needed.
import {
  PackageCheck,
  Handshake,
  Workflow,
  Boxes,
  Globe,
  Code,
  RefreshCw,
  LifeBuoy,
  ArrowUpRight,
} from 'lucide';

export const TRUST_ICONS = {
  'package-check': PackageCheck,
  handshake: Handshake,
  workflow: Workflow,
};

export const CAPABILITY_ICONS = {
  boxes: Boxes,
  workflow: Workflow,
  globe: Globe,
  code: Code,
  'refresh-cw': RefreshCw,
  'life-buoy': LifeBuoy,
};

// Matches $capability-card-accents in src/styles/components/_capability-card.scss.
export const CAPABILITY_ACCENTS = [
  'lime',
  'amber',
  'coral',
  'violet',
  'cyan',
  'magenta',
];

// The fixed decorative arrow used by every linked .capability-card__arrow
// and .project-card's action affordance — not content-selected, so it
// isn't a "key" a content module chooses, just a single shared constant.
// Matches the showcase's exact arrow SVG (d="M7 7h10v10" / d="M7 17 17 7").
export const CARD_ARROW_ICON = ArrowUpRight;
