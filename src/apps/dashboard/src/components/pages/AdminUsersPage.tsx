import { useEffect, useState } from 'react'
import { Plus, Trash2, Shield, Eye, Pencil, Check, ClipboardList, FileText, Copy, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getUsers, updateUserRole, createUser, deleteUser, inviteUrl, type DashboardUser } from '@/lib/db/users'
import type { Role } from '@/lib/roles'
import pb from '@/lib/pocketbase'

const ROLES: { value: Role; label: string }[] = [
  { value: 'admin',        label: 'Admin' },
  { value: 'media',        label: 'Media' },
  { value: 'viewer',       label: 'Viewer' },
  { value: 'formmanager',  label: 'Formmanager' },
]

const ROLE_BADGES: Record<Role, string> = {
  admin:       'bg-primary/15 text-primary border-primary/20',
  media:       'bg-blue-500/15 text-blue-400 border-blue-500/20',
  viewer:      'bg-muted text-muted-foreground border-border',
  formmanager: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
}

const PERMISSIONS = [
  { action: 'Read',         icon: Eye,           admin: true,  media: true,  viewer: true,  formmanager: true  },
  { action: 'View Forms',   icon: FileText,      admin: true,  media: true,  viewer: true,  formmanager: true  },
  { action: 'View Responses', icon: Eye,        admin: true,  media: true,  viewer: true,  formmanager: true  },
  { action: 'Write',        icon: Pencil,        admin: true,  media: true,  viewer: false, formmanager: false },
  { action: 'Delete',       icon: Trash2,        admin: true,  media: false, viewer: false, formmanager: false },
  { action: 'Manage Users', icon: Shield,        admin: true,  media: false, viewer: false, formmanager: false },
  { action: 'Manage Forms', icon: ClipboardList, admin: true,  media: true,  viewer: false, formmanager: true  },
]

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// PB only returns `email` for the requester's own record — for other users fall
// back to name, then to a placeholder so the UI never crashes on undefined.
function displayName(user: DashboardUser): string {
  return user.name || user.email || 'Unnamed user'
}

