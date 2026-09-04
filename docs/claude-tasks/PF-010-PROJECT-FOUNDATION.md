# PF-010 — Initialize the Portfolio Project Foundation

## Mode

Start in **Plan mode**. Inspect and plan only. Do not create, modify, install, commit, push, or delete anything until AAA explicitly approves the plan.

## Objective

Initialize `aaabrenica-portfolio` as a clean, maintainable, multi-page static portfolio using the approved technology stack. Establish only the project foundation: repository connection, Vite, initial dependencies, baseline multi-page entry points, documentation placement, essential scripts, and a verified production build.

This task must not implement the final visual design, homepage sections, capability cards, case-study layouts, animations, or production deployment.

## Confirmed environment

- Project owner: AAA
- Repository: `https://github.com/Junnn1412/aaabrenica-portfolio.git`
- Repository state: newly created and expected to be empty
- Repository name: `aaabrenica-portfolio`
- Local Node.js version: `v22.18.0`
- Package manager: npm
- Approved hosting later: Cloudflare Pages
- Approved branch model: `feature/* -> develop -> main`
- Initial working branch: `feature/project-foundation`

Before planning, verify the actual Git state, active directory, configured remotes, Node version, and whether any files already exist. Report any difference from the confirmed environment.

## Read first

Read these files completely before proposing the plan:

1. `CLAUDE.md`
2. `DEVELOPER_PORTFOLIO_INITIAL_REQUIREMENTS.md`
3. `docs/DEVELOPMENT_WORKFLOW.md`
4. `docs/INITIAL_IMPLEMENTATION_TASKS.md`
5. `docs/REUSABLE_PORTFOLIO_ARCHITECTURE.md`

If any required document is missing, stop and list the missing file. Do not reconstruct or guess its requirements.

## Approved stack

### Runtime dependencies

- `motion`
- `lucide`

Use the current versions compatible with Node.js `v22.18.0` at installation time. Record the exact resolved versions through `package.json` and `package-lock.json`.

### Development dependencies

- `vite`
- `sass`

Do not install React, Vue, Angular, TypeScript, Tailwind, Bootstrap, jQuery, a UI library, a templating framework, an additional animation library, or any other package during this task.

Linting, formatting, testing, HTML validation, and browser-testing packages belong to `PF-012`. You may recommend them separately, but do not install or configure them in `PF-010`.

## Required scope

Your plan must cover:

1. Verifying or establishing the local Git connection to the confirmed empty GitHub repository.
2. Preserving the supplied project documentation.
3. Initializing a Vite project without a frontend framework.
4. Configuring npm and the supported Node version.
5. Installing only Vite, Sass, Motion, and Lucide with the correct dependency classification.
6. Creating a maintainable foundation for a Vite multi-page static website.
7. Providing baseline entry pages for the approved routes, with minimal semantic placeholder content only.
8. Creating the first SCSS entry point and the first JavaScript ES-module entry point.
9. Adding a suitable `.gitignore`.
10. Creating or updating a concise `README.md` with prerequisites, installation, local development, production build, preview, project documents, and branch workflow.
11. Defining the required npm scripts for this phase.
12. Confirming Vite's production output and multi-page behavior.
13. Proposing the initial Git branch creation sequence without merging or pushing until separately approved.

## Approved Version 1 public routes

The foundation should accommodate these routes:

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

At this stage, each page should contain only enough semantic markup to verify its title, entry point, shared asset loading, internal navigation path, and production output. Do not write unapproved marketing content or create the finished interface.

## Architecture constraint

The project must generate static, crawlable multi-page output. Essential page content must not depend on client-side JavaScript rendering.

Propose the simplest maintainable Vite-compatible method for shared page elements and multiple entries. Explain:

- How shared header/footer markup will eventually avoid manual duplication
- Whether the proposed method requires a package or plugin
- What the generated production HTML looks like
- How page-specific titles and metadata will be handled later
- How the approach supports the future reusable portfolio starter

Because no additional package is approved for this task, prefer a package-free approach or stop and request approval if a package is genuinely necessary. Do not silently add a Vite HTML plugin or custom framework.

## Expected foundational areas

Your plan may refine names after inspecting the repository, but it should account for these responsibilities:

```text
docs/
src/
├── config/
├── content/
├── components/
├── pages/
├── scripts/
├── styles/
└── assets/
public/
```

Do not create speculative files in every directory simply to make the tree look complete. Create only the files needed for the foundation and document deferred directories.

## Required npm scripts for PF-010

At minimum, propose scripts equivalent to:

```text
dev      Start the Vite development server
build    Create the production build
preview  Preview the production build locally
```

Do not add scripts that invoke tools not installed in this task.

## Node version policy

Propose a clear Node version declaration appropriate for Node.js `v22.18.0`, such as an `engines` entry and an agreed version file if useful. Do not claim compatibility with versions you have not verified against the selected Vite release.

## Explicitly out of scope

- Final design tokens, typography, colors, spacing, or component styling
- Final header and mobile navigation
- Final homepage or dedicated-page content
- Capability cards or project cards
- Project graphics, screenshots, or animations
- Contact form backend
- SEO completion, structured data, sitemap, and Open Graph assets
- Linting, formatting, test frameworks, and CI
- Cloudflare Pages configuration
- DNS or custom-domain changes
- Production deployment
- Merging to `develop` or `main`
- Pushing commits without separate authorization
- Reusable starter extraction

## Plan response requirements

Return a plan containing:

1. **Repository findings** — directory, files, Git state, branch, remote, Node, and npm versions.
2. **Proposed file tree** — only files and directories to be created or changed in PF-010.
3. **Multi-page strategy** — exact Vite configuration and how each approved route becomes static output.
4. **Shared-markup strategy** — package-free approach, limitations, and what is deliberately deferred.
5. **Dependency plan** — exact packages and whether each is a dependency or devDependency.
6. **Implementation sequence** — ordered, reversible steps.
7. **Validation plan** — exact commands and expected checks.
8. **Git plan** — branches and proposed commits, without executing them.
9. **Risks or decisions needed** — anything AAA must approve before implementation.

End with:

> Plan complete. No files were changed. Waiting for AAA's approval before implementation.

Do not continue automatically after presenting the plan.

## Implementation acceptance criteria

These criteria apply only after AAA approves the plan and instructs you to implement:

- The local project is connected to the confirmed GitHub repository.
- Node.js `v22.18.0` satisfies the selected Vite package requirements.
- Only the four approved packages are installed.
- `package-lock.json` is created and retained.
- `npm install` or `npm ci`, as appropriate to the project state, succeeds.
- `npm run dev` starts without errors.
- `npm run build` succeeds.
- `npm run preview` serves the production output.
- Every approved foundational route resolves to its intended static HTML output.
- SCSS compiles through Vite.
- JavaScript uses ES modules and loads without console errors.
- No framework, unapproved package, final UI, or invented project content is added.
- Documentation remains intact and is linked from the README.
- `.gitignore` excludes `node_modules`, build output, environment files, and common local artifacts without hiding required source files.
- No secrets, credentials, or machine-specific absolute paths are committed.
- No commit, push, merge, deployment, or DNS change occurs without explicit authorization.

## Completion report after implementation

Use the completion-report format in `CLAUDE.md` and additionally include:

- Exact installed dependency versions
- Generated production routes
- Git branch and remote status
- Whether any files remain untracked or modified
- Checks not performed and why
