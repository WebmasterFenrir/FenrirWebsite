/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const ledenCol = app.findCollectionByNameOrId("preasidium_leden")
  const sponsorsCol = app.findCollectionByNameOrId("sponsors")

  if (!ledenCol || !sponsorsCol) {
    throw new Error("Required collections not found")
  }

  // Add imageFile field to preasidium_leden if it doesn't exist yet
  if (!ledenCol.fields.find((f) => f.name === "imageFile")) {
    ledenCol.fields.add(new FileField({
      name: "imageFile",
      required: false,
      maxSelect: 1,
      maxSize: 5242880, // 5 MB
      mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    }))
  }

  // Add imageFile field to sponsors if it doesn't exist yet
  if (!sponsorsCol.fields.find((f) => f.name === "imageFile")) {
    sponsorsCol.fields.add(new FileField({
      name: "imageFile",
      required: false,
      maxSelect: 1,
      maxSize: 5242880, // 5 MB
      mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    }))
  }

  app.save(ledenCol)
  app.save(sponsorsCol)
}, (app) => {
  const ledenCol = app.findCollectionByNameOrId("preasidium_leden")
  const sponsorsCol = app.findCollectionByNameOrId("sponsors")

  if (ledenCol) {
    ledenCol.fields.removeByName("imageFile")
    app.save(ledenCol)
  }

  if (sponsorsCol) {
    sponsorsCol.fields.removeByName("imageFile")
    app.save(sponsorsCol)
  }
})
