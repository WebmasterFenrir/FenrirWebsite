# events-sync

Scrapes upcoming events from the Fenrir Facebook page and syncs them into
PocketBase (`activiteiten` collection), so the website can show them without a
Facebook API token.

Facebook blocks plain HTTP requests (even with cookies — HTTP 400) and its
Events API is restricted to Marketing Partners, so this uses a real browser
(Chrome via `puppeteer-core`) with the page's **session cookies** to read the
public events tab.

## How it works

```
PocketBase hook (pb_hooks/events-sync.pb.js)
  ├─ cronAdd  every 6h  ──POST /run──▶  events-sync container (this app)
  └─ POST /api/events-sync/run (dashboard "Sync now", admin only)
                                            │  puppeteer: open FB events tab with cookies
                                            ▼
                                      extract events from DOM
                                            │
                                            ▼
                                   upsert into PocketBase "activiteiten"
```

The scheduler lives **inside PocketBase** (`cronAdd`), so there is no host
crontab to maintain. The admin uploads the Facebook session cookies once via
the dashboard; they are stored in the `facebook_settings` collection and
re-downloaded by this service on every run.

## Env vars

| Var | Required | Default | Purpose |
| --- | --- | --- | --- |
| `PB_URL` | no | `http://127.0.0.1:8090` | PocketBase base URL (use `http://pocketbase:3000` in Docker) |
| `EVENTS_SYNC_URL` | no | `http://127.0.0.1:3000` | Set on the PocketBase service (hook trigger target). docker-compose sets it to `http://events-sync:3000` for the container network |
| `PB_EMAIL` / `PB_PASSWORD` | yes | – | PocketBase superuser credentials (same as `PB_ADMIN_EMAIL`/`PB_ADMIN_PASSWORD`) |
| `FB_PAGE_URL` | no | from settings record | Override for the Facebook page URL |
| `FB_COOKIES_JSON` | no | from uploaded file | Inline JSON cookie array (for quick local tests) |
| `CHROME_PATH` | no | auto-detected | Chrome/Chromium executable |
| `PORT` | no | `3000` | HTTP port |
| `FB_SYNC_DRY_RUN` | no | off | `1` = don't write to PocketBase |
| `FB_SYNC_PRUNE` | no | off | `1` = delete stored *upcoming* events no longer on the FB tab (past events are never pruned) |
| `FB_SYNC_DUMP` | no | off | `1` = save the fetched HTML to `facebook-events-dump.html` for debugging |
| `FB_SYNC_MAX_EVENTS` | no | `30` | Stop scrolling once this many unique events are collected (keeps the sync fast and avoids timeouts) |

## Getting the session cookies (one time)

Run the export script — it opens a real Chrome window, waits for you to log in,
and writes `facebook-cookies.json` with the **complete** session (including the
httpOnly cookies that a DevTools-console snippet can never read):

```bash
bun run --cwd apps/events-sync export:cookies
```

1. A Chrome window opens at facebook.com — log in with the Fenrir account
   (or just let it sit if you were already logged in).
2. As soon as the session is detected the script writes
   `src/apps/events-sync/facebook-cookies.json` and reports which of the
   essential cookies (`c_user`, `xs`, `sb`, `datr`, `fr`) were found.
3. Upload that `.json` file (plus the page URL) in the dashboard under
   **Activiteiten → Sync settings**.

Sessions last weeks–months. When the sync reports "Facebook session invalid or
expired", just re-run the export script and re-upload the fresh file.

> The file is gitignored — never commit your session cookies.

## How events are matched & deduped

- The scraper scrolls through the whole events tab (the most recent event is the
  top-left card) and merges cards by Facebook event id.
- Before inserting, an event is matched against the DB by **Facebook id** first,
  then by **date + title** (Facebook sometimes re-issues event ids, which used
  to create duplicates). A matching record is updated, not re-created.
- After upserting, a **dedupe loop** removes any leftover records with the same
  date + title until none remain (keeps the record that has an FB id / a date).
- Events whose start date has already passed are marked `past` (new `past`
  field) instead of being deleted — the website only shows upcoming ones, and
  `prune` never touches past events.

## Local development

The service is part of the turbo dev workflow — from the repo root:

```bash
bun run dev   # starts the website, dashboard AND this events-sync service
```

(PocketBase itself is a standalone binary/container, so it is not part of
`bun dev` — start it however you normally do, e.g. `docker compose up pocketbase`.)

Individual commands:

```bash
bun run --cwd apps/events-sync start       # run the HTTP service on its own
bun run --cwd apps/events-sync sync        # one-shot run using the PB-uploaded config
FB_SYNC_DRY_RUN=1 bun run --cwd apps/events-sync sync   # dry run
```

Needs a local Chrome (auto-detected) or `CHROME_PATH`, and a `.env` with
`PB_EMAIL`/`PB_PASSWORD` for anything that touches PocketBase.

## Docker / VPS

The `events-sync` service in `docker-compose.yml` runs the HTTP service. The
PocketBase hook triggers it every 6 hours (`0 */6 * * *`). To change the
schedule, edit the `cronAdd` expression in
`src/apps/pocketbase/pb_hooks/events-sync.pb.js` and redeploy.

## Troubleshooting

- **`Facebook session invalid or expired`** → re-export cookies, re-upload.
- **`No Chrome/Chromium found`** → set `CHROME_PATH` (local) or use the Docker image.
- **0 events on a fresh setup** → run with `FB_SYNC_DUMP=1` and inspect
  `facebook-events-dump.html`; the DOM extraction selectors live in
  `src/sync.ts` (`extractCardsFromDom` / `parseStartTime`) and may need tweaks
  when Facebook changes its markup.
- The scraper is inherently fragile (Facebook changes layout/anti-bot
  measures). If scraping breaks entirely, the site still renders — the events
  section simply shows the "no activities" fallback.
