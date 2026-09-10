/// <reference path="../pb_data/types.d.ts" />

// Opening week sponsors: the activation window moved from the individual
// sponsor to its parent week (openingsweek_weken). Remove the per-sponsor
// dates and link every sponsor to exactly one week.
migrate((app) => {
  const col = app.findCollectionByNameOrId("openingsweek_sponsors")
  if (!col) throw new Error("openingsweek_sponsors collection not found")

  if (col.fields.getByName("activationDate")) {
    col.fields.removeByName("activationDate")
  }
  if (col.fields.getByName("endDate")) {
    col.fields.removeByName("endDate")
  }

  if (!col.fields.getByName("week")) {
    col.fields.add(new RelationField({
      id: "relation7700000004",
      name: "week",
      collectionId: "pbc_9777030003", // openingsweek_weken
      maxSelect: 1,
      minSelect: 0,
      required: true,
      cascadeDelete: true,
    }))
  }

  app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("openingsweek_sponsors")
  if (!col) return

  col.fields.removeByName("week")

  // Restore the per-sponsor window fields (same ids -> data preserved).
  col.fields.add(new DateField({
    id: "date5519873304",
    name: "activationDate",
    required: true,
  }))
  col.fields.add(new DateField({
    id: "date2210938479",
    name: "endDate",
    required: true,
  }))

  app.save(col)
})
