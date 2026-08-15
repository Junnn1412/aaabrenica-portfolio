# Developer Portfolio — Initial Requirements Specification

**Document status:** Approved initial requirements  
**Version:** 1.0  
**Date:** August 11, 2026  
**Project owner:** AAA

## 1. Purpose of This Document

This document defines the approved initial requirements for AAA's professional developer portfolio. It will guide design, content preparation, implementation, testing, deployment, and future enhancement decisions.

The portfolio must do more than display technical skills. It must position AAA as an independent software solutions partner who can understand a business problem and manage the complete delivery lifecycle—from requirements gathering and planning through development, testing, deployment, and support.

## 2. Project Vision

Create a premium, fast, accessible, and credible portfolio website that:

- Attracts growing businesses and cost-conscious clients.
- Presents AAA as an experienced software developer, not as a beginner or cheap freelancer.
- Communicates the structure and reliability of a software solutions company while retaining direct personal collaboration.
- Demonstrates the ability to improve company processes through practical digital solutions.
- Provides concise information on the homepage and detailed proof on dedicated pages.
- Shows real project experience without exposing confidential or restricted information.
- Can launch and operate with no initial hosting cost.
- Remains easy to maintain and expand.

## 3. Market Positioning

### 3.1 Primary positioning

> Practical, end-to-end software solutions for growing businesses—delivered with the structure of a development company and the direct collaboration of an independent developer.

### 3.2 Value proposition

AAA helps organizations identify inefficient, repetitive, or difficult processes and turn them into practical websites, workflow solutions, internal systems, and custom software.

### 3.3 Core promise

> From business problem to working software.

### 3.4 Recommended hero message

**Headline:**

> Turn Business Challenges Into Practical Software Solutions.

**Supporting copy:**

> I help growing businesses improve their operations through websites, internal systems, workflow solutions, and custom software—from requirements gathering and planning to development, deployment, and ongoing support.

**Primary actions:**

- Discuss Your Project
- Explore My Work

### 3.5 Brand language

Preferred terms:

- Software solutions
- Business process improvement
- Practical development
- End-to-end delivery
- Built around your workflow
- Phased and scalable
- Direct collaboration
- Clear project scope
- From requirements to deployment
- Designed to solve real operational problems

Avoid leading with:

- Cheap developer
- Beginner or starter developer
- Low-budget websites
- One-man software company
- I can code anything
- Generic technology-only claims

Budget sensitivity should be communicated through phrases such as **cost-conscious**, **phased development**, **focused first release**, and **start with what creates the most value**.

## 4. Target Audience

### 4.1 Primary audience

- Small and growing businesses
- Organizations with manual or inefficient processes
- Businesses that need a professional corporate website
- Clients that need a focused first version before expanding
- Clients seeking direct access to the developer responsible for delivery
- Organizations that cannot justify the complexity or cost of a large agency

### 4.2 Typical client problems

- Repetitive work consumes staff time.
- Records are scattered across spreadsheets, documents, email, or chat.
- Approval and reporting workflows are difficult to monitor.
- Existing systems no longer match the current process.
- A website is outdated, difficult to manage, or damaging credibility.
- Customers cannot easily request services or receive updates.
- The client understands the problem but does not have a technical specification.

## 5. Approved Technology Stack

| Area               | Approved choice                                              |
| ------------------ | ------------------------------------------------------------ |
| Website type       | Multi-page static website                                    |
| Build tool         | Vite                                                         |
| Markup             | Semantic HTML5                                               |
| Styling            | Custom SCSS                                                  |
| Interactions       | Vanilla JavaScript using ES modules                          |
| Animation          | Motion for JavaScript                                        |
| Interface icons    | Lucide icons                                                 |
| Brand icons        | Selected local SVG files where required                      |
| Card components    | Custom HTML, SCSS, SVG, and CSS graphics                     |
| Source control     | Git and GitHub                                               |
| Production hosting | Cloudflare Pages free tier                                   |
| Domain             | `aaabrenica.site` or an approved subdomain during transition |
| Deployment         | Automatic deployment from GitHub                             |

