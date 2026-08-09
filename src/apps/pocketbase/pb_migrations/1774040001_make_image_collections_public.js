/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  for (const name of ["preasidium_leden", "sponsors"]) {
    const col = app.findCollectionByNameOrId(name)
    if (col) {
      col.listRule = ""
      col.viewRule = ""
      app.save(col)
    }
  }
}, (app) => {
  for (const name of ["preasidium_leden", "sponsors"]) {
    const col = app.findCollectionByNameOrId(name)
    if (col) {
      col.listRule = "@request.auth.id != \"\""
      col.viewRule = "@request.auth.id != \"\""
      app.save(col)
    }
  }
})
