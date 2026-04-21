import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import AdminUserAdd from '@/components/AdminUserAdd'

export function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Add new dashboard users.</p>
      </div>

      <Card className="max-w-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Add User</CardTitle>
          <CardDescription>Create a new account for a presidium member.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminUserAdd />
        </CardContent>
      </Card>
    </div>
  )
}
