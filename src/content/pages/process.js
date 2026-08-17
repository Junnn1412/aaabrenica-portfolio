// PF-051 — real Version 1 Process-page content. Provenance for every string
// is recorded in the plan approved for this task: verbatim quotes from
// DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md, paraphrased requirements
// language, approved reuse of existing sitewide copy/links, or provisional
// copy pending AAA's content sign-off (every stage's whatHappens/
// clientInput/delivers/approval/next sentence, both Working Together items,
// and the closing CTA — none of these facet-level sentences is specified
// verbatim anywhere in the requirements docs). Support's stage object
// deliberately never declares a "next" key at all — the terminal stage has
// no next stage, and src/pages/content-schema.js's checkProcessContent()
// rejects a "next" property on Support regardless of its value (including
// null/undefined/''), so omitting the key entirely is the only valid form.
// No timelines, prices, guarantees, packages, or SLAs appear anywhere below
// — Support's facts describe an agreed, project-scoped arrangement, not an
// indefinite or automatic service.
export default {
  title: 'Process',
  description:
    "How a project moves from an initial business problem through discovery, design, development, testing, deployment, and agreed post-launch support — including what's needed from you at each stage.",
  heading: 'From Business Problem to Working Software',
  paragraphs: [
    "Projects move through a clear, structured path — Discover, Define, Design, Develop, Test, Deploy, and Support — so you can see what's happening, what's needed from you, and what happens next.",
  ],
  stages: {
    eyebrow: 'The Delivery Lifecycle',
    heading: 'A Clear, Seven-Stage Process',
    items: [
      {
        heading: 'Discover',
        whatHappens:
          "We start with a conversation about the problem you're trying to solve — the current process, who it affects, and what isn't working.",
        clientInput:
          'A description of the problem in your own words, along with any existing documents, spreadsheets, or examples of the current process.',
        delivers:
          'A clear, written summary of the problem and goals that we both agree on before any design work begins.',
        approval:
          'You review the summary and confirm it accurately reflects the problem before we move forward.',
        next: 'Once the problem is confirmed, we define the scope of what the first release will include.',
      },
      {
        heading: 'Define',
        whatHappens:
          'The problem is translated into a concrete scope — the features, pages, or workflow steps the first release will cover.',
        clientInput:
          'Your priorities and constraints: what matters most, what can wait, and any budget or timeline limits.',
        delivers:
          'A defined project scope and a phased plan, so the first release can focus on what creates the most value.',
        approval:
          'You approve the scope before design work starts, so both sides share the same expectations.',
        next: 'With scope agreed, the solution moves into design.',
      },
      {
        heading: 'Design',
        whatHappens:
          'The approved scope becomes a concrete plan for how the solution will work and look — screens, structure, and key interactions.',
        clientInput:
          'Feedback on layouts, workflow, and any branding or style preferences.',
        delivers: 'Design previews for the key screens and workflows in scope.',
        approval:
          'You review and approve the design before development begins, while changes are still easy to make.',
        next: 'Once the design is approved, development begins.',
      },
      {
        heading: 'Develop',
        whatHappens:
          'The approved design is built — the actual pages, features, or system logic in the agreed scope.',
        clientInput:
          'Availability for periodic check-ins and prompt answers to questions that come up along the way.',
        delivers:
          'Working software, built incrementally so progress is visible rather than delivered all at once at the end.',
        approval:
          'You can review progress at agreed check-ins; anything outside the original scope is discussed and agreed before work begins on it.',
        next: 'Once development is complete, the solution moves into testing.',
      },
      {
        heading: 'Test',
        whatHappens:
          'The finished solution is tested against the agreed scope — functionality, responsiveness, and everyday use.',
        clientInput:
          "Time to try the solution yourself and report anything that doesn't match what was agreed.",
        delivers:
          'A tested solution, with issues found during testing addressed before launch.',
        approval:
          'You confirm the solution works as expected before it goes live.',
        next: 'Once testing is signed off, the solution is ready to deploy.',
      },
      {
        heading: 'Deploy',
        whatHappens:
          'The solution is released to its live environment, following the plan agreed during scoping.',
        clientInput:
          'Access to any hosting, domain, or third-party accounts the solution depends on.',
        delivers:
          'A live, working solution, deployed and verified in its production environment.',
        approval: 'You confirm the live solution is working as expected.',
        next: 'After launch, the project moves into the Support stage.',
      },
      {
        heading: 'Support',
        whatHappens:
          'After launch, we agree on what post-launch support looks like for this project, based on what it actually needs.',
        clientInput:
          'Reports of anything unexpected, and visibility into new problems or priorities as they come up.',
        delivers:
          'An agreed level of post-launch support, scoped to this project, and a direct point of contact if something needs attention.',
        approval:
          'The scope and duration of support are agreed together as part of this stage, rather than fixed in advance.',
        // No "next" key — Support is the terminal stage (see file header).
      },
    ],
  },
  workingTogether: {
    heading: 'How We Communicate and Manage Change',
    items: [
      {
        heading: 'Communication',
        body: "I work directly with you throughout the project — no account managers or hand-offs between teams, so you always know who you're talking to.",
      },
      {
        heading: 'Scope, Revisions & Change Requests',
        body: 'Feedback within the agreed scope is a normal part of design and development. If something comes up that would change the scope, we discuss and agree on it separately before that work begins.',
      },
    ],
  },
  cta: {
    heading: 'Ready to see how this would work for your project?',
    body: "Tell me about the process you want to improve. We'll walk through where it fits into this lifecycle and what the first stage would look like.",
    action: { label: "Let's Discuss Your Project", path: '/contact/' },
  },
};
