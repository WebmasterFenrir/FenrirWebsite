/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const col = app.findCollectionByNameOrId("activiteiten")
  if (!col) throw new Error("activiteiten collection not found")

  if (!col.fields.find((f) => f.name === "past")) {
    col.fields.add(new BoolField({ name: "past", required: false }))
    app.save(col)
  }

  // Backfill: mark events that already started as old, so the website only
  // shows upcoming ones and old events are never deleted by the prune step.
  // Plain-JS date comparison — avoids the Go types API, which differs across
  // PocketBase versions ($types vs types vs require).
  const records = app.findRecordsByFilter("activiteiten", "id != ''")
  const toSave = []
  for (const r of records) {
    const startStr = r.getString("startTime")
    if (startStr) {
      const start = new Date(startStr)
      if (!Number.isNaN(start.getTime()) && start.getTime() < Date.now()) {
        r.set("past", true)
        toSave.push(r)
      }
    }
  }
  // NOTE: app.saveAll() does not exist in this PocketBase version — loop save().
  for (const r of toSave) app.save(r)
}, (app) => {
  const col = app.findCollectionByNameOrId("activiteiten")
  if (col) {
    col.fields.removeByName("past")
    app.save(col)
  }
})
