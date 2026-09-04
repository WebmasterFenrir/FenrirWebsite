import pb from '@/lib/pocketbase'
import type { RecordModel } from 'pocketbase'

export interface SiteSettings {
  id: string
  key: string
  heroImage?: string
  heroImageUrl?: string
}

type SettingsRow = RecordModel & SiteSettings

function toSettings(row: SettingsRow): SiteSettings {
  return {
    id: row.id,
    key: row.key,
    heroImage: row.heroImage,
    heroImageUrl: row.heroImage ? pb.files.getUrl(row, row.heroImage) : undefined,
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  // The website reads the "site" row; keep the dashboard in sync.
  const records = await pb.collection('site_settings').getFullList<SettingsRow>({
    filter: `key = 'site'`,
    requestKey: null,
    limit: 1,
  })
  return records[0] ? toSettings(records[0]) : null
}

export async function updateSiteSettings(
  id: string,
  data: FormData | Partial<Omit<SiteSettings, 'heroImageUrl'>>,
): Promise<SiteSettings> {
  const updated = await pb.collection('site_settings').update<SettingsRow>(id, data)
  return toSettings(updated)
}