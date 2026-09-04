// Intentionally omits `description` to exercise the site.defaultDescription
// fallback for real (see docs/SOURCE_ARCHITECTURE.md and
// tests/render.test.mjs's renderRoute("privacy") test).
//
// Every sentence below is an implementation-specific statement about what
// the current site code verifiably does (confirmed by reading the source:
// no analytics/cookie/tracking code exists anywhere in src/; fonts are
// self-hosted .woff2 files under public/fonts/; no contact form exists
// anywhere), not a categorical or platform-wide claim. Deliberately
// excluded, not merely omitted: any claim about hosting/server/CDN request
// logs, Cloudflare's own processing or data handling, data retention, or
// legal compliance (GDPR/CCPA/etc.) — none of that is configured or
// verified yet (site.baseUrl is null; Cloudflare Pages connects in
// PF-072). See docs/DECISION_LOG.md's PF-054 entry for the revisit
// condition.
export default {
  title: 'Privacy',
  heading: 'Privacy',
  paragraphs: [
    'The current site code does not include analytics or advertising trackers.',
    'The current site code does not set nonessential cookies.',
    'The site currently has no contact form; contact actions open email, GitHub, or LinkedIn.',
    'Fonts are served from this site rather than requested from Google Fonts.',
    'This notice will be revisited if analytics, cookies, a contact form, or a form-processing service are added.',
  ],
};
