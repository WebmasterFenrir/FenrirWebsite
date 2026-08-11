/// <reference path="../pb_data/types.d.ts" />

// ─────────────────────────────────────────────────────────────────────────────
// Events sync scheduler + manual trigger
// --------------------------------------
// NOTE: file must end with ".pb.js" for PocketBase to auto-load it!
//
// The Facebook events scraper needs a real browser (puppeteer), which cannot
// run inside PocketBase's JSVM. So this hook only orchestrates the dedicated
// `events-sync` container over HTTP:
//
//   1. cronAdd   — triggers POST /run on a schedule (default every 6 hours).
//   2. routerAdd — exposes POST /api/events-sync/run so the dashboard's
//                  "Sync now" button can trigger a run on demand (admin only).
//
// Syncs can be paused via the facebook_settings.paused flag (kill-switch).
//
// Requires env:  EVENTS_SYNC_URL
//   default http://127.0.0.1:3000  (local dev — the events-sync service on the
//   same machine). docker-compose overrides it with http://events-sync:3000 so
//   the production pocketbase container can reach the events-sync container
//   over the internal Docker network.
// ─────────────────────────────────────────────────────────────────────────────
//
// IMPORTANT (modern PocketBase): hook handlers run in an ISOLATED VM context
// and CANNOT reference module-level variables/functions (that throws a
// ReferenceError and silently breaks the job). Everything a handler needs must
// be defined INSIDE its body — hence the repeated helper code below.
//
// Auth access uses the current RequestEvent API:
//   - e.auth               → the authenticated record (or null for guests)
//   - e.hasSuperuserAuth() → whether the client is a superuser
// (The older `$apis.requestInfo(c)` no longer exists on current PocketBase.)

console.log("[events-sync] hook loaded — scheduler + manual trigger ready");

// Every 6 hours. The cron expression follows standard 5-field syntax.
// (Registering at top level runs once at hook load.)
cronAdd("events-sync-scheduler", "0 */6 * * *", () => {
  try {
    const rec = $app.findFirstRecordByFilter("facebook_settings", "id != ''");
    if (rec && rec.getBool("paused")) {
      console.log("[events-sync] scheduled run skipped (facebook_settings.paused = true)");
      return;
    }
  } catch (err) {
    // no settings record yet — just run (the sync service will report config errors)
  }

  const base = ($os.getenv("EVENTS_SYNC_URL") || "http://127.0.0.1:3000").replace(/\/+$/, "");
  try {
    const res = $http.send({
      url: base + "/run",
      method: "POST",
      timeout: 300, // seconds; scraping can take a while
    });
    console.log(
      "[events-sync] scheduled run -> " + res.statusCode + " " + JSON.stringify(res.json || "")
    );
  } catch (err) {
    console.error("[events-sync] scheduled run failed:", err);
  }
});

// Manual trigger for the dashboard "Sync now" button (admin only).
// Everything is wrapped so the REAL error surfaces instead of PocketBase's
// generic 400 "Something went wrong while processing your request".
routerAdd("POST", "/api/events-sync/run", (e) => {
  try {
    // 1. Authenticate — self-diagnosing: the 403 message echoes the role PB
    //    actually read, and the attempt is logged to the PB console.
    const auth = e.auth; // logged-in user (users collection) or null
    const superuser = e.hasSuperuserAuth(); // superuser (pb_admin)
    if (!auth && !superuser) {
      return e.json(403, { ok: false, message: "Admins only (no authenticated user found in request)" });
    }

    let role = "superuser";
    let who = "superuser";
    if (auth) {
      try {
        role = auth.getString("role");
        who = auth.getString("email") || auth.id || "unknown";
      } catch (err) {
        console.error("[events-sync] role read failed:", err);
      }
    }
    console.log("[events-sync] manual run by " + who + " — role: " + JSON.stringify(role));
    if (!superuser && role !== "admin") {
      return e.json(403, { ok: false, message: "Admins only (your role: '" + role + "')" });
    }

    // 2. Pause kill-switch (missing collection/record is not fatal)
    let paused = false;
    try {
      const rec = $app.findFirstRecordByFilter("facebook_settings", "id != ''");
      paused = !!rec && rec.getBool("paused");
    } catch (err) {
      console.log("[events-sync] pause check skipped (" + err + ")");
    }
    if (paused) {
      return e.json(409, { ok: false, message: "Sync is paused (facebook_settings.paused = true)" });
    }

    // 3. Trigger the events-sync service
    const base = ($os.getenv("EVENTS_SYNC_URL") || "http://127.0.0.1:3000").replace(/\/+$/, "");
    const res = $http.send({
      url: base + "/run",
      method: "POST",
      timeout: 300, // seconds
    });
    const body = res.json || {};
    return e.json(res.statusCode === 200 ? 200 : 502, {
      ok: res.statusCode === 200,
      ...body,
    });
  } catch (err) {
    console.error("[events-sync] manual run error:", err);
    return e.json(500, { ok: false, message: "Manual run error: " + err });
  }
});
