/// <reference path="../pb_data/types.d.ts" />

// ─────────────────────────────────────────────────────────────────────────────
// Forms hook — code generation + submission guard
// ------------------------------------------------
// NOTE: file must end with ".pb.js" for PocketBase to auto-load it!
//
//   onRecordCreateRequest("forms")             → generates a random `code`
//                                                (backstop for the
//                                                dashboard-generated codes).
//   onRecordCreateRequest("form_submissions")  → the real guard:
//                                                1. form must exist + be active
//                                                2. answers only reference known
//                                                   field ids
//                                                3. required fields present
//                                                4. type checks (email, number,
//                                                   select/radio/checkbox
//                                                   options, date)
//                                                5. per-IP rate limit
//                                                6. processing-hook dispatch
//                                                  (form.hook — see below)
//
// ── IMPORTANT: PocketBase v0.36 hook execution ──────────────────────────────
// Hook handlers run in an ISOLATED VM context and must be self-contained:
// module-level variables are NOT reachable from a handler (ReferenceError —
// same pattern as translate.pb.js / events-sync.pb.js). That is why the rate
// limiter stores its state in the `form_rate_limits` collection instead of an
// in-memory map: rows expire after 1h and cascade-delete with their form.
// ─────────────────────────────────────────────────────────────────────────────

console.log("[forms] hook loaded — code gen, submission validation + rate limit ready");

// ── TODO (later): auto-translate empty English fields ───────────────────────
// When a multiLanguage form is saved with label_en / content_en left empty,
// translate the Dutch label/content automatically with DeepL — same pattern as
// translate.pb.js (sponsors/preasidium). The Dutch label is required (that is
// the translation source), which the dashboard builder already enforces.

