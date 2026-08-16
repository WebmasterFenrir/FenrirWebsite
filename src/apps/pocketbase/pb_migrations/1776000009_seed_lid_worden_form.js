/// <reference path="../pb_data/types.d.ts" />

// Seed the native "Lid worden" form (replaces the old Google Form).
//
// Recreates the Google Form "Word lid van Fenrir🐺" (§2 of PLAN-members.md)
// minus the goodiebag/€5-€7 question and the one-off Mort Subite pickup
// question, plus a new "Telefoonnummer" text field (the Google Form had no
// phone field). `hook = "inschrijvingen"` wires it to the processing hook that
// maps the answers onto a `leden` record.
//
// The labels below are the stable keys the `inschrijvingen` hook matches on
// (normalized, case-insensitive, `includes`) — keep them in sync with the
// mapping in pb_hooks/forms.pb.js.
migrate((app) => {
  const formsCol = app.findCollectionByNameOrId("forms");

  // Idempotent: if the form is already seeded (or an admin already built one
  // with this hook), don't create a duplicate.
  const existing = app.findRecordsByFilter(
    "forms",
    "hook = 'inschrijvingen'",
    "",
    1,
    0,
    {}
  );
  if (existing.length > 0) return;

  // A friendly, stable code — re-check uniqueness on the (tiny) chance it is
  // already taken (the unique index in 1776000001 is the final guard).
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/O/1/l/I
  let code = "lidworden";
  const codeTaken = (c) =>
    app.findRecordsByFilter("forms", "code = '" + c + "'", "", 1, 0, {}).length > 0;
  if (codeTaken(code)) {
    for (let i = 0; i < 20; i++) {
      let candidate = "";
      for (let j = 0; j < 10; j++) {
        candidate += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      }
      if (!codeTaken(candidate)) {
        code = candidate;
        break;
      }
    }
  }

  const fields = [
    { id: "fld_lid_1", label: "Voornaam + achternaam", type: "text", required: true },
    { id: "fld_lid_2", label: "Geboortedatum", type: "text", required: true, placeholder: "dd/mm/jjjj" },
    { id: "fld_lid_3", label: "Taal (language)", type: "radio", required: true, options: ["Nederlands/Dutch", "Engels/English"] },
    { id: "fld_lid_4", label: "Ben je een KdG-Student?", type: "radio", required: true, options: ["Ja", "Nee"] },
    { id: "fld_lid_5", label: "Studentennummer", type: "text", required: false },
    { id: "fld_lid_6", label: "Richting", type: "text", required: false },
    { id: "fld_lid_7", label: "E-mailadres", type: "email", required: true },
    { id: "fld_lid_8", label: "Telefoonnummer", type: "text", required: false },
    { id: "fld_lid_9", label: "Wil je mee badmintonnen met Fenrir?", type: "radio", required: true, options: ["Ja", "Nee", "Misschien"] },
    { id: "fld_lid_10", label: "Neem je deel met de teambuilding/studentendoop?", type: "radio", required: true, options: ["Ja", "Nee", "Misschien"] },
    { id: "fld_lid_11", label: "Hoe heb je Fenrir leren kennen?", type: "text", required: false },
    { id: "fld_lid_12", label: "Betalingswijze", type: "radio", required: true, options: ["Cash", "Bankrekening"] },
    { id: "fld_lid_13", label: "Zijn er nog vragen?", type: "textarea", required: false },
  ];

  const form = new Record(formsCol, {
    code: code,
    title: "Word lid van Fenrir",
    description:
      "Vul dit formulier in om lid te worden van studentenvereniging Fenrir. Je gegevens worden enkel gebruikt voor het ledenbestand.",
    multiLanguage: false,
    active: true,
    hook: "inschrijvingen",
    fields: fields,
  });

  app.save(form);
}, (app) => {
  // Rollback: remove the seeded form (only the one this migration created).
  const found = app.findRecordsByFilter(
    "forms",
    "code = 'lidworden' || hook = 'inschrijvingen'",
    "",
    100,
    0,
    {}
  );
  for (const r of found) app.delete(r);
})
