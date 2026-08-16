// End-to-end test of the forms auto-translate hook (DeepL NL→EN).
// Spawns a mock DeepL API + a PocketBase instance with DEEPL_* env vars set,
// then verifies the full translation matrix:
//   - create: Dutch title/description/labels are auto-translated
//   - manual English values are never overwritten
//   - editing the Dutch source re-translates (stale auto-translations refresh)
//   - unrelated updates don't re-translate (no redundant DeepL calls)
//   - non-multiLanguage forms get no English fields at all
//   - a failing DeepL never breaks the save (old value kept / empty retried)
//
//   cd src/apps/pocketbase && bun smoke-translate-forms-test.mjs

import http from "node:http";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PB_PORT = 8096;
const DEEPL_PORT = 8898;
const BASE = `http://127.0.0.1:${PB_PORT}`;
const DEEPL_URL = `http://127.0.0.1:${DEEPL_PORT}/v2/translate`;

let passed = 0;
let failed = 0;
const check = (name, cond, extra = "") => {
  if (cond) {
    passed++;
    console.log("  \u2714", name);
  } else {
    failed++;
    console.log("  \u2718", name, extra);
  }
};
const api = async (path, opts = {}) => {
  const { headers, ...rest } = opts;
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    ...rest,
  });
  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── 1. Mock DeepL API ───────────────────────────────────────────────────────
let deeplRequests = 0;
const deeplServer = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    deeplRequests++;
    let parsed = {};
    try {
      parsed = JSON.parse(body || "{}");
    } catch {
      // ignore
    }
    const texts = Array.isArray(parsed.text) ? parsed.text : [];
    // A text containing "boom" simulates a DeepL outage (like the GitHub mock).
    if (texts.some((t) => String(t).includes("boom"))) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "simulated failure" }));
      return;
    }
    const translations = texts.map((t) => ({ text: "[EN] " + t }));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ translations }));
  });
});
await new Promise((resolve) => deeplServer.listen(DEEPL_PORT, "127.0.0.1", resolve));
console.log("[test] mock DeepL listening on " + DEEPL_URL);

// ── 2. PocketBase with a fresh data dir + DEEPL_* env ───────────────────────
const dataDir = mkdtempSync(join(tmpdir(), "pb-forms-translate-"));

