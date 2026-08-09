/**
 * Seed script: creates PocketBase collections and pre-populates them from data.ts
 * Run: bun seed.ts  (from src/apps/website/)
 *
 * Required env vars:
 *   PB_EMAIL     – superuser email
 *   PB_PASSWORD  – superuser password
 *   PB_URL       – optional, defaults to http://127.0.0.1:8090
 */

import PocketBase from "pocketbase";
import { SponsorData, PreasidiumYearsData } from "../data";

const PB_URL = process.env.PB_URL ?? "http://127.0.0.1:8090";
const PB_EMAIL = process.env.PB_EMAIL ?? "";
const PB_PASSWORD = process.env.PB_PASSWORD ?? "";

if (!PB_EMAIL || !PB_PASSWORD) {
    console.error("❌  Set PB_EMAIL and PB_PASSWORD environment variables");
    process.exit(1);
}

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

// ─── helpers ────────────────────────────────────────────────────────────────

async function ensureCollection(schema: object): Promise<{ id: string; name: string }> {
    const name = (schema as any).name;
    try {
        const existing = await pb.collections.getOne(name);
        console.log(`  ✓ collection "${name}" already exists`);
        return existing;
    } catch (getErr: any) {
        if (getErr?.status !== 404) throw getErr;
        try {
            const created = await pb.collections.create(schema);
            console.log(`  + created collection "${name}"`);
            return created as any;
        } catch (createErr: any) {
            console.error(`  ✗ failed to create "${name}":`, JSON.stringify(createErr?.response?.data ?? createErr?.data, null, 2));
            throw createErr;
        }
    }
}

/** Create a record only if none matching the filter exist. Returns the record. */
async function upsert(collection: string, filter: string, data: object) {
    try {
        return await pb.collection(collection).getFirstListItem(filter);
    } catch {
        return await pb.collection(collection).create(data);
    }
}

// ─── collection schemas ──────────────────────────────────────────────────────

async function createCollections() {
    console.log("\n── Creating collections ──────────────────────────────────");

    // 1. preasidium_rollen  (no deps)
    await ensureCollection({
        name: "preasidium_rollen",
        type: "base",
        fields: [
            { name: "name", type: "text", required: true },
        ],
    });

    // 2. preasidium_leden  (no deps)
    //    externalId keeps the original numeric id from data.ts so we can upsert reliably
    await ensureCollection({
        name: "preasidium_leden",
        type: "base",
        fields: [
            { name: "externalId", type: "number", required: true },
            { name: "firstName",  type: "text",   required: true },
            { name: "lastName",   type: "text",   required: true },
            { name: "description",type: "text",   required: false },
            { name: "description_en", type: "text", required: false },
            { name: "imageUrl",   type: "text",   required: false },
        ],
    });

    // 3. preasidium_years  (no deps)
    await ensureCollection({
        name: "preasidium_years",
        type: "base",
        fields: [
            { name: "yearId",    type: "number", required: true },
            { name: "startDate", type: "text",   required: true },
            { name: "endDate",   type: "text",   required: true },
        ],
    });

    // Grab IDs needed for the relation fields below
    const ledenCol  = await pb.collections.getOne("preasidium_leden");
    const yearsCol  = await pb.collections.getOne("preasidium_years");
    const rollenCol = await pb.collections.getOne("preasidium_rollen");

    // 4. preasidium_jaar_functies  (depends on all three above)
    //    One row = one person holding one role in one year
    await ensureCollection({
        name: "preasidium_jaar_functies",
        type: "base",
        fields: [
            {
                name: "lid",
                type: "relation",
                required: true,
                collectionId: ledenCol.id,
                maxSelect: 1,
                cascadeDelete: false,
            },
            {
                name: "year",
                type: "relation",
                required: true,
                collectionId: yearsCol.id,
                maxSelect: 1,
                cascadeDelete: false,
            },
            {
                name: "role",
                type: "relation",
                required: true,
                collectionId: rollenCol.id,
                maxSelect: 1,
                cascadeDelete: false,
            },
        ],
    });

    // 5. sponsors  (no deps)
    await ensureCollection({
        name: "sponsors",
        type: "base",
        fields: [
            { name: "name",      type: "text",   required: true },
            { name: "content",   type: "json",   required: false },
            { name: "content_en", type: "json",  required: false },
            { name: "image",     type: "text",   required: false },
            { name: "url",       type: "text",   required: false },
            { name: "startYear", type: "number", required: true },
            { name: "endYear",   type: "number", required: true },
        ],
    });
}

