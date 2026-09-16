// End-to-end test of the admin password-reset flow (ticket 95).
// Verifies:
//   - only admins (or superusers) can reset another user's password
//   - you cannot reset your own account
//   - a reset invalidates the old password and issues a single-use reset link
//     (invite token prefixed "r_") that keeps the user's display name
//   - accounts without a name get a plain invite link (name still required)
//   - unknown users are rejected with 404
//
//   Runs like the other smoke tests (spawns ./pocketbase.exe on a fresh temp
//   dir). On a machine without a runnable binary, point it at a live instance:
//
//     PB_BASE_URL=http://127.0.0.1:8095 bun smoke-reset-test.mjs
//
//   (the dockerized PocketBase must have a superuser test@fenrirclub.be /
//   TestPassword123! — see the other smoke tests.)

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PB_PORT = 8096;
const BASE = process.env.PB_BASE_URL || `http://127.0.0.1:${PB_PORT}`;

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

// ── PocketBase instance (spawned, unless PB_BASE_URL points at a live one) ──
let pb = null;
let dataDir = null;
if (!process.env.PB_BASE_URL) {
  dataDir = mkdtempSync(join(tmpdir(), "pb-reset-"));

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

  pb = spawn(
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
}

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

  // Helper: dashboard-style invite create → accept → returns the user record.
  const makeUser = async (email, name, password, role = "viewer") => {
    const create = await api("/api/collections/users/records", {
      method: "POST",
      headers: suHeaders,
      body: JSON.stringify({
        email,
        password: "__invite__",
        passwordConfirm: "__invite__",
        role,
        name,
      }),
    });
    if (create.status !== 200) {
      throw new Error("create failed for " + email + ": " + create.status + " " + JSON.stringify(create.body));
    }
    const rec = create.body;
    const accept = await api("/api/invites/accept", {
      method: "POST",
      body: JSON.stringify({
        token: rec.inviteToken,
        name,
        password,
        passwordConfirm: password,
      }),
    });
    if (accept.status !== 200) {
      throw new Error("accept failed for " + email + ": " + accept.status + " " + JSON.stringify(accept.body));
    }
    const login = await api("/api/collections/users/auth-with-password", {
      method: "POST",
      body: JSON.stringify({ identity: email, password }),
    });
    if (login.status !== 200) {
      throw new Error("login failed for " + email + ": " + login.status + " " + JSON.stringify(login.body));
    }
    return login.body;
  };

  // Target user: has a name + a working password.
  const target = await makeUser("reset-target@fenrirclub.be", "Reset Me", "OldPassword123!");
  check("target user onboarded + logged in", !!target.record, JSON.stringify(target.record?.email));
  const targetId = target.record.id;

  // Admin user (can trigger resets) + a plain viewer (must be blocked).
  const adminAuth = await makeUser("reset-admin@fenrirclub.be", "Admin Reset", "AdminPassword123!", "admin");
  const viewerAuth = await makeUser("reset-viewer@fenrirclub.be", "Viewer Reset", "ViewerPassword123!", "viewer");
  const adminHeaders = { Authorization: adminAuth.token };
  const viewerHeaders = { Authorization: viewerAuth.token };

  const reset = (body, headers = {}) =>
    api("/api/invites/reset", { method: "POST", headers, body: JSON.stringify(body) });

  // 1. Authorization boundaries
  const anon = await reset({ userId: targetId });
  check("no auth → 403", anon.status === 403, anon.status + " " + JSON.stringify(anon.body));
  const nonAdmin = await reset({ userId: targetId }, viewerHeaders);
  check("viewer → 403", nonAdmin.status === 403, nonAdmin.status + " " + JSON.stringify(nonAdmin.body));
  const self = await reset({ userId: adminAuth.record.id }, adminHeaders);
  check("admin resets self → 400", self.status === 400, self.status + " " + JSON.stringify(self.body));
  const missingBody = await reset({}, adminHeaders);
  check("missing userId → 400", missingBody.status === 400, missingBody.status + " " + JSON.stringify(missingBody.body));
  const missing = await reset({ userId: "does-not-exist" }, adminHeaders);
  check("unknown user → 404", missing.status === 404, missing.status + " " + JSON.stringify(missing.body));

  // 2. Admin resets the target
  const ok = await reset({ userId: targetId }, adminHeaders);
  check(
    "reset → 200 with r_ invite token + email",
    ok.status === 200 && String(ok.body.inviteToken).startsWith("r_") && ok.body.email === "reset-target@fenrirclub.be",
    ok.status + " " + JSON.stringify(ok.body)
  );

  // 3. Old password is invalidated
  const oldLogin = await api("/api/collections/users/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: "reset-target@fenrirclub.be", password: "OldPassword123!" }),
  });
  check("old password rejected → 400", oldLogin.status === 400, oldLogin.status + " " + JSON.stringify(oldLogin.body));

  // 4. Accept the reset link: no name needed, name preserved, new password works
  const acceptReset = await api("/api/invites/accept", {
    method: "POST",
    body: JSON.stringify({
      token: ok.body.inviteToken,
      name: "",
      password: "NewPassword456!",
      passwordConfirm: "NewPassword456!",
    }),
  });
  check("reset accept → 200 with email", acceptReset.status === 200 && acceptReset.body.email === "reset-target@fenrirclub.be", acceptReset.status + " " + JSON.stringify(acceptReset.body));

  const after = await api("/api/collections/users/records/" + targetId, { headers: suHeaders });
  check("name preserved after reset", after.body.name === "Reset Me", JSON.stringify(after.body.name));
  check("invite token cleared after accept", after.body.inviteToken === "", JSON.stringify(after.body.inviteToken));

  const newLogin = await api("/api/collections/users/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: "reset-target@fenrirclub.be", password: "NewPassword456!" }),
  });
  check("new password works → 200", newLogin.status === 200, newLogin.status + " " + JSON.stringify(newLogin.body));

  // 5. Single-use
  const reuse = await api("/api/invites/accept", {
    method: "POST",
    body: JSON.stringify({
      token: ok.body.inviteToken,
      name: "",
      password: "AnotherPassword789!",
      passwordConfirm: "AnotherPassword789!",
    }),
  });
  check("reused reset token → 400", reuse.status === 400, reuse.status + " " + JSON.stringify(reuse.body));

  // 6. Resetting an account without a name still needs the name step
  const nameless = await api("/api/collections/users/records", {
    method: "POST",
    headers: suHeaders,
    body: JSON.stringify({
      email: "reset-nameless@fenrirclub.be",
      password: "__invite__",
      passwordConfirm: "__invite__",
      role: "viewer",
    }),
  });
  check("nameless user created", nameless.status === 200, nameless.status + " " + JSON.stringify(nameless.body));
  const resetNameless = await reset({ userId: nameless.body.id }, adminHeaders);
  check(
    "reset of nameless user → plain (non-r_) token",
    resetNameless.status === 200 && !String(resetNameless.body.inviteToken).startsWith("r_"),
    resetNameless.status + " " + JSON.stringify(resetNameless.body)
  );
  const noNameAccepts = await api("/api/invites/accept", {
    method: "POST",
    body: JSON.stringify({
      token: resetNameless.body.inviteToken,
      name: "",
      password: "NamelessPassword123!",
      passwordConfirm: "NamelessPassword123!",
    }),
  });
  check("name still required for nameless account → 400", noNameAccepts.status === 400, noNameAccepts.status + " " + JSON.stringify(noNameAccepts.body));
  const withNameAccepts = await api("/api/invites/accept", {
    method: "POST",
    body: JSON.stringify({
      token: resetNameless.body.inviteToken,
      name: "Now Named",
      password: "NamelessPassword123!",
      passwordConfirm: "NamelessPassword123!",
    }),
  });
  check("accept closes the loop → 200", withNameAccepts.status === 200, withNameAccepts.status + " " + JSON.stringify(withNameAccepts.body));
} catch (err) {
  failed++;
  console.log("  \u2718 test crashed:", err);
} finally {
  if (pb) {
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
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);