Initial packages:

```text
Runtime dependencies
├── motion
└── lucide

Development dependencies
├── vite
└── sass
```

Compatible current versions will be selected during project setup and recorded in `package.json` and the lock file.

### 5.1 Deliberately excluded from Version 1

- React, Next.js, Vue, or Angular
- WordPress or another CMS
- Bootstrap or Tailwind CSS
- jQuery
- UI or card component libraries
- Multiple animation libraries
- Database and user accounts
- Admin dashboard
- Blog publishing system
- Ecommerce
- Live chat
- Heavy page-transition frameworks
- Marketing trackers and advertising scripts
- Carousels unless a real content requirement is established
- Dark/light theme toggle unless approved during visual design

## 6. Design Direction

### 6.1 Overall theme

The visual identity is an **approachable software consultancy with a modern technical edge**.

It should feel:

- Professional and dependable
- Modern and technically capable
- Organized and solution-oriented
- Friendly and accessible
- Premium without appearing expensive or corporate-heavy
- Handcrafted rather than template-driven

### 6.2 Primary inspiration

The Sawad portfolio (`https://sawad.framer.website/`) is the main visual and structural reference.

Elements to adapt as inspiration:

- Bold editorial typography
- Dark premium presentation
- Oversized hero copy
- Compact sticky or floating navigation
- Generous section spacing
- Large image-focused featured projects
- Strong experience and capability presentation
- Subtle scroll and hover motion
- Strong contact call to action

The implementation must remain original. Do not copy the reference site's code, exact layout, text, graphics, branding, or complete visual composition.

### 6.3 Color direction

| Role               | Direction                                             |
| ------------------ | ----------------------------------------------------- |
| Main background    | Deep charcoal or blue-black                           |
| Surface background | Slightly lighter slate or deep neutral                |
| Primary accent     | Electric blue or clear cobalt                         |
| Secondary accents  | Lime, amber, coral, violet, or cyan where appropriate |
| Primary text       | Warm off-white                                        |
| Secondary text     | Muted blue-gray                                       |

Final color tokens will be established during the design-system phase and checked for accessible contrast.

### 6.4 Typography

- Use strong, oversized display typography for important statements.
- Use a readable and professional body typeface.
- Prefer locally hosted fonts when licensing permits.
- Maintain a clear responsive type scale and heading hierarchy.
- Typography must remain readable on 320 px-wide screens.

## 7. Card System

All cards will be custom-built. No card plugin or UI framework is required.

### 7.1 Capability cards

Use the approved large, colorful card style for Services and Capabilities:

- Large rounded rectangles
- Bold solid or controlled gradient colors
- Oversized titles
- Custom abstract line or technical background patterns
- Relevant icon
- Outlined arrow action
- Original graphics made with inline SVG and CSS
- Accessible full-card links where appropriate

Suggested capability cards:

1. Custom Business Systems
2. Workflow & Process Solutions
3. Corporate Websites
4. WordPress Development
5. Existing-System Improvements
6. Support & Maintenance

Each card will use original graphics and a distinct but coordinated accent color.

### 7.2 Project cards

Project cards must provide evidence rather than decorative claims. They should use:

- Real, sanitized screenshots when permitted
- Browser or device frames created with HTML and CSS
- Original project compositions and SVG patterns
- Project-specific brand colors
- Outcome-oriented descriptions
- Role, technology, and key result information
- A clear View Case Study action

Featured projects should use larger editorial layouts. Secondary projects may use a responsive two- or three-column grid.

### 7.3 Card interaction

Permitted interactions include:

- Subtle 4–6 px lift
- Small image scale
- Pattern movement
- Arrow translation
- Border or gradient highlight
- Scroll-entry staggering
- Pointer-following highlight only if performance and accessibility remain strong

