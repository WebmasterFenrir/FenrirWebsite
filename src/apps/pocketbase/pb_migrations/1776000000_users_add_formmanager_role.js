/// <reference path="../pb_data/types.d.ts" />

// Extend users.role with a "formmanager" role: can manage forms (and view
// their submissions) but not other dashboard resources.
// In-place update: re-add a SelectField with the SAME id so the schema sync
// treats it as an update and the stored role values are preserved.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users")
  const roleField = collection.fields.getByName("role")
  if (!roleField) {
    throw new Error("users.role field not found — did 1774030000_users_add_role.js apply?")
  }

  collection.fields.add(new SelectField({
    id: roleField.id,
    name: "role",
    required: false,
    maxSelect: 1,
    values: ["admin", "media", "viewer", "formmanager"],
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("users")
  const roleField = collection.fields.getByName("role")
  if (!roleField) return

  collection.fields.add(new SelectField({
    id: roleField.id,
    name: "role",
    required: false,
    maxSelect: 1,
    values: ["admin", "media", "viewer"],
  }))

  return app.save(collection)
})
