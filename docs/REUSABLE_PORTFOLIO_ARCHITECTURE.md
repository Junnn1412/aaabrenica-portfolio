# Reusable Portfolio Architecture

**Status:** Approved architectural direction  
**Version:** 1.0

## 1. Objective

Build AAA's portfolio as a high-quality production website while establishing clean boundaries that can later support portfolio projects for other professions.

This is a **reusable portfolio starter**, not a general-purpose frontend framework, CMS, or page builder. Its value is a proven structure, configurable content, controlled design variation, documented delivery process, and strong quality defaults.

## 2. Product strategy

The architecture has two layers:

| Layer                    | Responsibility                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Reusable core            | Build setup, page composition, tokens, components, accessibility, motion, SEO foundations, and deployment conventions |
| Portfolio implementation | Profession, positioning, content, branding, services, projects, evidence, contact details, and enabled pages          |

AAA's developer portfolio is the first implementation. Do not extract a separate starter repository until Version 1 has proven which abstractions are genuinely reusable.

## 3. Architectural principles

1. **Content is separate from presentation.** Structured content should not be scattered through components.
2. **Branding is tokenized.** Profession-specific colors, type, radii, surfaces, and motion intensity should be adjustable without rewriting every component.
3. **Pages remain purposeful.** Optionality must not reduce semantic structure or produce empty sections.
4. **Static output is primary.** Public content should be crawlable, resilient, and available without client-side rendering.
5. **Progressive enhancement is preferred.** JavaScript adds menus, filters, and motion but does not own essential content.
6. **Variants are controlled.** Provide a small number of intentional options rather than unlimited styling flags.
7. **Accessibility and performance are defaults.** They are not client-specific upgrades.
8. **Evidence is profession-specific.** A reusable card structure cannot replace truthful work samples and relevant outcomes.
9. **Generalize after proof.** Avoid designing APIs for hypothetical clients before a second profession validates the need.

## 4. Proposed source boundaries

The exact structure will be confirmed during foundation planning, but the intended responsibilities are:

```text
src/
├── config/
│   ├── site.js
│   ├── navigation.js
│   ├── social-links.js
│   ├── seo.js
│   └── features.js
├── content/
│   ├── home.js
│   ├── services.js
│   ├── projects.js
│   ├── process.js
│   ├── experience.js
│   └── testimonials.js
├── components/
│   ├── global/
│   ├── cards/
│   ├── sections/
│   └── forms/
├── pages/
├── scripts/
├── styles/
│   ├── settings/
│   ├── generic/
│   ├── elements/
│   ├── objects/
│   ├── components/
│   ├── utilities/
│   └── pages/
└── assets/
    ├── fonts/
    ├── icons/
    └── images/
```

This is a responsibility map, not permission to introduce a runtime templating system. The foundation task must select the simplest Vite-compatible multi-page composition approach that preserves static output and maintainable shared elements.

## 5. Configuration model

### 5.1 Site configuration

Centralize values such as:

- Site name and profession
- Base URL and locale
- Default title and description
- Contact actions
- Social profiles
- Résumé path
- Navigation items
- Enabled optional sections
- Analytics status

Do not store secrets in frontend configuration.

### 5.2 Structured content

Reusable content objects should use profession-neutral fields. For example:

```js
{
  slug: "custom-wedding-cake",
  category: "Featured Work",
  title: "Custom Wedding Cake",
  summary: "A tailored three-tier cake created for a formal celebration.",
  challenge: "Create a stable centerpiece that matched the event style.",
  outcome: "Delivered an original design aligned with the approved brief.",
  image: "/images/work/custom-wedding-cake.webp",
  imageAlt: "Three-tier floral wedding cake",
  tags: ["Fondant", "Floral Design", "Three Tier"],
  actionLabel: "View Project"
}
```

The same structure can represent a software case study without forcing technology-specific labels into the component API.

Content models must distinguish optional fields from required evidence. Templates should omit unavailable optional elements cleanly rather than render placeholders.

## 6. Component categories

### 6.1 Universal components

- Header and mobile navigation
- Footer
- Section heading
- Buttons and text links
- Media frame
- Tags
- Contact CTA
- Form controls
- Accessible disclosure or menu patterns where needed

### 6.2 Portfolio components

- Capability or service card
- Featured-work card
- Work-grid card
- Case-study summary
- Process steps
- Experience timeline
- Metric or trust statement
- Testimonial, only when verified content exists
- Contact or booking panel