export function AdminUsersPage() {
  const currentUserId = pb.authStore.record?.id
  const [users, setUsers] = useState<DashboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addName, setAddName] = useState('')
  const [addEmail, setAddEmail] = useState('')
  const [addRole, setAddRole] = useState<Role>('viewer')
  const [addSaving, setAddSaving] = useState(false)
  const [addError, setAddError] = useState('')
  const [inviteUser, setInviteUser] = useState<DashboardUser | null>(null)
  const [inviteCopied, setInviteCopied] = useState(false)

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err: unknown) => setError(`Could not load users: ${err instanceof Error ? err.message : String(err)}`))
      .finally(() => setLoading(false))
  }, [])

  const handleRoleChange = async (user: DashboardUser, role: Role) => {
    setUpdatingId(user.id)
    try {
      await updateUserRole(user.id, role)
      setUsers(u => u.map(x => x.id === user.id ? { ...x, role } : x))
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteError('')
    try {
      await deleteUser(deleteId)
      setUsers(u => u.filter(x => x.id !== deleteId))
      setDeleteId(null)
    } catch (err) {
      setDeleteError(`Could not delete user: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const handleAddUser = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setAddSaving(true)
    setAddError('')
    try {
      const created = await createUser(addEmail, addRole, addName)
      setUsers(u => [...u, created].sort((a, b) => displayName(a).localeCompare(displayName(b))))
      setAddOpen(false)
      setAddName('')
      setAddEmail('')
      setAddRole('viewer')
      if (created.inviteToken) {
        setInviteUser(created)
      } else {
        setAddError('User created, but no invite link was generated.')
      }
    } catch {
      setAddError('Failed to create user. Email may already be in use.')
    } finally {
      setAddSaving(false)
    }
  }

  const copyInvite = async (user: DashboardUser) => {
    try {
      await navigator.clipboard.writeText(inviteUrl(user))
      setInviteCopied(true)
      setTimeout(() => setInviteCopied(false), 2000)
    } catch {
      // Clipboard unavailable (non-secure context) — the dialog input is
      // selectable, so the admin can still copy manually.
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage dashboard users and their access roles.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm" className="gap-1.5">
          <Plus className="size-4" /> Add User
        </Button>
      </div>

      {/* Users table */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Users</h2>
        <div className="rounded-lg border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Loading…</div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-sm text-destructive px-6 text-center">{error}</div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">No users found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => {
                  const isMe = user.id === currentUserId
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                            {displayName(user)[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            {user.name && <p className="text-sm font-medium truncate">{user.name}</p>}
                            <p className={`truncate ${user.name ? 'text-xs text-muted-foreground' : 'text-sm font-medium'}`}>
                              {user.email ?? (user.name ? 'No email' : 'Unnamed user')}
                            </p>
                          </div>
                          {isMe && <Badge variant="outline" className="text-[10px] px-1.5 py-0">you</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isMe ? (
                          <Badge variant="outline" className={user.role ? ROLE_BADGES[user.role] : ''}>
                            {user.role ?? 'No role'}
                          </Badge>
                        ) : (
                          <Select
                            value={user.role ?? ''}
                            onValueChange={(v) => handleRoleChange(user, v as Role)}
                            disabled={updatingId === user.id}
                          >
                            <SelectTrigger className="h-7 w-32 text-xs">
                              <SelectValue placeholder="No role" />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map(r => (
                                <SelectItem key={r.value} value={r.value} className="text-xs">
                                  {r.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fmtDate(user.created)}</TableCell>
                      <TableCell className="text-right">
                        {!isMe && user.inviteToken && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Copy invite link"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => setInviteUser(user)}
                          >
                            <Link2 className="size-3.5" />
                          </Button>
                        )}
                        {!isMe && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(user.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Permissions matrix */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Role Permissions</h2>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Viewer</TableHead>
                <TableHead>Formmanager</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERMISSIONS.map(({ action, icon: Icon, admin, media, viewer, formmanager }) => (
                <TableRow key={action}>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Icon className="size-3.5 text-muted-foreground" />
                      {action}
                    </div>
                  </TableCell>
                  {[admin, media, viewer, formmanager].map((allowed, i) => (
                    <TableCell key={i}>
                      {allowed
                        ? <Check className="size-4 text-primary" />
                        : <span className="text-muted-foreground/40 text-xs">—</span>}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground">
          Write applies to Years, Sponsors, Activiteiten, Categories and People;
          every role (incl. Viewer) can view the form list and its responses,
          but building/editing forms requires Manage Forms (Admin, Media,
          Formmanager). Manage Users is exclusive to the Admin role.
        </p>
      </div>

      {/* Add user dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-name">Name</Label>
              <Input
                id="add-name"
                type="text"
                placeholder="e.g. Jan Peeters"
                value={addName}
                onChange={e => setAddName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="user@fenrirclub.be"
                value={addEmail}
                onChange={e => setAddEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-role">Role</Label>
              <Select value={addRole} onValueChange={v => setAddRole(v as Role)}>
                <SelectTrigger id="add-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              No password needed — the user will set their own via an invite link.
            </p>
            {addError && <p className="text-xs text-destructive">{addError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addSaving}>{addSaving ? 'Creating…' : 'Create User'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invite link dialog */}
      <Dialog open={!!inviteUser} onOpenChange={o => !o && setInviteUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite link created</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Send this link to <span className="font-medium text-foreground">{inviteUser?.email}</span>{' '}
              — they'll pick their own display name and password. The link only works once.
            </p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteUser ? inviteUrl(inviteUser) : ''}
                className="font-mono text-xs"
                onFocus={e => e.currentTarget.select()}
              />
              <Button
                type="button"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => inviteUser && copyInvite(inviteUser)}
              >
                {inviteCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {inviteCopied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteUser(null)}>Close</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account. They will lose all access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
