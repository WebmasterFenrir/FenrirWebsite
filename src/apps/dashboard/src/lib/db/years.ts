import pb from '@/lib/pocketbase'

export interface Year {
  id: string
  yearId: number
  startDate: string
  endDate: string
}

export type YearCreate = Omit<Year, 'id'>
export type YearUpdate = Partial<YearCreate>

export async function getYears(): Promise<Year[]> {
  return pb.collection('preasidium_years').getFullList<Year>({ sort: '-yearId' })
}

export async function createYear(data: YearCreate): Promise<Year> {
  return pb.collection('preasidium_years').create<Year>(data)
}

export async function updateYear(id: string, data: YearUpdate): Promise<Year> {
  return pb.collection('preasidium_years').update<Year>(id, data)
}

export async function deleteYear(id: string): Promise<void> {
  await pb.collection('preasidium_years').delete(id)
}
