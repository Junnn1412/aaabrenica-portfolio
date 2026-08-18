// PF-060 — real FES Challenger case-study content. Every string is either
// an AAA-supplied fact or directly derived proposed wording, approved by
// AAA as provisional portfolio copy (subject to the PF-064 final polish
// pass). Curated: each verified fact appears exactly once, in the section
// it fits best — the full uncurated fact list (all 11 responsibilities,
// every manifest decision, etc.) is kept in docs/CONTENT_INVENTORY.md for
// traceability. No numeric or business-performance outcome is claimed
// anywhere — none is verified.
// `logo` was added in the PF-060 logo-integration follow-up: AAA confirmed
// the file at public/images/case-studies/fes-challenger/fes-challenger-logo.png
// as the approved asset (140x137px PNG, verified — see docs/CONTENT_INVENTORY.md).
// alt is deliberately empty: the visible "FES Challenger" heading already
// carries the identity; the logo is decorative alongside it.
// `gallery` was added in PF-063: 4 of 7 captured production-site screenshots
// were selected after individual inspection (see docs/CONTENT_INVENTORY.md
// for the full audit, including the 3 declined files and why). Delivered as
// PNG, unresized — no WebP encoder was available locally without installing
// a package, so the source format/dimensions were kept as-is per AAA's
// explicit fallback instruction.
// PF-064 — all narrative copy approved by AAA as final V1 copy, no longer
// provisional; facts preserved exactly, not rewritten for stylistic variety.
export default {
  title: 'FES Challenger',
  description:
    'A responsive custom WordPress website for FES Challenger, a marine salvage and underwater recovery company, supported by a controlled staging-to-production deployment workflow.',
  heading: 'FES Challenger',
  paragraphs: [
    'A responsive custom WordPress corporate website for FES Challenger, a marine salvage and underwater recovery company, presenting its services, project experience, and contact information.',
  ],
  logo: {
    src: '/images/case-studies/fes-challenger/fes-challenger-logo.png',
    alt: '',
  },
  externalLink: {
    label: 'Visit the FES Challenger website',
    url: 'https://feschallenger.com/',
  },
  gallery: {
    items: [
      {
        src: '/images/case-studies/fes-challenger/gallery/homepage-hero-desktop.png',
        alt: 'FES Challenger homepage hero section with a marine salvage vessel photo and headline',
        width: 719,
        height: 443,
        caption: 'Homepage',
      },
      {
        src: '/images/case-studies/fes-challenger/gallery/services-page-desktop.png',
        alt: 'FES Challenger Services page showing marine salvage and underwater service categories',
        width: 716,
        height: 448,
        caption: 'Services',
      },
      {
        src: '/images/case-studies/fes-challenger/gallery/projects-page-desktop.png',
        alt: 'FES Challenger Projects page showing completed marine salvage project cards',
        width: 718,
        height: 447,
        caption: 'Projects',
      },
      {
        src: '/images/case-studies/fes-challenger/gallery/homepage-mobile.png',
        alt: 'FES Challenger homepage on a mobile viewport, showing the responsive hero and navigation menu',
        width: 544,
        height: 689,
        caption: 'Mobile view',
      },
    ],
  },
  client: {
    body: [
      'FES Challenger is a marine-services company offering marine salvage and underwater recovery services. The website presents the company, its services, project experience, and contact information to prospective clients.',
    ],
  },
  problem: {
    body: [
      'FES Challenger needed a professional, responsive corporate website that clearly presents the company, its marine services, project experience, and contact information. The implementation also needed to be maintainable, support a controlled staging-to-production deployment workflow, and include SEO, social-sharing presentation, and cookie-preference access.',
    ],
  },
  role: {
    body: [
      "Before implementation, I reviewed FES Challenger's website requirements, approved content, page structure, branding assets, technical needs, and deployment requirements. I then worked as the website developer responsible for implementing and maintaining the custom WordPress website.",
    ],
    responsibilities: [
      'Building and maintaining the custom WordPress theme, including responsive page layouts and reusable styling',
      'Implementing the header, navigation, footer, and required frontend JavaScript behavior',
      'Integrating approved content and visual assets',
      'Configuring and maintaining the staging deployment workflow, and supporting production deployment preparation and verification',
      'Implementing SEO configuration with Rank Math SEO, including page-level metadata and social-sharing presentation',
      'Implementing footer-based cookie-preference access integrated with Complianz',
    ],
  },
  solution: {
    body: [
      "I built a responsive custom WordPress theme for the company's Home, Services, Projects, and Contact content, with reusable styling and the frontend behavior required by the site.",
    ],
  },
  technologyStack: {
    items: [
      'WordPress',
      'PHP',
      'HTML',
      'SCSS/CSS',
      'JavaScript',
      'Git',
      'GitHub',
      'GitHub Actions',
      'FTP-based deployment',
      'Rank Math SEO',
      'Complianz',
    ],
  },
  decisions: {
    items: [
      'Built a custom WordPress theme to provide a maintainable, project-specific implementation',
      'Organized SCSS into reusable theme styles instead of treating each page as an isolated implementation',
      'Centralized deployment logic in a reusable GitHub Actions workflow with validation, backup, deployment, verification, and rollback steps',
    ],
  },
  outcomes: {
    items: [
      'FES Challenger has a public, responsive website where visitors can review its services, project experience, and contact information',
      'The custom theme provides a maintainable foundation for the website',
      'The deployment workflow provides a repeatable method for validating and deploying theme changes',
      'The website includes SEO and social-sharing presentation, with cookie-preference access available through the footer',
    ],
  },
  backLink: { label: 'Back to Work', path: '/work/' },
  cta: {
    heading: 'Have a similar project in mind?',
    body: "Tell me what you're trying to build or improve, and we'll identify a practical place to start.",
    action: { label: "Let's Discuss Your Project", path: '/contact/' },
  },
  // Consumed by home.js/work/index.js so FES's category/summary/tags exist
  // in exactly one place, not a second independently-typed copy — not part
  // of the case-study page's own rendered content or schema.
  card: {
    category: 'Marine Services Corporate Website',
    summary:
      'A responsive custom WordPress website for a marine salvage and underwater recovery company, supported by a controlled staging-to-production deployment workflow.',
    tags: ['WordPress', 'Custom Theme'],
  },
};
