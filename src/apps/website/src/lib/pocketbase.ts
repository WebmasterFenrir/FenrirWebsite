import PocketBase from 'pocketbase'
import type { PreasidiumLid, PreasidiumYear, Sponsors } from '../../../types'


async function createClient() {
    const url = import.meta.env.PB_URL ?? process.env.PB_URL
    const email = import.meta.env.PB_EMAIL ?? process.env.PB_EMAIL
    const password = import.meta.env.PB_PASSWORD ?? process.env.PB_PASSWORD

    if (!url || !email || !password) {
        throw new Error('PocketBase not configured')
    }

    const pb = new PocketBase(url)
    await pb.collection('_superusers').authWithPassword(email, password)
    return pb
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
            map.get(key)!.list.push({ name: r.name, content: r.content, image: r.image, url: r.url })
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
                    ledenMap.set(lid.id, {
                        id:            lid.externalId,
                        firstName:     lid.firstName,
                        lastName:      lid.lastName,
                        birthdate:     '',
                        description:   lid.description,
                        imageUrl:      lid.imageUrl,
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
