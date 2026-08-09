import pb from '@/lib/pocketbase'

export interface Sponsor {
  id: string
  name: string
  content: string[]
  image?: string
  imageFile?: string
  url?: string
  startYear: number
  endYear: number
}

export type SponsorCreate = Omit<Sponsor, 'id'>
export type SponsorUpdate = Partial<SponsorCreate>

export async function getSponsors(): Promise<Sponsor[]> {
  return pb.collection('sponsors').getFullList<Sponsor>({ sort: '-startYear,name', requestKey: null })
}

export async function createSponsor(data: FormData | SponsorCreate): Promise<Sponsor> {
  return pb.collection('sponsors').create<Sponsor>(data)
}

export async function updateSponsor(id: string, data: FormData | SponsorUpdate): Promise<Sponsor> {
  return pb.collection('sponsors').update<Sponsor>(id, data)
}

export async function deleteSponsor(id: string): Promise<void> {
  await pb.collection('sponsors').delete(id)
}
