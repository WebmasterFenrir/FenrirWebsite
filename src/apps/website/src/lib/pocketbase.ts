import PocketBase, { type RecordModel } from 'pocketbase'
import type { PreasidiumLid, PreasidiumYear, Sponsors } from '../../../types'

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

export async function getSponsors(): Promise<Sponsors[]> {
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
            map.get(key)!.list.push({ name: r.name, content: r.content, image, url: r.url })
        }
        return [...map.values()]
    } catch (err) {
        console.error('getSponsors failed:', err)
        return []
    }
}

export async function getPreasidiumYears(): Promise<PreasidiumYear[]> {
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
                if (!ledenMap.has(lid.id)) {
                    const imageUrl = getFileUrl(lid, lid.imageFile) ?? ''
                    ledenMap.set(lid.id, {
                        id:            lid.externalId,
                        firstName:     lid.firstName,
                        lastName:      lid.lastName,
                        birthdate:     '',
                        description:   lid.description,
                        imageUrl,
                        yearIds:       [y.yearId],
                        preasidiumRols: [],
                    })
                }
                ledenMap.get(lid.id)!.preasidiumRols.push({
                    role: f.expand!.role.name,
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
