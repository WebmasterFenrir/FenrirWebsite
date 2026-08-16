/// <reference path="../pb_data/types.d.ts" />

// forms: add English title + description so multiLanguage forms render full EN
// chrome. Required NL stays the translation source; the DeepL hook
// (pb_hooks/forms.pb.js) fills these when left empty. Options/placeholders are
// intentionally NOT translated (they are answer values).
migrate((app) => {
  const col = app.findCollectionByNameOrId("forms")
  if (!col) throw new Error("forms collection not found")

  if (!col.fields.getByName("title_en")) {
    col.fields.add(new TextField({
      hidden: false,
      name: "title_en",
      required: false,
      presentable: false,
      system: false,
    }))
  }

  if (!col.fields.getByName("description_en")) {
    col.fields.add(new TextField({
      hidden: false,
      name: "description_en",
      required: false,
      presentable: false,
      system: false,
    }))
  }

  app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("forms")
  if (!col) return

  col.fields.removeByName("title_en")
  col.fields.removeByName("description_en")

  app.save(col)
})