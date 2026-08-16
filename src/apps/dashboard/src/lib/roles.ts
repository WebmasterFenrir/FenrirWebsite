export type Role = 'admin' | 'media' | 'viewer' | 'formmanager'

export type Action = 'read' | 'write' | 'delete' | 'manageUsers' | 'manageForms' | 'viewResponses'

export function can(role: Role | undefined, action: Action): boolean {
  switch (action) {
    case 'read':         return true
    case 'viewResponses': return true // form responses are viewable by every role
    case 'write':        return role === 'admin' || role === 'media'
    case 'delete':       return role === 'admin'
    case 'manageUsers':  return role === 'admin'
    case 'manageForms':  return role === 'admin' || role === 'media' || role === 'formmanager'
  }
}
