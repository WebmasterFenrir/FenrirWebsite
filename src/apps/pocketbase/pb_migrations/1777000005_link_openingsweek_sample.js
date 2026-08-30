/// <reference path="../pb_data/types.d.ts" />

// Link any opening week sponsor that isn't attached to a week yet (e.g. the
// sample seeded by 1777000001) to a week of the latest preasidium year — the
// same "latest year" the website shows, matching the leden tab. Fresh installs
// get a week + linked sample sponsor so the section is visible out of the box.
migrate((app) => {
  const years = app.findRecordsByFilter("preasidium_years", "id != ''", "-yearId")
  if (years.length === 0) {
    console.warn("[seed] no preasidium years found — skipping openingsweek sample link")
    return
  }
  const latestYear = years[0]

  let week = app.findRecordsByFilter("openingsweek_weken", `preasidium = "${latestYear.id}"`)[0]
  if (!week) {
    const weeksCol = app.findCollectionByNameOrId("openingsweek_weken")
    week = new Record(weeksCol, {
      preasidium: latestYear.id,
      // Wide window so the sample stays visible; admins set real dates via the dashboard.
      startDate: "2024-01-01 00:00:00.000Z",
      endDate:   "2030-12-31 23:59:59.999Z",
    })
    app.save(week)
  }

  const all = app.findRecordsByFilter("openingsweek_sponsors", "id != ''")
  for (const r of all) {
    if (!r.get("week")) {
      r.set("week", week.id)
      app.save(r)
    }
  }
}, (app) => {
  // Best-effort rollback: remove weeks that ended up with no sponsors.
  const weeks = app.findRecordsByFilter("openingsweek_weken", "id != ''")
  for (const w of weeks) {
    const children = app.findRecordsByFilter("openingsweek_sponsors", `week = "${w.id}"`)
    if (children.length === 0) app.delete(w)
  }
})
