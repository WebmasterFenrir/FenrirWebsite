import pb from '@/lib/pocketbase'

export interface Activiteit {
  id: string
  fbEventId: string
  name: string
  startTime?: string
  endTime?: string
  description?: string
  placeName?: string
  coverUrl?: string
  fbUrl?: string
  /** True when the event has already started — kept as history, hidden from "upcoming". */
  past?: boolean
  created?: string
  updated?: string
}

export interface FacebookSettings {
  id: string
  pageUrl?: string
  cookiesFile?: string
  lastSyncAt?: string
  lastSyncStatus?: string
  lastSyncError?: string
  paused?: boolean
  created?: string
  updated?: string
}

export async function getActiviteiten(): Promise<Activiteit[]> {
  return pb.collection('activiteiten').getFullList<Activiteit>({ sort: 'startTime', requestKey: null })
}

export async function deleteActiviteit(id: string): Promise<void> {
  await pb.collection('activiteiten').delete(id)
}

export async function getFacebookSettings(): Promise<FacebookSettings | null> {
  const list = await pb.collection('facebook_settings').getFullList<FacebookSettings>({ requestKey: null })
  return list[0] ?? null
}

export async function saveFacebookSettings(data: FormData, existingId?: string): Promise<FacebookSettings> {
  if (existingId) {
    return pb.collection('facebook_settings').update<FacebookSettings>(existingId, data)
  }
  return pb.collection('facebook_settings').create<FacebookSettings>(data)
}

/** Triggers a sync run via the PocketBase hook route (admin only). */
export async function triggerSync(): Promise<{ ok: boolean; events?: number; error?: string }> {
  return pb.send('/api/events-sync/run', { method: 'POST' })
}
