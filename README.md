# FenrirWebsite

FenrirWebsite is maintained by the Fenrir Presidium and contributors. Fenrir is a
student group based in Antwerp, at KDG Groenplaats, serving all students on that
campus. This repository powers everything the club runs online:

- **[fenrirclub.be](https://fenrirclub.be)** — the public website (events, sponsors, praesidium, …)
- **[dashboard.fenrirclub.be](https://dashboard.fenrirclub.be)** — the admin dashboard for the presidium
- **[form.fenrirclub.be](https://form.fenrirclub.be)** — public forms (e.g. `/lidworden` for memberships)
- **[pb.fenrirclub.be](https://pb.fenrirclub.be)** — the PocketBase backend behind it all

## Repository layout

This is a Bun + Turbo monorepo. All app code lives under `src/`; the workspace
root for tooling is `src/package.json` (Turbo workspaces), not the repo root.

```
src/
├── apps/
│   ├── website/       # Public site — Astro + React + Tailwind (fenrirclub.be)
│   ├── dashboard/     # Admin dashboard — React + Vite (dashboard.fenrirclub.be)
│   ├── form-site/     # Public forms — Astro + React (form.fenrirclub.be/{code})
│   ├── events-sync/   # Facebook events scraper — Bun service (puppeteer)
│   └── pocketbase/    # PocketBase server config: migrations, hooks, smoke tests
├── packages/          # Shared packages (@repo/ui, eslint-config, typescript-config)
├── turbo.json         # Turbo task pipeline (build / dev / lint / test / check-types)
└── package.json       # Workspace root — all bun commands run from here
```

## Tech stack

- **Apps:** Astro (website, form-site), React + Vite (dashboard), Bun + TypeScript (events-sync)
- **Backend:** PocketBase — SQLite, auth, realtime; hooks and migrations in `src/apps/pocketbase/`
- **Styling:** Tailwind CSS v4, shadcn-style components from `@repo/ui`
- **Tooling:** Bun as package manager, Turbo for task orchestration, Playwright for E2E tests
- **Hosting:** Docker Compose behind an nginx-proxy with automatic Let's Encrypt certs

## Getting started

Prerequisites: **Bun** (>= 1.1) and Node.js >= 18. Docker is only needed for a
full-stack local run.

```bash
# from the repository root
cd src
bun install

# start everything that has a dev server (website, dashboard, events-sync)
bun run dev
```

Individual apps can also be run on their own:

```bash
bun run --cwd src/apps/website dev        # public site
bun run --cwd src/apps/dashboard dev      # admin dashboard
bun run --cwd src/apps/form-site dev      # public forms
bun run --cwd src/apps/events-sync start  # events sync service
```

PocketBase is not part of `bun run dev` (it is a standalone binary/container):

```bash
docker compose up pocketbase
```

### Environment variables

Copy `.env.example` to `.env` and fill in the values. `.env` is gitignored —
never commit real secrets.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `PB_URL` | all apps | PocketBase base URL (`http://pocketbase:3000` inside Docker) |
| `PB_EMAIL` / `PB_PASSWORD` | server-side apps | PocketBase superuser credentials |
| `PB_ADMIN_EMAIL` / `PB_ADMIN_PASSWORD` | docker compose | Same credentials, interpolated into the containers |
| `PUBLIC_PB_URL` | website, form-site, dashboard | PocketBase URL seen by the browser (`https://pb.fenrirclub.be`) |
| `DEEPL_API_KEY` | PocketBase hook | DeepL auto-translation for multi-language forms |
| `GITHUB_TOKEN` / `GITHUB_REPO` | PocketBase hook | "bugticket" forms hook — creates GitHub issues |
| `EVENTS_SYNC_URL` | PocketBase hook | Where the PocketBase cron finds the events-sync service |

## Apps in detail

### website (`src/apps/website`)

The public Astro site. Reads all content from PocketBase at build/runtime:
pages, sponsors, praesidium, and the activities synced from Facebook. Commands
run inside `src/apps/website`:

```bash
bun run dev      # dev server
bun run build    # production build
bun run preview  # preview the build
bun run test     # bun tests
```

### dashboard (`src/apps/dashboard`)

The presidium's admin panel (React + Vite): manage people, forms, activities,
sponsors, roles and settings. Commands run inside `src/apps/dashboard`:

```bash
bun run dev         # dev server
bun run build       # typecheck + production build
bun run check-types # tsc --noEmit
bun run lint        # eslint
```

### form-site (`src/apps/form-site`)

Standalone public form renderer served at `form.fenrirclub.be/{code}`. Forms
are built in the dashboard; submissions are validated and stored by PocketBase
hooks (`src/apps/pocketbase/pb_hooks/forms.pb.js`), including a per-IP
rate limit configurable per form. Commands run inside `src/apps/form-site`.

### events-sync (`src/apps/events-sync`)

A Bun service that scrapes the club's Facebook page events (via session
cookies + puppeteer — there is no public Events API) and upserts them into the
`activiteiten` collection. A PocketBase cron triggers it every 6 hours; the
dashboard has a "Sync now" button. See
[`src/apps/events-sync/README.md`](src/apps/events-sync/README.md) for setup
(cookie export, dashboard upload, troubleshooting).

### pocketbase (`src/apps/pocketbase`)

The backend: collection migrations (`pb_migrations/`) and server-side hooks
(`pb_hooks/`) for forms validation + rate limiting, auto-translation, GitHub
issue creation, member registrations and the events-sync scheduler. Ships with
self-contained smoke tests that spawn a throwaway PocketBase instance, e.g.:

```bash
cd src/apps/pocketbase
bun smoke-forms-test.mjs
```

## Common tasks

| Task | Command (from `src/`) |
| --- | --- |
| Install dependencies | `bun install` |
| Dev servers (all apps) | `bun run dev` |
| Build all apps | `bun run build` |
| Lint | `bun run lint` |
| Format | `bun run format` |
| Typecheck | `bun run check-types` |
| Unit tests | `bun run test` |
| E2E tests (Playwright) | `bun run test:e2e` |

## Deployment

- **CI** (`.github/workflows/test.yml`) runs on every PR to `main`: install,
  build, unit tests and Playwright E2E tests.
- **Production deploy** (`.github/workflows/deploy.yml`): on every push to
  `main`, an SSH action pulls the repo on the server and runs
  `docker compose up -d --build`. The compose stack (see `docker-compose.yml`)
  runs nginx-proxy + Let's Encrypt companion, the website, dashboard,
  form-site, events-sync and PocketBase.
- A staging/test environment is deployed from `.github/workflows/deploytestenv.yml`
  via `docker-compose.dev.yml` (URL: https://fenrir.nilsmertens.dev — may change
  if the staging host is rebuilt).

## Contributing

If you'd like to contribute, open a GitHub issue to discuss your idea — bugs,
features, docs or design feedback. For bugs include steps to reproduce,
expected vs actual behavior and your environment; for features, the problem,
proposed solution and impact.

After agreeing on an approach, create a branch and submit a PR with a concise
description of the change and the motivation. CI must pass before merge.
