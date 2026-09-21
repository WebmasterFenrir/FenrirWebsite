import { describe, test, expect } from "bun:test"
import { parseStartTime, eventKey } from "./sync"

const NOW = new Date("2026-08-10T12:00:00Z")

describe("eventKey — event identity (#97)", () => {
  test("an fbEventId IS the identity, regardless of title or date", () => {
    // Same title, different years/ids → different events, never merged.
    expect(eventKey("Cantus", "2024-11-14T20:00:00.000Z", "111")).not.toBe(
      eventKey("Cantus", "2026-11-14T20:00:00.000Z", "222"),
    )
    // Same id → same event, even if the stored title/date drifted.
    expect(eventKey("Cantus", "2026-11-14T20:00:00.000Z", "111")).toBe(
      eventKey("cantus  ", "2025-01-01T00:00:00.000Z", "111"),
    )
  })

  test("key form is prefixed: id:… for FB events, t:… for manual ones", () => {
    expect(eventKey("Cantus", "2026-11-14T20:00:00.000Z", "111")).toBe("id:111")
    expect(eventKey("Cantus", "2026-11-14T20:00:00.000Z")).toBe("t:2026-11-14|cantus")
  })

  test("manual events without a date fall back to title only", () => {
    expect(eventKey("Cantus")).toBe(eventKey("  cantus ", undefined))
    expect(eventKey("Cantus")).not.toBe(eventKey("Cantus", "2026-11-14T20:00:00.000Z"))
  })

  test("titles are normalized (case + whitespace) for manual events", () => {
    expect(eventKey("Thé  Cantus", "2026-11-14T20:00:00.000Z")).toBe(
      eventKey("thé cantus", "2026-11-14T20:00:00.000Z"),
    )
  })
})

describe("parseStartTime — explicit years", () => {
  test("keeps an explicit past year as past (regression: Nov 2020 must stay 2020)", () => {
    const r = parseStartTime("SAT, NOV 14, 2020 AT 8:00 PM", NOW)
    expect(r.past).toBe(true)
    expect(r.iso).toBe("2020-11-14T20:00:00.000Z")
  })

  test("keeps an explicit past year in the past for Dutch day-month format", () => {
    const r = parseStartTime("zaterdag 14 november 2020 om 20:00", NOW)
    expect(r.past).toBe(true)
    expect(r.iso).toBe("2020-11-14T20:00:00.000Z")
  })

  test("uses an explicit future year as-is", () => {
    const r = parseStartTime("SAT, NOV 14, 2027 AT 8:00 PM", NOW)
    expect(r.past).toBe(false)
    expect(r.iso).toBe("2027-11-14T20:00:00.000Z")
  })
})

describe("parseStartTime — Dutch months (FB page is in Dutch)", () => {
  test("mei (May) parses", () => {
    const r = parseStartTime("vr, 22 mei Vrienden en familie cantus", NOW)
    expect(r.iso).toBe("2026-05-22T20:00:00.000Z")
    expect(r.past).toBe(true)
  })

  test("mrt. (March) parses", () => {
    const r = parseStartTime("do, 5 mrt. Fenrir's Emo Party", NOW)
    expect(r.iso).toBe("2026-03-05T20:00:00.000Z")
    expect(r.past).toBe(true)
  })

  test("okt. (October) parses and rolls to next year when nearer", () => {
    const r = parseStartTime("za, 24 okt. Fenrir Cantus", NOW)
    expect(r.iso).toBe("2026-10-24T20:00:00.000Z")
    expect(r.past).toBe(false)
  })

  test("full Dutch month names parse", () => {
    const r = parseStartTime("zaterdag 14 november 2026 om 20:00", NOW)
    expect(r.past).toBe(false)
    expect(r.iso).toBe("2026-11-14T20:00:00.000Z")
  })
})

describe("parseStartTime — street/postal-code false positives", () => {
  test("does NOT read 'Grote Markt 42, 2000 Antwerpen' as a date", () => {
    const r = parseStartTime("do, 12 feb. Fen zoekt Rir Grote Markt 42, 2000 Antwerpen", NOW)
    expect(r.iso).toBe("2026-02-12T20:00:00.000Z")
    expect(r.past).toBe(true)
  })

  test("does NOT read 'Markt 42, 2000' when it is the only text (no real date)", () => {
    const r = parseStartTime("Fenrir Party Grote Markt 42, 2000 Antwerpen", NOW)
    expect(r.iso).toBeUndefined()
  })
})

describe("parseStartTime — no year in card", () => {
  test("upcoming date without year stays in the current year", () => {
    const r = parseStartTime("SAT, NOV 14 AT 8:00 PM", NOW)
    expect(r.past).toBe(false)
    expect(r.iso).toBe("2026-11-14T20:00:00.000Z")
  })

  test("just-passed date without year is marked past this year", () => {
    const r = parseStartTime("SAT, JUL 25 AT 8:00 PM", NOW)
    expect(r.past).toBe(true)
    expect(r.iso).toBe("2026-07-25T20:00:00.000Z")
  })

  test("date far in the past without a year rolls to next year", () => {
    const r = parseStartTime("SAT, JAN 15 AT 8:00 PM", NOW)
    expect(r.past).toBe(false)
    expect(r.iso).toBe("2027-01-15T20:00:00.000Z")
  })
})

describe("parseStartTime — relative day labels", () => {
  test("vandaag (today) parses", () => {
    const r = parseStartTime("vandaag om 20:00 Fenrir Feestje", NOW)
    expect(r.iso).toBe("2026-08-10T20:00:00.000Z")
    expect(r.past).toBe(false)
  })

  test("morgen (tomorrow) parses", () => {
    const r = parseStartTime("morgen om 20:00 Fenrir Feestje", NOW)
    expect(r.iso).toBe("2026-08-11T20:00:00.000Z")
    expect(r.past).toBe(false)
  })
})

describe("parseStartTime — time handling", () => {
  test("24h-style time without am/pm", () => {
    const r = parseStartTime("zaterdag 14 november 2026 om 20:00", NOW)
    expect(r.past).toBe(false)
    expect(r.iso).toBe("2026-11-14T20:00:00.000Z")
  })

  test("defaults to 20:00 when no time is present", () => {
    const r = parseStartTime("SAT, NOV 14", NOW)
    expect(r.iso).toBe("2026-11-14T20:00:00.000Z")
  })

  test("invalid day (42) is rejected", () => {
    const r = parseStartTime("do, 42 feb. Something", NOW)
    expect(r.iso).toBeUndefined()
  })
})
