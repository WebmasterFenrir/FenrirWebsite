/// <reference path="../pb_data/types.d.ts" />

// ─────────────────────────────────────────────────────────────────────────────
// Invite-based onboarding for dashboard users
// ------------------------------------------------
// Admins no longer create accounts with a shared password. Instead:
//   1. The dashboard creates the user with the sentinel password below
//      (email + role + optional name; the password is never stored as-is).
//   2. `onRecordCreateRequest("users")` replaces it with a random password
//      nobody knows and stores a single-use `inviteToken` on the record.
//   3. The dashboard shows the invite link (`/invite?token=…`) to the admin,
//      who forwards it to the new member.
//   4. The member opens the link and POSTs to `/api/invites/accept` with
//      their display name + chosen password. The route validates the token,
//      sets name + password, clears the token (single-use) and returns the
//      email so the dashboard can log them straight in.
//
// Direct creates with a real password (API clients, smoke tests) are
// untouched — invite mode only kicks in for the sentinel value.
//
// NOTE: PB v0.36 handlers run in an ISOLATED VM — module-level variables are
// not reachable (ReferenceError), so the sentinel is inlined below.
// ─────────────────────────────────────────────────────────────────────────────

// Create a random unguessable password + invite token when the dashboard
// creates a user (identified by the sentinel password it always sends).
// NOTE: `e.next()` is REQUIRED in every path — without it the request chain
// stops and the record is never created (the forms hook has the same rule).
onRecordCreateRequest((e) => {
  if (!e.collection || e.collection.name !== "users") return e.next();
  try {
    if (e.record.getString("password") !== "__invite__") return e.next();
  } catch (err) {
    return e.next(); // no usable password on the record — not an invite create
  }

  e.record.setPassword($security.randomString(32));
  e.record.set("inviteToken", $security.randomString(48));
  e.next();
}, "users");

// Accept an invite: the only path where a user sets their own password.
// No auth needed — the token itself is the credential.
routerAdd("POST", "/api/invites/accept", (e) => {
  try {
    const body = e.requestInfo().body || {};
    const token = String(body.token || "").trim();
    const name = String(body.name || "").trim();
    const password = String(body.password || "");
    const confirm = String(body.passwordConfirm || "");

    if (!token) {
      return e.json(400, { message: "This invite link is missing its token." });
    }
    if (!name) {
      return e.json(400, { message: "Name is required." });
    }
    if (password.length < 8) {
      return e.json(400, { message: "Password must be at least 8 characters." });
    }
    if (password !== confirm) {
      return e.json(400, { message: "Passwords do not match." });
    }

    // findRecordsByFilter (plural) — findFirstRecordByFilter throws
    // "sql: no rows" when nothing matches on this PB build.
    const found = $app.findRecordsByFilter(
      "users",
      "inviteToken = {:token}",
      "",
      1,
      0,
      { token: token }
    );
    if (found.length === 0) {
      return e.json(400, { message: "This invite link is invalid or has already been used." });
    }
    const record = found[0];

    record.set("name", name);
    record.setPassword(password);
    record.set("inviteToken", "");
    $app.save(record);

    console.log("[invites] accepted by " + (record.getString("email") || record.id));
    return e.json(200, { email: record.getString("email") });
  } catch (err) {
    console.error("[invites] accept failed:", err);
    return e.json(500, { message: "Something went wrong. Please try again." });
  }
});
