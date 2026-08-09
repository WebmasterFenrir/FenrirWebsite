export type Role = 'admin' | 'media' | 'viewer'

export function can(role: Role | undefined, action: 'read' | 'write' | 'delete' | 'manageUsers'): boolean {
  switch (action) {
    case 'read':       return true
    case 'write':      return role === 'admin' || role === 'media'
    case 'delete':     return role === 'admin'
    case 'manageUsers': return role === 'admin'
  }
}
