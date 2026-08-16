/// <reference path="../pb_data/types.d.ts" />

// form_submissions: let ANY authenticated user read responses so viewers can
// see the form results in the dashboard. Create stays public (the form site is
// unauthenticated), update stays null, delete stays admin-only.
migrate((app) => {
  const col = app.findCollectionByNameOrId("form_submissions")
  if (!col) throw new Error("form_submissions collection not found")

  col.listRule = '@request.auth.id != ""'
  col.viewRule = '@request.auth.id != ""'

  return app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("form_submissions")
  if (!col) return

  col.listRule =
    '@request.auth.role = "admin" || @request.auth.role = "media" || @request.auth.role = "formmanager"'
  col.viewRule =
    '@request.auth.role = "admin" || @request.auth.role = "media" || @request.auth.role = "formmanager"'

  return app.save(col)
})