function formsHook(e) {
  const col = e.collection && e.collection.name;

  try {
    if (col === "forms") {
      // ── Code generation (only when the client didn't provide one) ──────
      const code = (e.record.getString("code") || "").trim();
      if (!code) {
        const alphabet = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/O/1/l/I
        const generate = () => {
          let out = "";
          for (let i = 0; i < 10; i++) {
            out += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
          }
          return out;
        };

        // Retry on unique-index collision (the index in 1776000001 is the
        // final guard; this keeps the create from failing on a rare clash).
        let candidate = generate();
        for (let attempts = 0; attempts < 10; attempts++) {
          const existing = $app.findRecordsByFilter(
            "forms",
            "code = '" + candidate + "'",
            "",
            1,
            0,
            {}
          );
          if (existing.length === 0) break;
          candidate = generate();
        }
        e.record.set("code", candidate);
      }
    } else if (col === "form_submissions") {
      // ── Submission guard ────────────────────────────────────────────────
      const abort = (status, message) => {
        if (typeof e.error === "function") {
          return e.error(status, message);
        }
        throw new Error(message);
      };

      const getClientIp = () => {
        try {
          if (e.httpContext && e.httpContext.RealIP) {
            const ip = String(e.httpContext.RealIP());
            if (ip) return ip;
          }
          // Fallback: the site is behind nginx-proxy, which sets X-Forwarded-For.
          const req = e.httpContext && e.httpContext.Request && e.httpContext.Request();
          const fwd = req && req.Header && req.Header().Get && req.Header().Get("X-Forwarded-For");
          if (fwd) {
            const first = String(fwd).split(",")[0].trim();
            if (first) return first;
          }
        } catch (err) {
          // fall through to "unknown"
        }
        return "unknown";
      };

      // 1. The referenced form must exist and be active.
      const formId = e.record.getString("form");
      let form = null;
      try {
        form = $app.findRecordById("forms", formId);
      } catch (err) {
        return abort(400, "This form does not exist.");
      }

      // Treat an unset `active` as true (the plan default is "active").
      let active = true;
      try {
        active = form.getString("active") === "" ? true : form.getBool("active");
      } catch (err) {
        active = true;
      }
      if (!active) {
        return abort(400, "This form is closed and no longer accepts submissions.");
      }

      // 2. Field schema of the form.
      // NOTE: in the JSVM, json fields are exposed as raw JSON BYTES (an array
      // of char codes) rather than parsed objects — decode before using.
      const parseJson = (value) => {
        if (value === null || value === undefined) return null;
        if (typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch (err) {
            return null;
          }
        }
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === "number") {
          let str = "";
          for (let i = 0; i < value.length; i++) str += String.fromCharCode(value[i]);
          try {
            return JSON.parse(str);
          } catch (err) {
            return null;
          }
        }
        if (Array.isArray(value) || typeof value === "object") return value;
        return null;
      };

      let fields = parseJson(form.get("fields"));
      if (!Array.isArray(fields)) fields = [];
      const fieldById = {};
      for (const f of fields) {
        if (f && f.id) fieldById[String(f.id)] = f;
      }

      // 3. answers must be an object whose keys are known field ids.
      let answers = parseJson(e.record.get("answers"));
      if (answers === null || Array.isArray(answers)) answers = null;
      if (!answers) {
        return abort(400, "Missing answers.");
      }
      for (const key of Object.keys(answers)) {
        if (!fieldById[key]) {
          return abort(400, "Unknown field in answers: " + key);
        }
      }

      // 4. Required + type checks.
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const dateRe = /^\d{4}-\d{2}-\d{2}$/;
      for (const f of fields) {
        // Display-only fields (section / image) collect no answer — skip.
        const ftype = f.type || "text";
        if (ftype === "section" || ftype === "image") continue;
        const id = String(f.id);
        const val = answers[id];
        const isEmpty =
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0);

        if (f.required && isEmpty) {
          return abort(400, "Field '" + (f.label || id) + "' is required.");
        }
        if (isEmpty) continue;

        const type = ftype;
        if (type === "email") {
          if (typeof val !== "string" || !emailRe.test(val)) {
            return abort(400, "Invalid email address for field '" + (f.label || id) + "'.");
          }
        } else if (type === "number") {
          const n = Number(val);
          if (val === "" || Number.isNaN(n)) {
            return abort(400, "Invalid number for field '" + (f.label || id) + "'.");
          }
        } else if (type === "select" || type === "radio") {
          const opts = Array.isArray(f.options) ? f.options : [];
          if (opts.indexOf(val) === -1) {
            return abort(400, "Invalid option for field '" + (f.label || id) + "'.");
          }
        } else if (type === "checkbox") {
          const opts = Array.isArray(f.options) ? f.options : [];
          if (!Array.isArray(val)) {
            return abort(400, "Invalid checkbox value for field '" + (f.label || id) + "'.");
          }
          for (const v of val) {
            if (opts.indexOf(v) === -1) {
              return abort(400, "Invalid option for field '" + (f.label || id) + "'.");
            }
          }
        } else if (type === "date") {
          if (typeof val !== "string" || !dateRe.test(val)) {
            return abort(400, "Invalid date for field '" + (f.label || id) + "'.");
          }
          const d = new Date(val + "T00:00:00Z");
          if (Number.isNaN(d.getTime())) {
            return abort(400, "Invalid date for field '" + (f.label || id) + "'.");
          }
        }
      }

      // 5. Per-IP rate limit (collection-backed): max 10 submissions per form
      //    per IP per hour. Best-effort anti-spam — rows expire after 1h and
      //    cascade-delete with the form; a limiter failure never rejects.
      const WINDOW_MS = 60 * 60 * 1000; // 1 hour
      const MAX_PER_WINDOW = 10;
      try {
        const ip = getClientIp();
        const filter = "form = '" + formId + "' && ip = '" + ip + "'";

        // 5a. Fetch the rows for this form+IP, drop stale ones (older than the
        // window) and count what remains. NB: avoid $app.countRecords — it does
        // not accept a filter string in this PB version.
        const cutoff = Date.now() - WINDOW_MS;
        const recent = $app.findRecordsByFilter(
          "form_rate_limits",
          filter,
          "-created",
          500,
          0,
          {}
        );
        let count = 0;
        for (const row of recent) {
          let created = Number.NaN;
          try {
            created = new Date(row.getString("created")).getTime();
          } catch (err) {
            // undecodable row
          }
          if (Number.isNaN(created) || created < cutoff) {
            $app.delete(row); // stale — keep the collection small
          } else {
            count++;
          }
        }

        // 5b. Enforce the limit for this form+IP.
        if (count >= MAX_PER_WINDOW) {
          return abort(429, "Too many submissions from this IP address. Please try again later.");
        }

        // 5c. Store this submission.
        const limitCol = $app.findCollectionByNameOrId("form_rate_limits");
        $app.save(new Record(limitCol, { form: formId, ip: ip }));
      } catch (err) {
        // Best-effort only — never reject a submission because the limiter broke.
        console.error("[forms] rate limiter failed (ignoring):", err);
      }

      // 6. Processing-hook dispatch — "I need this hook for that form".
      //    Form managers pick a key in the dashboard builder (FORM_HOOKS);
      //    devs add a new branch here (and the matching FORM_HOOKS entry).
      //    Runs AFTER validation, inside the same create — a processor failure
      //    never loses user input: the submission is still saved.
      const hookKey = form.getString("hook") || "none";
      if (hookKey && hookKey !== "none") {
        try {
          if (hookKey === "bugticket") {
            // Example processor: create a bug-ticket record in another
            // collection (replace with the real collection + mapping).
            // const tickets = $app.findCollectionByNameOrId("bug_tickets");
            // $app.save(new Record(tickets, {
            //   "title": (answers.title || "No title") + " (via " + form.getString("title") + ")",
            //   "details": JSON.stringify(answers),
            // }));
            console.log("[forms] bugticket processor would run for form " + form.id);
          } else {
            console.warn("[forms] unknown processing hook '" + hookKey + "' (form " + form.id + ") — skipping");
          }
        } catch (err) {
          console.error("[forms] processing hook '" + hookKey + "' failed (submission kept):", err);
        }
      }
    }
  } catch (err) {
    // Never break a save because of a hook bug — log and continue.
    console.error("[forms] hook failed (continuing):", err);
  }

  // Required: continue the request/save chain (unless aborted above).
  e.next();
}

onRecordCreateRequest(formsHook, "forms", "form_submissions");
