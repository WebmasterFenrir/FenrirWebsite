/// <reference path="../pb_data/types.d.ts" />

// `leden` — manual field editing.
//
// The board adds members by hand ("Add lid") and needs to fill in / correct
// their fields later (e.g. more info about a person arrives). Create is
// already admin/media; update was admin-only, so media could add a member but
// never touch it again. Relax update to match create (admin || media).
migrate((app) => {
  const col = app.findCollectionByNameOrId("leden")
  if (!col) throw new Error("leden collection not found")

  col.updateRule = '@request.auth.role = "admin" || @request.auth.role = "media"'

  return app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("leden")
  if (!col) return

  col.updateRule = '@request.auth.role = "admin"'

  return app.save(col)
})
