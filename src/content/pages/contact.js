// Content classification (see docs/DECISION_LOG.md's PF-054 entry):
// - The reassurance paragraph is approved-existing copy, quoted directly
//   from DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md §10.6.
// - The short intro sentence is provisional connective copy that asserts
//   no facts of its own.
// - Email/GitHub/LinkedIn are not authored here — the 'contact' template
//   (src/pages/templates/contact.js) renders them directly from
//   src/config/site.js, the single source of truth for those values.
// - No résumé link, no contact form — both deferred by explicit product
//   decision; resumePath stays null in site.js and no form markup exists
//   anywhere in this template.
// - PF-064 — the intro sentence approved by AAA as final V1 copy, no longer
//   provisional.
export default {
  title: 'Contact',
  description:
    'Contact AAA to discuss a software project — email, GitHub, and LinkedIn.',
  heading: 'Contact',
  paragraphs: [
    'Reach out using any of the methods below.',
    'You do not need complete requirements. Describe the current problem, and we can determine the next practical step.',
  ],
};
