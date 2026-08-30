/// <reference path="../pb_data/types.d.ts" />

// The openingsweek collections were created without the standard created/updated
// autodate fields, so any `sort=created` request (used by the dashboard and the
// website to order the sponsors of a week) failed with a 400. Add them back.
migrate((app) => {
  for (const name of ["openingsweek_sponsors", "openingsweek_weken"]) {
    const col = app.findCollectionByNameOrId(name)
    if (!col) continue

    if (!col.fields.getByName("created")) {
      col.fields.add(new AutodateField({
        id: "autodate7700000100",
        name: "created",
        onCreate: true,
        onUpdate: false,
        system: false,
      }))
    }
    if (!col.fields.getByName("updated")) {
      col.fields.add(new AutodateField({
        id: "autodate7700000101",
        name: "updated",
        onCreate: true,
        onUpdate: true,
        system: false,
      }))
    }

    app.save(col)
  }
}, (app) => {
  for (const name of ["openingsweek_sponsors", "openingsweek_weken"]) {
    const col = app.findCollectionByNameOrId(name)
    if (!col) continue

    col.fields.removeByName("created")
    col.fields.removeByName("updated")
    app.save(col)
  }
})
