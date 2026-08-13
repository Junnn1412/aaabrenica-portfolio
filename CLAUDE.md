# Claude Project Instructions

## Project

This repository contains AAA's professional developer portfolio. It is also the first production implementation from which a reusable, profession-independent portfolio starter may later be extracted.

The immediate priority is AAA's website. Reusability must improve maintainability without weakening the approved design, content, accessibility, or performance requirements.

## Source of truth

Before planning or changing code, read the documents relevant to the task:

1. `DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md`
2. `docs/DEVELOPMENT_WORKFLOW.md`
3. `docs/INITIAL_IMPLEMENTATION_TASKS.md`
4. `docs/REUSABLE_PORTFOLIO_ARCHITECTURE.md`

If an assigned task conflicts with an approved document, stop and report the conflict. Do not silently reinterpret a requirement.

## Required working method

For every implementation request:

1. Inspect the repository and relevant files.
2. Restate the bounded scope and identify dependencies.
3. Propose a short implementation plan before editing when requested to use Plan mode.
4. Implement only the approved scope.
5. Validate the result with the applicable project commands.
6. Review the rendered result at the required responsive widths when visual work is involved.
7. Report changed files, commands run, results, assumptions, and unresolved issues.

Do not declare a task complete merely because the production build passes. Visual, responsive, keyboard, content, and requirement checks are part of completion.

## Approved technical boundaries

- Use Vite for the multi-page static build.
- Use semantic HTML5.
- Use custom SCSS with a documented component structure.
- Use vanilla JavaScript ES modules.
- Use Motion for JavaScript only where animation adds meaningful value.
- Use Lucide for general interface icons and approved local SVGs for brand-specific graphics.
- Use original HTML, SCSS, CSS, and inline SVG for cards and decorative graphics.
- Support GitHub deployment to Cloudflare Pages.

Do not introduce a framework, CMS, component library, CSS framework, jQuery, another animation library, database, or server dependency unless AAA explicitly approves a documented change.

Do not add or upgrade a package without approval. If a new dependency appears necessary, explain the problem, the native alternative, bundle and maintenance impact, and the exact package before making any change.

## Architecture rules

- Keep client-specific content and branding separate from reusable presentation logic.
- Centralize site metadata, navigation, social links, SEO values, and structured content.
- Centralize visual tokens such as colors, type, spacing, radii, shadows, motion, and breakpoints.
- Keep components focused and composable. Avoid creating a custom framework inside the project.
- Prefer progressively enhanced static HTML. Essential content, links, and navigation must remain available when JavaScript fails.
- Do not render primary page content exclusively through JavaScript unless the approved build architecture requires it and the generated output remains static and crawlable.
- Use BEM-style component class names unless the existing code establishes another approved convention.
- Avoid global selectors that unintentionally affect unrelated components.
- Avoid page-specific duplication when a proven shared component is appropriate.
- Do not generalize speculative variants. Extract reusable patterns only after at least one real use demonstrates the need.

## Design and content rules

- Use the Sawad portfolio only as inspiration. Never copy its code, exact graphics, text, branding, or complete composition.
- Maintain the approved theme: an approachable software consultancy with a modern technical edge.
- Lead with client problems, operational improvement, and outcomes. Technologies are supporting evidence.
- Keep homepage sections concise; place depth and proof on dedicated pages.
- Use original graphics for capability cards and project compositions.
- Do not fabricate clients, testimonials, measurements, results, or experience.
- Do not publish confidential URLs, credentials, personal data, restricted screenshots, private architecture, or sensitive business processes.
- Anonymize government and restricted work according to the requirements.
- Use clear language that a nontechnical potential client can understand.

## Accessibility requirements

- Preserve semantic landmarks and a logical heading hierarchy.
- Provide a keyboard-operable skip link, navigation, menus, links, buttons, filters, and forms.
- Maintain visible focus states and accessible color contrast.
- Use real controls for interactions; do not turn noninteractive elements into simulated buttons.
- Provide meaningful alternative text and hide purely decorative graphics from assistive technology.
- Respect `prefers-reduced-motion` and keep essential behavior usable without animation.
- Do not convey essential information only through color, hover, or motion.
- Prevent keyboard traps and restore focus appropriately when overlays or mobile navigation close.

## Responsive and performance requirements

- Design from small screens upward and verify at 320, 375, 768, 1024, 1440, and 1920 px.
- Prevent horizontal overflow and maintain practical touch targets.
- Prefer `transform` and `opacity` for animation.
- Reserve media dimensions to prevent layout shift.
- Use responsive, optimized images with lazy loading below the fold.
- Keep JavaScript and third-party code minimal.
- Do not add decorative effects that materially reduce readability, responsiveness, or performance.

## Git and file safety

- Work only on the currently assigned branch and scope.
- Do not rewrite history, force-push, merge, or promote branches unless explicitly instructed.
- Do not modify or remove unrelated user changes.
- Never commit secrets, local environment files, `node_modules`, build output, or temporary artifacts.
- Keep the package lock file committed when dependencies change.
- Use small, descriptive commits when commit authorization is included in the task.

## Validation expectations

Run the commands that exist for the current phase, commonly:

```bash
npm run format:check
npm run lint
npm run test
npm run build
```

Do not invent missing scripts or report them as passed. During foundation work, propose the minimum appropriate validation scripts and document what each one covers.

For visual tasks, also check:

- Browser console errors
- Keyboard navigation
- Reduced-motion behavior
- Responsive widths listed above
- Missing images and broken links
- Heading and landmark structure
- Hover-independent touch behavior
- Production output

## Completion report template

```markdown
## Completed
- Concise implementation summary

## Files changed
- `path/to/file` — reason

## Validation
- `command` — result
- Manual check — result

## Assumptions
- Any assumption made, or `None`

## Remaining issues
- Anything unresolved, or `None`
```

Never conceal failed checks. Distinguish between automated checks, manual checks, and checks not yet performed.

