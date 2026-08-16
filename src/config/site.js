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
  // Structure only, no fabricated values — populated once PF-003's content inventory is approved.
  resumePath: null,
  social: {
    github: null,
    linkedin: null,
  },
  contactEmail: null,
};