Cards must remain usable without hover and on touch devices.

## 8. Information Architecture

### 8.1 Primary navigation

```text
Home | Solutions | Process | Work | About | Contact
```

**Start a Project** will be the highlighted navigation action.

Technical Skills will appear within About and case studies instead of competing for a primary navigation position.

### 8.2 Core routes

```text
/
/solutions/
/process/
/work/
/work/fes-challenger/
/work/business-workflow-system/
/work/ebarangay/
/about/
/contact/
/privacy/
/404.html
```

Additional case-study routes can be added when sufficient content and proof are available.

### 8.3 Content responsibility by page

| Page       | Primary responsibility                                              |
| ---------- | ------------------------------------------------------------------- |
| Home       | Promise, concise overview, selected proof, and invitation           |
| Solutions  | Client problems, solution scope, value, and engagement options      |
| Process    | Delivery method, expectations, approvals, and outputs               |
| Work       | Project directory and high-level evidence                           |
| Case study | Detailed challenge, decisions, implementation, and outcome          |
| About      | Experience, approach, credibility, skills, and working relationship |
| Contact    | Qualified but approachable project inquiry                          |

The homepage and dedicated pages must not repeat identical long-form content.

## 9. Homepage Requirements

The homepage must provide a concise, scannable overview of all major areas. Its purpose is to let a potential client understand the value quickly and then choose where to learn more.

### 9.1 Header and navigation

- Brand or personal logo/name
- Primary navigation
- Highlighted Start a Project action
- Responsive mobile menu
- Visible active and focus states
- Sticky or floating behavior if approved during prototyping

### 9.2 Hero

- Approved outcome-focused headline
- Concise supporting copy
- Discuss Your Project primary CTA
- Explore My Work secondary CTA
- Original technical or project-based hero visual
- Avoid opening with a list of programming languages

### 9.3 Trust summary

Display three concise assurances:

- End-to-end delivery
- Direct collaboration
- Solutions built around real workflows

Include a link to About or Process.

### 9.4 Problems preview

Briefly show common problems AAA can help solve:

- Manual and repetitive processes
- Scattered records and difficult reporting
- Inefficient approval workflows
- Outdated or ineffective websites

Include the reassurance:

> You do not need a complete technical specification. We can begin with the problem.

Link to Solutions.

### 9.5 Solutions and capabilities preview

- Use the six approved colorful capability cards.
- Keep card descriptions brief.
- Each card links to the relevant Solutions-page section.

### 9.6 Selected work

Show the strongest three initial projects:

1. FES Challenger
2. An anonymized government/business workflow system
3. eBarangay

Each preview should include:

- The problem
- What was built
- One meaningful outcome or improvement
- Core technologies
- View Case Study link

Also include Explore All Work.

### 9.7 Process preview

Condense the delivery method into four stages:

1. Discover and Define
2. Design and Plan
3. Develop and Test
4. Deploy and Support

Link to the detailed Process page.

### 9.8 Flexible engagement

Use the message:

> Start with what creates the most value.

Explain briefly that the first release can focus on essential features and expand as priorities and budget grow.

Possible engagement labels:

- Fixed scope
- Minimum viable solution
- Phased development
- Existing-system improvement

### 9.9 About preview

Include:

- Short personal introduction
- Professional photograph if available and approved
- Approximately five years of professional experience
- Frontend, backend, database, and deployment experience
- Direct involvement throughout delivery
- Link to About

### 9.10 Final CTA

Suggested message:

> Have a process that feels too manual, slow, or difficult to manage?

> Tell me what you want to improve. We will identify a practical place to start.

CTA: **Let's Discuss Your Project**

### 9.11 Footer

- Concise positioning statement
- Primary navigation links
- Email, GitHub, and LinkedIn links
- Résumé download when ready
- Privacy page link
- Copyright notice
- No cookie banner unless nonessential cookies or tracking are introduced

## 10. Dedicated Page Requirements

### 10.1 Solutions page

