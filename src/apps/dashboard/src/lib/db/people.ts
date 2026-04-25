import pb from '@/lib/pocketbase'

export interface Person {
  id: string
  externalId: number
  firstName: string
  lastName: string
  description?: string
  imageUrl?: string
}

export interface PersonFunctie {
  id: string
  yearId: string
  yearLabel: string
  roleId: string
  roleName: string
}

export type PersonCreate = Omit<Person, 'id'>
export type PersonUpdate = Partial<PersonCreate>

export async function getPeople(): Promise<Person[]> {
  return pb.collection('preasidium_leden').getFullList<Person>({ sort: 'firstName,lastName', requestKey: null })
}

export async function createPerson(data: PersonCreate): Promise<Person> {
  return pb.collection('preasidium_leden').create<Person>(data)
}

export async function updatePerson(id: string, data: PersonUpdate): Promise<Person> {
  return pb.collection('preasidium_leden').update<Person>(id, data)
}

export async function deletePerson(id: string): Promise<void> {
  const functies = await pb.collection('preasidium_jaar_functies').getFullList({ filter: `lid = "${id}"`, requestKey: null })
  await Promise.all(functies.map(f => pb.collection('preasidium_jaar_functies').delete(f.id)))
  await pb.collection('preasidium_leden').delete(id)
}

export async function getPersonFuncties(personId: string): Promise<PersonFunctie[]> {
  const records = await pb.collection('preasidium_jaar_functies').getFullList({
    filter: `lid = "${personId}"`,
    expand: 'year,role',
    requestKey: null,
  })
  return records.map(r => ({
    id: r.id,
    yearId: r.year,
    yearLabel: `${r.expand!.year.startDate} – ${r.expand!.year.endDate}`,
    roleId: r.role,
    roleName: r.expand!.role.name,
  }))
}

export async function addPersonFunctie(personId: string, yearId: string, roleId: string): Promise<void> {
  await pb.collection('preasidium_jaar_functies').create({ lid: personId, year: yearId, role: roleId })
}

export async function removePersonFunctie(functieId: string): Promise<void> {
  await pb.collection('preasidium_jaar_functies').delete(functieId)
}

export async function getRollen(): Promise<{ id: string; name: string }[]> {
  return pb.collection('preasidium_rollen').getFullList({ sort: 'name', requestKey: null })
}
