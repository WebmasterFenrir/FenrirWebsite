import { existsSync } from "node:fs"
import puppeteer, { type Browser, type CookieParam } from "puppeteer-core"
import PocketBase from "pocketbase"

export interface ScrapedEvent {
  fbEventId: string
  name: string
  startTime?: string
  endTime?: string
  description?: string
  placeName?: string
  coverUrl?: string
  fbUrl: string
  /** True when the parsed start date is in the past. */
  past?: boolean
}

export interface SyncResult {
  ok: boolean
  events: ScrapedEvent[]
  error?: string
}

export interface SyncOptions {
  pbUrl: string
  pbEmail: string
  pbPassword: string
  /** Facebook page URL, e.g. https://www.facebook.com/fenrir.antwerpen */
  pageUrl?: string
  /** Raw JSON string with the cookie array (overrides the PB-uploaded file). */
  cookiesJson?: string
  chromePath?: string
  /** Don't write anything to PocketBase (except still authenticating/reading). */
  dryRun?: boolean
  /** Delete stored events that are no longer on the FB events tab. */
  prune?: boolean
  /** Save the fetched page HTML to ./facebook-events-dump.html for debugging. */
  dumpHtml?: boolean
  /** Stop scrolling once this many unique events are collected (default 30). */
  maxEvents?: number
  timeoutMs?: number
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

/** Chrome/Chromium executable resolution (system browser + puppeteer-core). */
export function resolveChromePath(): string | undefined {
  const fromEnv = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH
  if (fromEnv) return fromEnv

  const candidates =
    process.platform === "win32"
      ? [
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
          process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe` : "",
        ].filter(Boolean)
      : process.platform === "darwin"
        ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
        : [
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser",
            "/usr/bin/google-chrome",
            "/usr/bin/google-chrome-stable",
          ]

  return candidates.find((p) => existsSync(p))
}

// Exact month WORDS (EN + NL), longest first so alternation prefers full names.
// Using full words (with \b boundaries) instead of prefixes is essential:
// a prefix match on "mar" would also match "Markt" in "Grote Markt 42" and
// turn street names + house numbers into fake dates.
const MONTH_PATTERN =
  "(january|januari|jan|february|februari|feb|march|maart|mar|mrt|april|apr|may|mei|june|juni|jun|july|juli|jul|august|augustus|aug|september|sept|sep|october|oktober|oct|okt|november|nov|december|dec)\\.?"

const MONTHS: Record<string, number> = {
  january: 0, januari: 0, jan: 0,
  february: 1, februari: 1, feb: 1,
  march: 2, maart: 2, mar: 2, mrt: 2,
  april: 3, apr: 3,
  may: 4, mei: 4,
  june: 5, juni: 5, jun: 5,
  july: 6, juli: 6, jul: 6,
  august: 7, augustus: 7, aug: 7,
  september: 8, sept: 8, sep: 8,
  october: 9, oktober: 9, oct: 9, okt: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
}

function monthToIndex(token: string): number | undefined {
  return MONTHS[token.toLowerCase().replace(/\.$/, "")]
}

/**
 * Best-effort date parsing from FB event card text. Handles both
 * "SAT, MAY 24 AT 8:00 PM" (EN) and "vr, 22 mei om 20:00" (NL) shapes,
 * with or without an explicit year ("NOV 14, 2020" / "14 november 2020").
 *
 * The date is always at the START of the card text, so the match is anchored
 * there — this prevents false positives from street names/postal codes in the
 * middle of the text (e.g. "Grote Markt 42, 2000 Antwerpen").
 *
 * When the card contains a year, it is used as-is and the event is marked past
 * if that date is before now (this is how old events stay marked old). Without
 * a year, we pick whichever of {this year, next year} is closer to today.
 */
export function parseStartTime(text: string, now: Date): { iso?: string; past: boolean } {
  // Relative day labels:  "vandaag" / "today" / "morgen" / "tomorrow"
  const dayOffset = (() => {
    const head = text.slice(0, 12).toLowerCase()
    if (/^vandaag|^today/.test(head)) return 0
    if (/^morgen|^tomorrow/.test(head)) return 1
    return null
  })()
  if (dayOffset !== null) {
    const time = text.match(/(\d{1,2}):(\d{2})\s*(am|pm|u\.?)?/i)
    let hours = time ? parseInt(time[1], 10) : 20
    const minutes = time ? parseInt(time[2], 10) : 0
    const meridiem = (time?.[3] ?? "").toLowerCase()
    if (meridiem.startsWith("p") && hours < 12) hours += 12
    if (meridiem.startsWith("a") && hours === 12) hours = 0
    const d = new Date(now)
    d.setDate(d.getDate() + dayOffset)
    d.setHours(hours, minutes, 0, 0)
    return { iso: d.toISOString(), past: d.getTime() < now.getTime() }
  }

  // Optional weekday prefix ("vr, " / "SAT," / "zaterdag "), then either
  // day-month (NL) or month-day (EN), with an optional explicit year right after.
  const anchored = new RegExp(
    "^\\s*(?:[a-z]{2,10}\\.?,?\\s*)?" +
      "(?:(\\d{1,2})\\s+" + MONTH_PATTERN + "|" + MONTH_PATTERN + "\\s+(\\d{1,2}))" +
      "(?:\\s*,?\\s*(20\\d{2})\\b)?",
    "i",
  )
  const m = text.match(anchored)
  if (!m) return { past: false }

  let day: number | undefined
  let month: number | undefined
  if (m[1] !== undefined) {
    // day-month (Dutch):  "22 mei"
    day = parseInt(m[1], 10)
    month = monthToIndex(m[2])
  } else {
    // month-day (English):  "MAY 24"
    month = monthToIndex(m[3])
    day = parseInt(m[4], 10)
  }
  if (month === undefined || day === undefined) return { past: false }
  if (day < 1 || day > 31) return { past: false }
  const explicitYear = m[5] ? parseInt(m[5], 10) : undefined

  const time = text.match(/(\d{1,2}):(\d{2})\s*(am|pm|u\.?)?/i)
  let hours = time ? parseInt(time[1], 10) : 20
  const minutes = time ? parseInt(time[2], 10) : 0
  const meridiem = (time?.[3] ?? "").toLowerCase()
  if (meridiem.startsWith("p") && hours < 12) hours += 12
  if (meridiem.startsWith("a") && hours === 12) hours = 0

  // Explicit year in the card text wins (e.g. "NOV 14, 2020" — old events
  // must stay in the past, never be rolled forward to this/next year).
  if (explicitYear !== undefined) {
    const candidate = new Date(explicitYear, month, day, hours, minutes)
    if (!Number.isNaN(candidate.getTime())) {
      return { iso: candidate.toISOString(), past: candidate.getTime() < now.getTime() }
    }
  }

  // No year in the card → pick whichever of {this year, next year} is closer.
  const thisYear = new Date(now.getFullYear(), month, day, hours, minutes)
  const nextYear = new Date(now.getFullYear() + 1, month, day, hours, minutes)

  const thisYearDist = Math.abs(thisYear.getTime() - now.getTime())
  const nextYearDist = Math.abs(nextYear.getTime() - now.getTime())

  if (nextYearDist < thisYearDist) {
    // Closer to next year's date → upcoming event next year.
    return { iso: nextYear.toISOString(), past: false }
  }
  return { iso: thisYear.toISOString(), past: thisYear.getTime() < now.getTime() }
}

/**
 * Stable key for matching/grouping events: lowercase title + start date (YYYY-MM-DD).
 * Used to find an existing event with the same date and title before inserting,
 * and to remove duplicates.
 */
function eventKey(name: string, startTime?: string): string {
  const title = name.trim().toLowerCase().replace(/\s+/g, " ")
  const date = startTime ? startTime.slice(0, 10) : ""
  return `${date}|${title}`
}

/** Pick the "better" of two duplicate records: the one with an FB id, then the one with a date. */
function betterRecord<T extends { fbEventId?: string; startTime?: string }>(a: T, b: T): T {
  const score = (r: T) => (r.fbEventId ? 2 : 0) + (r.startTime ? 1 : 0)
  return score(b) > score(a) ? b : a
}

const SKIP_LINES = /^(interested|going|more info|see all|you're going|interessant|geïnteresseerd|gaat|info|evenement|event)$/i

/**
 * Runs inside the browser page: finds event cards, returns raw data
 * (id, name, card text, cover image) for the host to parse.
 */
export function extractCardsFromDom() {
  // Everything must be self-contained: this function is serialized into the
  // page via page.evaluate, so no module-level helpers are reachable here.
  const monthWords =
    "(?:january|januari|jan|february|februari|feb|march|maart|mar|mrt|april|apr|may|mei|june|juni|jun|july|juli|jul|august|augustus|aug|september|sept|sep|october|oktober|oct|okt|november|nov|december|dec)\\.?"
  // A "date line" is a standalone month WORD + day (either order) or a relative
  // label. Word boundaries are critical: "Mar" alone must NOT match "Markt".
  const dateRe = new RegExp(
    "\\b" + monthWords + "\\s+\\d{1,2}\\b|\\b\\d{1,2}\\s+" + monthWords + "\\b|\\b(vandaag|morgen|today|tomorrow)\\b",
    "i",
  )
  const countDates = (text: string) => (text.match(new RegExp(dateRe.source, "gi")) || []).length

  const byId = new Map<string, { name: string; text: string; cover: string; href: string }>()

  for (const a of Array.from(document.querySelectorAll('a[href*="/events/"]'))) {
    const href = (a.getAttribute("href") || "").trim()
    const m = href.match(/\/events\/(\d+)(\/|$)/)
    if (!m) continue
    const id = m[1]

    // Skip links inside dialogs/notifications — they are invites to OTHER
    // pages' events ("Mieke heeft je uitgenodigd voor een evenement"), not
    // cards on this page's events tab.
    if (a.closest('[role="dialog"], [role="presentation"]')) continue

    // Each card has TWO anchors with the same id: an <a> wrapping the image
    // (empty text) and an <a> wrapping the name. Prefer the one WITH text so
    // we get the real event name, not an empty fallback.
    const anchorText = ((a as HTMLElement).innerText || "").replace(/\s+/g, " ").trim()
    const existing = byId.get(id)
    if (existing && anchorText.length < existing.name.length) continue

    // Walk up to the tightest card element: contains a date AND the anchor's
    // text, but NOT multiple dates (a container with 2+ cards would).
    let el: HTMLElement | null = a as HTMLElement
    let card: HTMLElement | null = null
    for (let i = 0; i < 8 && el; i++) {
      const text = (el.innerText || "").replace(/\s+/g, " ").trim()
      const singleCard =
        text.length > 20 &&
        anchorText.length > 0 &&
        text.includes(anchorText) &&
        dateRe.test(text) &&
        countDates(text) === 1
      if (singleCard) {
        card = el
        break
      }
      el = el.parentElement
    }
    if (!card) continue

    const text = (card.innerText || "").replace(/\s+/g, " ").trim()
    const name = anchorText || text.split(" ").slice(0, 8).join(" ")

    // Cover image: FB renders the photo inside the card's IMAGE anchor — a
    // SIBLING of the name anchor. The tightest single-date container found
    // above (from the name anchor) is the text block and does NOT contain the
    // img, so walk up until an ancestor does. Prefer real photos (scontent)
    // and ignore emoji/static/rsrc CDN urls ("1f3ad.png" etc.).
    let cover = ""
    let scope: HTMLElement | null = card
    for (let i = 0; i < 5 && scope; i++) {
      const img = scope.querySelector<HTMLImageElement>('img[src*="scontent"], img[src*="fbcdn"]')
      const src = img ? img.getAttribute("src") || "" : ""
      if (src && src.includes("scontent") && !src.includes("emoji")) {
        cover = src
        break
      }
      const bg = scope.querySelector<HTMLElement>("[style*='background-image']")
      if (bg) {
        const m2 = bg.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)
        if (m2 && m2[1] && /^https?:\/\//.test(m2[1]) && !m2[1].includes("emoji")) {
          cover = m2[1]
          break
        }
      }
      scope = scope.parentElement
    }

    byId.set(id, { name, text, cover, href })
  }

  return [...byId.entries()].map(([id, c]) => ({ id, ...c }))
}

export async function runSync(opts: SyncOptions): Promise<SyncResult> {
  const pb = new PocketBase(opts.pbUrl)
  await pb.collection("_superusers").authWithPassword(opts.pbEmail, opts.pbPassword)

  let settingsId: string | null = null
  let browser: Browser | null = null

  // Persist the outcome on the settings record so the dashboard always shows
  // the real state — including failures (expired session, FB block, ...).
  const persistStatus = async (status: string, error: string) => {
    if (!settingsId) return
    try {
      await pb.collection("facebook_settings").update(settingsId, {
        lastSyncAt: new Date().toISOString(),
        lastSyncStatus: status,
        lastSyncError: error,
      })
    } catch (err) {
      console.error("[events-sync] failed to persist sync status:", err)
    }
  }

  try {
    // ── Load config: page URL + cookies from the facebook_settings record ──
    let pageUrl = opts.pageUrl
    let cookies: CookieParam[] = []

    const settingsList = await pb.collection("facebook_settings").getFullList()
    const settings = settingsList[0]
    if (settings) {
      settingsId = settings.id
      if (!pageUrl) pageUrl = settings.pageUrl || undefined
      if (settings.cookiesFile) {
        const fileUrl = `${opts.pbUrl}/api/files/facebook_settings/${settings.id}/${settings.cookiesFile}`
        const res = await fetch(fileUrl, { headers: { Authorization: pb.authStore.token } })
        if (!res.ok) throw new Error(`Failed to download cookie file: HTTP ${res.status}`)
        try {
          const parsed = JSON.parse(await res.text())
          if (!Array.isArray(parsed)) throw new Error("Cookie file is not a JSON array")
          cookies = parsed as CookieParam[]
        } catch (err) {
          throw new Error(`Cookie file is not valid JSON: ${err instanceof Error ? err.message : err}`)
        }
      }
    }
    if (opts.cookiesJson) {
      cookies = JSON.parse(opts.cookiesJson) as CookieParam[]
    }
    if (!pageUrl) {
      throw new Error("No Facebook page URL configured (upload it in the dashboard or set FB_PAGE_URL)")
    }

    const chromePath = opts.chromePath ?? resolveChromePath()
    if (!chromePath) {
      throw new Error(
        "No Chrome/Chromium found. Set CHROME_PATH, install Chrome, or (on the server) use the events-sync Docker image.",
      )
    }

    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
      ],
    })

    const page = await browser.newPage()
    await page.setUserAgent(USER_AGENT)
    await page.setViewport({ width: 1280, height: 900 })
    if (cookies.length > 0) {
      // Normalize hand-made cookie exports: cookies without domain/url get the
      // page's host so page.setCookie doesn't throw.
      const host = new URL(pageUrl).hostname
      const normalized = cookies.map((c) => (c.domain || c.url ? c : { ...c, domain: host }))
      try {
        await page.setCookie(...normalized)
      } catch (err) {
        throw new Error(
          `Failed to apply cookies — check the JSON shape (each entry needs name+value): ${err instanceof Error ? err.message : err}`,
        )
      }
    }

    const url = `${pageUrl.replace(/\/+$/, "")}/events/?past=0`
    // Use domcontentloaded (not networkidle2): Facebook keeps the network busy
    // with polling, so networkidle2 often hits its timeout before the events
    // tab is usable. We wait for the actual event cards further down instead.
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: opts.timeoutMs ?? 60000 })

    // ── Login wall / block detection ────────────────────────────────────────
    const currentUrl = page.url()
    const bodyText = (await page.evaluate(() => document.body?.innerText || "")).slice(0, 8000)
    if (
      /login|checkpoint|two_step/i.test(currentUrl) ||
      /log in to see more|create new account|you must log in|confirm it's really you/i.test(bodyText)
    ) {
      const message =
        "Facebook session invalid or expired — upload fresh cookies in the dashboard (c_user, xs, sb, datr, fr)."
      await persistStatus("error", message)
      return { ok: false, events: [], error: message }
    }

    await page.waitForSelector('a[href*="/events/"]', { timeout: 30000 }).catch(() => {})

    // ── Capture the full events tab (Facebook lazy-loads more cards on scroll) ──
    // The most recent event is the top-left card; older cards only render after
    // scrolling. Collect cards in a loop, merging by FB event id, until two
    // consecutive scrolls add nothing new.
    const maxEvents = opts.maxEvents ?? 30
    const rawById = new Map<string, { id: string; name: string; text: string; cover: string; href: string }>()
    const collect = async () => {
      const cards = await page.evaluate(extractCardsFromDom)
      for (const c of cards) rawById.set(c.id, c)
    }
    const scrollStep = async () => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await new Promise((r) => setTimeout(r, 1200))
    }

    await collect()
    let stableScrolls = 0
    for (let i = 0; i < 25; i++) {
      // Stop as soon as we've collected the max number of events.
      if (rawById.size >= maxEvents) break
      const before = rawById.size
      await scrollStep()
      await collect()
      if (rawById.size === before) {
        stableScrolls++
        if (stableScrolls >= 2) break
      } else {
        stableScrolls = 0
      }
    }
    if (rawById.size >= maxEvents) {
      console.log(`[events-sync] reached max events cap (${maxEvents})`)
    }
    // Return to the top so the newest (top-left) card is visible again, then
    // collect one final time to make sure it's in the set.
    await page.evaluate(() => window.scrollTo(0, 0))
    await new Promise((r) => setTimeout(r, 800))
    await collect()

    if (opts.dumpHtml) {
      const html = await page.content()
      if (typeof Bun !== "undefined") {
        Bun.write("facebook-events-dump.html", html)
        console.log("[events-sync] dumped page HTML to facebook-events-dump.html")
      }
    }

    const events: ScrapedEvent[] = [...rawById.values()]
      .map((c) => {
        const parsed = parseStartTime(c.text, new Date())
        return {
          fbEventId: c.id,
          name: c.name,
          startTime: parsed.iso,
          placeName: extractPlace(c.text),
          coverUrl: c.cover || undefined,
          fbUrl: `https://www.facebook.com/events/${c.id}/`,
          past: parsed.past,
        }
      })
      .filter((e) => e.name.length > 0)

    // De-duplicate the scraped list by (date + title) — the same event can
    // appear more than once on the page under different FB event ids.
    const seenKeys = new Set<string>()
    const uniqueEvents: ScrapedEvent[] = []
    for (const e of events) {
      const key = eventKey(e.name, e.startTime)
      if (seenKeys.has(key)) continue
      seenKeys.add(key)
      uniqueEvents.push(e)
    }

    if (opts.dryRun) {
      return { ok: true, events }
    }

    // ── Upsert into PocketBase ──────────────────────────────────────────────
    // Match an existing event by FB id first, then by (date + title): Facebook
    // sometimes re-issues event ids, which used to create duplicates. Old events
    // are kept but marked as `past` — never deleted by a sync.
    const existing = await pb.collection("activiteiten").getFullList<{
      id: string
      fbEventId: string
      name: string
      startTime?: string
      past?: boolean
    }>()
    const byId = new Map<string, { id: string; fbEventId: string }>(
      existing.map((r) => [r.fbEventId, { id: r.id, fbEventId: r.fbEventId }]),
    )
    const byKey = new Map<string, { id: string; fbEventId: string }>()
    for (const r of existing) {
      // Manual events (no FB id) are never matched/adopted by the sync — an
      // admin-created event must not be converted into a synced one.
      if (!r.fbEventId) continue
      const k = eventKey(r.name, r.startTime)
      if (!byKey.has(k)) byKey.set(k, { id: r.id, fbEventId: r.fbEventId })
    }

    for (const ev of events) {
      const data = {
        fbEventId: ev.fbEventId,
        name: ev.name,
        startTime: ev.startTime ?? "",
        endTime: ev.endTime ?? "",
        description: ev.description ?? "",
        placeName: ev.placeName ?? "",
        coverUrl: ev.coverUrl ?? "",
        fbUrl: ev.fbUrl,
        past: ev.past ?? false,
      }
      // 1) exact FB id match
      let rec = byId.get(ev.fbEventId)
      // 2) same date + title already in the DB → update it and adopt its id
      if (!rec && ev.startTime) {
        rec = byKey.get(eventKey(ev.name, ev.startTime))
      }
      if (rec) {
        await pb.collection("activiteiten").update(rec.id, data)
        // Re-index so a later event with the same title/date or a changed id matches too.
        byId.set(ev.fbEventId, { id: rec.id, fbEventId: ev.fbEventId })
        byKey.set(eventKey(ev.name, ev.startTime), { id: rec.id, fbEventId: ev.fbEventId })
      } else {
        const created = await pb.collection("activiteiten").create<{ id: string }>(data)
        byId.set(ev.fbEventId, { id: created.id, fbEventId: ev.fbEventId })
        byKey.set(eventKey(ev.name, ev.startTime), { id: created.id, fbEventId: ev.fbEventId })
      }
    }

    // ── Dedupe loop ─────────────────────────────────────────────────────────
    // Remove duplicate records (same date + title) until none remain. Facebook
    // may have stored the same event twice under different ids in the past.
    for (let pass = 0; pass < 5; pass++) {
      const all = await pb.collection("activiteiten").getFullList<{
        id: string
        fbEventId: string
        name: string
        startTime?: string
        created?: string
      }>()
      const seen = new Map<string, (typeof all)[number]>()
      let removed = 0
      for (const rec of all) {
        // Never touch manual events (no FB id) — they are admin-created and
        // must not be removed because they happen to share a date + title.
        if (!rec.fbEventId) continue
        const k = eventKey(rec.name, rec.startTime)
        const prev = seen.get(k)
        if (!prev) {
          seen.set(k, rec)
          continue
        }
        const keep = betterRecord(prev, rec)
        const drop = keep.id === prev.id ? rec : prev
        await pb.collection("activiteiten").delete(drop.id)
        removed++
        seen.set(k, keep)
      }
      if (removed === 0) break
      console.log(`[events-sync] dedupe pass ${pass + 1}: removed ${removed} duplicate(s)`)
    }

    // Optional prune: drop stored *upcoming* events that vanished from the events
    // tab. Only when we actually got a list (protects against wiping data on a bad
    // scrape). Past events are never pruned — they stay as the "old" archive.
    if (opts.prune && events.length > 0) {
      // Re-fetch after the dedupe loop so records it deleted can't 404 here.
      const fresh = await pb.collection("activiteiten").getFullList<{
        id: string
        fbEventId: string
        name: string
        startTime?: string
        past?: boolean
      }>()
      const scrapedIds = new Set(events.map((e) => e.fbEventId))
      const scrapedKeys = new Set(events.map((e) => eventKey(e.name, e.startTime)))
      for (const rec of fresh) {
        // Manual events have no FB id and are never touched by the sync.
        if (!rec.fbEventId || rec.past) continue
        if (!scrapedIds.has(rec.fbEventId) && !scrapedKeys.has(eventKey(rec.name, rec.startTime))) {
          await pb.collection("activiteiten").delete(rec.id)
        }
      }
    }

    await persistStatus("ok", "")
    return { ok: true, events }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await persistStatus("error", message)
    return { ok: false, events: [], error: message }
  } finally {
    if (browser) await browser.close().catch(() => {})
  }
}

/** Best-effort venue extraction: the line after the date line, if it's short. */
function extractPlace(text: string): string | undefined {
  const dateIdx = text.search(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}\b|\b\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\b/i,
  )
  if (dateIdx === -1) return undefined
  const after = text.slice(dateIdx)
  const pieces = after.split(/\s{2,}| · /).map((s) => s.trim()).filter(Boolean)
  // After "SAT, MAY 24 AT 8:00 PM" we often get "Venue Name · Interested · 3"
  const joined = pieces.slice(1, 3).join(" ")
  const venue = joined.split(/·|\|/)[0].trim()
  if (!venue || venue.length > 60 || SKIP_LINES.test(venue)) return undefined
  return venue
}
