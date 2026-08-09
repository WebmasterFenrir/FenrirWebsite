/// <reference path="../pb_data/types.d.ts" />

const COLLECTIONS = [
  "preasidium_leden",
  "preasidium_rollen",
  "preasidium_years",
  "preasidium_jaar_functies",
  "sponsors",
]

const READ_RULE   = "@request.auth.id != \"\""
const WRITE_RULE  = "@request.auth.role = \"admin\" || @request.auth.role = \"media\""
const DELETE_RULE = "@request.auth.role = \"admin\""

migrate((app) => {
  for (const name of COLLECTIONS) {
    const col = app.findCollectionByNameOrId(name)
    col.listRule   = READ_RULE
    col.viewRule   = READ_RULE
    col.createRule = WRITE_RULE
    col.updateRule = WRITE_RULE
    col.deleteRule = DELETE_RULE
    app.save(col)
  }
}, (app) => {
  for (const name of COLLECTIONS) {
    const col = app.findCollectionByNameOrId(name)
    col.listRule   = null
    col.viewRule   = null
    col.createRule = null
    col.updateRule = null
    col.deleteRule = null
    app.save(col)
  }
})
