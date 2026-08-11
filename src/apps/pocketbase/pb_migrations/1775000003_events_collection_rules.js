/// <reference path="../pb_data/types.d.ts" />

// activiteiten: public read (mirrors sponsors), writes by admin/media, delete by admin
// facebook_settings: sensitive (session cookies) — admin only, all operations
migrate((app) => {
  const activiteiten = app.findCollectionByNameOrId("activiteiten")
  activiteiten.listRule   = ""
  activiteiten.viewRule   = ""
  activiteiten.createRule = "@request.auth.role = \"admin\" || @request.auth.role = \"media\""
  activiteiten.updateRule = "@request.auth.role = \"admin\" || @request.auth.role = \"media\""
  activiteiten.deleteRule = "@request.auth.role = \"admin\""
  app.save(activiteiten)

  const settings = app.findCollectionByNameOrId("facebook_settings")
  settings.listRule   = "@request.auth.role = \"admin\""
  settings.viewRule   = "@request.auth.role = \"admin\""
  settings.createRule = "@request.auth.role = \"admin\""
  settings.updateRule = "@request.auth.role = \"admin\""
  settings.deleteRule = "@request.auth.role = \"admin\""
  app.save(settings)
}, (app) => {
  const activiteiten = app.findCollectionByNameOrId("activiteiten")
  activiteiten.listRule   = null
  activiteiten.viewRule   = null
  activiteiten.createRule = null
  activiteiten.updateRule = null
  activiteiten.deleteRule = null
  app.save(activiteiten)

  const settings = app.findCollectionByNameOrId("facebook_settings")
  settings.listRule   = null
  settings.viewRule   = null
  settings.createRule = null
  settings.updateRule = null
  settings.deleteRule = null
  app.save(settings)
})
