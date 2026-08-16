// Smoke test for the forms hook + collections.
// Spawns its own PocketBase instance on a fresh temp data dir (the first
// superuser is created via the CLI — PB 0.36 blocks API-based creation) and
// cleans up afterwards.
//
//   cd src/apps/pocketbase && bun smoke-forms-test.mjs

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PB_PORT = 8099;
const BASE = `http://127.0.0.1:${PB_PORT}`;

async function api(path, opts = {}) {
  const { headers, ...rest } = opts;
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    ...rest,
  });
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text) } catch { body = text }
  return { status: res.status, body };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let passed = 0;
let failed = 0;
function check(name, cond, extra = "") {
  if (cond) { passed++; console.log("  \u2714", name); }
  else { failed++; console.log("  \u2718", name, extra); }
}

// ── 1. PocketBase on a fresh data dir ───────────────────────────────────────
const dataDir = mkdtempSync(join(tmpdir(), "pb-forms-"));

// This PB build refuses to create the first superuser via the API (install-
// token flow), so create it with the CLI against the same data dir.
const setup = spawn(
  "./pocketbase.exe",
  [
    "superuser", "upsert", "test@fenrirclub.be", "TestPassword123!",
    "--dir", dataDir,
    // PB 0.36 resolves pb_migrations + pb_hooks under the data dir by default —
    // point both at the repo folders explicitly.
    "--migrationsDir", "pb_migrations",
    "--hooksDir", "pb_hooks",
  ],
  { stdio: ["ignore", "pipe", "pipe"] }
);
setup.stderr.on("data", (d) => process.stderr.write("[pb-setup] " + d));
await new Promise((resolve) => setup.on("exit", resolve));
console.log("[test] superuser created via CLI");

