// Content classification (see docs/DECISION_LOG.md's PF-053 entry):
// - Paragraph 1 restates facts already approved in
//   DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md §9.9/§10.5 (about five
//   years of experience, frontend/backend/database/deployment, direct
//   involvement throughout delivery) in wording distinct from home.js's
//   about.paragraphs[0], per §8.3's "must not repeat identical long-form
//   content" rule.
// - Paragraph 2 (business-problem-first approach, freelance direction) is
//   directly named in §10.5 but has no pre-approved sentence — provisional,
//   flagged for AAA's content sign-off, same treatment as every other
//   dedicated page's copy.
// - No résumé link, no named industries, no working-style specifics, no
//   named frameworks beyond the approved category words — none of these
//   are approved for this milestone, so none appear here. A photograph
//   (`profileCard.portrait`, below) was added in the profile-card task
//   once AAA supplied and approved a real portrait file — see
//   docs/DECISION_LOG.md.
export default {
  title: 'About',
  description:
    'About AAA, an independent full-stack software developer with about five years of professional experience.',
  heading: 'About',
  paragraphs: [
    "For about five years, I've been designing and building software—from the interface someone actually clicks through, down to the backend logic, the database that stores everything, and the deployment that gets it live. I work as an independent developer, which means I'm the one person across the whole project, not one specialist in a rotating cast.",
    "I start with the problem you're trying to solve, not a specific technology or framework. My focus stays on what actually moves your business forward, and I stay directly involved from planning through launch and support, so you're always working with the person who built it.",
  ],
  cta: {
    heading: 'Have a project you want to talk through?',
    body: "Share what you're working on, and we can figure out a practical next step together.",
    action: { label: "Let's Discuss Your Project", path: '/contact/' },
  },
  // About profile-card task — AAA-approved exact strings, recorded here and
  // in docs/CONTENT_INVENTORY.md/docs/DECISION_LOG.md. `statement` reuses
  // this same content module's own `description` field verbatim (already
  // approved, PF-053) — not new copy. Highlights restate only the facts
  // already approved above/in DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md
  // §9.9/§10.5 (about five years, frontend/backend/database/deployment,
  // direct involvement) in new, terser wording AAA explicitly approved for
  // this card — no new facts. Portrait: real file inspected directly
  // (public/images/profile/aaa-portrait.jpg — JPEG, 1665×1464, no alpha,
  // AAA-approved as a suitable professional portrait after an initial
  // unsuitable candidate was rejected and replaced — see
  // docs/DECISION_LOG.md).
  profileCard: {
    name: 'AAA',
    role: 'Full-Stack Software Developer',
    statement:
      'About AAA, an independent full-stack software developer with about five years of professional experience.',
    highlights: [
      'About five years of professional software-development experience',
      'Frontend, backend, database, and deployment capability',
      'Direct involvement from planning through launch and agreed post-launch support',
    ],
    cta: { label: "Let's Discuss Your Project", path: '/contact/' },
    portrait: {
      src: '/images/profile/aaa-portrait.jpg',
      alt: 'Portrait of AAA',
      width: 1665,
      height: 1464,
    },
  },
};
