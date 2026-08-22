/// <reference path="../pb_data/types.d.ts" />

// Seed a sample openingsweek sponsor so the "Sponsor van de openingsweek"
// section is visible out of the box. The activation/end window is intentionally
// wide so the sample stays active; admins manage the real ones from the dashboard.
migrate((app) => {
  const col = app.findCollectionByNameOrId("openingsweek_sponsors")
  if (!col) {
    console.warn("[seed] openingsweek_sponsors collection not found — skipping seed")
    return
  }

  const sampleName = "Voorbeeld Openingsweek Sponsor"

  const r = new Record(col, {
    name:           sampleName,
    content: [
      "Dit is een voorbeeld van de sponsor van de openingsweek. Vanuit het dashboard stel je de activatie- en einddatum in, samen met een afbeelding en een beschrijving.",
      "Zodra de periode actief is, verschijnt deze sponsor bovenaan de sponsorspagina, boven de jaarsponsors.",
    ],
    url:            "https://fenrirclub.be",
    activationDate: "2024-01-01 00:00:00.000Z",
    endDate:        "2030-12-31 23:59:59.999Z",
    active:         true,
  })
  app.save(r)
}, (app) => {
  const col = app.findCollectionByNameOrId("openingsweek_sponsors")
  if (!col) return
  const records = app.findRecordsByFilter(col, `name = "Voorbeeld Openingsweek Sponsor"`)
  for (const r of records) app.delete(r)
})
