import pb from '@/lib/pocketbase'
import { getYears, type Year } from '@/lib/db/years'

export interface Lid {
  id: string
  /** Relation → preasidium_years (the club year this member signed up under). */
  year: string
  name: string
  email?: string
  phone?: string
  birthdate?: string
  language?: string
  kdg_student?: string
  student_number?: string
  richting?: string
  sport_event?: string
  student_doop?: string
  payment_method?: string
  /** Relation → form_submissions (the submission this row was derived from). */
  source: string
  created?: string
}

/** All members, optionally filtered to one club year, newest first. */
export async function getLeden(yearId?: string): Promise<Lid[]> {
  return pb.collection('leden').getFullList<Lid>({
    filter: yearId ? `year = "${yearId}"` : '',
    sort: '-created',
    requestKey: null,
  })
}

/**
 * The current active club year — the newest `preasidium_years` entry (same
 * source of truth the preasidium pages use; `getYears()` sorts by `-yearId`).
 * Returns null when no year has been created yet.
 */
export async function getCurrentYear(): Promise<Year | null> {
  const years = await getYears()
  return years.length > 0 ? years[0] : null
}

export async function deleteLid(id: string): Promise<void> {
  await pb.collection('leden').delete(id)
}

/**
 * Manually add a member from the dashboard. Only the name is required; all
 * other fields stay empty (unlike form-derived rows). The member is stamped
 * with the given club year.
 */
export async function createLid(data: { name: string; year: string }): Promise<Lid> {
  return pb.collection('leden').create<Lid>(data)
}

/** Editable fields of a member (everything except id/year/source/created). */
export type LidUpdate = Partial<
  Pick<
    Lid,
    | 'name'
    | 'email'
    | 'phone'
    | 'birthdate'
    | 'language'
    | 'kdg_student'
    | 'student_number'
    | 'richting'
    | 'sport_event'
    | 'student_doop'
    | 'payment_method'
  >
>

/** Update a member's fields from the dashboard (e.g. fill in more info later). */
export async function updateLid(id: string, data: LidUpdate): Promise<Lid> {
  return pb.collection('leden').update<Lid>(id, data)
}
