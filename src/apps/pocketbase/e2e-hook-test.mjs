// End-to-end test of the translate hook against a local PocketBase instance.
// Expects: PocketBase on 127.0.0.1:8099, superuser test@test.com / testpass123.
const base = "http://127.0.0.1:8099";

const auth = await fetch(`${base}/api/collections/_superusers/auth-with-password`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ identity: "test@test.com", password: "testpass123" }),
}).then((r) => r.json());
if (!auth.token) {
  console.error("AUTH FAILED", JSON.stringify(auth));
  process.exit(1);
}
console.log("auth ok");
const headers = { "Content-Type": "application/json", Authorization: auth.token };

// 1. CREATE a sponsor with Dutch content -> hook should translate to content_en
const create = await fetch(`${base}/api/collections/sponsors/records`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: "E2E Sponsor " + Date.now(),
    content: ["Dit is een test.", "De hook moet dit vertalen."],
    startYear: 2026,
    endYear: 2027,
  }),
});
const created = await create.json();
console.log("CREATE status:", create.status);
if (create.status === 200) {
  console.log("  content_en:", JSON.stringify(created.content_en));
}

// 2. UPDATE the same sponsor with new Dutch content -> hook should re-translate
if (create.status === 200) {
  const id = created.id;
  const update = await fetch(`${base}/api/collections/sponsors/records/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      content: ["Nieuwe inhoud na update."],
    }),
  });
  const updated = await update.json();
  console.log("UPDATE status:", update.status);
  if (update.status === 200) {
    console.log("  content_en:", JSON.stringify(updated.content_en));
  }
}

// 3. CREATE a preasidium lid with a Dutch description
const lid = await fetch(`${base}/api/collections/preasidium_leden/records`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    externalId: 9999,
    firstName: "Test",
    lastName: "Lid",
    description: "Dit is een beschrijving in het Nederlands.",
  }),
});
const lidCreated = await lid.json();
console.log("LID CREATE status:", lid.status);
if (lid.status === 200) {
  console.log("  description_en:", JSON.stringify(lidCreated.description_en));
}
