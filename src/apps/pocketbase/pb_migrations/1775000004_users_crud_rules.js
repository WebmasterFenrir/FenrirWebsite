/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const col = app.findCollectionByNameOrId("users")
  // Previously only list/view/update rules were set; createRule and deleteRule
  // kept the built-in defaults (any authenticated user can register, only the
  // record owner can delete their own record). Admins manage users, so:
  col.createRule = '@request.auth.role = "admin"'
  col.deleteRule = '@request.auth.role = "admin"'
  return app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("users")
  // Restore the PocketBase built-in defaults for auth collections.
  col.createRule = ""
  col.deleteRule = "id = @request.auth.id"
  return app.save(col)
})
