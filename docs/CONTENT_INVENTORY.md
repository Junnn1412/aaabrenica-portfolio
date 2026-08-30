# Content and Asset Inventory

Tracks PF-003's per-project evidence: every fact and asset considered for a
case study, its provenance, its publication status, and — once published —
which curated on-page sentence it was folded into. This is the durable
Gate E ("content and evidence," `docs/DEVELOPMENT_WORKFLOW.md`) record, the
same role `docs/COMPONENT_APPROVAL.md` plays for Gate C. Extended by
PF-061/062 with their own sections when those projects' content/assets are
supplied.

Status values used throughout:

- **Publishable** — verified and cleared for public use.
- **Needs redaction/cropping** — verified but requires editing before use.
- **Provisional** — AAA-reviewed and approved as portfolio copy, subject to
  the PF-064 final polish pass (wording may still be refined later).
- **Missing** — not yet supplied or not verified; omitted from the page,
  never filled with generic copy.
- **Unsuitable** — must never be published.

## FES Challenger (PF-060)

**PF-064 (2026-08-18):** all narrative copy below approved by AAA as final
V1 copy (no longer provisional), via a dedicated checkpoint recorded in
`docs/DECISION_LOG.md`. Also added: `evidence` links from the Solutions
page's "Corporate Websites" and "WordPress Development" sections to this
case study — `src/content/pages/solutions.js`, guarded by
`tests/solutions-render.test.mjs`.

### Facts

