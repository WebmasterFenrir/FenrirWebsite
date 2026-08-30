/// <reference path="../pb_data/types.d.ts" />

// openingsweek_sponsors: public read, writes by admin/media, delete by admin.
// (Created with null rules in 1777000000; the dashboard uses normal
// users-auth, so admin/media users need these rules to manage the opening
// week sponsors, and the website needs public read to load the images.)
migrate((app) => {
  const col = app.findCollectionByNameOrId("openingsweek_sponsors")
  col.listRule   = ""
  col.viewRule   = ""
  col.createRule = "@request.auth.role = \"admin\" || @request.auth.role = \"media\""
  col.updateRule = "@request.auth.role = \"admin\" || @request.auth.role = \"media\""
  col.deleteRule = "@request.auth.role = \"admin\""
  app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("openingsweek_sponsors")
  col.listRule   = null
  col.viewRule   = null
  col.createRule = null
  col.updateRule = null
  col.deleteRule = null
  app.save(col)
})
