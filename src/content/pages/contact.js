// Content classification (see docs/DECISION_LOG.md's PF-054 entry):
// - The reassurance paragraph is approved-existing copy, quoted directly
//   from DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md §10.6.
// - The short intro sentence is provisional connective copy that asserts
//   no facts of its own.
// - Email/GitHub/LinkedIn are not authored here — the 'contact' template
//   (src/pages/templates/contact.js) renders them directly from
//   src/config/site.js, the single source of truth for those values.
// - No résumé link. The approved Contact form contract is recorded below,
//   but site.contactForm.enabled remains false until Cloudflare WAF and
//   Resend are configured and operationally verified. The disabled real
//   route therefore still renders direct methods only.
// - PF-064 — the intro sentence approved by AAA as final V1 copy, no longer
//   provisional.
export default {
  title: 'Contact',
  description:
    'Contact Antonio Abrenica to discuss a software project — email, GitHub, and LinkedIn.',
  heading: 'Contact',
  paragraphs: [
    'Reach out using any of the methods below.',
    'You do not need complete requirements. Describe the current problem, and we can determine the next practical step.',
  ],
  form: {
    heading: 'Tell Me About Your Project',
    fields: {
      name: { label: 'Name (required)' },
      email: { label: 'Email (required)' },
      company: { label: 'Company or organization (optional)' },
      message: {
        label: 'Message / project needs (required)',
        help: 'Please do not include passwords, access credentials, or other sensitive information.',
      },
    },
    privacy: {
      text: 'By submitting this form, you’ll send your name, email address, optional company or organization, and message so I can review and respond to your inquiry.',
      link: { label: 'Privacy notice', path: '/privacy/' },
    },
    submitLabel: 'Send Message',
    pendingMessage: 'Sending your message…',
    success: {
      heading: 'Message submitted',
      message:
        'Thanks for reaching out. Your message was accepted for processing. If you need another way to reach me, email website@aaabrenica.site.',
    },
    validation: {
      heading: 'Please check the highlighted fields',
      instruction: 'Correct the errors below and submit the form again.',
    },
    failureMessage:
      'Your message could not be submitted right now. Please try again, or email website@aaabrenica.site.',
    errors: {
      nameRequired: 'Enter your name.',
      emailRequired: 'Enter your email address.',
      emailInvalid: 'Enter a valid email address.',
      messageRequired: 'Describe your project needs.',
      maxLength: 'Keep this field to no more than {maximum} characters.',
    },
  },
};
