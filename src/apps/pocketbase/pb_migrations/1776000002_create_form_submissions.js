/// <reference path="../pb_data/types.d.ts" />

// `form_submissions` — answers stored per form.
//
// Creating is open to ANYONE (the public form site is unauthenticated); the
// anti-spam + validation guard lives in pb_hooks/forms.pb.js. Reading the
// responses requires admin/media/formmanager (the dashboard responses view).
migrate((app) => {
  const collection = new Collection({
    "createRule": "",
    "deleteRule": "@request.auth.role = \"admin\"",
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
        "id": "relation1776000201",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "form",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "json1776000202",
        "maxSize": 0,
        "name": "answers",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "autodate1776000203",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate1776000204",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_8234567891",
    "indexes": [],
    "listRule": "@request.auth.role = \"admin\" || @request.auth.role = \"media\" || @request.auth.role = \"formmanager\"",
    "name": "form_submissions",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": "@request.auth.role = \"admin\" || @request.auth.role = \"media\" || @request.auth.role = \"formmanager\""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_8234567891");

  return app.delete(collection);
})
