const identity = Object.freeze({
  displayName: 'Antonio Abrenica',
  formalName: 'Antonio A. Abrenica III',
});

export const site = {
  siteName: identity.displayName,
  // PF-064 — replaced the pre-launch "foundation preview" placeholder with
  // the approved final positioning statement, reused verbatim from
  // DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md §3.1 rather than invented.
  // Only Privacy currently relies on this fallback (every other route sets
  // its own content.description).
  defaultDescription:
    'Practical, end-to-end software solutions for growing businesses — delivered with the structure of a development company and the direct collaboration of an independent developer.',
  // Named in PF-031's own scope and DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md
  // §8.1 as "the highlighted navigation action" — reuses the existing
  // /contact/ route, not a new one.
  primaryCta: {
    key: 'contact',
    label: 'Start a Project',
    path: '/contact/',
  },
  // Production domain for canonical URLs, social metadata, and sitemap output.
  baseUrl: 'https://aaabrenica.site',
  // No résumé asset exists yet — deferred by explicit product decision
  // (PF-053/054 scope); stays null until a later milestone approves and
  // adds one.
  resumePath: null,
  // Verified real values (PF-054) — both pass isSafeExternalUrl's
  // https-only + closed host-allowlist check (src/pages/link-safety.js).
  social: {
    github: 'https://github.com/Junnn1412',
    linkedin: 'https://www.linkedin.com/in/antonio-iii-abrenica-b17b181a7',
    facebook: 'https://www.facebook.com/Junnabrenica/',
  },
  // Verified real value (PF-054) — passes isSafeEmail.
  contactEmail: 'website@aaabrenica.site',
  // Contact-form implementation — intentionally disabled until AAA has
  // configured Resend and an exact-path Cloudflare WAF rate-limiting rule,
  // then completed preview delivery, Reply-To, rejection, and recovery
  // checks. The endpoint also has its own independent runtime enable flag;
  // neither source nor runtime configuration can enable the other.
  contactForm: {
    enabled: false,
    action: '/api/contact',
  },
  // Header/nav visual-polish task, logo-integration follow-up — the
  // replaceable header brand-mark slot, now occupied by AAA's temporary
  // legacy placeholder image, placed directly in the repository at
  // public/images/brand/aaa-placeholder-logo.png. Inspected directly from
  // the real file bytes, not assumed from the extension: valid PNG,
  // 231x140px (1.65:1 aspect ratio — a wide horizontal lockup with
  // embedded "AAA III" text baked into the image), 8-bit RGBA (color type
  // 6 — real alpha transparency), not interlaced, 8,853 bytes.
  // `renderBrandMark()` (src/components/partials/header.js) always renders
  // this decoratively (`alt=""`, hardcoded there, not read from this
  // object) — the same pattern already used for the FES Challenger
  // case-study logo (PF-060): the concise public name rendered alongside it
  // remains the one real accessible name. width/height are
  // the real inspected intrinsic dimensions, never guessed, so the browser
  // reserves the correct aspect ratio before the image loads. This is
  // explicitly NOT the final SBTech PH / Silver Bullet Tech identity —
  // swapping in that emblem later is the same one-line change to this
  // object, no markup or CSS restructuring required — that's the point of
  // this slot.
  brandMark: {
    src: '/images/brand/aaa-placeholder-logo.png',
    width: 231,
    height: 140,
  },
  // Shared profile identity for the full About card and compact homepage
  // card. The compact card deliberately selects identity.displayName; the
  // full About card deliberately selects identity.formalName. Route content
  // owns variant-specific statement/highlight/action copy; identity and
  // portrait metadata stay centralized here so the two consumers cannot
  // drift or infer a name from route/string characteristics.
  profile: {
    identity,
    role: 'Full-Stack Software Developer',
    portrait: {
      src: '/images/profile/aaa-portrait.jpg',
      alt: 'Portrait of Antonio A. Abrenica III',
      width: 1665,
      height: 1464,
    },
  },
};
