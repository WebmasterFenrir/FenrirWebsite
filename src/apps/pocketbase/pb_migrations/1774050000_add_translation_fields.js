/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const ledenCol = app.findCollectionByNameOrId("preasidium_leden")
  const sponsorsCol = app.findCollectionByNameOrId("sponsors")

  if (!ledenCol || !sponsorsCol) {
    throw new Error("Required collections not found")
  }

  // English description, auto-filled by the translate hook (pb_hooks/translate.pb.js)
  if (!ledenCol.fields.find((f) => f.name === "description_en")) {
    ledenCol.fields.add(new TextField({
      name: "description_en",
      required: false,
    }))
  }

  // English content paragraphs, auto-filled by the translate hook (pb_hooks/translate.pb.js)
  if (!sponsorsCol.fields.find((f) => f.name === "content_en")) {
    // note: the JSVM class is JSONField (all caps, Go initialism style)
    sponsorsCol.fields.add(new JSONField({
      name: "content_en",
      required: false,
      maxSize: 0, // 0 = default 1MB limit
    }))
  }

  app.save(ledenCol)
  app.save(sponsorsCol)
}, (app) => {
  const ledenCol = app.findCollectionByNameOrId("preasidium_leden")
  const sponsorsCol = app.findCollectionByNameOrId("sponsors")

  if (ledenCol) {
    ledenCol.fields.removeByName("description_en")
    app.save(ledenCol)
  }

  if (sponsorsCol) {
    sponsorsCol.fields.removeByName("content_en")
    app.save(sponsorsCol)
  }
})
