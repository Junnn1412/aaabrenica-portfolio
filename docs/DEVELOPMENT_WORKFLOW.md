# Development Workflow

**Status:** Approved working workflow  
**Version:** 1.0  
**Owner:** AAA  
**Implementation assistant:** Claude Code  

## 1. Purpose

This workflow turns the approved portfolio requirements into small, reviewable implementation increments. It is designed to reduce rework, make effective use of Claude Pro limits, preserve decision history, and keep AAA in control of approvals and releases.

## 2. Roles and responsibilities

| Responsibility | Owner |
|---|---|
| Business goals, personal information, assets, and final approval | AAA |
| Requirements, architecture, task definition, reviews, and correction prompts | AAA with ChatGPT |
| Repository inspection, implementation, automated checks, and completion reports | Claude Code |
| Visual acceptance and confidentiality approval | AAA |
| Branch promotion and production release approval | AAA |

Claude may recommend changes, but it does not independently change scope, technology, branding, content claims, or release status.

## 3. Documentation hierarchy

The following order resolves ambiguity:

1. The current task approved by AAA
2. `DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md`
3. `CLAUDE.md`
4. Architecture and design documentation
5. Existing approved component behavior
6. Implementation convenience

A task may refine a requirement but must explicitly record the refinement. Material scope or architectural changes require a decision-log entry and AAA's approval.

## 4. Branch model

| Branch | Purpose | Expected deployment |
|---|---|---|
| `feature/*` | One bounded feature, page, or documentation change | Optional preview |
| `develop` | Integrated and reviewable development release | Cloudflare preview |
| `main` | Approved production source | Production |

Promotion path:

```text
feature/* -> develop -> integrated QA -> main -> production verification
```

Recommended initial branches:

```text
feature/project-foundation
feature/design-system
feature/component-showcase
feature/global-shell
feature/homepage
feature/solutions-page
feature/process-page
feature/work-and-case-studies
feature/about-page
feature/contact-page
feature/quality-and-seo
```

Use one active implementation branch at a time unless two tasks are proven independent and their file ownership does not overlap.

## 5. Task lifecycle

### 5.1 Prepare

Before Claude starts:

- Confirm the issue or task identifier.
- Define the exact scope and explicit exclusions.
- Name the documents and files Claude must inspect.
- Provide required copy and approved assets, or clearly mark placeholders.
- Define responsive, accessibility, content, and build acceptance criteria.
- Identify whether Claude must stop after planning or may proceed directly.

### 5.2 Plan

For architecture, design-system, global component, and full-page tasks, start Claude in Plan mode.

Claude's plan must state:

- Existing files and patterns affected
- Proposed file changes
- Component and data flow
- Responsive and accessibility treatment
- Validation commands
- Assumptions or conflicts

AAA approves or corrects the plan before implementation. Small, well-defined corrections may skip a separate plan if they do not change architecture.

### 5.3 Implement

Claude implements only the approved plan and scope. It must preserve unrelated changes, avoid unapproved dependencies, and keep content, tokens, and component responsibilities separated.

Accessibility, responsiveness, and reduced-motion behavior are part of the implementation—not deferred cleanup.

### 5.4 Validate

Claude runs all available checks relevant to the task and reports the exact results. A typical feature gate includes:

```bash
npm run format:check
npm run lint
npm run test
npm run build
```

Visual tasks additionally require manual verification at 320, 375, 768, 1024, 1440, and 1920 px, plus keyboard, reduced-motion, console, and overflow checks.

If automated browser testing is not yet configured, Claude must say which checks were performed manually and which remain for AAA.

### 5.5 Review

AAA reviews the local or branch preview. Review the rendered experience first:

- Does it satisfy the assigned business purpose?
- Does it match the approved visual direction?
- Is the content truthful, concise, and understandable?
- Does it work on mobile, desktop, keyboard, and touch?
- Are graphics original and assets safe to publish?

Collect corrections into one consolidated prompt, prioritized as:

