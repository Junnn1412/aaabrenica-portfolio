// Content classification (see docs/DECISION_LOG.md's PF-053 entry):
// - The biography, technology stack, and Experience timeline are AAA-approved
//   PF-064 content. "Since 2020" replaces a duration that required annual
//   maintenance without changing the approved experience facts.
//   Every published technology is supported by an implemented case study and
//   docs/CONTENT_INVENTORY.md; project-specific supporting tools stay omitted.
// - Approved employer names are factual plain text. No employer links/logos,
//   endorsements, internal product names, screenshots, metrics, or unapproved
//   operational details appear. The shared portrait and identity remain in
//   site.profile; this module owns all About-only content below.
const description =
  'About Antonio Abrenica, an independent full-stack software developer building practical websites, internal systems, and workflow solutions.';

export default {
  title: 'About',
  description,
  heading: 'About',
  paragraphs: [
    'Since 2020, I’ve been designing and building software—from the interface someone actually clicks through, down to the backend logic, the database that stores everything, and the deployment that gets it live. I work as an independent developer, which means I’m the one person across the whole project, not one specialist in a rotating cast.',
    'I start with the problem you’re trying to solve, not a specific technology or framework. My focus stays on what actually moves your business forward, and I stay directly involved from planning through launch and any agreed post-launch support, so you’re always working with the person who built it.',
  ],
  technologyStack: {
    heading: 'Core Technologies',
    groups: [
      {
        heading: 'Frontend',
        items: ['Angular', 'TypeScript', 'JavaScript', 'HTML', 'SCSS/CSS'],
      },
      {
        heading: 'Backend',
        items: ['ASP.NET Core', 'C#', 'REST APIs'],
      },
      {
        heading: 'Data',
        items: ['Microsoft SQL Server', 'Dapper'],
      },
      {
        heading: 'CMS & Delivery',
        items: ['WordPress', 'PHP', 'Git', 'GitHub Actions'],
      },
    ],
  },
  experience: {
    eyebrow: 'PROFESSIONAL JOURNEY',
    heading: 'Experience',
    lede: 'A record of the roles, systems, and technologies that have shaped my professional work since 2020.',
    entries: [
      {
        role: 'Computer Programmer II',
        employer: 'Department of Public Works and Highways',
        dates: {
          start: { label: 'Apr 2024', datetime: '2024-04' },
          end: { label: 'Present' },
        },
        summary:
          'Develop and maintain internal workflow systems by translating operational requirements into technical specifications and application features.',
        responsibilities: [
          'Analyze requirements and implement workflow functionality.',
          'Develop and maintain frontend features and database-supported processes.',
          'Resolve application defects and support testing and deployment.',
        ],
        technologies: ['Angular', 'Microsoft SQL Server'],
      },
      {
        role: 'Analyst Programmer',
        employer: 'Bank of Commerce',
        dates: {
          start: { label: 'Aug 2022', datetime: '2022-08' },
          end: { label: 'Apr 2024', datetime: '2024-04' },
        },
        summary:
          'Enhanced and supported internal enterprise applications used in daily business operations.',
        responsibilities: [
          'Implemented new modules and application improvements.',
          'Provided technical support for internal systems.',
          'Deployed enhancements focused on usability and reliability.',
        ],
        technologies: ['ASP.NET MVC', 'C#', 'Microsoft SQL Server'],
      },
      {
        role: 'Computer Programmer',
        employer: 'SolidService Electronics Corporation',
        dates: {
          start: { label: 'Dec 2020', datetime: '2020-12' },
          end: { label: 'Jul 2022', datetime: '2022-07' },
        },
        summary:
          'Developed and maintained business applications supporting employee timekeeping, attendance, leave management, and payroll preparation.',
        responsibilities: [
          'Maintained core business applications and resolved reported issues.',
          'Developed a multi-branch fingerprint-based timekeeping and leave-management system.',
          'Built attendance-monitoring functionality that generated payroll-ready data.',
        ],
        technologies: ['VB.NET', 'Visual Basic 6', 'PostgreSQL'],
      },
      {
        role: 'IT Support Specialist',
        employer: 'Nephila Web Technology Inc.',
        dates: {
          start: { label: 'Jul 2020', datetime: '2020-07' },
          end: { label: 'Sep 2020', datetime: '2020-09' },
        },
        summary:
          'Supported application development by translating business requirements into technical specifications and assisting with implementation.',
        responsibilities: [
          'Assisted with application development based on business requirements.',
          'Helped prepare technical specifications.',
        ],
        technologies: ['Laravel', 'MySQL'],
      },
    ],
  },
  cta: {
    heading: 'Have a project you want to talk through?',
    body: "Share what you're working on, and we can figure out a practical next step together.",
    action: { label: "Let's Discuss Your Project", path: '/contact/' },
  },
  // AAA-approved About-only full-card copy. Experience timing remains in the
  // biography and is deliberately not repeated here. The full variant has no
  // action; About's unchanged closing CTA is the route's sole Contact action.
  profileCard: {
    statement:
      'I build practical websites, internal systems, and workflow solutions.',
    highlights: [
      'Problem-first planning shaped around business needs',
      'Direct involvement from implementation through launch',
      'Post-launch support when included in the agreed project scope',
    ],
  },
};
