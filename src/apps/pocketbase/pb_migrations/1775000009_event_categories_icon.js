/// <reference path="../pb_data/types.d.ts" />

// event_categories: emoji -> icon. The "Wat doen wij" cards on the website now
// use lucide icons (like the homepage) instead of emojis, so the field stores
// a lucide icon name (e.g. "PartyPopper"). Rename happens in place via the
// original field id; seeded values are replaced with the matching icon names.
migrate((app) => {
  const col = app.findCollectionByNameOrId("event_categories")
  if (!col) throw new Error("event_categories collection not found")

  if (col.fields.getByName("emoji")) {
    col.fields.add(new TextField({
      id: "text7123456789", // original emoji field id -> in-place rename
      name: "icon",
      required: false,
      hidden: false,
      max: 0,
      min: 0,
      pattern: "",
      presentable: false,
      primaryKey: false,
      system: false,
    }))
    app.save(col)
  }

  // The icons that were hardcoded before categories became data:
  // TD's & feestjes -> PartyPopper, Cantussen -> Music, Sport -> Trophy,
  // Cultuur & ontspanning -> Film, Ledenweekend -> Tent.
  const ICONS = {
    "TD's & feestjes": "PartyPopper",
    "Cantussen": "Music",
    "Sport": "Trophy",
    "Cultuur & ontspanning": "Film",
    "Ledenweekend": "Tent",
  }
  const records = app.findRecordsByFilter("event_categories", "id != ''")
  const toSave = []
  for (const r of records) {
    const icon = ICONS[r.getString("name")]
    if (icon) {
      r.set("icon", icon)
      toSave.push(r)
    }
  }
  for (const r of toSave) app.save(r)
}, (app) => {
  const col = app.findCollectionByNameOrId("event_categories")
  if (!col) return

  if (col.fields.getByName("icon")) {
    col.fields.add(new TextField({
      id: "text7123456789",
      name: "emoji",
      required: false,
      hidden: false,
      max: 0,
      min: 0,
      pattern: "",
      presentable: false,
      primaryKey: false,
      system: false,
    }))
    app.save(col)
  }

  // Restore the original emoji values.
  const EMOJIS = {
    "TD's & feestjes": "🎉",
    "Cantussen": "🎵",
    "Sport": "🏀",
    "Cultuur & ontspanning": "🍿",
    "Ledenweekend": "🏕️",
  }
  const records = app.findRecordsByFilter("event_categories", "id != ''")
  const toSave = []
  for (const r of records) {
    const emoji = EMOJIS[r.getString("name")]
    if (emoji) {
      r.set("emoji", emoji)
      toSave.push(r)
    }
  }
  for (const r of toSave) app.save(r)
})
