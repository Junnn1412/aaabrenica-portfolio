# Web Portfolio --- AI Agent Operating Contract

## 1. Purpose

This repository is an existing, production-oriented Version 1 developer
portfolio. It is not a greenfield project.

AI agents may inspect, plan, implement, validate, and report work, but
they must preserve the established architecture, design system, content
rules, security boundaries, and release controls.

Detailed project documentation remains the source for architectural and
historical context. This file defines how an AI agent is expected to
operate inside that repository.

------------------------------------------------------------------------

## 2. Current project state

The portfolio is substantially implemented and is approaching Version 1
production deployment.

Current immediate objective:

1.  Close remaining pre-launch work.
2.  Implement approved technical SEO.
3.  Deploy to Cloudflare Pages preview.
4.  Complete integrated QA.
5.  Configure and verify production deployment/domain.
6.  Release Version 1 to production.

Approved production domain:

`https://aaabrenica.site`

Use this domain for production canonical URLs, sitemap references, and
production SEO configuration when the relevant task requires it.

Do not treat older documentation stating that `site.baseUrl` is `null`
as evidence that the production domain is unknown. That statement
reflects an earlier project state.

------------------------------------------------------------------------

## 3. Documentation hierarchy

When resolving ambiguity, use this order:

1.  The current task explicitly approved by AAA.
2.  `DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md`
3.  `CLAUDE.md`
4.  Current architecture and design documentation.
5.  Existing approved component behavior.
6.  Implementation convenience.

Historical documentation may describe an earlier state.

When a later accepted decision supersedes an earlier decision, the later
accepted decision governs current implementation.

Use `docs/DECISION_LOG.md` to understand why a decision changed.

Do not blindly treat the newest-looking file timestamp as authoritative.
Determine whether the content describes current behavior or historical
context.

------------------------------------------------------------------------

## 4. Required documents before substantial work

For architecture, page, design-system, deployment, SEO, or multi-file
tasks, inspect the relevant project documentation before proposing
implementation.

Core documents include:

-   `CLAUDE.md`
-   `DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md`
-   `docs/DEVELOPMENT_WORKFLOW.md`
-   `docs/REUSABLE_PORTFOLIO_ARCHITECTURE.md`
-   `docs/SOURCE_ARCHITECTURE.md`
-   `docs/DESIGN_SYSTEM.md`
-   `docs/DECISION_LOG.md`
-   `docs/TESTING_AND_QA.md`
-   `docs/INITIAL_IMPLEMENTATION_TASKS.md`
-   `docs/CONTENT_INVENTORY.md`

Do not paste or reproduce entire documents unnecessarily. Inspect the
relevant sections and source files.

------------------------------------------------------------------------

## 5. Architecture invariants

Preserve these established decisions unless the current task explicitly
approves an architectural change:

-   Vite multi-page static architecture.
-   Static/crawlable HTML output is primary.
-   No React, Vue, Next.js, or other frontend framework migration.
-   No CMS or visual page builder.
-   Build-time page composition through the existing Vite architecture.
-   `src/config/routes.js` is the authoritative route registry.
-   Structured content remains separate from presentation.
-   Content modules contain data, not raw HTML.
-   `escape.js` remains the content-to-HTML escaping boundary.
-   Link safety remains centralized.
-   Content schema validation remains a deliberate guardrail.
-   Existing component contracts remain controlled and closed.
-   SCSS remains the styling system.
-   ITCSS-lite layer order remains intact.
-   Semantic design tokens must be used instead of arbitrary raw values.
-   Progressive enhancement is preferred.
-   Accessibility and responsive behavior are implementation
    requirements.
-   Reusable abstractions require real demonstrated reuse.
-   Do not generalize a single-consumer solution speculatively.

------------------------------------------------------------------------

## 6. Content and evidence rules

Never invent or infer visitor-facing facts that are not approved.

Do not fabricate:

-   metrics
-   business outcomes
-   client identities
-   organizations
-   project ownership claims
-   team-size claims
-   credentials
-   awards
-   testimonials
-   technologies
-   URLs
-   screenshots
-   image evidence
-   performance claims

Case-study content must follow `docs/CONTENT_INVENTORY.md` and the
approved content decisions.

Only approved, publishable assets may be used.

Never use AI-generated or reconstructed imagery as a substitute for
missing real project evidence where the project documentation prohibits
it.

------------------------------------------------------------------------

## 7. Shared component rule

Before creating a new component:

1.  Inspect existing components.
2.  Determine whether the requested behavior has a real second consumer.
3.  Reuse an established component when its contract fits.
4.  Create a new shared component only when reuse is justified.
5.  Keep page-specific composition in the page template/style layer when
    the behavior has only one legitimate consumer.

Do not create generic components merely because two pieces of markup
look similar.

------------------------------------------------------------------------

## 8. Styling rules

Follow the existing design-system contract.

Do not:

-   introduce Tailwind or another CSS framework
-   bypass the SCSS architecture
-   add arbitrary global styles for a page-specific problem
-   duplicate shared token values
-   change shared tokens to solve an isolated page issue without
    justification