Organize around client problems rather than programming languages.

Each solution section should explain:

- The problem it addresses
- Who it is appropriate for
- What AAA can build
- Expected operational or business benefit
- Relevant project evidence
- Supporting technologies
- Clear inquiry CTA

Version 1 will use one detailed Solutions page with anchored sections. Individual solution subpages are deferred until there is sufficient unique content and SEO value.

### 10.2 Process page

Explain the full delivery lifecycle:

```text
Discover → Define → Design → Develop → Test → Deploy → Support
```

For each stage, explain:

- What happens
- What information is needed from the client
- What AAA delivers
- How review and approval work
- What happens next

Also cover communication, scope management, revisions, change requests, deployment readiness, and post-launch support.

### 10.3 Work page

Provide a project overview organized by relevant categories:

- Business systems
- Workflow solutions
- Corporate websites
- WordPress
- Frontend components
- Personal projects

Filtering may be added using vanilla JavaScript if the number of projects makes it useful. The unfiltered content must remain accessible without JavaScript.

### 10.4 Case studies

Each full case study should include, where applicable:

1. Project overview
2. Client or industry context
3. Challenge
4. Goals and requirements
5. Role and responsibilities
6. Proposed solution
7. Development process
8. Key features
9. Technical implementation
10. Important decisions and constraints
11. Result or operational improvement
12. Screenshots and interface visuals
13. Related capabilities or solutions
14. Project inquiry CTA

Do not invent numeric outcomes. Where measurements are unavailable, describe the verified qualitative improvement accurately.

### 10.5 About page

Include:

- Professional story
- Approximately five years of software development experience
- Business-problem-first approach
- End-to-end technical capability
- Industries or project types understood
- Communication and working style
- Freelance and software-solutions direction
- Technical stack as supporting evidence
- Downloadable résumé when ready

### 10.6 Contact page

Initial contact methods:

- Professional email
- GitHub
- LinkedIn
- Résumé download

Recommended inquiry fields when the form is implemented:

- Name
- Email
- Company or organization
- What would you like to improve?
- Type of solution
- Preferred timeline
- Approximate budget range
- Existing website or system URL, if applicable

Reassurance:

> You do not need complete requirements. Describe the current problem, and we can determine the next practical step.

The final form delivery solution will be selected during Contact implementation. Options may include a privacy-conscious form service or a Cloudflare Pages Function. A direct email link is the launch-safe fallback.

## 11. Initial Project Portfolio

| Project                             | Initial presentation                                |
| ----------------------------------- | --------------------------------------------------- |
| FES Challenger                      | Full public case study using approved public assets |
| Government/business workflow system | Sanitized and anonymized professional case study    |
| eBarangay                           | Personal full-stack case study                      |
| Reusable Angular components         | Technical showcase when content is ready            |
| WordPress theme/starter system      | Reusable-development showcase when content is ready |

### 11.1 Confidentiality rules

Never publish:

- Internal or private URLs
- Credentials or secrets
- Personal or sensitive data
- Restricted screenshots
- Production database details
- Security-sensitive architecture
- Confidential requirements or business processes
- Client materials without permission

Government or restricted work must anonymize the organization, users, data, URLs, and screenshots as needed. The focus should be role, challenge, approach, technical decisions, and non-sensitive outcomes.

## 12. Animation and Interaction Requirements

Motion for JavaScript is the only approved animation library for Version 1.

Planned uses:

- Hero content entrance
- Scroll-reveal sections
- Staggered statistics or cards
- Project image scaling
- Navigation and filter transitions
- Subtle button and card feedback
- Case-study content reveals

Animation rules:

- Remain restrained and purposeful.
- Prefer `transform` and `opacity`.
- Do not block navigation or interaction.
- Do not use scroll hijacking.
- Avoid excessive parallax.
- Respect `prefers-reduced-motion`.
- Keep important content and navigation usable without JavaScript.
- Use CSS transitions for simple hover effects; use Motion only where it adds value.

