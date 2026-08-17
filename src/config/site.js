export const site = {
  siteName: 'AAA Portfolio',
  defaultDescription:
    "AAA's professional developer portfolio — foundation preview.",
  // Named in PF-031's own scope and DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md
  // §8.1 as "the highlighted navigation action" — reuses the existing
  // /contact/ route, not a new one.
  primaryCta: { label: 'Start a Project', path: '/contact/' },
  // No production domain is connected yet — canonical links are omitted while this is null.
  baseUrl: null,
  // No résumé asset exists yet — deferred by explicit product decision
  // (PF-053/054 scope); stays null until a later milestone approves and
  // adds one.
  resumePath: null,
  // Verified real values (PF-054) — both pass isSafeExternalUrl's
  // https-only + closed host-allowlist check (src/pages/link-safety.js).
  social: {
    github: 'https://github.com/Junnn1412',
    linkedin: 'https://www.linkedin.com/in/antonio-iii-abrenica-b17b181a7',
  },
  // Verified real value (PF-054) — passes isSafeEmail.
  contactEmail: 'website@aaabrenica.site',
};
