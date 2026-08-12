// End-to-end test of the "bugticket" form hook (GitHub issue creation).
// Spawns a local mock GitHub Issues API + a PocketBase instance with the
// GITHUB_* env vars set, submits a form with hook=bugticket, and verifies
// the issue POST (title / body / labels / auth header).
//
//   cd src/apps/pocketbase && bun smoke-bugticket-test.mjs

import http from "node:http";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PB_PORT = 8097;
const GH_PORT = 8098;
const BASE = `http://127.0.0.1:${PB_PORT}`;
const GH_URL = `http://127.0.0.1:${GH_PORT}`;

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

// ── 1. Mock GitHub Issues API ───────────────────────────────────────────────
const createdIssues = [];
const ghServer = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    let parsed = {};
    try {
      parsed = JSON.parse(body || "{}");
    } catch {
      // ignore
    }
    createdIssues.push({ url: req.url, authorization: req.headers.authorization || null, ...parsed });
    // A title of exactly "boom" simulates a GitHub failure.
    if (parsed.title === "boom") {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "simulated failure" }));
      return;
    }
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        html_url: "https://github.com/WebmasterFenrir/FenrirWebsite/issues/1",
        number: 1,
      })
    );
  });
});
await new Promise((resolve) => ghServer.listen(GH_PORT, "127.0.0.1", resolve));
console.log("[test] mock GitHub listening on " + GH_URL);

// ── 2. PocketBase with a fresh data dir + GITHUB_* env ─────────────────────
const dataDir = mkdtempSync(join(tmpdir(), "pb-bugticket-"));

// This PB build refuses to create the first superuser via the API (403), so
// create it with the CLI against the same data dir before serving.
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
  {
  env: {
    ...process.env,
    GITHUB_API_URL: GH_URL,
    GITHUB_TOKEN: "test-token",
    GITHUB_REPO: "WebmasterFenrir/FenrirWebsite",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
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

  // Form with hook = bugticket + a mix of answer field types.
  const formRes = await api("/api/collections/forms/records", {
    method: "POST",
    headers: suHeaders,
    body: JSON.stringify({
      title: "Issue test form",
      active: true,
      hook: "bugticket",
      fields: [
        { id: "fld_1", label: "Titel", type: "text", required: true },
        { id: "fld_2", label: "Beschrijf de issue", type: "textarea", required: true },
        { id: "fld_3", label: "Type", type: "select", required: true, options: ["bug", "enhancement"] },
        { id: "fld_4", label: "Urgent", type: "checkbox", required: false, options: ["urgent"] },
      ],
    }),
  });
  check("create form (hook=bugticket)", formRes.status === 200, formRes.status + " " + JSON.stringify(formRes.body));
  const form = formRes.body;

  // Valid submission → the hook POSTs the issue to the mock during the create.
  const sub = await api("/api/collections/form_submissions/records", {
    method: "POST",
    body: JSON.stringify({
      form: form.id,
      answers: {
        fld_1: "Kapotte knop op de activiteitenpagina",
        fld_2: "Als ik op 'Inschrijven' klik gebeurt er niks.",
        fld_3: "bug",
        fld_4: ["urgent"],
      },
    }),
  });
  check("submission accepted (200)", sub.status === 200, sub.status + " " + JSON.stringify(sub.body));

  const issue = createdIssues[0] || {};
  check("mock received exactly 1 issue", createdIssues.length === 1, "got " + createdIssues.length);
  check("POSTed to /repos/.../issues", (issue.url || "").endsWith("/repos/WebmasterFenrir/FenrirWebsite/issues"), issue.url);
  check("bearer auth header sent", issue.authorization === "Bearer test-token", issue.authorization);
  check("title = first text answer", issue.title === "Kapotte knop op de activiteitenpagina", JSON.stringify(issue.title));
  check(
    "body contains form title + answers",
    typeof issue.body === "string" &&
      issue.body.includes("Issue test form") &&
      issue.body.includes("Beschrijf de issue") &&
      issue.body.includes("Als ik op 'Inschrijven' klik gebeurt er niks."),
    JSON.stringify((issue.body || "").slice(0, 200))
  );
  check(
    "labels mapped from answers (bug + urgent, not enhancement)",
    Array.isArray(issue.labels) &&
      issue.labels.indexOf("bug") !== -1 &&
      issue.labels.indexOf("urgent") !== -1 &&
      issue.labels.indexOf("enhancement") === -1,
    JSON.stringify(issue.labels)
  );

  // GitHub failure → submission still saved (processor is fire-and-forget).
  const sub2 = await api("/api/collections/form_submissions/records", {
    method: "POST",
    body: JSON.stringify({
      form: form.id,
      answers: { fld_1: "boom", fld_2: "Deze moet toch opgeslagen worden.", fld_3: "bug" },
    }),
  });
  check("submission still saved when GitHub fails (500)", sub2.status === 200, sub2.status + " " + JSON.stringify(sub2.body));
  check("2 POSTs hit the mock (1 ok + 1 failed attempt)", createdIssues.length === 2, "got " + createdIssues.length);
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
  ghServer.close();
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
