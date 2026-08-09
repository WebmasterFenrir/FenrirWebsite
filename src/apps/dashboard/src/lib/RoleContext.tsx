import { createContext, useContext } from 'react'
import type { Role } from './roles'
import { can } from './roles'

interface RoleContextValue {
  role: Role | undefined
  can: (action: Parameters<typeof can>[1]) => boolean
}

export const RoleContext = createContext<RoleContextValue>({ role: undefined, can: () => false })

export function useRole() {
  return useContext(RoleContext)
}
