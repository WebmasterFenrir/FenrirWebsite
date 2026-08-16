// End-to-end test of the invite-based onboarding flow.
// Spawns a PocketBase instance (CLI-created superuser, fresh temp dir) and
// verifies:
//   - dashboard-style creates (sentinel password) get a random password nobody
//     knows + a single-use invite token
//   - logging in with the sentinel password is impossible
//   - the accept endpoint rejects bad/empty/mismatched input
//   - a valid accept sets name + password, clears the token, preserves the role
//   - the invitee can log in with their own password; the link is single-use
//   - direct creates with a real password still work (no invite mode)
//
//   cd src/apps/pocketbase && bun smoke-invite-test.mjs

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PB_PORT = 8095;
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
const dataDir = mkdtempSync(join(tmpdir(), "pb-invite-"));

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

  const su = await api("/api/collections/_superusers/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: "test@fenrirclub.be", password: "TestPassword123!" }),
  });
  check("superuser login", su.status === 200, su.status + " " + JSON.stringify(su.body));
  const suHeaders = { Authorization: su.body.token };

  // 1. Dashboard-style create: sentinel password → invite mode
  const create = await api("/api/collections/users/records", {
    method: "POST",
    headers: suHeaders,
    body: JSON.stringify({
      email: "nieuw@fenrirclub.be",
      password: "__invite__",
      passwordConfirm: "__invite__",
      role: "formmanager",
      name: "Nieuwe Bestuurder",
    }),
  });
  check("create user (invite mode) → 200", create.status === 200, create.status + " " + JSON.stringify(create.body));
  const invited = create.body;
  check("inviteToken generated (48 chars)", typeof invited.inviteToken === "string" && invited.inviteToken.length === 48, JSON.stringify(invited.inviteToken));
  check("role preserved on create", invited.role === "formmanager", JSON.stringify(invited.role));

  // 2. The sentinel password must NOT work — the hook swapped it for a random one
  const sentinelLogin = await api("/api/collections/users/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: "nieuw@fenrirclub.be", password: "__invite__" }),
  });
  check("sentinel password rejected (random one set)", sentinelLogin.status === 400, sentinelLogin.status + " " + JSON.stringify(sentinelLogin.body));

  const accept = (body) =>
    api("/api/invites/accept", { method: "POST", body: JSON.stringify(body) });

  // 3. Accept rejects bad input
  const wrongToken = await accept({ token: "nope", name: "Jan", password: "Password123!", passwordConfirm: "Password123!" });
  check("wrong token → 400", wrongToken.status === 400, wrongToken.status + " " + JSON.stringify(wrongToken.body));
  const noName = await accept({ token: invited.inviteToken, name: " ", password: "Password123!", passwordConfirm: "Password123!" });
  check("empty name → 400", noName.status === 400, noName.status + " " + JSON.stringify(noName.body));
  const shortPw = await accept({ token: invited.inviteToken, name: "Jan", password: "short", passwordConfirm: "short" });
  check("short password → 400", shortPw.status === 400, shortPw.status + " " + JSON.stringify(shortPw.body));
  const mismatch = await accept({ token: invited.inviteToken, name: "Jan", password: "Password123!", passwordConfirm: "Password456!" });
  check("mismatched passwords → 400", mismatch.status === 400, mismatch.status + " " + JSON.stringify(mismatch.body));

  // 4. Valid accept → name + password set, token cleared, role preserved
  const ok = await accept({ token: invited.inviteToken, name: "Jan Peeters", password: "NewPassword123!", passwordConfirm: "NewPassword123!" });
  check("valid accept → 200 with email", ok.status === 200 && ok.body.email === "nieuw@fenrirclub.be", ok.status + " " + JSON.stringify(ok.body));

  const read = await api("/api/collections/users/records/" + invited.id, { headers: suHeaders });
  check("inviteToken cleared after accept", read.body.inviteToken === "", JSON.stringify(read.body.inviteToken));
  check("name set by invitee", read.body.name === "Jan Peeters", JSON.stringify(read.body.name));
  check("role still formmanager", read.body.role === "formmanager", JSON.stringify(read.body.role));

  const login = await api("/api/collections/users/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: "nieuw@fenrirclub.be", password: "NewPassword123!" }),
  });
  check("invitee logs in with own password → 200", login.status === 200, login.status + " " + JSON.stringify(login.body));

  // 5. Single-use: the same token no longer works
  const reuse = await accept({ token: invited.inviteToken, name: "Iemand Anders", password: "Password123!", passwordConfirm: "Password123!" });
  check("reused token → 400", reuse.status === 400, reuse.status + " " + JSON.stringify(reuse.body));

  // 6. Direct creates with a real password are untouched (no invite mode)
  const direct = await api("/api/collections/users/records", {
    method: "POST",
    headers: suHeaders,
    body: JSON.stringify({
      email: "direct@fenrirclub.be",
      password: "DirectPassword123!",
      passwordConfirm: "DirectPassword123!",
      role: "viewer",
      name: "Direct",
    }),
  });
  check("direct create → 200", direct.status === 200, direct.status + " " + JSON.stringify(direct.body));
  check("no inviteToken on direct create", !direct.body.inviteToken, JSON.stringify(direct.body.inviteToken));
  const directLogin = await api("/api/collections/users/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: "direct@fenrirclub.be", password: "DirectPassword123!" }),
  });
  check("direct user logs in with known password → 200", directLogin.status === 200, directLogin.status + " " + JSON.stringify(directLogin.body));
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
