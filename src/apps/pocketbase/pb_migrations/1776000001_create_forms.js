/// <reference path="../pb_data/types.d.ts" />

// `forms` — the form definitions managed from the dashboard.
//
// The `code` is the public URL slug (form.fenrirclub.be/{code}); a unique index
// keeps it collision-free. `fields` holds the JSON field schema. The form
// definitions contain no sensitive data — the code is the secret — so reads
// are public (the form site fetches them server-side).
//
// Rules: public read, write by admin/media/formmanager, delete by admin.
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.role = \"admin\" || @request.auth.role = \"media\" || @request.auth.role = \"formmanager\"",
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
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1776000101",
        "max": 0,
        "min": 0,
        "name": "code",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1776000102",
        "max": 0,
        "min": 0,
        "name": "title",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1776000103",
        "max": 0,
        "min": 0,
        "name": "description",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "bool1776000104",
        "name": "multiLanguage",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "bool1776000105",
        "name": "active",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "json1776000106",
        "maxSize": 0,
        "name": "fields",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1776000107",
        "max": 0,
        "min": 0,
        "name": "hook",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation1776000108",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "createdBy",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "autodate1776000109",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate1776000110",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_8234567890",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_forms_code` ON `forms` (`code`)"
    ],
    "listRule": "",
    "name": "forms",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.role = \"admin\" || @request.auth.role = \"media\" || @request.auth.role = \"formmanager\"",
    "viewRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_8234567890");

  return app.delete(collection);
})
