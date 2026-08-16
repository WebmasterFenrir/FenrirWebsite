import pb from '@/lib/pocketbase'
import type { Role } from '@/lib/roles'

export interface DashboardUser {
  id: string
  /** Only present for the current user's own record — PB hides other users' emails from non-superusers. */
  email?: string
  name?: string
  role?: Role
  /** Single-use invite token — admins see it so they can send the invite link. */
  inviteToken?: string
  created: string
}

export async function getUsers(): Promise<DashboardUser[]> {
  return pb.collection('users').getFullList<DashboardUser>({ sort: 'email', requestKey: null })
}

export async function updateUserRole(id: string, role: Role | null): Promise<void> {
  await pb.collection('users').update(id, { role: role ?? '' })
}

// Sentinel the dashboard always sends for new users — the invites hook
// (pb_hooks/invites.pb.js) swaps it for a random password nobody knows and
// issues a single-use invite token. Must match the hook constant.
const INVITE_SENTINEL = '__invite__'

export async function createUser(email: string, role: Role | null, name?: string): Promise<DashboardUser> {
  return pb.collection('users').create<DashboardUser>({
    email,
    password: INVITE_SENTINEL,
    passwordConfirm: INVITE_SENTINEL,
    ...(name ? { name } : {}),
    ...(role ? { role } : {}),
  })
}

export function inviteUrl(user: Pick<DashboardUser, 'inviteToken'>): string {
  return `${window.location.origin}/invite?token=${encodeURIComponent(user.inviteToken ?? '')}`
}

export async function deleteUser(id: string): Promise<void> {
  await pb.collection('users').delete(id)
}
