import PocketBase, { type RecordModel } from 'pocketbase'
import type { PreasidiumLid, PreasidiumYear, Sponsors, Activiteit, EventCategory } from '../../../types'
import { translateRole, type Locale } from '@/i18n/ui'

const PB_URL = import.meta.env.PB_URL ?? process.env.PB_URL ?? 'http://127.0.0.1:8090'
const PUBLIC_PB_URL = import.meta.env.PUBLIC_PB_URL ?? process.env.PUBLIC_PB_URL ?? PB_URL

const publicPb = new PocketBase(PUBLIC_PB_URL)

async function createClient() {
    const email = import.meta.env.PB_EMAIL ?? process.env.PB_EMAIL
    const password = import.meta.env.PB_PASSWORD ?? process.env.PB_PASSWORD

    if (!email || !password) {
        throw new Error('PocketBase not configured')
    }

    const pb = new PocketBase(PB_URL)
    await pb.collection('_superusers').authWithPassword(email, password)
    return pb
}

function getFileUrl(record: RecordModel, filename: string | undefined) {
    if (!filename) return undefined
    return publicPb.files.getUrl(record, filename)
}

/** Locale-aware text picker: prefer the English value on EN pages, else the Dutch source. */
function pickLocale(locale: Locale, nl?: string, en?: string): string | undefined {
    return locale === 'en' && en ? en : nl || undefined
}

export async function getSponsors(locale: Locale = 'nl'): Promise<Sponsors[]> {
    try {
        const pb = await createClient()
        const records = await pb.collection('sponsors').getFullList({ sort: '-startYear' })

        const map = new Map<string, Sponsors>()
        for (const r of records) {
            const key = `${r.startYear}-${r.endYear}`
            if (!map.has(key)) {
                map.set(key, { startYear: r.startYear, endYear: r.endYear, list: [] })
            }
            const image = getFileUrl(r, r.imageFile) ?? ''
            // English content is stored in content_en (auto-translated by a PocketBase
            // hook); fall back to the Dutch source of truth when unavailable.
            const content = (locale === 'en' && Array.isArray(r.content_en) && r.content_en.length > 0)
                ? r.content_en
                : r.content
            map.get(key)!.list.push({ name: r.name, content, image, url: r.url })
        }
        return [...map.values()]
    } catch (err) {
        console.error('getSponsors failed:', err)
        return []
    }
}

export async function getEventCategories(locale: Locale = 'nl'): Promise<EventCategory[]> {
    try {
        const pb = await createClient()
        const records = await pb.collection('event_categories').getFullList({ sort: 'sortOrder,name' })
        return records
            .filter((r) => r.active !== false)
            .map((r) => ({
                id:          r.id,
                name:        pickLocale(locale, r.name, r.name_en) ?? r.name,
                description: pickLocale(locale, r.description, r.description_en),
                icon:        r.icon || undefined,
                sortOrder:   r.sortOrder ?? 0,
            }))
    } catch (err) {
        console.error('getEventCategories failed:', err)
        return []
    }
}

export async function getHeroImage(): Promise<string | null> {
    try {
        const pb = await createClient()
        const records = await pb.collection('site_settings').getFullList({ filter: `key = 'site'` })
        const record = records[0]
        if (!record) return null
        return getFileUrl(record, record.heroImage) ?? null
    } catch (err) {
        console.error('getHeroImage failed:', err)
        return null
    }
}

export async function getActiviteiten(locale: Locale = 'nl'): Promise<Activiteit[]> {
    try {
        const pb = await createClient()
        const records = await pb.collection('activiteiten').getFullList({ sort: 'startTime', expand: 'category' })
        // Only show future events. The `past` flag is authoritative when set,
        // but we also hard-check the start date so no past event ever leaks
        // onto the public site (e.g. records created before the flag existed).
        // Manual events can additionally be hidden with `active = false`.
        const now = new Date()
        return records
            .filter((r) => {
                if (r.active === false) return false
                if (r.past) return false
                const start = r.startTime ? new Date(r.startTime).getTime() : NaN
                return !Number.isNaN(start) && start > now.getTime()
            })
            .map((r) => {
                const cat = r.expand?.category as RecordModel | undefined
                return {
                    id:            r.id,
                    fbEventId:     r.fbEventId || undefined,
                    name:          r.name,
                    startTime:     r.startTime ?? '',
                    endTime:       r.endTime ?? undefined,
                    description:   r.description ?? undefined,
                    placeName:     r.placeName ?? undefined,
                    coverUrl:      r.coverUrl ?? undefined,
                    fbUrl:         r.fbUrl ?? undefined,
                    past:          !!r.past,
                    category:      cat
                        ? (locale === 'en' && cat.name_en ? cat.name_en : cat.name)
                        : undefined,
                    image:         getFileUrl(r, r.imageFile),
                }
            })
    } catch (err) {
        console.error('getActiviteiten failed:', err)
        return []
    }
}

export async function getPreasidiumYears(locale: Locale = 'nl'): Promise<PreasidiumYear[]> {
    try {
        const pb = await createClient()

        const [years, functies] = await Promise.all([
            pb.collection('preasidium_years').getFullList({ sort: '-yearId' }),
            pb.collection('preasidium_jaar_functies').getFullList({ expand: 'lid,role' }),
        ])

        return years.map(y => {
            const yearFuncties = functies.filter(f => f.year === y.id)

            // group functies by lid → one PreasidiumLid with multiple roles
            const ledenMap = new Map<string, PreasidiumLid>()
            for (const f of yearFuncties) {
                const lid = f.expand!.lid
                // English description is stored in description_en (auto-translated
                // by a PocketBase hook); fall back to the Dutch source of truth.
                const description = locale === 'en' && lid.description_en
                    ? lid.description_en
                    : lid.description

                let lidEntry = ledenMap.get(lid.id)
                if (!lidEntry) {
                    lidEntry = {
                        id:            lid.externalId,
                        firstName:     lid.firstName,
                        lastName:      lid.lastName,
                        birthdate:     '',
                        description,
                        imageUrl:      '',
                        yearIds:       [y.yearId],
                        preasidiumRols: [],
                    }
                    ledenMap.set(lid.id, lidEntry)
                }

                // Fallback chain for the photo: per-year picture on the functie
                // → the person's own picture → placeholder avatar (component).
                const personImage = getFileUrl(lid, lid.imageFile) ?? ''
                const perYearImage = getFileUrl(f, f.imageFile) ?? ''
                if (perYearImage) lidEntry.imageUrl = perYearImage
                else if (!lidEntry.imageUrl) lidEntry.imageUrl = personImage

                lidEntry.preasidiumRols.push({
                    role: translateRole(f.expand!.role.name, locale),
                    year: `${y.startDate} - ${y.endDate}`,
                })
            }

            const leden = [...ledenMap.values()]
            return {
                id:                y.yearId,
                startDate:         y.startDate,
                endDate:           y.endDate,
                PreasidiumLeden:   leden,
                PreasidiumLedenIds: leden.map(l => l.id),
            }
        })
    } catch (err) {
        console.error('getPreasidiumYears failed:', err)
        return []
    }
}