### 6.3 Profession-specific compositions

These use the core components but may require different layout emphasis:

| Profession   | Primary evidence                                  | Likely emphasis                  |
| ------------ | ------------------------------------------------- | -------------------------------- |
| Developer    | Systems, websites, workflows, technical decisions | Case studies and process         |
| Pastry chef  | Products, collections, event work, specialties    | High-quality gallery and inquiry |
| Photographer | Sessions, galleries, packages, testimonials       | Media presentation and booking   |
| Architect    | Projects, constraints, drawings, outcomes         | Project narratives and services  |
| Consultant   | Engagements, expertise, results, publications     | Authority, process, and contact  |

Do not force every profession to use every component or page.

## 7. Page templates and optionality

Core templates:

- Home
- About
- Services or Solutions
- Work or Portfolio
- Individual project or case study
- Process
- Contact
- Privacy
- 404

Optional templates:

- Experience or résumé
- Testimonials
- Packages
- Publications or insights
- FAQ

Page selection should be made during client discovery. An optional page is enabled only when it has a clear audience purpose and sufficient unique content.

## 8. Design variation strategy

Support controlled variation through token groups:

- Foundation: light, dark, or mixed
- Accent palette
- Font pairing
- Fluid type scale
- Container and spacing density
- Corner-radius scale
- Border and shadow treatment
- Card graphic treatment
- Navigation presentation
- Motion intensity

Initial future design directions may include:

1. **Professional** — restrained, clear, trust-focused
2. **Creative** — image-led, expressive, spacious
3. **Technical** — structured, editorial, systems-oriented

These directions should share accessibility and component behavior but must not become superficial one-click skins. Client positioning and evidence still determine final composition.

## 9. Content adaptation rules

For every new profession:

- Replace the positioning, value proposition, problems, services, proof, and calls to action.
- Choose terminology familiar to the target audience.
- Reassess which pages and components are relevant.
- Supply real work and truthful outcomes.
- Create original graphics and media treatment.
- Review the SEO intent, structured data, and contact flow.
- Verify image ownership and publication permission.

Never offer a new client AAA's copy with nouns replaced. Reuse structure and quality controls, not the strategic content itself.

## 10. Extraction criteria

Extract the reusable starter after AAA's Version 1 launch when:

- Core components have survived integrated responsive and accessibility testing.
- Page architecture works with real content.
- AAA-specific assumptions have been identified.
- Build and deployment instructions are stable.
- The content model can represent at least one materially different profession.
- Removing AAA's private and branded content can be done completely and safely.

The clean starter repository must contain generic example content, setup documentation, a customization checklist, and no confidential or client-owned material.

## 11. Second-profession validation

Before commercial reuse, validate the starter with a different content type. A pastry-chef portfolio is a strong candidate because it tests:

- Image-led work rather than interface screenshots
- Collections and specialties rather than technologies
- Order or inquiry flow rather than software consultation
- Different project metadata
- A warmer or lighter design direction
- Mobile gallery performance

Any change required only for that validation should first be assessed as one of:

- A legitimate reusable-core improvement
- A controlled profession variant
- Client-specific customization that should remain outside the core

## 12. Future new-client workflow

1. Discovery questionnaire and asset audit
2. Audience, positioning, and primary conversion goal
3. Page and feature selection
4. Design-direction selection and original brand adaptation
5. Content model population
6. Component and page customization
7. Client review at agreed gates
8. Responsive, accessibility, SEO, content, and performance QA
9. Hosting, domain, and form configuration
10. Launch, handoff, and maintenance option

This workflow will become a separate checklist after the first implementation exposes the actual decisions, effort, and common client blockers.

## 13. Boundaries

The starter will not initially provide:

- A visual page builder
- A CMS or admin dashboard
- Arbitrary drag-and-drop sections
- Unlimited component variants
- Ecommerce
- User accounts
- A universal contact backend
- A plugin ecosystem
- Guaranteed suitability for every profession

These exclusions keep the product fast, understandable, maintainable, and realistic for an independent developer to support.

## 14. Success criteria

The reusable architecture succeeds when AAA can create a distinctly branded second portfolio faster by changing configuration, content, tokens, assets, and selected compositions—without copying the first site's identity, weakening quality, or rewriting the entire foundation.
