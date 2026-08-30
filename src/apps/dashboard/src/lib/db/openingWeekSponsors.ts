import pb from '@/lib/pocketbase'

/**
 * One opening week per preasidium year. The week window (startDate/endDate)
 * decides when the section is shown on the website; the sponsors are child
 * records in `openingsweek_sponsors` linked through `week`.
 */
export interface OpeningWeek {
  id: string
  /** Relation → preasidium_years. */
  preasidium: string
  /** Start of the week window (date-only in the dashboard). */
  startDate: string
  /** End of the week window (date-only in the dashboard). */
  endDate: string
}

export interface OpeningWeekSponsor {
  id: string
  /** Relation → openingsweek_weken. */
  week: string
  name: string
  content: string[]
  image?: string
  imageFile?: string
  url?: string
  /** Hard-hide from the website regardless of the week window. */
  active: boolean
}

export type OpeningWeekCreate = Omit<OpeningWeek, 'id'>
export type OpeningWeekUpdate = Partial<OpeningWeekCreate>

export type OpeningWeekSponsorCreate = Omit<OpeningWeekSponsor, 'id'>
export type OpeningWeekSponsorUpdate = Partial<OpeningWeekSponsorCreate>

/** The opening week of one preasidium year, or null when none exists yet. */
export async function getWeekForYear(preasidiumId: string): Promise<OpeningWeek | null> {
  const weeks = await pb.collection('openingsweek_weken').getFullList<OpeningWeek>({
    filter: `preasidium = "${preasidiumId}"`,
    requestKey: null,
  })
  return weeks[0] ?? null
}

export async function createWeek(data: OpeningWeekCreate): Promise<OpeningWeek> {
  return pb.collection('openingsweek_weken').create<OpeningWeek>(data)
}

export async function updateWeek(id: string, data: OpeningWeekUpdate): Promise<OpeningWeek> {
  return pb.collection('openingsweek_weken').update<OpeningWeek>(id, data)
}

export async function getSponsorsForWeek(weekId: string): Promise<OpeningWeekSponsor[]> {
  return pb.collection('openingsweek_sponsors').getFullList<OpeningWeekSponsor>({
    filter: `week = "${weekId}"`,
    sort: 'created',
    requestKey: null,
  })
}

export async function createOpeningWeekSponsor(
  data: FormData | OpeningWeekSponsorCreate,
): Promise<OpeningWeekSponsor> {
  return pb.collection('openingsweek_sponsors').create<OpeningWeekSponsor>(data)
}

export async function updateOpeningWeekSponsor(
  id: string,
  data: FormData | OpeningWeekSponsorUpdate,
): Promise<OpeningWeekSponsor> {
  return pb.collection('openingsweek_sponsors').update<OpeningWeekSponsor>(id, data)
}

export async function deleteOpeningWeekSponsor(id: string): Promise<void> {
  await pb.collection('openingsweek_sponsors').delete(id)
}
