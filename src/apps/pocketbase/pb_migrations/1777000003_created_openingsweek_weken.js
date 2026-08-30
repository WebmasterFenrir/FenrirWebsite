/// <reference path="../pb_data/types.d.ts" />

// Openingsweek week — one entry per preasidium year, holding the week window
// (start/end date) during which the opening week sponsors are shown on the
// website. The sponsors themselves are children in `openingsweek_sponsors`,
// linked via the `week` relation.
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.role = \"admin\" || @request.auth.role = \"media\"",
    "deleteRule": "@request.auth.role = \"admin\"",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text7700000000",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_2664542398",
        "hidden": false,
        "id": "relation7700000001",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "preasidium",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "date7700000002",
        "max": "",
        "min": "",
        "name": "startDate",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "date7700000003",
        "max": "",
        "min": "",
        "name": "endDate",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "date"
      }
    ],
    "id": "pbc_9777030003",
    "indexes": [],
    "listRule": "",
    "name": "openingsweek_weken",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.role = \"admin\" || @request.auth.role = \"media\"",
    "viewRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_9777030003");

  return app.delete(collection);
})
