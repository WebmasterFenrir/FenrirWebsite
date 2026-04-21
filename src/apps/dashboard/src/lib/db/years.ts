import pb from '@/lib/pocketbase'

export interface Year {
  id: string
  yearId: number
  startDate: string
  endDate: string
}

export interface YearFunctie {
  id: string
  personId: string
  personName: string
  roleId: string
  roleName: string
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
  const functies = await pb.collection('preasidium_jaar_functies').getFullList({ filter: `year = "${id}"` })
  await Promise.all(functies.map(f => pb.collection('preasidium_jaar_functies').delete(f.id)))
  await pb.collection('preasidium_years').delete(id)
}

export async function getYearFuncties(yearId: string): Promise<YearFunctie[]> {
  const records = await pb.collection('preasidium_jaar_functies').getFullList({
    filter: `year = "${yearId}"`,
    expand: 'lid,role',
    sort: 'expand.role.name',
  })
  return records.map(r => ({
    id: r.id,
    personId: r.lid,
    personName: `${r.expand!.lid.firstName} ${r.expand!.lid.lastName}`,
    roleId: r.role,
    roleName: r.expand!.role.name,
  }))
}

export async function addYearFunctie(yearId: string, personId: string, roleId: string): Promise<void> {
  await pb.collection('preasidium_jaar_functies').create({ year: yearId, lid: personId, role: roleId })
}

export async function removeYearFunctie(functieId: string): Promise<void> {
  await pb.collection('preasidium_jaar_functies').delete(functieId)
}
