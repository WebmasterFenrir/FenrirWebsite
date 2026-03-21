/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
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
        "collectionId": "pbc_1453294312",
        "hidden": false,
        "id": "relation1080860409",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "lid",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_2664542398",
        "hidden": false,
        "id": "relation3145888567",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "year",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_2356340731",
        "hidden": false,
        "id": "relation1466534506",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "role",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      }
    ],
    "id": "pbc_1762971516",
    "indexes": [],
    "listRule": null,
    "name": "preasidium_jaar_functies",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1762971516");

  return app.delete(collection);
})