1. Functional or confidentiality defects
2. Accessibility and responsive defects
3. Requirement mismatch
4. Content corrections
5. Visual polish

### 5.6 Accept and merge

A feature may merge to `develop` when:

- Acceptance criteria are met.
- Required checks pass or exceptions are documented and approved.
- No known confidential data is exposed.
- The completion report is recorded.
- The branch preview has been visually reviewed when applicable.

Only AAA authorizes merging and promotion.

## 6. Task prompt template

```markdown
# Task: [ID] [Name]

## Objective
[One outcome-focused paragraph]

## Read first
- `CLAUDE.md`
- `DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md`
- [Relevant documents and files]

## Scope
- [Required change]

## Out of scope
- [Explicit exclusion]

## Inputs
- [Approved copy, assets, data, or references]

## Acceptance criteria
- [Observable requirement]
- Works at 320, 375, 768, 1024, 1440, and 1920 px where visual
- Keyboard accessible and reduced-motion safe where interactive
- Applicable validation commands pass

## Working instruction
Inspect the existing implementation and propose a plan. Do not edit files until the plan is approved.

## Completion report
Use the format required by `CLAUDE.md`.
```

## 7. Efficient use of Claude Pro

- Start a fresh focused session for a major task, but rely on repository documentation instead of repeating the entire project history.
- Keep one coherent outcome per prompt.
- Reference file paths rather than pasting large unchanged documents.
- Ask Claude to inspect before proposing code.
- Approve design decisions before applying them to several pages.
- Build and approve reusable components through a component showcase first.
- Combine visual feedback into one correction cycle.
- Do not ask multiple AI tools to edit the same branch simultaneously.
- End a task after the completion report; open a new task for material scope expansion.
- Preserve decisions and discovered constraints in repository documentation.

## 8. Design approval gates

### Gate A: Foundation

Approve the build, directory architecture, scripts, and static multi-page output before visual implementation.

### Gate B: Design system

Approve tokens, typography, layout, buttons, focus states, and motion rules before full-page work.

### Gate C: Component showcase

Approve header, footer, capability cards, project cards, process elements, and CTAs in representative states and widths.

### Gate D: Homepage

Approve the complete homepage narrative and responsive flow before using it as the standard for dedicated pages.

### Gate E: Content and evidence

Approve every public case-study claim, screenshot, anonymization, and downloadable asset.

### Gate F: Release

Approve integrated accessibility, performance, SEO, link, domain, and production checks.

## 9. Documentation during development

Maintain these records as the project grows:

- `docs/DECISION_LOG.md` — material choices, alternatives, reasons, and consequences
- `docs/CHANGELOG.md` — user-visible or architectural changes by release
- `docs/CONTENT_INVENTORY.md` — copy, assets, ownership, permissions, and readiness
- `docs/DESIGN_SYSTEM.md` — approved tokens, components, and usage rules
- `docs/TESTING_AND_QA.md` — test matrix, commands, manual checks, and exceptions
- `docs/DEPLOYMENT.md` — environments, configuration, release, rollback, and domain verification
- `docs/NEW_CLIENT_CHECKLIST.md` — reusable intake and customization process after the first implementation is proven

Create these when their corresponding implementation phase begins; do not fill them with speculative details merely to complete a document list.

## 10. Release workflow

1. Freeze Version 1 scope.
2. Merge accepted features into `develop`.
3. Run the full automated suite and production build.
4. Review the integrated Cloudflare preview.
5. Complete the responsive, accessibility, content, confidentiality, SEO, performance, and link checklist.
6. Record approved exceptions.
7. Open the `develop` to `main` pull request with the release summary and validation results.
8. AAA approves and merges.
9. Verify production deployment, domain, HTTPS, canonical redirects, metadata, forms or contact links, and key pages.
10. Record the release and retain rollback instructions.

## 11. Definition of done

A task is done only when its code, visual behavior, content, documentation, and checks satisfy its acceptance criteria. A release is done only after production verification—not when the merge or deployment job begins.

