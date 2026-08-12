import PocketBase from 'pocketbase'
import type { FenrirForm } from '../../../types'

const PB_URL = import.meta.env.PB_URL ?? process.env.PB_URL ?? 'http://127.0.0.1:8090'

/**
 * Look up a form by its public code (form.fenrirclub.be/{code}).
 * Returns null for unknown codes and when PocketBase is unreachable/misconfigured
 * — the page renders the branded "form not found" state instead of crashing.
 */
export async function getFormByCode(code: string): Promise<FenrirForm | null> {
  if (!code) return null
  try {
    const email = import.meta.env.PB_EMAIL ?? process.env.PB_EMAIL
    const password = import.meta.env.PB_PASSWORD ?? process.env.PB_PASSWORD
    if (!email || !password) {
      throw new Error('PocketBase not configured')
    }

    const pb = new PocketBase(PB_URL)
    await pb.collection('_superusers').authWithPassword(email, password)

    const record = await pb.collection('forms').getFirstListItem(`code = "${code}"`)
    return {
      id: record.id,
      code: record.code,
      title: record.title,
      description: record.description || undefined,
      multiLanguage: !!record.multiLanguage,
      active: record.active !== false,
      fields: Array.isArray(record.fields) ? record.fields : [],
    }
  } catch (err) {
    console.error('getFormByCode failed:', err)
    return null
  }
}
