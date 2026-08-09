/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const col = app.findCollectionByNameOrId("users")
  col.listRule   = '@request.auth.role = "admin"'
  col.viewRule   = '@request.auth.role = "admin" || @request.auth.id = id'
  col.updateRule = '@request.auth.role = "admin" || @request.auth.id = id'
  return app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("users")
  col.listRule   = null
  col.viewRule   = '@request.auth.id = id'
  col.updateRule = '@request.auth.id = id'
  return app.save(col)
})
