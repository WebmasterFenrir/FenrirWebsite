import AdminUserAdd from '@/components/AdminUserAdd'

export function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Add new dashboard users.</p>
      </div>

      <div className="max-w-md">
        <p className="text-sm font-medium mb-3">Create a new account for a presidium member.</p>
        <AdminUserAdd />
      </div>
    </div>
  )
}
