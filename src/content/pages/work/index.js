// PF-052 — real Version 1 Work-index content. Provenance for every string
// is recorded in the plan approved for this task: the three project items'
// heading/category/featured values are approved reuse of home.js's own
// already-approved projects.items fields (same order — FES Challenger
// featured, Business Workflow System with its verbatim category, then
// eBarangay), not new copy. The page-level title/description/heading/
// intro/section header/CTA strings are approved-as-provisional copy for
// this task, pending final production-content sign-off. No screenshot,
// outcome, technology, or result claim is made anywhere — none is
// approved for any of the three real projects (PF-003 still blocked).
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
      },
      {
        heading: 'Business Workflow System',
        category: 'Government/business workflow system',
        link: '/work/business-workflow-system/',
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
