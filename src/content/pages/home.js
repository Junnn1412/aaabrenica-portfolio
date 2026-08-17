// PF-041 — real Version 1 homepage content. Every string's provenance is
// documented in the plan approved for this task and in
// docs/DESIGN_SYSTEM.md's "Homepage (PF-041)" content-provenance table:
// verbatim/quoted from DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md, existing
// approved project/site data, or provisional copy pending AAA's final
// content sign-off (capability-card descriptions, section eyebrows/
// headings, the About paragraph, and a few link labels — all flagged there,
// not here, to avoid a second, driftable copy of the same classification).
export default {
  title: 'Practical Software Solutions for Growing Businesses',
  description:
    'AAA helps organizations identify inefficient, repetitive, or difficult processes and turn them into practical websites, workflow solutions, internal systems, and custom software.',
  heading: 'Turn Business Challenges Into Practical Software Solutions.',
  paragraphs: [
    'I help growing businesses improve their operations through websites, internal systems, workflow solutions, and custom software—from requirements gathering and planning to development, deployment, and ongoing support.',
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
        link: '/solutions/',
      },
      {
        accent: 'amber',
        icon: 'workflow',
        heading: 'Workflow & Process Solutions',
        description:
          'Turning manual, error-prone approval and reporting processes into reliable, trackable systems.',
        link: '/solutions/',
      },
      {
        accent: 'cyan',
        icon: 'globe',
        heading: 'Corporate Websites',
        description:
          'Professional, fast, and easy-to-maintain websites that represent your business well.',
        link: '/solutions/',
      },
      {
        accent: 'violet',
        icon: 'code',
        heading: 'WordPress Development',
        description:
          'Custom WordPress builds and improvements for teams that need a familiar, editable platform.',
        link: '/solutions/',
      },
      {
        accent: 'coral',
        icon: 'refresh-cw',
        heading: 'Existing-System Improvements',
        description:
          'Modernizing or extending systems that no longer match how the business runs today.',
        link: '/solutions/',
      },
      {
        accent: 'magenta',
        icon: 'life-buoy',
        heading: 'Support & Maintenance',
        description:
          'Ongoing support so systems stay reliable long after launch.',
        link: '/solutions/',
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
      },
      {
        category: 'Government/business workflow system',
        heading: 'Business Workflow System',
        link: '/work/business-workflow-system/',
      },
      {
        heading: 'eBarangay',
        link: '/work/ebarangay/',
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
      "I'm AAA, an independent software developer with about five years of experience building websites, internal systems, and custom software. I work across the full stack—frontend, backend, database, and deployment—and stay directly involved in every project from planning through launch and support.",
    ],
    link: { label: 'Read My Full Story', path: '/about/' },
  },
  cta: {
    heading:
      'Have a process that feels too manual, slow, or difficult to manage?',
    body: 'Tell me what you want to improve. We will identify a practical place to start.',
    action: { label: "Let's Discuss Your Project", path: '/contact/' },
  },
};
