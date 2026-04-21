import pb from '@/lib/pocketbase'

export interface Person {
  id: string
  externalId: number
  firstName: string
  lastName: string
  description?: string
  imageUrl?: string
}

export type PersonCreate = Omit<Person, 'id'>
export type PersonUpdate = Partial<PersonCreate>

export async function getPeople(): Promise<Person[]> {
  return pb.collection('preasidium_leden').getFullList<Person>({ sort: 'firstName,lastName' })
}

export async function createPerson(data: PersonCreate): Promise<Person> {
  return pb.collection('preasidium_leden').create<Person>(data)
}

export async function updatePerson(id: string, data: PersonUpdate): Promise<Person> {
  return pb.collection('preasidium_leden').update<Person>(id, data)
}

export async function deletePerson(id: string): Promise<void> {
  await pb.collection('preasidium_leden').delete(id)
}
