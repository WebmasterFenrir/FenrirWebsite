/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users")

  collection.fields.add({
    "id": "select_role",
    "type": "select",
    "name": "role",
    "presentable": false,
    "required": false,
    "system": false,
    "hidden": false,
    "maxSelect": 1,
    "values": ["admin", "media", "viewer"]
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("users")

  collection.fields.removeById("select_role")

  return app.save(collection)
})
