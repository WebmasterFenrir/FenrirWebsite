/// <reference path="../pb_data/types.d.ts" />

// ─────────────────────────────────────────────────────────────────────────────
// Translate-on-save hook
// ----------------------
// NOTE: file must end with ".pb.js" for PocketBase to auto-load it!
//
// Automatically translates Dutch content written by admins into English so the
// website can show both languages without double data entry.
//
//   - sponsors.content            (json array of strings)  -> content_en
//   - preasidium_leden.description (text)                  -> description_en
//
// Requires a DeepL API key (free tier is fine):  DEEPL_API_KEY
// Optional override for self-hosted/other endpoints:  DEEPL_API_URL
//
// ── IMPORTANT: PocketBase v0.36 hook execution ──────────────────────────────
// Hook handlers run in an ISOLATED VM context: they CANNOT reference
// module-level variables/functions or globalThis state (that throws
// "ReferenceError: ... is not defined" and aborts the request with a generic
// 400). Everything the handler needs must be defined INSIDE the handler body.
// That is why all helpers below live inside translateHook().
//
// Request hooks must also call e.next() to continue the save operation, and
// JSON string-array fields are read via record.getStringSlice().
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[translate] hook loaded — v0.36 self-contained mode" +
    ($os.getenv("DEEPL_API_KEY") ? " (DeepL key found)" + $os.getenv("DEEPL_API_KEY"): " (WARNING: DEEPL_API_KEY is not set)")
);

function translateHook(e) {
  const apiKey = $os.getenv("DEEPL_API_KEY") || "";
  const apiUrl =
    $os.getenv("DEEPL_API_URL") || "https://api-free.deepl.com/v2/translate";

  /** Read a JSON string-array field, tolerating empty/null/missing values. */
  const readSlice = (record, field) => {
    try {
      return record.getStringSlice(field) || [];
    } catch (err) {
      return [];
    }
  };

  /**
   * Whether the value returned by getValue changed vs. the persisted state.
   * getValue must use the right accessor for the field type
   * (getStringSlice for json arrays, getString for text).
   */
  const fieldChanged = (getValue) => {
    try {
      const original = e.record.original();
      if (!original) return true; // e.g. create
      return (
        JSON.stringify(getValue(original)) !== JSON.stringify(getValue(e.record))
      );
    } catch (err) {
      return true;
    }
  };

  /**
   * Translate an array of strings NL -> EN via the DeepL API.
   * Returns the translated texts in the same order (empty inputs preserved),
   * or null when the request fails.
   */
  const translateTexts = (texts) => {
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
      timeout: 10, // seconds; don't block saves when DeepL is slow/down
    });

    if (res.statusCode !== 200) {
      let detail = "";
      try {
        detail = JSON.stringify(res.json);
      } catch (err) {
        try {
          detail = toString(res.body || []);
        } catch (err2) {
          detail = "";
        }
      }
      console.error("[translate] DeepL error " + res.statusCode + ": " + detail);
      return null;
    }

    const json = res.json;
    if (!json || !Array.isArray(json.translations)) {
      console.error(
        "[translate] Unexpected DeepL response: " + JSON.stringify(json || "")
      );
      return null;
    }

    // map translated results back onto the original array (preserving empty entries)
    // and falling back to the source text if DeepL returns fewer results
    let idx = 0;
    return chunks.map((c) =>
      c.text.trim().length === 0 || !json.translations[idx]
        ? c.text
        : json.translations[idx++].text
    );
  };

  try {
    const col = e.collection && e.collection.name;

    if (col === "sponsors") {
      const dutch = readSlice(e.record, "content");
      const existing = readSlice(e.record, "content_en");

      if (existing.length === 0 || fieldChanged((r) => readSlice(r, "content"))) {
        if (dutch.length === 0) {
          e.record.set("content_en", []);
        } else {
          const translated = translateTexts(dutch);
          if (translated) e.record.set("content_en", translated);
        }
      }
    } else if (col === "preasidium_leden") {
      const dutch = e.record.getString("description");
      const existing = e.record.getString("description_en");

      if (!existing || fieldChanged((r) => r.getString("description"))) {
        if (!dutch || dutch.trim().length === 0) {
          e.record.set("description_en", "");
        } else {
          const translated = translateTexts([dutch]);
          if (translated) e.record.set("description_en", translated[0]);
        }
      }
    }
  } catch (err) {
    // Never break the save because of a failed translation
    console.error("[translate] hook failed:", err);
  }

  // Required: continue the request/save chain
  e.next();
}

onRecordCreateRequest(translateHook, "sponsors", "preasidium_leden");
onRecordUpdateRequest(translateHook, "sponsors", "preasidium_leden");