## 13. Responsive Requirements

Support:

- Mobile devices from approximately 320 px
- Modern phones
- Tablets
- Standard laptops
- Desktop monitors
- Large screens

Primary test widths:

```text
320 px
375 px
768 px
1024 px
1440 px
1920 px
```

Use content-driven SCSS breakpoints rather than device-specific targeting. Navigation, cards, typography, images, forms, and calls to action must remain usable at all supported widths.

## 14. Accessibility Requirements

- Semantic landmarks and HTML elements
- Logical heading hierarchy
- Keyboard-accessible navigation and controls
- Visible focus states
- Skip link
- Descriptive alternative text
- Decorative graphics hidden from assistive technology
- Sufficient color contrast
- Clear form labels, instructions, and errors
- Touch targets of practical size
- Accessible mobile menu behavior
- Reduced-motion support
- No essential information conveyed only by color or animation

Target Lighthouse accessibility score: **95 or higher**.

## 15. Performance Requirements

Target Lighthouse scores:

| Category       | Target |
| -------------- | -----: |
| Performance    |    90+ |
| Accessibility  |    95+ |
| Best Practices |    95+ |
| SEO            |    95+ |

Implementation requirements:

- Properly sized WebP or AVIF images, with fallbacks where needed
- Lazy loading for below-the-fold images
- Explicit image dimensions to reduce layout shift
- Minimal JavaScript and third-party scripts
- Production minification through Vite
- Locally hosted fonts when licensing permits
- Only required font weights
- Optimized SVG assets
- No unnecessary animation or UI packages
- Test on realistic mobile network and CPU conditions

## 16. SEO and Social Sharing Requirements

- Unique title and meta description for every public page
- Canonical URLs
- Open Graph and relevant social-sharing metadata
- Custom Open Graph image
- `sitemap.xml`
- `robots.txt`
- Correct favicon and web-app icon package
- Descriptive URL structure
- Semantic static HTML content
- `Person` structured data where appropriate
- Relevant project or creative-work structured data where valid
- Useful internal linking between Solutions, Work, Process, and Contact

SEO copy must remain natural and must not overpromise experience or project outcomes.

## 17. Security and Privacy Requirements

- HTTPS enforced
- No secrets, credentials, or private API keys in frontend code
- Security headers configured where supported
- External links use appropriate safe `rel` values
- Dependencies reviewed and audited
- Form spam protection if a form is introduced
- User-supplied form content validated on the server or service boundary
- No advertising or behavioral tracking in Version 1
- No nonessential cookies in Version 1

A cookie banner is not required while the site uses no nonessential cookies or tracking scripts. Add consent management only when later functionality creates a genuine legal or privacy requirement.

## 18. Hosting and Deployment

### 18.1 Approved architecture

```text
GitHub repository
        ↓
Cloudflare Pages
        ↓
aaabrenica.site
```

Cloudflare Pages is the approved primary host because it supports static hosting, HTTPS, CDN delivery, GitHub-based automatic deployments, custom domains, and branch preview deployments on a free plan.

GitHub Pages remains an acceptable fallback if Cloudflare Pages cannot be used.

### 18.2 Domain plan

- Preferred final production URL: `https://aaabrenica.site`
- An approved subdomain such as `portfolio.aaabrenica.site` may be used during transition.
- DNS changes must avoid disrupting any existing services on the domain.
- HTTPS and canonical redirects must be verified after connection.

## 19. Git and Release Workflow

Use one GitHub repository and the following branch model:

| Branch      | Purpose                            | Deployment behavior        |
| ----------- | ---------------------------------- | -------------------------- |
| `feature/*` | Individual feature or content work | Optional temporary preview |
| `develop`   | Integrated development version     | Development preview        |
| `main`      | Approved production source         | Production deployment      |

Promotion path:

```text
feature/* → develop → preview and review → main → production
```

Requirements:

