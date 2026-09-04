// PF-041 — real Version 1 homepage content. Every string's provenance is
// documented in the plan approved for this task and in
// docs/DESIGN_SYSTEM.md's "Homepage (PF-041)" content-provenance table:
// verbatim/quoted from DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md, existing
// approved project/site data, or provisional copy pending AAA's final
// content sign-off (capability-card descriptions, section eyebrows/
// headings, the About paragraph, and a few link labels — all flagged there,
// not here, to avoid a second, driftable copy of the same classification).
// PF-060 — the FES Challenger project item spreads fes-challenger.js's own
// `card` export instead of retyping category/summary/tags a second time, so
// this file can't silently drift from the case study it links to.
// PF-061 — Business Workflow System now does the same. Its card also
// replaces the prior literal "Government/business workflow system" category
// (prohibited wording, superseded by the fully anonymized case study).
// PF-064 — approved by AAA as final V1 copy, no longer provisional. One
// wording correction applied: the hero paragraph's closing phrase changed
// from "ongoing support" to "agreed post-launch support," to stay
// consistent with Process's own approved rule that support is agreed and
// scoped per project, not automatic or indefinite.
import fesChallenger from './work/fes-challenger.js';
import businessWorkflowSystem from './work/business-workflow-system.js';
import ebarangay from './work/ebarangay.js';

export default {
  title: 'Practical Software Solutions for Growing Businesses',
  description:
    'Antonio Abrenica helps organizations identify inefficient, repetitive, or difficult processes and turn them into practical websites, workflow solutions, internal systems, and custom software.',
  heading: 'Turn Business Challenges Into Practical Software Solutions.',
  paragraphs: [
    'I help growing businesses improve their operations through websites, internal systems, workflow solutions, and custom software—from requirements gathering and planning to development, deployment, and agreed post-launch support.',
  ],
  hero: {
    primaryCta: { label: 'Discuss Your Project', path: '/contact/' },
    secondaryCta: { label: 'Explore My Work', path: '/work/' },
  },
  trust: {
    eyebrow: 'How I Work',
    heading: 'Structured, End-to-End Delivery',
    items: [
      { icon: 'package-check', heading: 'End-to-end delivery' },
      { icon: 'handshake', heading: 'Direct collaboration' },
      { icon: 'workflow', heading: 'Solutions built around real workflows' },
    ],
    link: { label: 'Learn About My Approach', path: '/about/' },
  },
  problems: {
    eyebrow: 'Common Challenges',
    heading: 'Does This Sound Familiar?',
    items: [
      'Manual and repetitive processes',
      'Scattered records and difficult reporting',
      'Inefficient approval workflows',
      'Outdated or ineffective websites',
    ],
    reassurance:
      'You do not need a complete technical specification. We can begin with the problem.',
    link: { label: 'Explore Solutions', path: '/solutions/' },
  },
  capabilities: {
    eyebrow: 'What I Build',
    heading: 'Solutions Built Around Your Business',
    items: [
      {
        accent: 'lime',
        icon: 'boxes',
        heading: 'Custom Business Systems',
        description:
          'Purpose-built internal tools designed around how your team actually works.',
        link: '/solutions/#custom-business-systems',
      },
      {
        accent: 'amber',
        icon: 'workflow',
        heading: 'Workflow & Process Solutions',
        description:
          'Turning manual, error-prone approval and reporting processes into reliable, trackable systems.',
        link: '/solutions/#workflow-process-solutions',
      },
      {
        accent: 'cyan',
        icon: 'globe',
        heading: 'Corporate Websites',
        description:
          'Professional, fast, and easy-to-maintain websites that represent your business well.',
        link: '/solutions/#corporate-websites',
      },
      {
        accent: 'violet',
        icon: 'code',
        heading: 'WordPress Development',
        description:
          'Custom WordPress builds and improvements for teams that need a familiar, editable platform.',
        link: '/solutions/#wordpress-development',
      },
      {
        accent: 'coral',
        icon: 'refresh-cw',
        heading: 'Existing-System Improvements',
        description:
          'Modernizing or extending systems that no longer match how the business runs today.',
        link: '/solutions/#existing-system-improvements',
      },
      {
        accent: 'magenta',
        icon: 'life-buoy',
        heading: 'Support & Maintenance',
        description:
          'Ongoing support so systems stay reliable long after launch.',
        link: '/solutions/#support-maintenance',
      },
    ],
  },
  projects: {
    eyebrow: 'Selected Work',
    heading: 'A Sample of Recent Projects',
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
        ...ebarangay.card,
      },
    ],
    link: { label: 'Explore All Work', path: '/work/' },
  },
  process: {
    eyebrow: "How We'll Work Together",
    heading: 'A Clear, Four-Stage Process',
    steps: [
      { heading: 'Discover and Define' },
      { heading: 'Design and Plan' },
      { heading: 'Develop and Test' },
      { heading: 'Deploy and Support' },
    ],
    link: { label: 'See the Full Process', path: '/process/' },
  },
  engagement: {
    heading: 'Start with what creates the most value.',
    lede: 'The first release can focus on essential features, then expand as priorities and budget grow.',
    items: [
      'Fixed scope',
      'Minimum viable solution',
      'Phased development',
      'Existing-system improvement',
    ],
  },
  about: {
    eyebrow: 'About',
    heading: "Who You'll Be Working With",
    paragraphs: [
      "I'm Antonio Abrenica, an independent software developer with about five years of experience building websites, internal systems, and custom software. I work across the full stack—frontend, backend, database, and deployment—and stay directly involved in every project from planning through launch and support.",
    ],
    profileCard: {
      action: { label: 'Read My Full Story', path: '/about/' },
    },
  },
  cta: {
    heading:
      'Have a process that feels too manual, slow, or difficult to manage?',
    body: 'Tell me what you want to improve. We will identify a practical place to start.',
    action: { label: "Let's Discuss Your Project", path: '/contact/' },
  },
};
