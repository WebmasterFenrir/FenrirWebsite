// ─────────────────────────────────────────────────────────────────────────────
// Export Facebook session cookies (for the events-sync setup)
// --------------------------------------------------------------
//
// Usage (from the repo root):
//   bun run --cwd apps/events-sync export:cookies
//
// Opens a real Chrome window pointed at Facebook. Log in (or accept the
// existing session) in that window, and the script exports the session
// cookies to `facebook-cookies.json` — the exact format the dashboard upload
// and the sync service expect.
//
// Why not just copy `document.cookie` from the DevTools console? httpOnly
// cookies (`xs`, `sb`, `datr`, ...) are invisible to JavaScript, but this
// script reads them via the browser protocol — those are the ones Facebook's
// session security actually checks, so the console snippet would produce a
// broken export.
//
// Env overrides:
//   CHROME_PATH        Chrome/Chromium executable
//   FB_COOKIES_OUT     output file (default ./facebook-cookies.json)
//   FB_HOME_URL        where to open (default https://www.facebook.com/)
//   FB_COOKIES_TIMEOUT login wait in ms (default 5 minutes)
// ─────────────────────────────────────────────────────────────────────────────

import { resolve } from "node:path"
import puppeteer from "puppeteer-core"
import { resolveChromePath } from "../src/sync"

const ESSENTIAL = ["c_user", "xs", "sb", "datr", "fr"]

const OUT = process.env.FB_COOKIES_OUT ?? resolve("facebook-cookies.json")
const HOME_URL = process.env.FB_HOME_URL ?? "https://www.facebook.com/"
const LOGIN_TIMEOUT_MS = Number(process.env.FB_COOKIES_TIMEOUT ?? 5 * 60 * 1000)

const chromePath = resolveChromePath()
if (!chromePath) {
  console.error(
    "No Chrome/Chromium found. Install Chrome or set CHROME_PATH to the executable.",
  )
  process.exit(1)
}

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: false, // a human needs to log in
  defaultViewport: { width: 1280, height: 900 },
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
})

try {
  const page = await browser.newPage()
  console.log(`Opened a Chrome window at ${HOME_URL}`)
  console.log("Log in to the Fenrir account in that window (it may already be logged in).")
  console.log(`Waiting up to ${Math.round(LOGIN_TIMEOUT_MS / 60000)} minutes for the session…`)

  await page.goto(HOME_URL, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {})

  // Poll until the c_user cookie appears (i.e. the dev is logged in).
  const start = Date.now()
  let loggedIn = false
  while (Date.now() - start < LOGIN_TIMEOUT_MS) {
    const cookies = await page.cookies()
    if (cookies.some((c) => c.name === "c_user")) {
      loggedIn = true
      break
    }
    await new Promise((r) => setTimeout(r, 2000))
  }

  if (!loggedIn) {
    console.error("Timed out waiting for login — no c_user cookie found. Try again.")
    process.exitCode = 1
  } else {
    const cookies = await page.cookies()
    const names = cookies.map((c) => c.name)
    const missing = ESSENTIAL.filter((n) => !names.includes(n))

    await Bun.write(OUT, JSON.stringify(cookies, null, 2))

    console.log("")
    console.log(`✓ Exported ${cookies.length} cookies to ${OUT}`)
    if (missing.length > 0) {
      console.log(`⚠ Missing (may cause scraping failures): ${missing.join(", ")}`)
    } else {
      console.log("✓ All essential session cookies present (c_user, xs, sb, datr, fr).")
    }
    console.log("Next: upload this file in the dashboard → Activiteiten → Sync settings.")
  }
} finally {
  await browser.close().catch(() => {})
}
