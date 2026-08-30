// PF-064 — replaces the PF-011 dev-facing placeholder with a neutral,
// fact-free holding message. PF-062 (the real eBarangay case study) remains
// deliberately deferred — the underlying project isn't built yet — so this
// copy states only development/shareability status, nothing about the
// project itself (no stack, no features, no completion claim). See
// docs/CONTENT_INVENTORY.md and docs/DECISION_LOG.md's PF-064 entry.
export default {
  title: 'eBarangay',
  description:
    'This case study is currently in development and will be published once it reaches a shareable stage.',
  heading: 'eBarangay',
  paragraphs: [
    "This case study is still in development and isn't ready to share yet. In the meantime, take a look at my other projects.",
  ],
  backLink: { label: 'Back to Work', path: '/work/' },
  card: {
    isVisible: false,
    presentation: {
      kind: 'deferred',
      label: 'Case study in development',
    },
  },
};
