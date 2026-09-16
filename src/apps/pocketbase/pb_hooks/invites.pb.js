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
// Password resets reuse the same single-use invite mechanism:
//   POST /api/invites/reset   (admins only) — invalidates the user's current
//     password (swapped for a random one nobody knows) and issues a fresh
//     invite link. Reset tokens are prefixed with "r_" so the invite page can
//     skip the name step for accounts that already have one.
//   POST /api/invites/accept — when the account already has a name it is
//     preserved (the reset link is about the password, not the profile).
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

    // A reset link is about the password, not the profile — keep the name the
    // account already has. The name is only required for first-time onboardings.
    const existingName = String(record.getString("name") || "").trim();
    if (!existingName) {
      if (!name) {
        return e.json(400, { message: "Name is required." });
      }
      record.set("name", name);
    }
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

// Admin-only reset: invalidate the user's current password (swap it for a
// random one nobody knows) and issue a fresh single-use invite link, so the
// user sets a new password themselves. Reset tokens are prefixed "r_" so the
// invite page can skip the name step for accounts that already have one.
routerAdd("POST", "/api/invites/reset", (e) => {
  try {
    const info = e.requestInfo();

    // Superusers always pass; otherwise the requester must be a user with the
    // admin role (PB rules are skipped by this custom route, so we re-enforce
    // the same boundary the dashboard UI gates on).
    let isAdmin = false;
    try {
      isAdmin = !!info.admin;
    } catch (err) {
      isAdmin = false;
    }
    try {
      if (info.auth) isAdmin = isAdmin || info.auth.get("role") === "admin";
    } catch (err) {
      // unreadable role — treated as not an admin
    }
    if (!isAdmin) {
      return e.json(403, { message: "Only admins can reset passwords." });
    }

    const body = info.body || {};
    const userId = String(body.userId || "").trim();
    if (!userId) {
      return e.json(400, { message: "Missing user id." });
    }
    // Resetting yourself would lock you out — the old password is invalidated.
    try {
      if (info.auth && info.auth.id === userId) {
        return e.json(400, { message: "You cannot reset your own password." });
      }
    } catch (err) {
      // superuser has no auth record — id check does not apply
    }

    let record;
    try {
      record = $app.findRecordById("users", userId);
    } catch (err) {
      return e.json(404, { message: "User not found." });
    }

    // Only accounts that already have a display name get the "r_" prefix (which
    // tells the invite page to skip the name step). A user who never finished
    // onboarding still needs to pick a name on the reset link.
    const hasName = String(record.getString("name") || "").trim().length > 0;
    record.setPassword($security.randomString(32));
    record.set("inviteToken", (hasName ? "r_" : "") + $security.randomString(48));
    $app.save(record);

    console.log(
      "[invites] password reset for " + (record.getString("email") || record.id)
    );
    return e.json(200, {
      inviteToken: record.getString("inviteToken"),
      email: record.getString("email"),
    });
  } catch (err) {
    console.error("[invites] reset failed:", err);
    return e.json(500, { message: "Something went wrong. Please try again." });
  }
});
