/// <reference path="../pb_data/types.d.ts" />

// One "site" record with no hero image set — the website falls back to the
// build-time `public/images/hero.jpg` until an admin uploads one.
migrate((app) => {
  const existing = app.findRecordsByFilter("site_settings", "key = 'site'", "", 1, 0, {});
  if (existing.length > 0) return;

  const record = new Record(app.findCollectionByNameOrId("site_settings"), {
    key: "site",
  });

  app.save(record);
}, (app) => {
  const found = app.findRecordsByFilter("site_settings", "key = 'site'", "", 1, 0, {});
  for (const r of found) app.delete(r);
})