| Fact                                                                                                                                                                                  | Status                                      | Provenance                                                       | Published where                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Client name "FES Challenger"                                                                                                                                                          | Publishable                                 | AAA-supplied fact; already live on Home/Work since PF-041/052    | Title, H1, Home/Work cards                                                                                                                                                                                                                 |
| Business context: marine salvage/underwater recovery company; site presents company/services/projects/contact                                                                         | Publishable                                 | AAA-supplied fact                                                | Client & Business Context section                                                                                                                                                                                                          |
| Problem: needed a professional, responsive corporate site; maintainable custom WordPress; controlled staging-to-production deployment; SEO/social/cookie-preference access            | Publishable                                 | AAA-supplied fact                                                | The Challenge section (goals folded in, see below)                                                                                                                                                                                         |
| Goals: present professionally; accessible desktop/mobile; maintainable theme; controlled deployments; SEO/social; cookie-preference access                                            | Publishable, not shown as a standalone list | AAA-supplied fact                                                | Folded into The Challenge's second sentence, to avoid a third restatement later under Solution/Outcomes                                                                                                                                    |
| Budget, formal timeline, lead/traffic/ranking targets                                                                                                                                 | Missing                                     | Unknown/unverified                                               | Omitted entirely, no meta-commentary                                                                                                                                                                                                       |
| Role: website developer responsible for implementing/maintaining the custom WordPress site                                                                                            | Publishable                                 | AAA-supplied fact                                                | My Role section, opening sentence                                                                                                                                                                                                          |
| Discovery: reviewed requirements, approved content, page structure, branding assets, technical needs, deployment requirements                                                         | Publishable, kept general                   | AAA-supplied fact                                                | Folded into My Role's opening sentence (not a separate section)                                                                                                                                                                            |
| 11 granular responsibilities (theme, layouts, header/nav/footer/JS, content integration, staging config, production support, SEO/Rank Math, metadata/social, cookie access/Complianz) | Publishable                                 | AAA-supplied fact                                                | Condensed to 6 grouped bullets under My Role; full 11-item list below                                                                                                                                                                      |
| Claim that AAA was designer/copywriter/sole owner/strategist, or a team size                                                                                                          | Unsuitable                                  | Explicitly disclaimed by AAA                                     | Never published                                                                                                                                                                                                                            |
| Delivered scope: Home/Services/Projects/Contact presentation, responsive theme, required JS behavior                                                                                  | Publishable                                 | AAA-supplied fact                                                | What I Built section                                                                                                                                                                                                                       |
| Technology stack: WordPress, PHP, HTML, SCSS/CSS, JavaScript, Git, GitHub, GitHub Actions, FTP-based deployment, Rank Math SEO, Complianz                                             | Publishable                                 | AAA-supplied fact                                                | Technology Stack section, shown once as tags                                                                                                                                                                                               |
| Hosting provider                                                                                                                                                                      | Unsuitable                                  | Explicitly withheld by AAA                                       | Never published                                                                                                                                                                                                                            |
| 9 manifest "decisions" (theme choice, SCSS organization, responsive implementation, deployment centralization, cookie access, Rank Math, metadata, OG assets)                         | Publishable, trimmed                        | AAA-supplied fact                                                | Trimmed to the 3 genuinely decision-shaped items (theme choice, SCSS organization, deployment workflow design) under Key Decisions; the remaining 6 are facts already stated once elsewhere (Role/What I Built), not repeated a third time |
| Numeric/business outcomes (leads, revenue, traffic, rankings, speed, dev/maintenance time)                                                                                            | Unsuitable                                  | Explicitly disallowed by AAA + requirements §10.4/§20            | Never published                                                                                                                                                                                                                            |
| 5 qualitative outcomes, capability-framed                                                                                                                                             | Publishable, merged to 4                    | AAA-supplied fact                                                | Outcomes section (the last two manifest items — SEO metadata and cookie-preference access — merged into one sentence)                                                                                                                      |
| Production URL `https://feschallenger.com/`                                                                                                                                           | Publishable                                 | AAA-supplied fact                                                | External link under the intro, main-content-region-scoped (see `docs/DECISION_LOG.md`'s PF-060 entry)                                                                                                                                      |
| Staging URL                                                                                                                                                                           | Unsuitable                                  | Explicitly withheld — the value itself was never given to Claude | Never published; structurally enforced by the region-scoped external-link invariant (only one approved host can ever render)                                                                                                               |
| Timeline, team size                                                                                                                                                                   | Missing                                     | Unknown/withheld                                                 | Omitted entirely, no meta-commentary                                                                                                                                                                                                       |
| Home/Work card category "Marine Services Corporate Website"                                                                                                                           | Provisional                                 | Directly derived proposed wording, AAA-reviewed and approved     | `fes-challenger.js`'s `card.category`, spread into Home/Work project items                                                                                                                                                                 |
| Home/Work card summary                                                                                                                                                                | Provisional                                 | Directly derived proposed wording, AAA-reviewed and approved     | `fes-challenger.js`'s `card.summary`                                                                                                                                                                                                       |
| Home/Work card tags `["WordPress", "Custom Theme"]`                                                                                                                                   | Provisional                                 | Directly derived proposed wording, AAA-reviewed and approved     | `fes-challenger.js`'s `card.tags`                                                                                                                                                                                                          |
| Meta title/description, closing CTA copy                                                                                                                                              | Provisional                                 | Directly derived proposed wording, AAA-reviewed and approved     | `<title>`/meta description, closing CTA panel                                                                                                                                                                                              |

### Full uncurated responsibility list (kept here for traceability; the page shows the condensed version)

1. Building and maintaining the custom WordPress theme.
2. Implementing responsive page layouts.
3. Implementing the header, navigation, footer, and reusable theme styles.
4. Integrating approved website content and visual assets.
5. Implementing required frontend behavior with JavaScript.
6. Configuring and maintaining the staging deployment workflow.
7. Supporting production deployment preparation and verification.
8. Implementing footer-based cookie-preference access integrated with Complianz.
9. Implementing SEO configuration using Rank Math SEO.
10. Implementing page-level metadata and social-sharing presentation.
11. Preparing or integrating Open Graph/social-sharing assets where applicable.

### Full uncurated "decisions" list from the manifest (3 of 9 published under Key Decisions; the rest are facts already stated once elsewhere)

1. A custom WordPress theme was used for a maintainable, project-specific implementation. — **Published** (Key Decisions)
2. SCSS was organized into reusable theme styles rather than treating every page as an isolated implementation. — **Published** (Key Decisions)
3. Responsive header, navigation, footer, and page behavior were implemented for desktop and mobile use. — already stated under What I Built; not repeated
4. Deployment logic was centralized in a reusable GitHub Actions workflow. — **Published**, combined with #5 (Key Decisions)
5. The deployment workflow includes validation, backup, deployment, verification, and rollback handling. — **Published**, combined with #4 (Key Decisions)
6. Cookie-preference access was integrated into the site footer while Complianz remained the underlying consent system. — already stated under My Role; not repeated
7. Rank Math SEO was used for the WordPress SEO configuration. — already stated under My Role; not repeated
8. Page-level metadata and social-sharing presentation were implemented. — already stated under My Role; not repeated
9. Open Graph/social-sharing assets and metadata were prepared or integrated where applicable. — already stated under My Role ("metadata and social-sharing presentation"); not repeated as a separate item

### Assets

| Asset                                                          | Status                                                            | Provenance                                                           | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FES logo (`fes-challenger-logo.png`)                           | **Publishable — supplied, verified, and integrated**              | AAA-supplied approved asset                                          | Placed at `public/images/case-studies/fes-challenger/fes-challenger-logo.png`. Direct inspection confirms a valid 19,767-byte RGBA PNG at **140×137px**; it was not edited or re-encoded. The canonical `content.logo` supplies the path, decorative `alt: ''`, and real `width: 140`/`height: 137`; the shared template renders those intrinsic attributes generically. `.case-study-hero__logo` preserves the ratio with `width: auto`, `object-fit: contain`, a 3.5rem default height, and a 4.5rem height from 48em. Existence remains verified pre-build against `public/` and post-build against `dist/` through the shared exact-case asset validation. |
| Screenshots — 4 published, 3 declined (see PF-063 audit below) | **Publishable — supplied, individually reviewed, and integrated** | AAA-supplied approved assets, captured from the live production site | Gallery ships with 4 real images. See the full PF-063 inventory/decision table below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

### Screenshot request list (candidates for evaluation — not pre-approved)

| #            | Subject                                         | Viewport          | Purpose                                                                             | Recommended crop                                  |
| ------------ | ----------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| 1            | Desktop homepage/hero                           | ~1440px desktop   | Establishes real visual identity as evidence                                        | Full above-the-fold hero, browser chrome excluded |
| 2            | Services presentation                           | Desktop           | Evidences the "Services" area named in What I Built                                 | Content area only, no visible admin UI            |
| 3            | Projects presentation                           | Desktop           | Evidences the "Projects" area named in What I Built                                 | Content area only                                 |
| 4            | Mobile homepage or navigation                   | ~375–414px mobile | Directly evidences the responsive-implementation claim in Outcomes                  | Full screen, nav open if capturing navigation     |
| 5 (optional) | Footer/contact or cookie-preference interaction | Either            | Only worth including if it clearly supports the cookie-preference claim in Outcomes | Footer/consent widget only                        |

### Screenshot intake workflow (once files are supplied)

1. AAA supplies each screenshot file.
2. Each file is inventoried individually here (source page, subject, what it actually shows).
3. Each is classified: **Publishable as-is / Needs cropping / Needs redaction / Unsuitable**.
4. Only files classified Publishable as-is (after any required cropping/redaction is actually applied) are copied into `public/images/case-studies/fes-challenger/`, with descriptive, stable filenames (e.g. `homepage-desktop.webp`) — never generic (`screenshot1.png`).
5. `alt`, `caption`, `width`, and `height` are written from the real reviewed file — never invented.
6. No AI-generated or reconstructed screenshots, ever.
7. No WordPress admin screens, hosting panels, credentials, deployment/repo secrets, private analytics, private communications, restricted staging content, or unpublished client information in any screenshot.
8. `content.gallery` is added to `fes-challenger.js` only once specific files have cleared this workflow — a separate, later commit, not part of PF-060's initial implementation.

### PF-063 screenshot audit and final decision

AAA captured 7 production-site screenshots and placed them at
`public/images/case-studies/fes-challenger/`. Every file was inspected
directly (PNG signature/IHDR, not metadata only) and viewed visually
(subject, quality, chrome/admin UI, private/identifying content,
duplication) before any selection.

| File (original name)    | Format/dimensions/size                            | Subject                                                                            | Decision                                           | Reason                                                                                           |
| ----------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `hero-banner.png`       | Valid PNG, 2880×1388, 4,339,585 bytes, 8-bit RGBA | Homepage hero: nav + underwater diving image + headline                            | **Selected** → `gallery/homepage-hero-desktop.png` | Homepage/hero visual identity — no equivalent evidence otherwise                                 |
| `services-page.png`     | Valid PNG, 716×448, 378.9 KB, 8-bit RGBA          | Dedicated Services page: hero + 3 service cards; nav shows "SERVICES" active       | **Selected** → `gallery/services-page-desktop.png` | Strongest Services-page evidence (own hero, active nav state)                                    |
| `services-section.png`  | Valid PNG, 718×449, 178.0 KB, 8-bit RGBA          | A services teaser section (different heading/cards); nav "SERVICES" not active     | **Declined — removed**                             | Overlaps with `services-page.png` (same category-card format); not materially different evidence |
| `projects-page.png`     | Valid PNG, 718×447, 371.8 KB, 8-bit RGBA          | Dedicated Projects page: hero + 3 named project cards; nav shows "PROJECTS" active | **Selected** → `gallery/projects-page-desktop.png` | Strongest Projects-page evidence (own hero, active nav state)                                    |
| `projects-section1.png` | Valid PNG, 713×449, 40.6 KB, 8-bit RGBA           | Mostly-white intro/stats block, no project photography                             | **Declined — removed**                             | Weak visual evidence; no distinct claim support                                                  |
| `projects-section2.png` | Valid PNG, 719×449, 245.8 KB, 8-bit RGBA          | Grid of 6 real project thumbnails with photos, bottom row partially cut            | **Declined — removed**                             | The optional 5th-image slot; declined by AAA to keep the gallery to exactly 4                    |
| `fes-home-mobile.png`   | Valid PNG, 544×689, 332.6 KB, 8-bit RGBA          | Mobile homepage: hamburger nav, hero, CTAs, start of a stats section               | **Selected** → `gallery/homepage-mobile.png`       | Only visual evidence for the site's "responsive" claim                                           |

No file needed redaction or cropping — none showed browser chrome, admin UI,
staging indicators, credentials, or personal data; every image shows only
content already public on `https://feschallenger.com/`. No file needed
resizing/upscaling (source dimensions preserved exactly, per AAA's explicit
"do not upscale, current resolution is accepted" instruction, since larger
captures aren't obtainable).

**Delivery format:** attempted WebP conversion first, per AAA's instruction.
No suitable encoder was available locally without installing a package —
checked for `cwebp`, ImageMagick, ffmpeg (none present; the only `convert`
found is Windows' unrelated filesystem-conversion utility) and .NET's
built-in GDI+ image encoders (`BMP`/`JPEG`/`GIF`/`TIFF`/`PNG` only, no WebP).
Per AAA's explicit fallback rule, all 4 selected images ship as **PNG**,
byte-identical to the reviewed originals (verified via `cmp`) — no
conversion, resize, or quality change of any kind.

**`srcset` derivatives: not implemented, per AAA's approval.** The current
gallery contract uses one source per approved screenshot. The homepage hero
file's intrinsic metadata was re-verified as 2880×1388 on 2026-08-19; this
correction did not resize, re-encode, or duplicate the binary.

**Final gallery** (`content.gallery.items`, `fes-challenger.js`), in
display order:

| #   | File                                | Dimensions | Size            | Alt                                                                                               | Caption     |
| --- | ----------------------------------- | ---------- | --------------- | ------------------------------------------------------------------------------------------------- | ----------- |
| 1   | `gallery/homepage-hero-desktop.png` | 2880×1388  | 4,339,585 bytes | "Screenshot of the FES Challenger homepage with navigation above an underwater diving hero image" | Homepage    |
| 2   | `gallery/services-page-desktop.png` | 716×448    | 378.9 KB        | "FES Challenger Services page showing marine salvage and underwater service categories"           | Services    |
| 3   | `gallery/projects-page-desktop.png` | 718×447    | 371.8 KB        | "FES Challenger Projects page showing completed marine salvage project cards"                     | Projects    |
| 4   | `gallery/homepage-mobile.png`       | 544×689    | 332.6 KB        | "FES Challenger homepage on a mobile viewport, showing the responsive hero and navigation menu"   | Mobile view |

All 7 raw capture files (4 renamed-into-gallery + 3 declined) were removed
from `public/` after the 4 delivery files were created and byte-verified —
AAA confirmed the originals are backed up outside the repository. The
approved logo (`fes-challenger-logo.png`) is unchanged. Verified absent from
both the real `public/` directory and the rendered case-study output by
`tests/fes-challenger-render.test.mjs`.

## Business Workflow System (PF-061)

**PF-064 (2026-08-18):** all narrative copy below approved by AAA as final
V1 copy (no longer provisional), via a dedicated checkpoint recorded in
`docs/DECISION_LOG.md`. Note: a PF-064 checkpoint summary mistakenly
described the Outcomes section as having 4 items — the table below and the
real content file both correctly have 5; this was a summary-writing error,
not a content defect, and nothing here was changed as a result.

Fully anonymized per AAA's explicit publication constraints. No
organization, agency, department, sector, industry, program, office,
location, real internal system name, or acronym appears anywhere in the
published content. No live/staging URL, no logo, no screenshots.

### Facts

| Fact                                                                                                                                                                                                                            | Status                                                                      | Provenance                     | Published where                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------- |
| Client name / organization identity                                                                                                                                                                                             | **Unsuitable — must never be published**                                    | Explicitly withheld by AAA     | Never published; case study explicitly states organizational details are withheld |
| Public title "Business Workflow System"                                                                                                                                                                                         | Publishable                                                                 | AAA-confirmed                  | Title, H1, Home/Work cards                                                        |
| Business context: internal system for a multi-stage application, review, examination, document, approval workflow                                                                                                               | Publishable                                                                 | AAA-supplied fact              | Client & Business Context section                                                 |
| Problem: fragmented records, manual coordination, limited status visibility, multiple participant roles                                                                                                                         | Publishable                                                                 | AAA-supplied fact              | The Challenge section                                                             |
| AAA's role: full-stack developer (requirements, frontend, backend, database, defects, testing, deployment)                                                                                                                      | Publishable                                                                 | AAA-supplied fact              | My Role section                                                                   |
| 9 verified capabilities (application/registration, document review, examination management, role-based review, dashboards, map-based site-inspection records, QR admission/verification, email notifications, activity history) | Publishable                                                                 | AAA-supplied fact              | What I Built section, published in full as the features list                      |
| Verified technology stack (Angular, Angular Material, TypeScript, ASP.NET Core Web API, C#, Microsoft SQL Server, Dapper, Leaflet, REST APIs)                                                                                   | Publishable                                                                 | AAA-supplied fact              | Technology Stack section, shown once as tags                                      |
| 6 verified technical decisions                                                                                                                                                                                                  | Publishable, 4 of 6 curated (see below)                                     | AAA-supplied fact              | Key Decisions section                                                             |
| 5 approved qualitative outcomes                                                                                                                                                                                                 | Publishable, qualitative only — no metrics                                  | AAA-supplied fact              | Outcomes section                                                                  |
| Timeline, team size                                                                                                                                                                                                             | **Omitted by instruction** — not published even if known                    | AAA-supplied instruction       | Not published                                                                     |
| Numeric metrics, adoption figures, cost savings, delivery dates                                                                                                                                                                 | **Unsuitable — must never be published**                                    | Explicitly disallowed by AAA   | Never published                                                                   |
| Live/staging URL                                                                                                                                                                                                                | **Unsuitable — must never be published**                                    | Explicitly disallowed by AAA   | No `externalLink` configured                                                      |
| Logo                                                                                                                                                                                                                            | **Missing** — none approved                                                 | N/A                            | No `logo` configured                                                              |
| Screenshots                                                                                                                                                                                                                     | **Missing** — deferred to a later, separate sanitization-and-approval round | AAA-supplied instruction       | No `gallery` configured                                                           |
| Home/Work card category "Internal Workflow System"                                                                                                                                                                              | Provisional, AAA-approved                                                   | Directly derived, AAA-reviewed | `business-workflow-system.js`'s `card.category`                                   |
| Home/Work card summary                                                                                                                                                                                                          | Provisional, AAA-approved                                                   | Directly derived, AAA-reviewed | `business-workflow-system.js`'s `card.summary`                                    |
| Home/Work card tags (`Angular`, `ASP.NET Core`)                                                                                                                                                                                 | Provisional, AAA-approved                                                   | Directly derived, AAA-reviewed | `business-workflow-system.js`'s `card.tags`                                       |

### Curation: 6 verified decisions → 4 published

The manifest supplied 6 verified technical decisions. 2 were intentionally
excluded from the published Key Decisions section to stay within AAA's
4-item cap and avoid restating a fact already published elsewhere:

1. "Role- and permission-based access across different workflow stages" — **not published as a decision.** Represented once, under What I Built, as the feature "Role- and permission-based review stages."
2. "Reusable Leaflet mapping with filtering, marker highlighting, and responsive viewport handling" — **not published as a decision.** Represented once, under What I Built, as the feature "Site-inspection records with map-based visualization."

Published as Key Decisions (verbatim intent, one wording correction applied
by AAA — see below):

1. Reusable frontend components and shared services
2. Stored procedures and paginated API queries — **corrected wording**: published as "organize data access and handle large result sets in manageable pages," not the originally proposed "for structured, efficient data access" (an unverified performance-efficiency claim AAA explicitly rejected).
3. Token-based authentication, refresh-token handling, and guarded routes
4. Structured development/staging/production promotion process

### Absolute redaction list (enforced by `tests/business-workflow-system-render.test.mjs`'s prohibited-wording guard, and by `tests/home-render.test.mjs`/`tests/work-render.test.mjs`'s equivalent checks on the composed Home/Work pages)

Never publish: organization/agency/department/program/sector/industry/office/location names; the system's real internal name or acronym; government identifiers or terminology that could identify the organization; real user/applicant/project/contract/office/regional/operational data; internal URLs, domains, environment names, server names, database names, table/stored-procedure names, IP addresses, or credentials; exact record counts, confidential metrics, dates, budgets, or delivery timelines; screenshots until separately sanitized and approved.

The automated guard checks for: `government`, `agency`/`agencies`, `accreditation`, `regional`, `contract`, `department`, `sector`, `industry`, `program`, `office`, `location` (word-bounded, case-insensitive) against the real rendered case-study output, the content module itself, and the Home/Work card fields. Organizational acronyms and real names cannot be guarded programmatically (unknown by construction) — enforced by AAA's fact-approval step itself never having introduced one.

## eBarangay (PF-062 — deferred; PF-064 holding-page exception)

**PF-062 itself remains deferred and incomplete.** AAA confirmed eBarangay
is in the planning/design stage only (nothing built yet).
`docs/INITIAL_IMPLEMENTATION_TASKS.md`: "Blocked by verified current
project state and assets" — unchanged; never marked complete by PF-064.

**PF-064 V1 exception (2026-08-18):** the route's dev-facing PF-011
placeholder text — literally "Foundation placeholder... Final content is
defined in a later task," publicly live and linked from both Home and the
Work index — was replaced with a neutral, fact-free holding message. This
is a **presentation-only fix**, not case-study content:

| Field         | Status                                  | Content                                                                                                                    |
| ------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `title`       | Unchanged                               | `eBarangay`                                                                                                                |
| `description` | **Publishable — approved holding copy** | "This case study is currently in development and will be published once it reaches a shareable stage."                     |
| `heading`     | Unchanged                               | `eBarangay`                                                                                                                |
| `paragraphs`  | **Publishable — approved holding copy** | "This case study is still in development and isn't ready to share yet. In the meantime, take a look at my other projects." |
| `backLink`    | Unchanged                               | "Back to Work" → `/work/`                                                                                                  |

No project fact appears anywhere in this copy — no stack, no feature, no
completion claim. Guarded by `tests/ebarangay-render.test.mjs`, which
proves the rendered page carries no case-study narrative section (no
`client`/`problem`/`role`/`solution`/`technologyStack`/`decisions`/`outcomes`
heading, no logo, no gallery, no external link), so PF-062 can't silently
gain fabricated content later without a deliberate, reviewed
implementation. Still **Missing**: logo, screenshots, verified stack,
features, role, decisions, outcomes, repository/live URL — none approved,
none published.

**Project-card presentation (approved 2026-08-19):** the Home and Work
eBarangay card reuses one `card.presentation` descriptor from this module:
`{ kind: 'deferred', label: 'Case study in development' }`. It adds no
category, summary, tags, media, or completion claim. Business Workflow
System is explicitly `text-only`. FES Challenger alone uses approved image
media, sharing the existing homepage gallery screenshot path and verified
2880×1388 intrinsic dimensions from one canonical descriptor; no duplicate
or re-encoded binary was added.

## Home/Work publication-state and FES carousel addendum (2026-08-19)

All three project modules and case-study routes remain registered. Their shared
card publication states are FES `isVisible: true`, Business Workflow System
`isVisible: false`, and eBarangay `isVisible: false`. The latter two are omitted
before Home/Work rendering; their content, route files, schemas, and exact-set
route validation remain intact.

FES card media now reuses exactly three existing desktop gallery descriptors:

| Asset                               | Verified dimensions |
| ----------------------------------- | ------------------: |
| `gallery/homepage-hero-desktop.png` |           2880×1388 |
| `gallery/services-page-desktop.png` |             716×448 |
| `gallery/projects-page-desktop.png` |             718×447 |

The mobile gallery screenshot remains gallery-only. No screenshot was copied,
edited, re-encoded, or added. Shared path/dimension literals live only in the
canonical descriptors in `fes-challenger.js`; gallery and carousel consumers
reuse them with the existing truthful alt text.

## FES presentation update and pending evidence (PF-064, 2026-08-21)

This section supersedes the earlier four-item rendered-gallery description.
The canonical 2880×1388 Homepage screenshot is now case-study hero media and
remains slide 1 of the unchanged project-card carousel. Its physical size is
4,339,585 bytes. The current rendered case-study gallery is exactly:

1. `gallery/services-page-desktop.png` — caption `Services`
2. `gallery/projects-page-desktop.png` — caption `Projects`

`gallery/homepage-mobile.png` remains physically archived but is unreferenced,
unregistered, and unpublished. It was not deleted or modified. Its prior alt and
caption are no longer visitor-facing content.

The following exact future paths are reserved documentation only and are not
production content, registered assets, built HTML, placeholder frames, or
approved/integrated screenshots:

- `/images/case-studies/fes-challenger/gallery/project-details-page-desktop.png`
  — planned caption `Project details`
- `/images/case-studies/fes-challenger/gallery/about-us-page-desktop.png` —
  planned caption `About us`

Capture specification for both: CSS viewport 1440×810, DPR 2, expected final
pixels 2880×1620. Provisional alt direction only—not published alt text:

- Project details: screenshot of an FES Challenger project-details page
  presenting project information and imagery.
- About us: screenshot of the FES Challenger About Us page introducing the
  company.

A read-only repository inspection found an existing
`about-us-page-desktop.png` binary and a differently named
`projects-details-page-desktop.png` binary. Neither is registered or published;
the plural filename does not satisfy the reserved singular path. File presence
does not establish approval. Before either future integration, AAA still
requires byte/format inspection, intrinsic-dimension verification, visual
classification, final alt-text approval, exact-case asset validation, and
gallery integration. No placeholder may be published while that gate is open.
