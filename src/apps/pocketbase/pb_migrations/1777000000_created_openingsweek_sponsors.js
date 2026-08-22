/// <reference path="../pb_data/types.d.ts" />

// Openingsweek sponsor — the sponsors featured during the opening week of the
// academic year. Admins set an activation date and an ending date in the
// dashboard; the website shows the active ones above the year-round sponsors.
// Mirrors the `sponsors` collection (name, content, imageFile, url) plus
// locale-aware translation (content_en) handled by the translate hook.
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text8347120095",
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
        "id": "text4917208366",
        "max": 0,
        "min": 0,
        "name": "name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "json7720193458",
        "maxSize": 0,
        "name": "content",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json3388172401",
        "maxSize": 0,
        "name": "content_en",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "text5502187743",
        "max": 0,
        "min": 0,
        "name": "url",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "file7710943382",
        "maxSelect": 1,
        "maxSize": 5242880,
        "mimeTypes": ["image/jpeg", "image/png", "image/webp", "image/gif"],
        "name": "imageFile",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "file"
      },
      {
        "hidden": false,
        "id": "date5519873304",
        "max": "",
        "min": "",
        "name": "activationDate",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "date2210938479",
        "max": "",
        "min": "",
        "name": "endDate",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "bool6620391180",
        "name": "active",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      }
    ],
    "id": "pbc_8847200931",
    "indexes": [],
    "listRule": null,
    "name": "openingsweek_sponsors",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_8847200931");

  return app.delete(collection);
})
