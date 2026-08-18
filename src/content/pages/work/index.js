// PF-052 — real Version 1 Work-index content. Provenance for every string
// is recorded in the plan approved for this task: the project items'
// heading/featured values are approved reuse of home.js's own
// already-approved projects.items fields, not new copy. The page-level
// title/description/heading/intro/section header/CTA strings are
// approved-as-provisional copy for this task, pending final
// production-content sign-off. No screenshot, outcome, technology, or
// result claim is made anywhere for eBarangay — it remains an untouched
// foundation placeholder (PF-062 still blocked).
// PF-060 — the FES Challenger project item spreads fes-challenger.js's own
// `card` export instead of retyping category/summary/tags a second time.
// PF-061 — Business Workflow System now does the same, replacing the prior
// literal "Government/business workflow system" category (prohibited
// wording, superseded by the fully anonymized case study).
// PF-064 — page-level title/description/heading/intro/CTA copy approved by
// AAA as final V1 copy, no longer provisional.
import fesChallenger from './fes-challenger.js';
import businessWorkflowSystem from './business-workflow-system.js';

export default {
  title: 'Work',
  description:
    'Explore selected website, workflow, and full-stack projects delivered across professional and personal work.',
  heading: 'Explore My Work',
  paragraphs: [
    'A selection of real projects spanning corporate websites, workflow systems, and full-stack application development.',
  ],
  projects: {
    eyebrow: 'Case Studies',
    heading: 'Selected Projects',
    items: [
      {
        featured: true,
        heading: 'FES Challenger',
        link: '/work/fes-challenger/',
        ...fesChallenger.card,
      },
      {
        heading: 'Business Workflow System',
        link: '/work/business-workflow-system/',
        ...businessWorkflowSystem.card,
      },
      {
        heading: 'eBarangay',
        link: '/work/ebarangay/',
      },
    ],
  },
  cta: {
    heading: 'Have a project in mind?',
    body: "Tell me what you're trying to build or improve, and we'll identify a practical place to start.",
    action: { label: "Let's Discuss Your Project", path: '/contact/' },
  },
};
