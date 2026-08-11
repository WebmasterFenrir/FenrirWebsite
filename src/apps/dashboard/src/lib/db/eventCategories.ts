import pb from '@/lib/pocketbase'

export interface EventCategory {
  id: string
  name: string
  name_en?: string
  description?: string
  description_en?: string
  /** Lucide icon name shown on the website activity cards. */
  icon?: string
  sortOrder?: number
  active?: boolean
  created?: string
  updated?: string
}

export type EventCategoryCreate = Omit<EventCategory, 'id'>
export type EventCategoryUpdate = Partial<EventCategoryCreate>

export async function getEventCategories(): Promise<EventCategory[]> {
  return pb.collection('event_categories').getFullList<EventCategory>({ sort: 'sortOrder,name', requestKey: null })
}

export async function createEventCategory(data: FormData | EventCategoryCreate): Promise<EventCategory> {
  return pb.collection('event_categories').create<EventCategory>(data)
}

export async function updateEventCategory(id: string, data: FormData | EventCategoryUpdate): Promise<EventCategory> {
  return pb.collection('event_categories').update<EventCategory>(id, data)
}

/** Deletes a category — blocked when events still reference it. */
export async function deleteEventCategory(id: string): Promise<void> {
  const inUse = await pb.collection('activiteiten').getFullList<{ id: string }>({
    filter: `category = "${id}"`,
    requestKey: null,
  })
  if (inUse.length > 0) {
    throw new Error(
      `Cannot delete: ${inUse.length} event${inUse.length === 1 ? '' : 's'} still use this category. Reassign or delete them first.`,
    )
  }
  await pb.collection('event_categories').delete(id)
}
