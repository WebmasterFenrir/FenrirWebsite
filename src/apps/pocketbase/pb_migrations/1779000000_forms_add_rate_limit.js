/// <reference path="../pb_data/types.d.ts" />

// forms: add `rateLimit` — how many submissions one IP may send to THIS form
// per hour (anti-spam, see issue #99). Schools share a single egress IP, so
// the old hard-coded 10/hour starved whole campuses; admins can now raise the
// budget per form. 0 / unset = the hook's server default (currently 50).
migrate((app) => {
  const col = app.findCollectionByNameOrId("forms")
  if (!col) throw new Error("forms collection not found")

  if (!col.fields.getByName("rateLimit")) {
    col.fields.add(new NumberField({
      hidden: false,
      name: "rateLimit",
      required: false,
      presentable: false,
      system: false,
      onlyInt: true,
      min: 0,
    }))
  }
  app.save(col)

  // Give existing forms the new default (the old hard limit was 10; 50 is 5x
  // more headroom while still bounding spam) so nothing silently drops to 0.
  const forms = app.findRecordsByFilter("forms", "", "-created", 500, 0, {})
  for (const f of forms) {
    if (f.getInt("rateLimit") === 0) {
      f.set("rateLimit", 50)
      app.save(f)
    }
  }
}, (app) => {
  const col = app.findCollectionByNameOrId("forms")
  if (!col) return

  col.fields.removeByName("rateLimit")
  app.save(col)
})
