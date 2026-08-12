/// <reference path="../pb_data/types.d.ts" />

// `form_rate_limits` — anti-spam counter used by pb_hooks/forms.pb.js.
//
// The hook originally planned an in-memory map, but PocketBase's JSVM runs
// handlers in an isolated context where module-level state is not reachable
// (ReferenceError), so the limiter needs durable storage. On every valid
// submission the hook deletes stale rows (older than 1h) for that form+IP,
// counts the rest and stores a new row when under the limit.
//
// All rules are null — the collection is only ever touched by the hook via
// $app (superuser context). Rows cascade-delete with their form.
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
        "cascadeDelete": true,
        "collectionId": "pbc_8234567890",
        "hidden": false,
        "id": "relation1776000301",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "form",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1776000302",
        "max": 64,
        "min": 0,
        "name": "ip",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "autodate1776000303",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_8234567892",
    "indexes": [],
    "listRule": null,
    "name": "form_rate_limits",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_8234567892");

  return app.delete(collection);
})
