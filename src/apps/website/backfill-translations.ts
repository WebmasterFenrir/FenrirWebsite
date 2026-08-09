/**
 * Backfill script: translate existing Dutch content into English.
 *
 * Requires the PocketBase server to be running WITH the translate hook
 * (pb_hooks/translate.pb.js). Re-saving each record triggers the hook, which
 * fills content_en / description_en via DeepL.
 *
 * Run: bun backfill-translations.ts  (from src/apps/website/)
 *
 * Required env vars:
 *   PB_EMAIL     – superuser email
 *   PB_PASSWORD  – superuser password
 *   PB_URL       – optional, defaults to http://127.0.0.1:8090
 *   (DEEPL_API_KEY must be configured on the PocketBase server itself)
 */

import PocketBase from "pocketbase";

const PB_URL = process.env.PB_URL ?? "http://127.0.0.1:8090";
const PB_EMAIL = process.env.PB_EMAIL ?? "";
const PB_PASSWORD = process.env.PB_PASSWORD ?? "";

if (!PB_EMAIL || !PB_PASSWORD) {
    console.error("❌  Set PB_EMAIL and PB_PASSWORD environment variables");
    process.exit(1);
}

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

async function main() {
    console.log(`Connecting to PocketBase at ${PB_URL} …`);
    await pb.collection("_superusers").authWithPassword(PB_EMAIL, PB_PASSWORD);
    console.log("✓ Authenticated");

    // ── sponsors: translate content → content_en ─────────────────────────────
    const sponsors = await pb.collection("sponsors").getFullList();
    let sponsorCount = 0;
    for (const s of sponsors) {
        const hasDutch = Array.isArray(s.content) && s.content.length > 0;
        const hasEnglish = Array.isArray(s.content_en) && s.content_en.length > 0;
        if (hasDutch && !hasEnglish) {
            await pb.collection("sponsors").update(s.id, {});
            sponsorCount++;
            console.log(`  ✓ sponsors/${s.id} (${s.name})`);
        }
    }
    console.log(`Sponsors backfilled: ${sponsorCount}`);

    // ── preasidium_leden: translate description → description_en ─────────────
    const leden = await pb.collection("preasidium_leden").getFullList();
    let lidCount = 0;
    for (const l of leden) {
        if (l.description && !l.description_en) {
            await pb.collection("preasidium_leden").update(l.id, {});
            lidCount++;
            console.log(`  ✓ preasidium_leden/${l.id} (${l.firstName} ${l.lastName})`);
        }
    }
    console.log(`Leden backfilled: ${lidCount}`);

    console.log("✅  Done.");
}

main().catch((err) => {
    console.error("❌ Backfill failed:", err);
    process.exit(1);
});
