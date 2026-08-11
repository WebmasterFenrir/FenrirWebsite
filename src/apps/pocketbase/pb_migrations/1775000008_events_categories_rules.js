/// <reference path="../pb_data/types.d.ts" />

// event_categories: public read, writes by admin/media, delete by admin.
// (Created with null write rules in 1775000006; the dashboard uses normal
// users-auth, so admin/media users need these rules to manage categories.)
migrate((app) => {
  const categories = app.findCollectionByNameOrId("event_categories")
  categories.listRule   = ""
  categories.viewRule   = ""
  categories.createRule = "@request.auth.role = \"admin\" || @request.auth.role = \"media\""
  categories.updateRule = "@request.auth.role = \"admin\" || @request.auth.role = \"media\""
  categories.deleteRule = "@request.auth.role = \"admin\""
  app.save(categories)
}, (app) => {
  const categories = app.findCollectionByNameOrId("event_categories")
  categories.createRule = null
  categories.updateRule = null
  categories.deleteRule = null
  app.save(categories)
})
