// PF-050 — real Version 1 Solutions-page content. Provenance for every
// string is recorded in the plan approved for this task (six sections,
// each: verbatim reuse of home.js's approved capability heading/
// description where one exists, paraphrased §4.2/§10.1 requirements-doc
// language, or provisional copy pending AAA's content sign-off). No
// fabricated outcomes, technologies, or project-category claims: per-
// section "supporting technologies" is intentionally omitted (no approved
// per-capability list exists yet), and project evidence appears only under
// Workflow & Process Solutions (the one project with a documented category
// match) — both are approved V1 exceptions, not missed scope.
export default {
  title: 'Solutions',
  description:
    'How I turn common business problems — manual processes, outdated websites, aging systems — into practical software solutions, organized by problem rather than technology.',
  heading: 'Practical Solutions to Common Business Problems',
  paragraphs: [
    "Each section below is organized around a business problem, not a specific technology — covering who it's for, what I can build, and the benefit you can expect.",
  ],
  sections: [
    {
      id: 'custom-business-systems',
      icon: 'boxes',
      accent: 'lime',
      heading: 'Custom Business Systems',
      problem:
        'Manual, repetitive work and scattered records — spread across spreadsheets, documents, email, and chat — slow the team down and make reporting difficult.',
      audience:
        'Businesses whose day-to-day work still runs on manual tracking, spreadsheets, or a mix of disconnected tools.',
      build:
        'A system built around how your team actually works, not a generic tool your team has to adapt to.',
      benefit:
        'Less time spent on repetitive tasks, and records that are easier to find, update, and report on.',
      cta: { label: 'Discuss a Custom System', path: '/contact/' },
    },
    {
      id: 'workflow-process-solutions',
      icon: 'workflow',
      accent: 'amber',
      heading: 'Workflow & Process Solutions',
      problem:
        "Approval and reporting workflows are difficult to monitor, and it's often unclear where a request currently stands.",
      audience:
        'Teams managing multi-step approvals, requests, or reporting processes across several people or departments.',
      build:
        'Turning a manual, error-prone approval or reporting process into a reliable, trackable system.',
      benefit:
        'Fewer delays and dropped requests, with clear visibility into where each item stands.',
      evidence: {
        label: 'Business Workflow System',
        path: '/work/business-workflow-system/',
      },
      cta: { label: 'Discuss a Workflow Solution', path: '/contact/' },
    },
    {
      id: 'corporate-websites',
      icon: 'globe',
      accent: 'cyan',
      heading: 'Corporate Websites',
      problem:
        'An outdated or difficult-to-manage website can make it harder for customers to find or trust the business.',
      audience:
        'Businesses that need a professional, credible online presence and a website they can keep up to date themselves.',
      build:
        'A fast, professional, easy-to-maintain website that represents the business well.',
      benefit:
        'A website that supports credibility now and stays straightforward to update going forward.',
      cta: { label: 'Discuss a Website Project', path: '/contact/' },
    },
    {
      id: 'wordpress-development',
      icon: 'code',
      accent: 'violet',
      heading: 'WordPress Development',
      problem:
        'The business needs a website its own team can edit day to day, without depending on a developer for every routine change.',
      audience:
        'Teams that want a familiar, editable platform they can manage themselves after launch.',
      build:
        'Custom WordPress builds and improvements for teams that need a familiar, editable platform.',
      benefit:
        'A website the team can update directly, without waiting on a developer for routine changes.',
      cta: { label: 'Discuss a WordPress Project', path: '/contact/' },
    },
    {
      id: 'existing-system-improvements',
      icon: 'refresh-cw',
      accent: 'coral',
      heading: 'Existing-System Improvements',
      problem:
        'An existing system no longer matches how the business actually runs today.',
      audience:
        'Businesses with a system already in place that has become slow, outdated, or misaligned with how the team now works.',
      build:
        'Modernizing or extending systems that no longer match how the business runs today.',
      benefit:
        "A system that matches how the business works now, without discarding what's already in place.",
      cta: { label: 'Discuss an Existing System', path: '/contact/' },
    },
    {
      id: 'support-maintenance',
      icon: 'life-buoy',
      accent: 'magenta',
      heading: 'Support & Maintenance',
      problem:
        'Systems that go live without ongoing support tend to become unreliable or fall behind over time.',
      audience:
        'Businesses that need a system to stay dependable after launch, without keeping a developer on permanent staff.',
      build: 'Ongoing support so systems stay reliable long after launch.',
      benefit:
        'Continued reliability, and a direct point of contact when something needs attention.',
      cta: { label: 'Discuss Support Needs', path: '/contact/' },
    },
  ],
  cta: {
    heading: 'Not sure which of these fits your situation?',
    body: "Tell me what's slowing your team down. We'll figure out the most practical next step, whatever that turns out to be.",
    action: { label: "Let's Discuss Your Project", path: '/contact/' },
  },
};
