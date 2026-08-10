import { runSync } from "./sync"

const PORT = Number(process.env.PORT ?? 3000)

async function doSync() {
  try {
    const result = await runSync({
      pbUrl: process.env.PB_URL ?? "http://127.0.0.1:8090",
      pbEmail: process.env.PB_EMAIL ?? process.env.PB_ADMIN_EMAIL ?? "",
      pbPassword: process.env.PB_PASSWORD ?? process.env.PB_ADMIN_PASSWORD ?? "",
      pageUrl: process.env.FB_PAGE_URL,
      cookiesJson: process.env.FB_COOKIES_JSON,
      chromePath: process.env.CHROME_PATH,
      dryRun: process.env.FB_SYNC_DRY_RUN === "1",
      prune: process.env.FB_SYNC_PRUNE === "1",
      dumpHtml: process.env.FB_SYNC_DUMP === "1",
      maxEvents: Number(process.env.FB_SYNC_MAX_EVENTS ?? 30),
    })
    return { ok: result.ok, events: result.events.length, error: result.error ?? null }
  } catch (err) {
    return { ok: false, events: 0, error: err instanceof Error ? err.message : String(err) }
  }
}

// One-shot CLI mode: `bun run start --once` (useful for local testing / debugging)
if (process.argv.includes("--once")) {
  const res = await doSync()
  console.log(JSON.stringify(res, null, 2))
  process.exit(res.ok ? 0 : 1)
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)

    // POST /run — triggered by the PocketBase cron hook and the dashboard.
    if (req.method === "POST" && url.pathname === "/run") {
      const res = await doSync()
      return Response.json(res, { status: res.ok ? 200 : 500 })
    }

    if (req.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true })
    }

    return new Response("Not found", { status: 404 })
  },
})

console.log(`[events-sync] HTTP service listening on http://localhost:${server.port}`)
