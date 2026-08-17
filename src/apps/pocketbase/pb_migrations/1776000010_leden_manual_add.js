/// <reference path="../pb_data/types.d.ts" />

// `leden` — manual member registry additions.
//
// The board needs to add members by hand from the dashboard ("add lid"
// button), without a "Lid worden" form submission behind them. So:
//   - `createRule` goes from null (hook-only) to admin/media, so the
//     dashboard can create rows directly.
//   - `source` (relation → form_submissions) becomes optional: manual rows
//     have no submission behind them. Form-derived rows keep linking back.
migrate((app) => {
  const col = app.findCollectionByNameOrId("leden")
  if (!col) throw new Error("leden collection not found")

  col.createRule = '@request.auth.role = "admin" || @request.auth.role = "media"'

  const source = col.fields.find((f) => f.name === "source")
  if (source) {
    source.required = false
    source.minSelect = 0
  }

  return app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("leden")
  if (!col) return

  col.createRule = null

  const source = col.fields.find((f) => f.name === "source")
  if (source) {
    source.required = true
    source.minSelect = 1
  }

  return app.save(col)
})