-   introduce uncontrolled variant flags
-   use CSS `order` to compensate for incorrect DOM structure unless an
    explicitly approved design decision requires it

When modifying responsive behavior, consider the project's required
review widths:

-   320px
-   375px
-   768px
-   1024px
-   1440px
-   1920px

------------------------------------------------------------------------

## 9. Accessibility rules

Accessibility is part of implementation, not deferred cleanup.

Preserve:

-   semantic landmarks
-   heading hierarchy
-   keyboard operability
-   visible focus
-   reduced-motion behavior
-   forced-colors compatibility where applicable
-   touch/no-hover behavior
-   accessible names
-   correct link/button semantics
-   skip-link behavior
-   correct `aria-current` behavior

Do not claim accessibility verification merely because automated tests
pass. Distinguish automated verification from manual browser
verification.

------------------------------------------------------------------------

## 10. Validation rules

Use the existing validation architecture.

Where applicable, run:

``` bash
npm run check:routes
npm run lint
npm run format:check
npm run test
npm run build
npm run html:validate
npm run verify
```

Do not weaken, bypass, delete, or disable tests simply to make a task
pass.

If a test fails:

1.  Determine whether the failure is caused by the current change.
2.  Fix the implementation when appropriate.
3.  Preserve unrelated failures.
4.  Report failures that cannot be safely resolved within scope.

------------------------------------------------------------------------

## 11. Task execution model

For substantial tasks:

``` text
Inspect
  ↓
Plan
  ↓
AAA approval
  ↓
Implement
  ↓
Validate
  ↓
Browser/manual review when applicable
  ↓
Completion report
```

Do not edit files before an approved plan when the task affects
architecture, design-system behavior, global components, full pages,
deployment, SEO, or other multi-file concerns.

Small, clearly bounded corrections may proceed without a separate
planning phase only when they do not change architecture.

------------------------------------------------------------------------

## 12. Scope discipline

Implement only the approved task.

Do not:

-   perform unrelated refactors
-   clean up unrelated code
-   rename files without need
-   introduce dependencies without approval
-   redesign existing pages
-   rewrite approved content
-   change deployment architecture while implementing a page feature
-   activate disabled systems without explicit authorization

If implementation reveals a broader architectural problem, stop and
report it instead of silently expanding scope.

------------------------------------------------------------------------

## 13. Security and deployment boundaries

Treat the following as high-control areas:

-   contact form
-   Cloudflare Pages Functions
-   WAF configuration
-   Resend
-   CSP/security headers
-   DNS
-   production environment configuration
-   canonical redirects
-   privacy publication
-   secrets

Do not enable the contact form merely because its code exists.

The contact form has independent build/presentation and runtime gates
and requires the operational prerequisites documented in
`docs/CONTACT_FORM_OPERATIONS.md`.

Do not invent secrets or production configuration values.

------------------------------------------------------------------------

## 14. Current deployment sequence

The intended Version 1 sequence is:

``` text
Pre-launch closure
    ↓
Technical SEO
    ↓
Cloudflare preview deployment
    ↓
Integrated QA
    ↓
Cloudflare production configuration
    ↓
aaabrenica.site domain/HTTPS verification
    ↓
develop → main
    ↓
Production verification
```

Deployment and production release remain controlled by AAA.

An AI agent may implement approved deployment-related code/configuration
but must not independently declare the site production-ready.

------------------------------------------------------------------------

## 15. Stop conditions

Stop and ask AAA for clarification when:

-   two authoritative sources appear to conflict and chronology cannot
    resolve them confidently
-   a requested change requires a new architecture
-   a new dependency appears necessary
-   required content or evidence is missing
-   a visitor-facing claim would need to be invented
-   a production credential or secret is required
-   a security/privacy decision is required
-   a shared component must change solely for one page without a clear
    reuse justification
-   a route registry change has wider implications than the approved
    task
-   the task scope would materially expand
-   a deployment/release decision is required
-   the implementation would require disabling or weakening a validation
    rule

Do not guess in these situations.

------------------------------------------------------------------------

## 16. Completion report

At the end of a task, report:

1.  Task identifier and objective.
2.  Files changed.
3.  What was implemented.
4.  Tests/checks executed and exact results.
5.  Browser/manual checks performed.
6.  Known limitations or unverified items.
7.  Any deviations from the approved plan.
8.  Any follow-up work that is genuinely outside the task.

Do not report "complete" when required manual or production verification
remains outstanding.

------------------------------------------------------------------------

## 17. AI responsibility boundary

AAA owns:

-   business goals
-   personal information
-   assets and publication permission
-   final content approval
-   visual acceptance
-   confidentiality approval
-   merge/promotion authorization
-   production release authorization

ChatGPT is used as the architecture/planning/review layer.

GitHub Copilot is used as the repository
inspection/implementation/validation agent.

Do not allow one AI tool to silently override decisions made by the
other. When in doubt, return to the repository documentation and the
current approved task.