// ─── seeding ─────────────────────────────────────────────────────────────────

async function seedSponsors() {
    console.log("\n── Seeding sponsors ──────────────────────────────────────");
    for (const sponsorYear of SponsorData) {
        for (const sponsor of sponsorYear.list) {
            await upsert(
                "sponsors",
                `name = '${sponsor.name.replace(/'/g, "\\'")}' && startYear = ${sponsorYear.startYear}`,
                {
                    name:      sponsor.name,
                    content:   sponsor.content,
                    image:     sponsor.image,
                    url:       sponsor.url,
                    startYear: sponsorYear.startYear,
                    endYear:   sponsorYear.endYear,
                },
            );
            console.log(`  ✓ ${sponsor.name} (${sponsorYear.startYear}–${sponsorYear.endYear})`);
        }
    }
}

async function seedPreasidium() {
    console.log("\n── Seeding preasidium_rollen ─────────────────────────────");
    const roleMap = new Map<string, string>(); // role name → PB record id

    const allRoles = new Set(
        PreasidiumYearsData.flatMap(y =>
            y.PreasidiumLeden.flatMap(l => l.preasidiumRols.map(r => r.role)),
        ),
    );

    for (const roleName of allRoles) {
        const record = await upsert(
            "preasidium_rollen",
            `name = '${roleName.replace(/'/g, "\\'")}'`,
            { name: roleName },
        );
        roleMap.set(roleName, record.id);
        console.log(`  ✓ ${roleName}`);
    }

    // ── preasidium_leden ──────────────────────────────────────────────────────
    // Deduplicate across years: same person can appear in multiple years.
    // We use the original numeric id from data.ts per year-entry as externalId.
    // If the same person appears in two years they get two different externalIds,
    // so they're stored once per appearance (keeps history clean).
    console.log("\n── Seeding preasidium_leden ──────────────────────────────");
    const lidMap = new Map<number, string>(); // externalId → PB record id

    for (const year of PreasidiumYearsData) {
        for (const lid of year.PreasidiumLeden) {
            if (lidMap.has(lid.id)) continue;
            const record = await upsert(
                "preasidium_leden",
                `externalId = ${lid.id}`,
                {
                    externalId:  lid.id,
                    firstName:   lid.firstName,
                    lastName:    lid.lastName,
                    description: lid.description,
                    imageUrl:    lid.imageUrl,
                },
            );
            lidMap.set(lid.id, record.id);
            console.log(`  ✓ ${lid.firstName} ${lid.lastName} (id: ${lid.id})`);
        }
    }

    // ── preasidium_years + preasidium_jaar_functies ───────────────────────────
    console.log("\n── Seeding preasidium_years & functies ───────────────────");
    for (const year of PreasidiumYearsData) {
        const yearRecord = await upsert(
            "preasidium_years",
            `yearId = ${year.id}`,
            { yearId: year.id, startDate: year.startDate, endDate: year.endDate },
        );
        console.log(`  ✓ year ${year.startDate}–${year.endDate}`);

        for (const lid of year.PreasidiumLeden) {
            const lidPbId = lidMap.get(lid.id)!;
            for (const rol of lid.preasidiumRols) {
                const rolePbId = roleMap.get(rol.role)!;
                await upsert(
                    "preasidium_jaar_functies",
                    `lid = '${lidPbId}' && year = '${yearRecord.id}' && role = '${rolePbId}'`,
                    { lid: lidPbId, year: yearRecord.id, role: rolePbId },
                );
                console.log(`    ✓ ${lid.firstName} ${lid.lastName} → ${rol.role}`);
            }
        }
    }
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log(`Connecting to PocketBase at ${PB_URL} …`);
    await pb.collection("_superusers").authWithPassword(PB_EMAIL, PB_PASSWORD);
    console.log("✓ Authenticated");

    await createCollections();
    await seedSponsors();
    await seedPreasidium();

    console.log("\n✅  All done — collections created and pre-seeded.");
}

main().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