const pb = spawn(
  "./pocketbase.exe",
  [
    "serve", "--dir", dataDir,
    "--migrationsDir", "pb_migrations",
    "--hooksDir", "pb_hooks",
    "--http", `127.0.0.1:${PB_PORT}`,
  ],
  { stdio: ["ignore", "pipe", "pipe"] }
);
pb.stdout.on("data", (d) => process.stdout.write("[pb] " + d));
pb.stderr.on("data", (d) => process.stderr.write("[pb] " + d));

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

  // Superuser (created via the CLI above) + login.
  const su = await api("/api/collections/_superusers/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: "test@fenrirclub.be", password: "TestPassword123!" }),
  });
  check("superuser login", su.status === 200, su.status + " " + JSON.stringify(su.body));
  const suHeaders = { Authorization: su.body.token };

  // 2. Create a form WITHOUT code → hook generates one
  const formRes = await api("/api/collections/forms/records", {
    method: "POST",
    headers: suHeaders,
    body: JSON.stringify({
      title: "Test form",
      description: "Smoke test",
      multiLanguage: true,
      active: true,
      fields: [
        { id: "fld_1", label: "Naam", type: "text", required: true },
        { id: "fld_2", label: "Email", type: "email", required: true },
        { id: "fld_3", label: "Leeftijd", type: "number", required: false },
        { id: "fld_4", label: "Kleur", type: "select", required: true, options: ["rood", "blauw"] },
        { id: "fld_5", label: "Hobbys", type: "checkbox", required: false, options: ["sport", "muziek"] },
        { id: "fld_6", label: "Datum", type: "date", required: false },
      ],
    }),
  })
  // NB: PocketBase returns 200 (not 201) for record creates.
  check("create form without code → 200", formRes.status === 200, formRes.status + " " + JSON.stringify(formRes.body))
  const form = formRes.body
  check("code generated (10 chars, url-safe)", typeof form.code === "string" && form.code.length === 10 && /^[a-z0-9]+$/.test(form.code), JSON.stringify(form.code))

  // The auto-translate hook runs on every multiLanguage save — it must never
  // break the create even when no DeepL key is configured (EN fields stay empty
  // and are retried on the next save).
  check("multiLanguage save sets a string title_en (empty without DeepL)", typeof form.title_en === "string", JSON.stringify(form.title_en))

  // 3. Valid submission → 201
  const validAnswers = {
    fld_1: "Jan",
    fld_2: "jan@example.com",
    fld_3: 21,
    fld_4: "rood",
    fld_5: ["sport"],
    fld_6: "2026-08-11",
  }
  const ok = await api("/api/collections/form_submissions/records", {
    method: "POST",
    body: JSON.stringify({ form: form.id, answers: validAnswers }),
  })
  check("valid submission → 200", ok.status === 200, ok.status + " " + JSON.stringify(ok.body))

  // 4. Missing required → 400 with clear message
  const missing = await api("/api/collections/form_submissions/records", {
    method: "POST",
    body: JSON.stringify({ form: form.id, answers: { fld_2: "jan@example.com" } }),
  })
  check("missing required → 400", missing.status === 400, missing.status + " " + JSON.stringify(missing.body))
  check("  message mentions required", /required/i.test(JSON.stringify(missing.body)))

  // 5. Bad email → 400
  const badEmail = await api("/api/collections/form_submissions/records", {
    method: "POST",
    body: JSON.stringify({ form: form.id, answers: { fld_1: "x", fld_2: "nope", fld_4: "rood" } }),
  })
  check("bad email → 400", badEmail.status === 400, badEmail.status + " " + JSON.stringify(badEmail.body))

  // 6. Invalid select option → 400
  const badOption = await api("/api/collections/form_submissions/records", {
    method: "POST",
    body: JSON.stringify({ form: form.id, answers: { fld_1: "x", fld_2: "a@b.com", fld_4: "groen" } }),
  })
  check("invalid select option → 400", badOption.status === 400, badOption.status + " " + JSON.stringify(badOption.body))

  // 7. Unknown field id → 400
  const unknown = await api("/api/collections/form_submissions/records", {
    method: "POST",
    body: JSON.stringify({ form: form.id, answers: { fld_1: "x", fld_2: "a@b.com", fld_4: "rood", fld_999: "hack" } }),
  })
  check("unknown field id → 400", unknown.status === 400, unknown.status + " " + JSON.stringify(unknown.body))

  // 8. Closed form rejects → 400
  const closed = await api("/api/collections/forms/records", {
    method: "POST",
    headers: suHeaders,
    body: JSON.stringify({ title: "Closed form", active: false, fields: [{ id: "f1", label: "A", type: "text", required: true }] }),
  })
  check("create closed form → 200", closed.status === 200, JSON.stringify(closed.body))
  const closedSub = await api("/api/collections/form_submissions/records", {
    method: "POST",
    body: JSON.stringify({ form: closed.body.id, answers: { f1: "x" } }),
  })
  check("closed form rejects → 400", closedSub.status === 400, closedSub.status + " " + JSON.stringify(closedSub.body))

  // 9. Rate limit — max 10 submissions/form/IP/hour. The first form already got
  //    1 valid submission, so fire 10 more: the 11th attempt must be blocked.
  let blocked = false
  let blockedBody = ""
  for (let i = 0; i < 10; i++) {
    const r = await api("/api/collections/form_submissions/records", {
      method: "POST",
      body: JSON.stringify({ form: form.id, answers: { fld_1: "x" + i, fld_2: "x" + i + "@e.com", fld_4: "blauw" } }),
    })
    if (r.status === 429) { blocked = true; blockedBody = JSON.stringify(r.body); break }
  }
  check("rate limit blocks the 11th submission (429)", blocked, blockedBody)

  // 10. Roles — formmanager can manage forms + read submissions, viewer cannot
  await api("/api/collections/users/records", {
    method: "POST",
    headers: suHeaders,
    body: JSON.stringify({ email: "fm@fenrirclub.be", password: "Password123!", passwordConfirm: "Password123!", role: "formmanager", name: "FM" }),
  })
  await api("/api/collections/users/records", {
    method: "POST",
    headers: suHeaders,
    body: JSON.stringify({ email: "vw@fenrirclub.be", password: "Password123!", passwordConfirm: "Password123!", role: "viewer", name: "VW" }),
  })
  const fm = await api("/api/collections/users/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: "fm@fenrirclub.be", password: "Password123!" }),
  })
  const vw = await api("/api/collections/users/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: "vw@fenrirclub.be", password: "Password123!" }),
  })

  const fmCreate = await api("/api/collections/forms/records", {
    method: "POST",
    headers: { Authorization: fm.body.token },
    body: JSON.stringify({ title: "FM form", active: true, fields: [{ id: "f1", label: "A", type: "text", required: true }] }),
  })
  check("formmanager can create form → 200", fmCreate.status === 200, fmCreate.status + " " + JSON.stringify(fmCreate.body))

  const vwCreate = await api("/api/collections/forms/records", {
    method: "POST",
    headers: { Authorization: vw.body.token },
    body: JSON.stringify({ title: "VW form", active: true }),
  })
  // This PB build rejects rule-denied creates with 400 "Failed to create record."
  // (denied LISTs instead return 200 with 0 items — checked below).
  check("viewer cannot create form → blocked (400/403)", (vwCreate.status === 400 || vwCreate.status === 403), vwCreate.status + " " + JSON.stringify(vwCreate.body))

  const fmRead = await api("/api/collections/form_submissions/records", {
    headers: { Authorization: fm.body.token },
  })
  // List rules act as filters: allowed → items present, denied → 200 + empty.
  check("formmanager can read submissions (items visible)", fmRead.status === 200 && Array.isArray(fmRead.body.items) && fmRead.body.items.length > 0, fmRead.status + " items:" + (fmRead.body.items || []).length)

  // Migration 1776000007 lets ANY authenticated user read responses —
  // viewers see them too (they just can't create/edit forms).
  const vwRead = await api("/api/collections/form_submissions/records", {
    headers: { Authorization: vw.body.token },
  })
  check("viewer CAN read submissions (items visible)", vwRead.status === 200 && Array.isArray(vwRead.body.items) && vwRead.body.items.length > 0, vwRead.status + " items:" + (vwRead.body.items || []).length)

  // 11. Deleting a form cascades to its submissions
  const del = await api("/api/collections/forms/records/" + form.id, { method: "DELETE", headers: suHeaders })
  check("delete form → 204", del.status === 204, del.status)
  const afterDelete = await api("/api/collections/form_submissions/records?filter=" + encodeURIComponent('form = "' + form.id + '"'), {
    headers: suHeaders,
  })
  check("submissions cascaded (0 left)", afterDelete.status === 200 && Array.isArray(afterDelete.body.items) && afterDelete.body.items.length === 0, JSON.stringify(afterDelete.body))
} catch (err) {
  failed++;
  console.log("  \u2718 test crashed:", err);
} finally {
  pb.kill();
  // Give the process time to release its files before cleaning up (Windows
  // errors with EBUSY if we delete the data dir while PB still holds it).
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

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
