/// <reference path="../pb_data/types.d.ts" />

// Activiteiten: support manually created events alongside the Facebook-synced
// ones. fbEventId becomes optional (manual events have none), the unique index
// on it is dropped (multiple manual events share the empty value), and events
// get a category relation, an active flag and an optional uploaded image.
migrate((app) => {
  const col = app.findCollectionByNameOrId("activiteiten")
  if (!col) throw new Error("activiteiten collection not found")

  // fbEventId: required -> optional. Passing the existing field id makes
  // fields.add() REPLACE it in place, so the schema sync treats this as an
  // update and the stored values are preserved.
  if (col.fields.getByName("fbEventId")) {
    col.fields.add(new TextField({
      id: "text7104912273",
      name: "fbEventId",
      required: false,
      hidden: false,
      max: 0,
      min: 0,
      pattern: "",
      presentable: false,
      primaryKey: false,
      system: false,
    }))
  }

  // Drop the unique index on fbEventId — manual events store an empty value.
  col.indexes = (col.indexes || []).filter((idx) => !idx.includes("idx_activiteiten_fbEventId"))

  if (!col.fields.getByName("category")) {
    const catCol = app.findCollectionByNameOrId("event_categories")
    col.fields.add(new RelationField({
      name: "category",
      collectionId: catCol.id,
      maxSelect: 1,
      minSelect: 0,
      required: false,
      cascadeDelete: false,
    }))
  }

  if (!col.fields.getByName("active")) {
    col.fields.add(new BoolField({ name: "active", required: false }))
  }

  if (!col.fields.getByName("imageFile")) {
    col.fields.add(new FileField({
      name: "imageFile",
      maxSelect: 1,
      maxSize: 5242880,
      mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      required: false,
    }))
  }

  app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("activiteiten")
  if (!col) return

  // Restore required fbEventId (same id -> in-place update, data preserved).
  col.fields.add(new TextField({
    id: "text7104912273",
    name: "fbEventId",
    required: true,
    hidden: false,
    max: 0,
    min: 0,
    pattern: "",
    presentable: false,
    primaryKey: false,
    system: false,
  }))

  // Restore the unique index.
  if (!(col.indexes || []).some((idx) => idx.includes("idx_activiteiten_fbEventId"))) {
    col.indexes = [...(col.indexes || []), "CREATE UNIQUE INDEX `idx_activiteiten_fbEventId` ON `activiteiten` (`fbEventId`)"]
  }

  col.fields.removeByName("category")
  col.fields.removeByName("active")
  col.fields.removeByName("imageFile")

  app.save(col)
})
