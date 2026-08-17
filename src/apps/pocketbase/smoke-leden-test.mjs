// Smoke test for the `inschrijvingen` processing hook + `leden` collection.
// Spawns its own PocketBase instance on a fresh temp data dir and verifies:
//   - a "Lid worden" submission creates a `leden` row with the mapped columns,
//     stamped with the newest (active) club year and linked back to the source
//     submission
//   - the same email again UPDATES the row instead of creating a duplicate
//   - unmatched/unknown labels never break the row (warning only) and a
//     submission that can't map a name is still saved
//   - reads are gated: media sees members, viewer/formmanager do not
//   - a hook failure never loses the submission
//
//   cd src/apps/pocketbase && bun smoke-leden-test.mjs

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PB_PORT = 8097;
const BASE = `http://127.0.0.1:${PB_PORT}`;

const api = async (path, opts = {}) => {
  const { headers, ...rest } = opts;
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    ...rest,
  });
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text) } catch { body = text }
  return { status: res.status, body };
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let passed = 0;
let failed = 0;
function check(name, cond, extra = "") {
  if (cond) { passed++; console.log("  \u2714", name); }
  else { failed++; console.log("  \u2718", name, extra); }
}

// ── PocketBase on a fresh data dir ──────────────────────────────────────────
const dataDir = mkdtempSync(join(tmpdir(), "pb-leden-"));
let pbLog = "";

const setup = spawn(
  "./pocketbase.exe",
  [
    "superuser", "upsert", "test@fenrirclub.be", "TestPassword123!",
    "--dir", dataDir,
    "--migrationsDir", "pb_migrations",
    "--hooksDir", "pb_hooks",
  ],
  { stdio: ["ignore", "pipe", "pipe"] }
);
setup.stderr.on("data", (d) => process.stderr.write("[pb-setup] " + d));
await new Promise((resolve) => setup.on("exit", resolve));

const pb = spawn(
  "./pocketbase.exe",
  [
    "serve", "--dir", dataDir,
    "--migrationsDir", "pb_migrations",
    "--hooksDir", "pb_hooks",
    // Test 8 deletes the `leden` collection to force a hook error; keep
    // automigrate OFF so that delete doesn't write a `_deleted_leden.js`
    // migration back into the repo's pb_migrations dir.
    "--automigrate=false",
    "--http", `127.0.0.1:${PB_PORT}`,
  ],
  { stdio: ["ignore", "pipe", "pipe"] }
);
pb.stdout.on("data", (d) => { process.stdout.write("[pb] " + d); pbLog += d.toString(); });
pb.stderr.on("data", (d) => { process.stderr.write("[pb] " + d); pbLog += d.toString(); });

