/**
 * Debug helper: load the saved facebook-events-dump.html in a real browser and
 * print what the scraper actually sees and parses for every event card.
 *
 * Uses the REAL extraction + parsing functions from src/sync.ts, so what you
 * see here is exactly what a sync would store.
 *
 * Usage:  bun run scripts/analyze-dump.ts [path-to-dump.html]
 */
import { existsSync } from "node:fs"
import { resolve } from "node:path"
import puppeteer from "puppeteer-core"
import { extractCardsFromDom, parseStartTime, resolveChromePath } from "../src/sync"

const dumpPath = resolve(process.argv[2] ?? "facebook-events-dump.html")
if (!existsSync(dumpPath)) {
  console.error(`No dump found at ${dumpPath} — run the sync with FB_SYNC_DUMP=1 first.`)
  process.exit(1)
}

const chromePath = resolveChromePath()
if (!chromePath) {
  console.error("No Chrome found. Set CHROME_PATH.")
  process.exit(1)
}

const browser = await puppeteer.launch({ executablePath: chromePath, headless: true, args: ["--no-sandbox"] })
try {
  const page = await browser.newPage()
  await page.goto(`file:///${dumpPath.replace(/\\/g, "/")}`, { waitUntil: "load" })

  const cards = await page.evaluate(extractCardsFromDom)

  console.log(`\n=== ${cards.length} cards extracted from dump ===\n`)
  const now = new Date()
  for (const c of cards) {
    const parsed = parseStartTime(c.text, now)
    console.log(`- ${c.id}`)
    console.log(`  name : ${c.name.slice(0, 60)}`)
    console.log(`  date : ${parsed.iso ?? "UNPARSED"}  past=${parsed.past}`)
    console.log(`  text : ${c.text.slice(0, 160)}`)
    console.log()
  }
} finally {
  await browser.close().catch(() => {})
}
