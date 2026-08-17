// PF-061 — real Business Workflow System case-study content. Fully
// anonymized per AAA's explicit publication constraints: no organization,
// agency, department, sector, industry, program, office, location, real
// internal system name, or acronym anywhere in this file. Every string is
// AAA-supplied verified fact or directly derived proposed wording, approved
// by AAA as provisional portfolio copy. Curated: each verified fact appears
// exactly once. The complete approved fact set (including the 2 technical
// decisions intentionally not repeated here — see below) and the full
// redaction constraint list are kept in docs/CONTENT_INVENTORY.md.
// `logo`, `gallery`, and `externalLink` are intentionally absent: no logo
// or public URL is approved, and screenshots are deferred to a later,
// separate sanitization-and-approval round — omitted entirely, not a
// placeholder.
export default {
  title: 'Business Workflow System',
  description:
    'An anonymized case study of an internal system built to centralize a multi-stage application, review, examination, and approval workflow.',
  heading: 'Business Workflow System',
  paragraphs: [
    'Built and iteratively improved for an internal operational workflow, this system centralizes a multi-stage application, review, examination, and approval process. Organizational details are withheld to protect confidentiality.',
  ],
  client: {
    body: [
      'This case study describes an internal system built for an organization that needed a centralized way to manage a multi-stage application, review, examination, document, and approval workflow. To protect confidentiality, the organization and any identifying details are withheld.',
    ],
  },
  problem: {
    body: [
      'The existing process involved fragmented records, manual coordination, limited visibility into status, and multiple participant roles handling different stages of the workflow independently.',
    ],
  },
  role: {
    body: [
      'I worked as a full-stack developer on this project, responsible for analyzing requirements, building and maintaining frontend and backend functionality, working with the database, resolving defects, and supporting testing and deployment.',
    ],
    responsibilities: [
      'Analyzing requirements and translating them into working features across the workflow',
      "Building and maintaining the system's frontend functionality",
      "Building and maintaining the system's backend functionality",
      "Working with the database supporting the workflow's records and reporting",
      'Resolving defects across the application, review, and approval stages',
      'Supporting testing and deployment',
    ],
  },
  solution: {
    body: [
      'I built a system that manages the workflow end-to-end, from initial application through review, examination, and final approval.',
    ],
    features: [
      'Application and registration workflows',
      'Document submission and review',
      'Written and practical examination management',
      'Role- and permission-based review stages',
      'Status dashboards and reporting',
      'Site-inspection records with map-based visualization',
      'QR-based admission or verification',
      'Email notifications',
      'Activity history and audit-related records',
    ],
  },
  technologyStack: {
    items: [
      'Angular',
      'Angular Material',
      'TypeScript',
      'ASP.NET Core Web API',
      'C#',
      'Microsoft SQL Server',
      'Dapper',
      'Leaflet',
      'REST APIs',
    ],
  },
  decisions: {
    items: [
      'Built reusable frontend components and shared services to keep the application consistent and maintainable as it grew',
      'Used stored procedures and paginated API queries to organize data access and handle large result sets in manageable pages',
      'Implemented token-based authentication with refresh-token handling and guarded routes to protect access across the application',
      'Structured a promotion process across development, staging, and production environments for controlled releases',
    ],
  },
  outcomes: {
    items: [
      'Centralized records and workflow stages in one system',
      'Improved visibility into application, document, examination, and review status',
      'Provided role-appropriate access and actions',
      'Reduced dependence on disconnected manual tracking',
      'Created a maintainable foundation for continued workflow improvements',
    ],
  },
  backLink: { label: 'Back to Work', path: '/work/' },
  cta: {
    heading: 'Have a similar project in mind?',
    body: "Tell me what you're trying to build or improve, and we'll identify a practical place to start.",
    action: { label: "Let's Discuss Your Project", path: '/contact/' },
  },
  // Consumed by home.js/work/index.js so this project's category/summary/tags
  // exist in exactly one place — replaces the prior PF-033-era literal
  // "Government/business workflow system" category (prohibited wording).
  card: {
    category: 'Internal Workflow System',
    summary:
      'A centralized system for managing a multi-stage application, review, examination, and approval workflow, built and iteratively improved for internal use.',
    tags: ['Angular', 'ASP.NET Core'],
  },
};
