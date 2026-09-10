/// <reference path="../pb_data/types.d.ts" />

// Site-wide settings, editable from the dashboard. Holds the hero image that
// overrides the build-time fallback `public/images/hero.jpg`. The `key` field
// marks a single "site" record (one row, upserted on save).
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.role = \"admin\" || @request.auth.role = \"media\"",
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
        "id": "text1189503102",
        "max": 0,
        "min": 0,
        "name": "key",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "unique": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "file5482271903",
        "maxSelect": 1,
        "maxSize": 10485760,
        "mimeTypes": ["image/jpeg", "image/png", "image/webp", "image/gif"],
        "name": "heroImage",
        "presentable": false,
        "protected": false,
        "required": false,
        "system": false,
        "thumbs": null,
        "type": "file"
      }
    ],
    "id": "pbc_9051226734",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_unique_site_key` ON `site_settings` (`key`)"
    ],
    "listRule": "",
    "name": "site_settings",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.role = \"admin\" || @request.auth.role = \"media\"",
    "viewRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_9051226734");

  return app.delete(collection);
})