- Do not commit `node_modules` or generated local files.
- Commit the package lock file.
- Keep environment-specific values outside source when sensitive.
- Require a successful production build before promotion to `main`.
- Use clear commit messages and pull requests for meaningful changes.
- Add a deployment and rollback guide before production launch.

## 20. Content and Evidence Standards

- Lead with the client problem and outcome; use technologies as evidence.
- Keep homepage copy brief and scannable.
- Use dedicated pages for depth and proof.
- Do not duplicate identical paragraphs across pages.
- Use truthful, verifiable claims only.
- Do not fabricate testimonials, clients, statistics, or outcomes.
- Prefer specific responsibilities and decisions over generic claims.
- Explain technical concepts in language nontechnical clients can understand.
- Maintain consistent terminology, voice, and calls to action.

## 21. Version 1 Acceptance Criteria

Version 1 is ready for production when:

- All core pages and routes are implemented.
- Navigation works with mouse, touch, and keyboard.
- Homepage presents every major area concisely.
- Solutions, Process, Work, About, and Contact pages provide meaningful supporting detail.
- At least three credible project previews are present.
- Approved case studies are complete or clearly marked without broken links.
- Government and client-sensitive content has been sanitized.
- Capability and project cards use original visuals.
- Responsive behavior is verified at all primary test widths.
- Reduced-motion behavior is verified.
- Forms or contact links work correctly.
- Production build completes without errors.
- No broken internal links or missing required assets remain.
- Page metadata, sitemap, robots file, favicon, and Open Graph image are present.
- Target Lighthouse scores are met or exceptions are documented and approved.
- HTTPS, custom domain, redirects, and production deployment are verified.
- A basic README, local setup guide, deployment guide, and content-update guide exist.

## 22. Deferred Enhancements

The following may be considered after Version 1 based on real need:

- Individual SEO-focused solution pages
- Development insights or articles
- Privacy-friendly analytics
- Protected contact form through a Pages Function
- Additional case studies
- Search or advanced work filtering
- Client testimonials with permission
- Dark/light theme switching
- Content management workflow
- Automated performance and accessibility checks in CI

Deferred items must not delay the initial launch unless they become necessary for correctness, legal compliance, or core usability.

## 23. Recommended Implementation Phases

1. **Content inventory and evidence review** — collect résumé data, project details, screenshots, links, and confidentiality approvals.
2. **Design system** — finalize logo treatment, color tokens, typography, spacing, buttons, cards, and responsive rules.
3. **Project foundation** — initialize Vite, SCSS structure, JavaScript modules, linting/formatting decisions, and Git workflow.
4. **Global shell** — build header, navigation, footer, layout system, accessibility foundations, and metadata templates.
5. **Homepage** — implement the complete concise sales narrative.
6. **Dedicated pages** — implement Solutions, Process, Work, About, and Contact.
7. **Case studies and original graphics** — prepare and validate proof-oriented project content.
8. **Animation and polish** — add restrained Motion effects and card interactions.
9. **Quality assurance** — responsive, accessibility, performance, SEO, content, and browser testing.
10. **Deployment** — connect GitHub, Cloudflare Pages, domain, HTTPS, previews, and production.
11. **Launch review** — verify forms, links, analytics status, indexing controls, backups, and rollback documentation.

## 24. Final Approved Direction

The portfolio will be an original, multi-page static website built with **Vite, semantic HTML, custom SCSS, vanilla JavaScript, Motion, and Lucide**. It will use a dark premium editorial design inspired by the Sawad reference while introducing original graphics, custom colorful capability cards, and evidence-focused project presentations.

The homepage will act as a concise sales overview. Dedicated pages will explain solutions, process, experience, technical capability, and project evidence in greater depth. The site will position AAA as an approachable independent software solutions partner who provides structured, end-to-end delivery for growing and cost-conscious businesses.

The source will be managed in GitHub and deployed automatically to Cloudflare Pages, with `aaabrenica.site` as the preferred production domain.
