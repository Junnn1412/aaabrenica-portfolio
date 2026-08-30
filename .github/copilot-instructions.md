# Web Portfolio --- GitHub Copilot Instructions

This repository is an established, production-oriented Version 1
developer portfolio. Treat it as an existing system, not a greenfield
application.

## Operating mode

For substantial or multi-file tasks:

1.  Inspect the repository and relevant documentation first.
2.  Use Plan mode before modifying architecture, design-system behavior,
    global components, full pages, SEO, deployment, or other multi-file
    work.
3.  Do not edit files until the plan is approved by AAA.
4.  Implement only the approved plan.
5.  Run the applicable validation commands.
6.  Clearly separate automated verification from manual/browser
    verification.
7.  Produce a concise completion report.

For small, isolated fixes that do not change architecture, a separate
planning phase may be skipped when the scope is unambiguous.

## Documentation hierarchy

Use this order when resolving ambiguity:

1.  Current task explicitly approved by AAA.
2.  `DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md`
3.  `CLAUDE.md`
4.  Current architecture/design documentation.
5.  Existing approved component behavior.
6.  Implementation convenience.

Historical documentation can describe superseded states. Use
`docs/DECISION_LOG.md` to understand chronology and later accepted
decisions.

Do not assume that an older planning statement represents the current
codebase.

## Current production context

The approved production domain is:

`https://aaabrenica.site`

Use it when implementing the current production SEO/canonical/sitemap
work.

An older statement that `site.baseUrl` is `null` represents an earlier
state and must not be used to claim that the production domain is
unknown.

## Architecture

Preserve:

- Vite multi-page static architecture
- build-time HTML composition
- static/crawlable output
- `src/config/routes.js` as the route source of truth
- structured content separated from presentation
- content escaping through the existing boundary
- centralized link safety
- schema validation
- controlled component contracts
- ITCSS-lite SCSS
- semantic design tokens
- progressive enhancement
- accessibility requirements

Do not introduce a frontend framework, CMS, page builder, Tailwind, or a
new templating system.

Do not replace established architecture merely because another approach
is more familiar.

## Reuse and abstraction

Before creating a component or abstraction:

- inspect existing components and patterns
- determine whether there is a genuine reuse case
- prefer the existing contract when it fits
- avoid speculative generic APIs
- keep one-consumer page-specific behavior local to the page

## Content

Never invent visitor-facing content, metrics, client information,
project outcomes, technologies, credentials, testimonials, screenshots,
URLs, or other evidence.

Follow `docs/CONTENT_INVENTORY.md` and approved decisions.

Content modules contain data, not raw HTML.

## Styling

Use the existing SCSS architecture and semantic design tokens.

Do not introduce a CSS framework or arbitrary global styles.

When changing responsive behavior, consider:

- 320px
- 375px
- 768px
- 1024px
- 1440px
- 1920px

Preserve DOM order and accessibility rather than using CSS ordering as a
shortcut.

## Validation

Do not bypass or weaken existing checks.

Use the relevant commands, normally including:

```bash
npm run check:routes
npm run lint
npm run format:check
npm run test
npm run build
npm run html:validate
npm run verify
```

Report exact results.

Passing automated checks does not prove browser accessibility,
responsive, performance, or production deployment behavior.

## High-control areas

Require explicit approval before materially changing:

- route architecture
- shared components
- design tokens
- security/privacy behavior
- contact-form activation
- Cloudflare Functions
- WAF
- Resend
- CSP/security headers
- DNS/domain behavior
- production release configuration

Never invent secrets.

## Stop conditions

Stop rather than guessing when:

- requirements conflict
- historical/current state is unclear
- required content/evidence is missing
- a new dependency is required
- a security/privacy decision is needed
- scope expands materially
- a shared abstraction would be introduced without demonstrated reuse
- validation would need to be weakened
- production authorization is required

## Current deployment direction

The Version 1 release path is:

```text
Pre-launch closure
→ Technical SEO
→ Cloudflare preview
→ Integrated QA
→ Production Cloudflare configuration
→ aaabrenica.site verification
→ develop → main
→ production verification
```

AAA owns final acceptance, merge/promotion, and production release.
