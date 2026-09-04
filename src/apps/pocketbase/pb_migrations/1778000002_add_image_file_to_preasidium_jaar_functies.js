/// <reference path="../pb_data/types.d.ts" />

// Per-year picture for a presidium member. Lives on the year↔member join so a
// person can have a different photo per presidium year. The website falls back
// per-year picture → the person's own picture → placeholder avatar.
migrate((app) => {
  const functiesCol = app.findCollectionByNameOrId("preasidium_jaar_functies");

  if (!functiesCol) {
    throw new Error("preasidium_jaar_functies collection not found")
  }

  // Add imageFile to preasidium_jaar_functies if it doesn't exist yet
  if (!functiesCol.fields.find((f) => f.name === "imageFile")) {
    functiesCol.fields.add(new FileField({
      name: "imageFile",
      required: false,
      maxSelect: 1,
      maxSize: 5242880, // 5 MB
      mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    }))
  }

  app.save(functiesCol)
}, (app) => {
  const functiesCol = app.findCollectionByNameOrId("preasidium_jaar_functies")

  if (functiesCol) {
    functiesCol.fields.removeByName("imageFile")
    app.save(functiesCol)
  }
})