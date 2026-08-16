/// <reference path="../pb_data/types.d.ts" />

// ─────────────────────────────────────────────────────────────────────────────
// Forms hook — code generation + submission guard
// ------------------------------------------------
// NOTE: file must end with ".pb.js" for PocketBase to auto-load it!
//
//   onRecordCreateRequest("forms")             → generates a random `code`
//                                                (backstop for the
//                                                dashboard-generated codes).
//   onRecordCreateRequest("forms") + onRecordUpdateRequest("forms")
//                                              → DeepL auto-translate for
//                                                multiLanguage forms (title_en,
//                                                description_en, label_en,
//                                                content_en).
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

console.log(
  "[forms] hook loaded — code gen, submission validation + rate limit ready" +
    ($os.getenv("GITHUB_TOKEN") ? " (GITHUB_TOKEN set)" : " (WARNING: GITHUB_TOKEN is not set)")
);

function formsHook(e) {
  const col = e.collection && e.collection.name;

  // Decode a JSON field, tolerating raw-byte arrays (PB v0.36 JSVM exposes
  // json values as arrays of char codes), strings and real objects.
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

      // ── Auto-translate empty English fields (multiLanguage forms only) ──
      // DeepL NL → EN, same self-contained pattern as translate.pb.js. Fills
      // title_en / description_en and each field's label_en / content_en — but
      // ONLY when the English input is missing: a manually typed (custom)
      // translation is never overwritten. Rendered by the form site via the
      // NL/EN toggle. Never breaks the save when DeepL is missing/down.
      const translateTexts = (texts) => {
        const apiKey = $os.getenv("DEEPL_API_KEY") || "";
        const apiUrl =
          $os.getenv("DEEPL_API_URL") || "https://api-free.deepl.com/v2/translate";
        const chunks = texts.map((t) => ({ text: t ?? "" }));
        const toSend = chunks
          .filter((c) => c.text.trim().length > 0)
          .map((c) => c.text);

        if (toSend.length === 0) return texts;
        if (!apiKey) return null;

        const res = $http.send({
          url: apiUrl,
          method: "POST",
          headers: {
            Authorization: "DeepL-Auth-Key " + apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: toSend,
            source_lang: "NL",
            target_lang: "EN",
          }),
          timeout: 10,
        });

        if (res.statusCode !== 200) {
          console.error("[forms] DeepL error " + res.statusCode);
          return null;
        }
        const json = res.json;
        if (!json || !Array.isArray(json.translations)) {
          console.error("[forms] Unexpected DeepL response");
          return null;
        }
        let idx = 0;
        return chunks.map((c) =>
          c.text.trim().length === 0 || !json.translations[idx]
            ? c.text
            : json.translations[idx++].text
        );
      };

      try {
        let isMulti = false;
        try {
          isMulti = e.record.getBool("multiLanguage");
        } catch (err) {
          isMulti = false;
        }
        if (isMulti) {
          // Persisted state (null on create) — lets us detect what actually
          // changed in this save so we never clobber manual edits and only
          // re-translate when the Dutch source changed (same fieldChanged
          // pattern as translate.pb.js).
          let original = null;
          try {
            original = e.record.original();
          } catch (err) {
            original = null;
          }
          const getStr = (rec, name) => {
            if (!rec) return "";
            try {
              const v = rec.getString(name);
              return typeof v === "string" ? v : "";
            } catch (err) {
              return "";
            }
          };

          // Decide the English value for one text:
          //   • Dutch empty → nothing to translate (EN cleared).
          //   • EN edited in THIS save (differs from persisted) → keep as-is:
          //     a manually typed translation is never overwritten.
          //   • EN filled + Dutch unchanged → keep (no DeepL call).
          //   • EN filled + Dutch changed → re-translate, refreshing stale
          //     auto-translations when the admin edits the Dutch text.
          //   • EN empty → translate (also retries after a previous DeepL
          //     failure, since an empty EN is retried on the next save).
          // On failure the old value is kept — a missing/down DeepL never
          // breaks the save (the empty-fill case stays empty and is retried).
          const resolveEn = (dutch, en, dutchWas, enWas) => {
            const nl = String(dutch || "").trim();
            const cur = String(en || "");
            if (nl.length === 0) return "";
            if (cur.length > 0) {
              if (cur !== enWas) return cur; // manual edit now — keep
              if (nl === dutchWas) return cur; // nothing changed — keep
              const out = translateTexts([nl]);
              return out ? out[0] : cur; // refresh stale translation
            }
            const out = translateTexts([nl]);
            return out ? out[0] : ""; // fill when empty
          };

          // Title + description.
          e.record.set(
            "title_en",
            resolveEn(
              getStr(e.record, "title"),
              getStr(e.record, "title_en"),
              getStr(original, "title"),
              getStr(original, "title_en")
            )
          );
          e.record.set(
            "description_en",
            resolveEn(
              getStr(e.record, "description"),
              getStr(e.record, "description_en"),
              getStr(original, "description"),
              getStr(original, "description_en")
            )
          );

          // Field labels (all types) + section content.
          const fields = parseJson(e.record.get("fields"));
          if (Array.isArray(fields)) {
            // Persisted fields by id, to compare each field's NL/EN state.
            const wasFields = parseJson(
              original && original.get ? original.get("fields") : null
            );
            const wasById = {};
            if (Array.isArray(wasFields)) {
              for (const wf of wasFields) {
                if (wf && wf.id !== undefined) wasById[String(wf.id)] = wf;
              }
            }
            const translated = fields.map((f) => {
              if (!f || typeof f !== "object") return f;
              const prev = wasById[String(f.id)] || {};
              const next = Object.assign({}, f);
              if (typeof next.label === "string") {
                next.label_en = resolveEn(
                  next.label,
                  typeof next.label_en === "string" ? next.label_en : "",
                  typeof prev.label === "string" ? prev.label : "",
                  typeof prev.label_en === "string" ? prev.label_en : ""
                );
              }
              if (typeof next.content === "string") {
                next.content_en = resolveEn(
                  next.content,
                  typeof next.content_en === "string" ? next.content_en : "",
                  typeof prev.content === "string" ? prev.content : "",
                  typeof prev.content_en === "string" ? prev.content_en : ""
                );
              }
              return next;
            });
            e.record.set("fields", translated);
          }
        }
      } catch (err) {
        // Never break the save because of a failed translation.
        console.error("[forms] auto-translate failed (continuing):", err);
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
      // (parseJson is shared from the top of formsHook.)
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

      // 5.5 Helper for the "bugticket" processor — turn this submission into a
      //     GitHub issue and POST it via the GitHub Issues API. Self-contained
      //     (JSVM — no module-level state) and fire-and-forget: a failure is
      //     logged but never rejects the submission (the submission is saved
      //     regardless, per section 6).
      //     Env: GITHUB_TOKEN (required), GITHUB_REPO (default
      //     WebmasterFenrir/FenrirWebsite), GITHUB_API_URL (default
      //     https://api.github.com — also used to point tests at a mock).
      const createGithubIssue = (form, answers, fields) => {
        const token = $os.getenv("GITHUB_TOKEN") || "";
        const repo = $os.getenv("GITHUB_REPO") || "WebmasterFenrir/FenrirWebsite";
        const apiBase = $os.getenv("GITHUB_API_URL") || "https://api.github.com";

        if (!token) {
          console.error(
            "[forms] bugticket: GITHUB_TOKEN is not set — skipping GitHub issue creation"
          );
          return;
        }

        // Labels a form answer may map to — mirrors the labels that exist in
        // the WebmasterFenrir/FenrirWebsite repo. Unknown labels make the API
        // reject the issue with 422, so candidates are filtered against this.
        const knownLabels = [
          "bug", "enhancement", "improvement", "urgent", "question",
          "documentation", "spelling mistake", "breaking bug", "duplicate",
          "invalid", "wontfix", "help wanted", "good first issue",
        ];

        let title = "";
        const bodyParts = [];
        const labelCandidates = [];

        for (const f of fields) {
          if (!f || f.id === undefined) continue;
          const ftype = f.type || "text";
          if (ftype === "section" || ftype === "image") continue;
          const id = String(f.id);
          const val = answers[id];
          const label = f.label || id;

          // select / radio / checkbox answers that match a known repo label
          // become issue labels (deduped, lowercased — GitHub matches by name).
          if (ftype === "select" || ftype === "radio" || ftype === "checkbox") {
            const vals = Array.isArray(val)
              ? val
              : val === undefined || val === null
                ? []
                : [val];
            for (const v of vals) {
              const s = String(v).trim();
              if (!s) continue;
              const lower = s.toLowerCase();
              if (
                knownLabels.indexOf(lower) !== -1 &&
                labelCandidates.indexOf(lower) === -1
              ) {
                labelCandidates.push(lower);
              }
            }
          }

          // The first free-text answer doubles as the issue title.
          if (!title && (ftype === "text" || ftype === "textarea")) {
            const s = typeof val === "string" ? val.trim() : "";
            if (s.length > 0) title = s;
          }

          // Render every answer into the issue body (markdown).
          let display;
          if (Array.isArray(val)) {
            display = val.length > 0 ? val.join(", ") : "—";
          } else if (val === undefined || val === null || val === "") {
            display = "—";
          } else {
            display = String(val);
          }
          bodyParts.push("**" + label + "**\n" + display);
        }

        const formTitle = form.getString("title") || "Untitled form";
        const formCode = form.getString("code") || "";
        if (title.length === 0) title = "Form submission: " + formTitle;
        if (title.length > 72) title = title.slice(0, 72);

        // Labels are the bare minimum alongside title+body: option answers that
        // matched known labels win, otherwise fall back to "bug".
        const labels = labelCandidates.length > 0 ? labelCandidates : ["bug"];
        const body =
          "Submitted via the **" + formTitle + "** form (`/" + formCode + "`).\n\n" +
          bodyParts.join("\n\n");

        const postIssue = (labelsToSend) =>
          $http.send({
            url: apiBase + "/repos/" + repo + "/issues",
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
              Accept: "application/vnd.github+json",
              "Content-Type": "application/json",
              "X-GitHub-Api-Version": "2022-11-28",
            },
            body: JSON.stringify({ title: title, body: body, labels: labelsToSend }),
            timeout: 10,
          });

        let res = postIssue(labels);
        // A label that no longer exists in the repo makes GitHub reject the
        // issue with 422 — retry once without labels so it still gets created.
        if (res.statusCode === 422) {
          res = postIssue([]);
        }

        if (res.statusCode === 201) {
          let htmlUrl = "";
          try {
            htmlUrl = res.json && res.json.html_url ? res.json.html_url : "";
          } catch (err) {
            htmlUrl = "";
          }
          console.log(
            "[forms] bugticket: created GitHub issue" +
              (htmlUrl ? " " + htmlUrl : " (" + repo + ")")
          );
        } else {
          let detail = "";
          try {
            detail = JSON.stringify(res.json);
          } catch (err) {
            detail = "";
          }
          console.error(
            "[forms] bugticket: GitHub API " +
              res.statusCode +
              (detail ? " — " + detail : "")
          );
        }
      };

      // 6. Processing-hook dispatch — "I need this hook for that form".
      //    Form managers pick a key in the dashboard builder (FORM_HOOKS);
      //    devs add a new branch here (and the matching FORM_HOOKS entry).
      //    Runs AFTER validation, inside the same create — a processor failure
      //    never loses user input: the submission is still saved.
      const hookKey = form.getString("hook") || "none";
      if (hookKey && hookKey !== "none") {
        try {
          if (hookKey === "bugticket") {
            createGithubIssue(form, answers, fields);
          } else if (hookKey === "inschrijvingen") {
            // The leden mapping needs the saved submission's id (for the
            // `source` relation), so it runs in formsAfterCreateHook below —
            // recognized here so it isn't logged as unknown.
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

// ─────────────────────────────────────────────────────────────────────────────
// inschrijvingen processing hook (member registry — see PLAN-members.md)
// -----------------------------------------------------
// Runs AFTER a "Lid worden" form submission is saved so the new submission's
// id is available for the `leden.source` relation (cascadeDelete). Maps the
// validated answers onto a `leden` record by field LABEL (normalized,
// case-insensitive `includes`) — the same convention the bugticket hook uses
// for option labels. Fire-and-forget: a failure is logged but never loses user
// input (the submission is already saved by this point).
function formsAfterCreateHook(e) {
  if (!e.record) return e.next();

  try {
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

    // Resolve the form; only continue for the inschrijvingen hook.
    const formId = e.record.getString("form");
    let form = null;
    try {
      form = $app.findRecordById("forms", formId);
    } catch (err) {
      return e.next();
    }
    if ((form.getString("hook") || "none") !== "inschrijvingen") return e.next();

    let fields = parseJson(form.get("fields"));
    if (!Array.isArray(fields)) fields = [];
    let answers = parseJson(e.record.get("answers"));
    if (!answers || Array.isArray(answers)) answers = {};

    // Normalized label matching (lowercase, collapsed whitespace).
    const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();

    // First answer whose field label contains one of the given keys.
    const fieldValue = (keys) => {
      for (const f of fields) {
        if (!f || f.id === undefined) continue;
        const t = f.type || "text";
        if (t === "section" || t === "image") continue;
        const label = norm(f.label || "");
        if (!label) continue;
        for (const k of keys) {
          if (label.indexOf(norm(k)) !== -1) {
            const raw = answers[String(f.id)];
            if (Array.isArray(raw)) return raw.length > 0 ? raw.join(", ") : "";
            return raw === null || raw === undefined ? "" : String(raw).trim();
          }
        }
      }
      return undefined;
    };

    // name: matched label first, fallback to the first non-empty text answer.
    let name = fieldValue(["voornaam + achternaam", "voornaam", "naam"]);
    if (!name) {
      for (const f of fields) {
        const t = f.type || "text";
        if (t !== "text" && t !== "textarea") continue;
        const raw = answers[String(f.id)];
        if (raw !== undefined && raw !== null) {
          const s = Array.isArray(raw) ? raw.join(", ") : String(raw).trim();
          if (s) {
            name = s;
            break;
          }
        }
      }
    }
    if (!name) {
      console.warn("[forms] inschrijvingen: no name matched — skipping leden row (submission kept)");
      return e.next();
    }

    // Current active club year = newest preasidium_years (same source of truth
    // as the preasidium pages: sorted by -yearId).
    let yearId = "";
    try {
      const years = $app.findRecordsByFilter("preasidium_years", "", "-yearId", 1, 0, {});
      if (years.length > 0) yearId = years[0].id;
    } catch (err) {
      console.error("[forms] inschrijvingen: could not resolve club year:", err);
    }
    if (!yearId) {
      console.warn("[forms] inschrijvingen: no club year found — skipping leden row (submission kept)");
      return e.next();
    }

    // language: raw radio answer → NL / EN.
    const langRaw = fieldValue(["taal", "language"]);
    let language = "";
    if (langRaw !== undefined) {
      const l = norm(langRaw);
      language = l.indexOf("engels") !== -1 || l.indexOf("english") !== -1 ? "EN" : "NL";
    }

    const mapped = {
      name: name,
      email: fieldValue(["e-mailadres", "e-mail", "emailadres", "email"]) || "",
      phone: fieldValue(["telefoonnummer", "telefoon", "gsm"]) || "",
      birthdate: fieldValue(["geboortedatum", "geboorte"]) || "",
      language: language,
      kdg_student: fieldValue(["kdg-student", "kdg student", "kdg"]) || "",
      student_number: fieldValue(["studentennummer", "studentnummer"]) || "",
      richting: fieldValue(["richting", "studierichting"]) || "",
      sport_event: fieldValue(["wil je mee badmintonnen", "badminton"]) || "",
      student_doop: fieldValue(["neem je deel met de teambuilding", "teambuilding", "studentendoop", "doop"]) || "",
      payment_method: fieldValue(["betalingswijze", "betaal", "betalen"]) || "",
    };

    // Warn about answer fields that map to no leden column (never fatal — the
    // answer still lives in the raw submission).
    const knownKeys = [
      "voornaam", "naam", "geboortedatum", "geboorte", "taal", "language",
      "kdg", "studentennummer", "studentnummer", "richting", "e-mail",
      "email", "telefoon", "gsm", "badminton", "teambuilding",
      "studentendoop", "doop", "betalingswijze", "betaal", "betalen",
    ];
    for (const f of fields) {
      if (!f || f.id === undefined) continue;
      const t = f.type || "text";
      if (t === "section" || t === "image") continue;
      const label = norm(f.label || "");
      if (!label) continue;
      let matched = false;
      for (const k of knownKeys) {
        if (label.indexOf(k) !== -1) {
          matched = true;
          break;
        }
      }
      if (!matched) {
        console.warn(
          "[forms] inschrijvingen: unmatched field '" + (f.label || String(f.id)) + "' (stored in submission only)"
        );
      }
    }

    // Upsert: same email + same year → update the existing row instead of
    // creating a duplicate (resubmission / correction). No email → new row.
    const ledenCol = $app.findCollectionByNameOrId("leden");
    let existing = null;
    if (mapped.email) {
      const found = $app.findRecordsByFilter(
        "leden",
        "email = {:email} && year = {:year}",
        "",
        1,
        0,
        { email: mapped.email, year: yearId }
      );
      if (found.length > 0) existing = found[0];
    }

    const data = {
      year: yearId,
      name: mapped.name,
      email: mapped.email,
      phone: mapped.phone,
      birthdate: mapped.birthdate,
      language: mapped.language,
      kdg_student: mapped.kdg_student,
      student_number: mapped.student_number,
      richting: mapped.richting,
      sport_event: mapped.sport_event,
      student_doop: mapped.student_doop,
      payment_method: mapped.payment_method,
      source: e.record.id,
    };

    let rec;
    if (existing) {
      rec = existing;
      for (const key of Object.keys(data)) rec.set(key, data[key]);
    } else {
      rec = new Record(ledenCol, data);
    }
    $app.save(rec);
    console.log(
      "[forms] inschrijvingen: " + (existing ? "updated" : "created") + " leden row for " + mapped.name
    );
  } catch (err) {
    // Never break the (already-saved) submission because of a mapping bug.
    console.error("[forms] inschrijvingen hook failed (submission kept):", err);
  }

  e.next();
}

onRecordCreateRequest(formsHook, "forms", "form_submissions");
onRecordUpdateRequest(formsHook, "forms");
onRecordAfterCreateSuccess(formsAfterCreateHook, "form_submissions");