try {
  let healthy = false;
  for (let i = 0; i < 40 && !healthy; i++) {
    try {
      const r = await fetch(BASE + "/api/health");
      healthy = r.status === 200;
    } catch {
      // not up yet
    }
    if (!healthy) await sleep(500);
  }
  check("PocketBase healthy", healthy);

  const su = await api("/api/collections/_superusers/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: "test@fenrirclub.be", password: "TestPassword123!" }),
  });
  check("superuser login", su.status === 200, su.status + " " + JSON.stringify(su.body));
  const suHeaders = { Authorization: su.body.token };

  // 1. Two club years. The seed migration already creates years up to 2025, so
  //    use high ids so 2099 is unambiguously the newest (active) year.
  const y2098 = await api("/api/collections/preasidium_years/records", {
    method: "POST",
    headers: suHeaders,
    body: JSON.stringify({ yearId: 2098, startDate: "2098", endDate: "2099" }),
  });
  const y2099 = await api("/api/collections/preasidium_years/records", {
    method: "POST",
    headers: suHeaders,
    body: JSON.stringify({ yearId: 2099, startDate: "2099", endDate: "2100" }),
  });
  check("create club years → 200", y2098.status === 200 && y2099.status === 200, y2098.status + "/" + y2099.status);
  const activeYearId = y2099.body.id;

  // 2. Role users for the read-rule assertions.
  const mkUser = (email, role) =>
    api("/api/collections/users/records", {
      method: "POST",
      headers: suHeaders,
      body: JSON.stringify({ email, password: "Password123!", passwordConfirm: "Password123!", role, name: role }),
    });
  await mkUser("media@fenrirclub.be", "media");
  await mkUser("viewer@fenrirclub.be", "viewer");
  await mkUser("fm@fenrirclub.be", "formmanager");
  const login = async (identity) => {
    const r = await api("/api/collections/users/auth-with-password", {
      method: "POST",
      body: JSON.stringify({ identity, password: "Password123!" }),
    });
    return { Authorization: r.body.token };
  };
  const mediaH = await login("media@fenrirclub.be");
  const viewerH = await login("viewer@fenrirclub.be");
  const fmH = await login("fm@fenrirclub.be");

  // 3. The "Lid worden" form (hook = inschrijvingen). `fld_vragen` matches no
  //    leden column on purpose — it must be collected but ignored.
  const formRes = await api("/api/collections/forms/records", {
    method: "POST",
    headers: suHeaders,
    body: JSON.stringify({
      title: "Word lid van Fenrir",
      multiLanguage: false,
      active: true,
      hook: "inschrijvingen",
      fields: [
        { id: "fld_name", label: "Voornaam + achternaam", type: "text", required: true },
        { id: "fld_birth", label: "Geboortedatum", type: "text", required: true },
        { id: "fld_lang", label: "Taal (language)", type: "radio", required: true, options: ["Nederlands/Dutch", "Engels/English"] },
        { id: "fld_kdg", label: "Ben je een KdG-Student?", type: "radio", required: true, options: ["Ja", "Nee"] },
        { id: "fld_sn", label: "Studentennummer", type: "text", required: false },
        { id: "fld_richting", label: "Richting", type: "text", required: false },
        { id: "fld_email", label: "E-mailadres", type: "email", required: true },
        { id: "fld_phone", label: "Telefoonnummer", type: "text", required: false },
        { id: "fld_sport", label: "Wil je mee badmintonnen met Fenrir?", type: "radio", required: true, options: ["Ja", "Nee", "Misschien"] },
        { id: "fld_doop", label: "Neem je deel met de teambuilding/studentendoop?", type: "radio", required: true, options: ["Ja", "Nee", "Misschien"] },
        { id: "fld_pay", label: "Betalingswijze", type: "radio", required: true, options: ["Cash", "Bankrekening"] },
        { id: "fld_vragen", label: "Zijn er nog vragen?", type: "textarea", required: false },
      ],
    }),
  });
  check("create lid form → 200", formRes.status === 200, formRes.status + " " + JSON.stringify(formRes.body));
  const form = formRes.body;

  const answers = (overrides = {}) => ({
    fld_name: "Jan Peeters",
    fld_birth: "12/03/2003",
    fld_lang: "Nederlands/Dutch",
    fld_kdg: "Ja",
    fld_sn: "20251234",
    fld_richting: "Toegepaste Informatica",
    fld_email: "jan@example.com",
    fld_phone: "0471 12 34 56",
    fld_sport: "Ja",
    fld_doop: "Misschien",
    fld_pay: "Bankrekening",
    fld_vragen: "Wanneer is de eerste training?",
    ...overrides,
  });

  // 4. Valid submission → a leden row with the mapped columns.
  const sub1 = await api("/api/collections/form_submissions/records", {
    method: "POST",
    body: JSON.stringify({ form: form.id, answers: answers() }),
  });
  check("valid submission → 200", sub1.status === 200, sub1.status + " " + JSON.stringify(sub1.body));

  const ledenList = await api("/api/collections/leden/records", { headers: suHeaders });
  check("leden readable as superuser", ledenList.status === 200 && Array.isArray(ledenList.body.items), JSON.stringify(ledenList.body));
  const rows = ledenList.body.items || [];
  check("one leden row created", rows.length === 1, "rows:" + rows.length);
  const row = rows[0] || {};
  check("name mapped", row.name === "Jan Peeters", JSON.stringify(row.name));
  check("email mapped", row.email === "jan@example.com", JSON.stringify(row.email));
  check("phone mapped", row.phone === "0471 12 34 56", JSON.stringify(row.phone));
  check("birthdate mapped", row.birthdate === "12/03/2003", JSON.stringify(row.birthdate));
  check("language mapped to NL", row.language === "NL", JSON.stringify(row.language));
  check("kdg_student raw value", row.kdg_student === "Ja", JSON.stringify(row.kdg_student));
  check("student_number mapped", row.student_number === "20251234", JSON.stringify(row.student_number));
  check("richting mapped", row.richting === "Toegepaste Informatica", JSON.stringify(row.richting));
  check("sport_event raw value", row.sport_event === "Ja", JSON.stringify(row.sport_event));
  check("student_doop raw value", row.student_doop === "Misschien", JSON.stringify(row.student_doop));
  check("payment_method mapped", row.payment_method === "Bankrekening", JSON.stringify(row.payment_method));
  check("year = newest club year", row.year === activeYearId, row.year + " vs " + activeYearId);
  check("source = submission", row.source === sub1.body.id, row.source + " vs " + sub1.body.id);
  check("unmatched field warning logged", pbLog.includes("unmatched field"), pbLog.slice(-500));

  // 5. Read rules: media sees members; viewer + formmanager do not.
  const mediaList = await api("/api/collections/leden/records", { headers: mediaH });
  check("media can read leden", mediaList.status === 200 && (mediaList.body.items || []).length > 0, mediaList.status + " items:" + (mediaList.body.items || []).length);
  const viewerList = await api("/api/collections/leden/records", { headers: viewerH });
  check("viewer cannot read leden (0 items)", viewerList.status === 200 && (viewerList.body.items || []).length === 0, viewerList.status + " items:" + (viewerList.body.items || []).length);
  const fmList = await api("/api/collections/leden/records", { headers: fmH });
  check("formmanager cannot read leden (0 items)", fmList.status === 200 && (fmList.body.items || []).length === 0, fmList.status + " items:" + (fmList.body.items || []).length);

  // 6. Same email again → update, not duplicate.
  const sub2 = await api("/api/collections/form_submissions/records", {
    method: "POST",
    body: JSON.stringify({ form: form.id, answers: answers({ fld_name: "Jan Peeters-Govers", fld_sport: "Nee" }) }),
  });
  check("resubmission → 200", sub2.status === 200, sub2.status + " " + JSON.stringify(sub2.body));
  const after2 = await api("/api/collections/leden/records", { headers: suHeaders });
  const rows2 = after2.body.items || [];
  check("still one leden row (update, not duplicate)", rows2.length === 1, "rows:" + rows2.length);
  check("name updated on resubmission", rows2.length === 1 && rows2[0].name === "Jan Peeters-Govers", JSON.stringify(rows2[0] && rows2[0].name));
  check("sport_event updated on resubmission", rows2.length === 1 && rows2[0].sport_event === "Nee", JSON.stringify(rows2[0] && rows2[0].sport_event));
  check("update logged", pbLog.includes("updated leden row"), pbLog.slice(-500));

  // 7. A submission that can't map a name is still saved (skip, no leden row).
  const noNameForm = await api("/api/collections/forms/records", {
    method: "POST",
    headers: suHeaders,
    body: JSON.stringify({
      title: "Only a colour",
      active: true,
      hook: "inschrijvingen",
      fields: [{ id: "fld_kleur", label: "Kleur", type: "radio", required: true, options: ["rood", "blauw"] }],
    }),
  });
  const noNameSub = await api("/api/collections/form_submissions/records", {
    method: "POST",
    body: JSON.stringify({ form: noNameForm.body.id, answers: { fld_kleur: "rood" } }),
  });
  check("no-name submission still saved → 200", noNameSub.status === 200, noNameSub.status + " " + JSON.stringify(noNameSub.body));
  const afterNoName = await api("/api/collections/leden/records", { headers: suHeaders });
  check("no leden row for no-name submission", (afterNoName.body.items || []).length === 1, "rows:" + (afterNoName.body.items || []).length);
  check("no-name warning logged", pbLog.includes("no name matched"), pbLog.slice(-500));

  // 7b. Manual add from the dashboard: admin/media may create a row with only
  //     a name + year (no `source` relation); viewer/formmanager may not.
  const manualRow = await api("/api/collections/leden/records", {
    method: "POST",
    headers: suHeaders,
    body: JSON.stringify({ name: "Handmatig Lid", year: activeYearId }),
  });
  check("manual add as admin → 201", manualRow.status === 201 || manualRow.status === 200, manualRow.status + " " + JSON.stringify(manualRow.body));
  check("manual row has no source", manualRow.body && !manualRow.body.source, JSON.stringify(manualRow.body && manualRow.body.source));

  const manualMedia = await api("/api/collections/leden/records", {
    method: "POST",
    headers: mediaH,
    body: JSON.stringify({ name: "Media Lid", year: activeYearId }),
  });
  check("manual add as media → 201", manualMedia.status === 201 || manualMedia.status === 200, manualMedia.status + " " + JSON.stringify(manualMedia.body));

  const manualViewer = await api("/api/collections/leden/records", {
    method: "POST",
    headers: viewerH,
    body: JSON.stringify({ name: "Viewer Lid", year: activeYearId }),
  });
  check("manual add as viewer forbidden", manualViewer.status === 403 || manualViewer.status === 400, manualViewer.status + " " + JSON.stringify(manualViewer.body));

  const manualFm = await api("/api/collections/leden/records", {
    method: "POST",
    headers: fmH,
    body: JSON.stringify({ name: "FM Lid", year: activeYearId }),
  });
  check("manual add as formmanager forbidden", manualFm.status === 403 || manualFm.status === 400, manualFm.status + " " + JSON.stringify(manualFm.body));

  const afterManual = await api("/api/collections/leden/records", { headers: suHeaders });
  const manualNames = (afterManual.body.items || []).map((r) => r.name);
  check("manual rows listed", manualNames.includes("Handmatig Lid") && manualNames.includes("Media Lid"), JSON.stringify(manualNames));

  // 8. A hook failure never loses the submission — delete the leden collection
  //    so the hook's save throws, then submit: it must still be persisted.
  const delCol = await api("/api/collections/leden", { method: "DELETE", headers: suHeaders });
  check("delete leden collection (to force hook error) → 204/200", delCol.status === 204 || delCol.status === 200, String(delCol.status));
  const sub3 = await api("/api/collections/form_submissions/records", {
    method: "POST",
    body: JSON.stringify({ form: form.id, answers: answers({ fld_email: "derde@example.com" }) }),
  });
  check("submission saved despite hook error → 200", sub3.status === 200, sub3.status + " " + JSON.stringify(sub3.body));
  const subsAfter = await api(
    "/api/collections/form_submissions/records?filter=" + encodeURIComponent('form = "' + form.id + '"'),
    { headers: suHeaders },
  );
  check("submission persisted despite hook error", (subsAfter.body.items || []).some((s) => s.id === sub3.body.id), JSON.stringify(subsAfter.body));
  check("hook failure logged", pbLog.includes("inschrijvingen hook failed"), pbLog.slice(-500));
} catch (err) {
  failed++;
  console.log("  \u2718 test crashed:", err);
} finally {
  pb.kill();
  await new Promise((resolve) => {
    const t = setTimeout(resolve, 5000);
    pb.on("exit", () => { clearTimeout(t); resolve(); });
  });
  try {
    rmSync(dataDir, { recursive: true, force: true });
  } catch {
    // best-effort cleanup
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
