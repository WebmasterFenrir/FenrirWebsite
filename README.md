# FenrirWebsite

FenrirWebsite is maintained by the Fenrir Presidium and contributors. Fenrir is a student group based in Antwerp, at KDG Groenplaats, serving all students on that campus. The site is a public-facing hub that tells who we are, who sits on the presidium, information about sponsors, events, and more.

## Live sites
- Production: https://fenrirclub.be
- Staging/testing: https://fenrir.nilsmertens.dev
  (Note: the testing URL may change if the staging environment is rebuilt or the host is updated.)

## How it's set up
- The repository hosts static assets and a lightweight frontend scaffold. The development workflow relies on Node.js tooling.
- Branches commonly used: main (production) and a development branch if applicable. Deploys are typically triggered via CI/CD.
- Project structure is kept lean; static assets live under public/assets and HTML/JS/CSS under appropriate folders.

## Setup
- Prerequisites: Node.js (LTS recommended, v16+), npm (or yarn/pnpm).
- Install dependencies: `npm install` (or `bun install` if you use Bun as your package manager).
- Run the development server: `npm run dev` (Astro dev); or navigate to `src/apps/website` and run `bun run dev` if you prefer Bun.
- Build for production: `npm run build`
- Preview production: `npm run preview` (or serve the contents of the build output with a static server)

## Tech Stack
- Frontend: Astro, React
- Styling: Tailwind CSS
- MDX support: `@astrojs/mdx` and optional `@astrojs/react`
- Builder: Astro (uses Vite under the hood)
- Libraries: lucide-react, radix-ui, canvas-confetti
- State/backend: pocketbase
- Type safety: JavaScript with optional TypeScript (monorepo provides TS tooling)
- Monorepo tooling: Turbo (workspaces), Bun as package manager (as configured in the repo)

## Tech Deep Dive
- Monorepo layout:
  - Apps: `src/apps/website` (website), plus future apps
  - Packages: `src/packages/*` (shared configs, tooling)
- Frontend tech:
  - Astro with React; MDX for docs; Tailwind CSS for styling
  - File structure: UI components under `src/apps/website/src/components`, pages under `src/apps/website/src/pages` (or `.astro` routes)
- Build and dev workflow:
  - Root uses Turbo for orchestrating tasks; workspace tooling: Bun as package manager
  - Website app scripts (in `src/apps/website/package.json`): `dev` (astro dev), `build` (astro build), `preview` (astro preview)
  - To run locally: `bun install` at repo root, then `cd src/apps/website` and `bun run dev` (or `npm run dev` if using npm)
- Dependency and linting:
  - Lint/format: Prettier and ESLint via workspace scripts; format: `bun run format` (or `npm run format`), lint: `bun run lint`
- Backend and data:
  - PocketBase is included for lightweight backend needs; refer to its docs for setup and data modeling
- Testing:
  - Testing setup is available via Turbo; run `bun run check-types` or `bun run test` if configured; adjust per actual test setup
- Environment:
  - Use `.env` or `.env.local` as needed; avoid committing secrets
- Deployment:
  - Production hosting: fenrirclub.be; CI/CD triggers deployments on main; staging URL updates via CI

## Deployment
- Production site is hosted at fenrirclub.be.
- Deployments are typically triggered by pushes to the main branch; the staging URL is updated from the staging environment.
- For manual deployment, follow the project’s CI/CD workflow or run the build script locally and deploy the output to the hosting provider.

## Badges
- CI status and license badges can be added here once the repository is linked to a CI service and a license is chosen.

## Contributing
- If you'd like to contribute, open a GitHub issue to discuss collaboration. Propose what you want to work on, your approach, and the expected impact. This helps us coordinate and avoid duplicating effort.
- If we agree to collaborate, we may create a pull request for your changes. For smaller fixes, an issue to discuss your idea is enough; we'll decide if a PR is appropriate.
- Issue types: bug report, feature request, documentation improvement, design feedback, or collaboration proposal.
- When filing issues, please include:
  - Clear title and summary
  - For bugs: steps to reproduce, expected vs actual behavior
  - For features: problem, proposed solution, scope, and impact
  - Environment details (Node version, OS)
  - Links to relevant files or branches (if any)
- If you want to contribute code, let us know in the issue; after discussion, create a branch and submit a PR with a concise description of the change and the motivation.

## Local Development (quick start)
- Prerequisites: Node.js >= 18 and Bun as the package manager (per repo config).
- From repo root:
- 1) Install workspace dependencies: `bun install`.
- 2) Navigate to the website app: `cd src/apps/website`.
- 3) Install app-specific dependencies (if any): `bun install`.
- 4) Run the dev server: `bun run dev`.
- 5) Build for production: `bun run build`.
- 6) Preview the production build: `bun run preview`.
- Note: The website app uses Astro with React and Tailwind; commands assume the project structure described above.
