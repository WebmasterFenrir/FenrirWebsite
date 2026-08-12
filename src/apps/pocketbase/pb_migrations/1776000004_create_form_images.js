/// <reference path="../pb_data/types.d.ts" />

// `form_images` — uploaded images for image fields of forms.
//
// Image fields live inside the form's `fields` JSON as an `imageUrl` string.
// Uploads are stored here (a file per record) and the dashboard resolves the
// file URL into the field's imageUrl after saving the form. Rows cascade-delete
// with their form; replaced/removed images are deleted by the dashboard.
//
// Rules: public read (the public form site renders <img> from the resolved
// URL), create+delete by admin/media/formmanager (the dashboard cleans up
// replaced/removed uploads as the logged-in user).
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.role = \"admin\" || @request.auth.role = \"media\" || @request.auth.role = \"formmanager\"",
    "deleteRule": "@request.auth.role = \"admin\" || @request.auth.role = \"media\" || @request.auth.role = \"formmanager\"",
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
        "id": "relation1776000401",
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
        "id": "text1776000402",
        "max": 64,
        "min": 0,
        "name": "fieldId",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "file1776000403",
        "maxSelect": 1,
        "maxSize": 5242880,
        "mimeTypes": ["image/jpeg", "image/png", "image/webp", "image/gif"],
        "name": "file",
        "presentable": false,
        "protected": false,
        "required": false,
        "system": false,
        "thumbs": null,
        "type": "file"
      },
      {
        "hidden": false,
        "id": "autodate1776000404",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate1776000405",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_8234567893",
    "indexes": [],
    "listRule": "",
    "name": "form_images",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_8234567893");

  return app.delete(collection);
})
