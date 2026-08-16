/// <reference path="../pb_data/types.d.ts" />

// `leden` — the member registry (who is "lid").
//
// Rows are derived from "Lid worden" form submissions by the `inschrijvingen`
// processing hook (pb_hooks/forms.pb.js) — members never log in, so this is a
// plain base collection of personal data for the board only.
//
// - `year` is a relation to `preasidium_years` (same year collection the
//   preasidium uses; the hook stamps the newest/active year).
// - `source` is a relation to `form_submissions` with cascadeDelete, so
//   deleting a submission removes its derived member row.
// - All personal-data reads (list/view) are gated to admin || media; create is
//   null (only the hook creates, bypassing rules via $app.save); update/delete
//   are admin-only.
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
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
        "cascadeDelete": false,
        "collectionId": "pbc_2664542398",
        "hidden": false,
        "id": "relation1776000801",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "year",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1776000802",
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
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1776000803",
        "max": 0,
        "min": 0,
        "name": "email",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1776000804",
        "max": 0,
        "min": 0,
        "name": "phone",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1776000805",
        "max": 0,
        "min": 0,
        "name": "birthdate",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1776000806",
        "max": 0,
        "min": 0,
        "name": "language",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1776000807",
        "max": 0,
        "min": 0,
        "name": "kdg_student",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1776000808",
        "max": 0,
        "min": 0,
        "name": "student_number",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1776000809",
        "max": 0,
        "min": 0,
        "name": "richting",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1776000810",
        "max": 0,
        "min": 0,
        "name": "sport_event",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1776000811",
        "max": 0,
        "min": 0,
        "name": "student_doop",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1776000812",
        "max": 0,
        "min": 0,
        "name": "payment_method",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": true,
        "collectionId": "pbc_8234567891",
        "hidden": false,
        "id": "relation1776000813",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "source",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "autodate1776000814",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_9234567890",
    "indexes": [],
    "listRule": "@request.auth.role = \"admin\" || @request.auth.role = \"media\"",
    "name": "leden",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.role = \"admin\"",
    "viewRule": "@request.auth.role = \"admin\" || @request.auth.role = \"media\""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_9234567890");

  return app.delete(collection);
})