// First superuser must be created via the CLI on this PB build (install-token
// flow blocks the API route).
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
    "--http", `127.0.0.1:${PB_PORT}`,
  ],
  {
    env: {
      ...process.env,
      DEEPL_API_KEY: "test-key",
      DEEPL_API_URL: DEEPL_URL,
    },
    stdio: ["ignore", "pipe", "pipe"],
  }
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

  const su = await api("/api/collections/_superusers/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: "test@fenrirclub.be", password: "TestPassword123!" }),
  });
  check("superuser login", su.status === 200, su.status + " " + JSON.stringify(su.body));
  const suHeaders = { Authorization: su.body.token };

  const createForm = (body) =>
    api("/api/collections/forms/records", { method: "POST", headers: suHeaders, body: JSON.stringify(body) });
  const updateForm = (id, body) =>
    api("/api/collections/forms/records/" + id, { method: "PATCH", headers: suHeaders, body: JSON.stringify(body) });

  // 3. Create → Dutch title/description/labels auto-translated
  const r1 = await createForm({
    title: "Ledenweekend inschrijving",
    description: "Schrijf je in voor het ledenweekend.",
    multiLanguage: true,
    active: true,
    fields: [
      { id: "fld_1", label: "Naam", type: "text", required: true },
      { id: "fld_2", label: "E-mailadres", type: "email", required: true },
      { id: "fld_sec", label: "Informatie", type: "section", content: "Dit is een sectie.", required: false },
    ],
  });
  check("create multiLanguage form → 200", r1.status === 200, r1.status + " " + JSON.stringify(r1.body));
  const f1 = r1.body;
  check("title_en auto-translated", f1.title_en === "[EN] Ledenweekend inschrijving", JSON.stringify(f1.title_en));
  check("description_en auto-translated", f1.description_en === "[EN] Schrijf je in voor het ledenweekend.", JSON.stringify(f1.description_en));
  check("label_en auto-translated per field", f1.fields[0].label_en === "[EN] Naam" && f1.fields[1].label_en === "[EN] E-mailadres", JSON.stringify(f1.fields));
  check("section content_en auto-translated", f1.fields[2].content_en === "[EN] Dit is een sectie.", JSON.stringify(f1.fields[2]));

  // 4. Manual English values are never overwritten
  const r2 = await createForm({
    title: "Handmatige titel",
    title_en: "My custom title",
    description: "Beschrijving.",
    description_en: "My custom description.",
    multiLanguage: true,
    active: true,
    fields: [
      { id: "fld_1", label: "Voornaam", label_en: "First name", type: "text", required: false },
    ],
  });
  check("create manual-EN form → 200", r2.status === 200, r2.status + " " + JSON.stringify(r2.body));
  const f2 = r2.body;
  check("manual title_en preserved", f2.title_en === "My custom title", JSON.stringify(f2.title_en));
  check("manual description_en preserved", f2.description_en === "My custom description.", JSON.stringify(f2.description_en));
  check("manual label_en preserved", f2.fields[0].label_en === "First name", JSON.stringify(f2.fields[0].label_en));

  // 5. Editing the Dutch source re-translates (stale auto-translation refresh)
  const r3 = await updateForm(f1.id, { title: "Nieuwe inschrijvingspagina" });
  check("update Dutch title → 200", r3.status === 200, r3.status + " " + JSON.stringify(r3.body));
  check("title_en refreshed", r3.body.title_en === "[EN] Nieuwe inschrijvingspagina", JSON.stringify(r3.body.title_en));

  // 6. Unrelated update → English untouched + no new DeepL call
  const before = deeplRequests;
  const r4 = await updateForm(f1.id, { active: false });
  check("unrelated update (toggle active) → 200", r4.status === 200, r4.status + " " + JSON.stringify(r4.body));
  check("title_en unchanged on unrelated update", r4.body.title_en === "[EN] Nieuwe inschrijvingspagina", JSON.stringify(r4.body.title_en));
  check("no DeepL call fired for unrelated update", deeplRequests === before, "requests went from " + before + " to " + deeplRequests);

  // 7. Non-multiLanguage forms get no English fields
  const r5 = await createForm({
    title: "Nederlandse vorm",
    active: true,
    fields: [{ id: "fld_1", label: "Naam", type: "text", required: false }],
  });
  check("create NL-only form → 200", r5.status === 200, r5.status + " " + JSON.stringify(r5.body));
  check("no title_en on NL-only form", !r5.body.title_en, JSON.stringify(r5.body.title_en));
  check("no label_en on NL-only form", !r5.body.fields[0].label_en, JSON.stringify(r5.body.fields[0].label_en));

  // 8. DeepL down → save still succeeds (fill case: stays empty, retried later)
  const r6 = await createForm({
    title: "boom formulier",
    multiLanguage: true,
    active: true,
    fields: [{ id: "fld_1", label: "boom", type: "text", required: false }],
  });
  check("create with failing DeepL → still 200", r6.status === 200, r6.status + " " + JSON.stringify(r6.body));
  check("empty EN kept empty on failure", r6.body.title_en === "" && r6.body.fields[0].label_en === "", JSON.stringify([r6.body.title_en, r6.body.fields[0].label_en]));

  // 9. DeepL down during a re-translate → old English value kept
  const r7 = await createForm({
    title: "Normale titel",
    multiLanguage: true,
    active: true,
    fields: [],
  });
  check("create normal title → 200", r7.status === 200, r7.status + " " + JSON.stringify(r7.body));
  check("title_en filled", r7.body.title_en === "[EN] Normale titel", JSON.stringify(r7.body.title_en));
  const r8 = await updateForm(r7.body.id, { title: "boom nu" });
  check("update to failing text → still 200", r8.status === 200, r8.status + " " + JSON.stringify(r8.body));
  check("old title_en kept when re-translate fails", r8.body.title_en === "[EN] Normale titel", JSON.stringify(r8.body.title_en));
} catch (err) {
  failed++;
  console.log("  \u2718 test crashed:", err);
} finally {
  pb.kill();
  // Give the process time to release its files before cleaning up (Windows
  // errors with EBUSY if we delete the data dir while PB still holds it).
  await new Promise((resolve) => {
    const t = setTimeout(resolve, 5000);
    pb.on("exit", () => {
      clearTimeout(t);
      resolve();
    });
  });
  try {
    rmSync(dataDir, { recursive: true, force: true });
  } catch {
    // best-effort cleanup
  }
  deeplServer.close();
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
