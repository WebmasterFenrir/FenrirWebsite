import pb from '@/lib/pocketbase'
import type { Role } from '@/lib/roles'

export interface DashboardUser {
  id: string
  /** Only present for the current user's own record — PB hides other users' emails from non-superusers. */
  email?: string
  name?: string
  role?: Role
  created: string
}

export async function getUsers(): Promise<DashboardUser[]> {
  return pb.collection('users').getFullList<DashboardUser>({ sort: 'email', requestKey: null })
}

export async function updateUserRole(id: string, role: Role | null): Promise<void> {
  await pb.collection('users').update(id, { role: role ?? '' })
}

export async function createUser(email: string, password: string, role: Role | null, name?: string): Promise<DashboardUser> {
  return pb.collection('users').create<DashboardUser>({
    email,
    password,
    passwordConfirm: password,
    ...(name ? { name } : {}),
    ...(role ? { role } : {}),
  })
}

export async function deleteUser(id: string): Promise<void> {
  await pb.collection('users').delete(id)
}
