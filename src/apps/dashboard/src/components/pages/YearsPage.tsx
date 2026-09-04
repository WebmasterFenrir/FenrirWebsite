import React, { useEffect, useRef, useState } from 'react'
import { Plus, Pencil, Trash2, CalendarRange, Users, X, Check, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import {
  getYears,
  createYear,
  updateYear,
  deleteYear,
  getYearFuncties,
  addYearFunctie,
  updateYearFunctie,
  removeYearFunctie,
  getYearMemberCounts,
  type Year,
  type YearCreate,
  type YearFunctie,
} from '@/lib/db/years'
import { getPeople, getRollen, type Person } from '@/lib/db/people'
import { useRole } from '@/lib/RoleContext'

const emptyForm: YearCreate = { yearId: new Date().getFullYear(), startDate: '', endDate: '' }

function fmtDate(d: string) {
  if (!d) return '—'
  const parts = d.split('-')
  if (parts.length < 3) return d
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[Number(parts[1]) - 1]} ${parts[0]}`
}

function PersonSearch({ people, value, onChange }: {
  people: Person[]
  value: string
  onChange: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = people.find(p => p.id === value)
  const filtered = people.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(query.toLowerCase())
  )

  const select = (p: Person) => { onChange(p.id); setQuery(''); setOpen(false) }
  const clear = () => { onChange(''); setQuery('') }

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      {selected ? (
        <div className="flex items-center gap-2 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
          <span className="flex-1 truncate">{selected.firstName} {selected.lastName}</span>
          <button type="button" onClick={clear} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <Input
          placeholder="Search person…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
      )}
      {open && !selected && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
          {filtered.map(p => (
            <button key={p.id} type="button" onMouseDown={() => select(p)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {p.firstName[0]}
              </div>
              {p.firstName} {p.lastName}
            </button>
          ))}
        </div>
      )}
      {open && !selected && query.length > 0 && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md px-3 py-2 text-sm text-muted-foreground">
          No results for "{query}"
        </div>
      )}
    </div>
  )
}

export function YearsPage() {
  const { can } = useRole()

  const [years, setYears] = useState<Year[]>([])
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // members dialog
  const [membersYear, setMembersYear] = useState<Year | null>(null)
  const [functies, setFuncties] = useState<YearFunctie[]>([])
  const [functiesLoading, setFunctiesLoading] = useState(false)
  const [people, setPeople] = useState<Person[]>([])
  const [rollen, setRollen] = useState<{ id: string; name: string }[]>([])
  const [newPersonId, setNewPersonId] = useState('')
  const [newRoleId, setNewRoleId] = useState('')
  const [addingFunctie, setAddingFunctie] = useState(false)
  const [membersError, setMembersError] = useState('')
  const [memberSearch, setMemberSearch] = useState('')

  // edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editingYear, setEditingYear] = useState<Year | null>(null)
  const [form, setForm] = useState<YearCreate>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const load = () => {
    Promise.all([getYears(), getYearMemberCounts()])
      .then(([y, counts]) => { setYears(y); setMemberCounts(counts) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([getYears(), getYearMemberCounts()])
      .then(([y, counts]) => { setYears(y); setMemberCounts(counts) })
      .finally(() => setLoading(false))
  }, [])

  // ── members dialog ────────────────────────────────────────────────────────────
  const openMembers = (year: Year) => {
    setMembersYear(year)
    setFuncties([])
    setNewPersonId(''); setNewRoleId(''); setMembersError(''); setMemberSearch('')
    setFunctiesLoading(true)
    Promise.all([getYearFuncties(year.id), getPeople(), getRollen()])
      .then(([f, p, r]) => { setFuncties(f); setPeople(p); setRollen(r) })
      .finally(() => setFunctiesLoading(false))
  }

  const closeMembers = () => setMembersYear(null)

  const handleAddFunctie = async (yearId: string) => {
    if (!newPersonId || !newRoleId) return
    if (functies.some(f => f.personId === newPersonId && f.roleId === newRoleId)) {
      setMembersError('This person already has that role this year.'); return
    }
    setAddingFunctie(true); setMembersError('')
    try {
      await addYearFunctie(yearId, newPersonId, newRoleId)
      const updated = await getYearFuncties(yearId)
      setFuncties(updated); setNewPersonId(''); setNewRoleId('')
      setMemberCounts(c => ({ ...c, [yearId]: (c[yearId] ?? 0) + 1 }))
    } catch {
      setMembersError('Failed to add member.')
    } finally {
      setAddingFunctie(false)
    }
  }

  const handleRemoveFunctie = async (functieId: string, yearId: string) => {
    await removeYearFunctie(functieId)
    setFuncties(f => f.filter(x => x.id !== functieId))
    setMemberCounts(c => ({ ...c, [yearId]: Math.max(0, (c[yearId] ?? 1) - 1) }))
  }

  const handleUploadYearPicture = async (f: YearFunctie, file: File) => {
    if (!membersYear) return
    try {
      const formData = new FormData()
      formData.append('imageFile', file)
      await updateYearFunctie(f.id, formData)
      const updated = await getYearFuncties(membersYear.id)
      setFuncties(updated)
      setMembersError('')
    } catch {
      setMembersError('Failed to update the year picture.')
    }
  }

  const handleRemoveYearPicture = async (functieId: string) => {
    if (!membersYear) return
    try {
      const formData = new FormData()
      formData.append('imageFile', '')
      await updateYearFunctie(functieId, formData)
      const updated = await getYearFuncties(membersYear.id)
      setFuncties(updated)
      setMembersError('')
    } catch {
      setMembersError('Failed to remove the year picture.')
    }
  }

  const visibleFuncties = functies.filter(f =>
    f.personName.toLowerCase().includes(memberSearch.toLowerCase()) ||
    f.roleName.toLowerCase().includes(memberSearch.toLowerCase())
  )

  // ── edit year ────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingYear(null); setForm(emptyForm); setEditError(''); setEditOpen(true)
  }

  const openEdit = (year: Year, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingYear(year)
    setForm({ yearId: year.yearId, startDate: year.startDate, endDate: year.endDate })
    setEditError(''); setEditOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setEditError('')
    try {
      if (editingYear) {
        await updateYear(editingYear.id, form)
        setEditOpen(false); load()
      } else {
        const created = await createYear(form)
        setEditOpen(false); load()
        const [p, r] = await Promise.all([getPeople(), getRollen()])
        setPeople(p); setRollen(r)
        openMembers({ ...created })
      }
    } catch {
      setEditError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await deleteYear(deleteId) } finally { setDeleteId(null); load() }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Years</h1>
          <p className="text-sm text-muted-foreground mt-1">Click a row to view and manage its members.</p>
        </div>
        {can('write') && (
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="size-4" /> Add Year
          </Button>
        )}
      </div>

      <div className="rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading…</div>
          ) : years.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
              <CalendarRange className="size-8 opacity-30" />
              <p className="text-sm">No years yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {years.map((year) => (
                  <TableRow
                    key={year.id}
                    className="cursor-pointer"
                    onClick={() => openMembers(year)}
                  >
                    <TableCell className="font-semibold">{year.yearId}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {fmtDate(year.startDate)} – {fmtDate(year.endDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1 font-normal">
                        <Users className="size-3" />
                        {memberCounts[year.id] ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {can('write') && (
                          <Button variant="ghost" size="icon-sm" title="Edit year" onClick={(e) => openEdit(year, e)}>
                            <Pencil className="size-3.5" />
                          </Button>
                        )}
                        {can('delete') && (
                          <Button variant="ghost" size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); setDeleteId(year.id) }}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
      </div>

      {/* ── Members dialog ────────────────────────────────────────────────────── */}
      <Dialog open={!!membersYear} onOpenChange={(o) => { if (!o) closeMembers() }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{membersYear?.yearId}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {membersYear ? `${fmtDate(membersYear.startDate)} – ${fmtDate(membersYear.endDate)}` : ''}&nbsp;·&nbsp;
              {membersYear ? `${memberCounts[membersYear.id] ?? 0} members` : ''}
            </p>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Input
              placeholder="Search by name or role…"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />

            <div className="flex flex-col gap-1 max-h-96 overflow-y-auto pr-1">
              {functiesLoading ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
              ) : functies.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {can('write') ? 'No members yet. Add one below.' : 'No members in this year.'}
                </p>
              ) : visibleFuncties.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No results for "{memberSearch}".</p>
              ) : (
                visibleFuncties.map(f => (
                  <div key={f.id} className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {f.imageUrl ? (
                        <img
                          src={f.imageUrl}
                          alt={f.personName}
                          className="size-8 shrink-0 rounded-full border border-border object-cover"
                        />
                      ) : (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                          {f.personName[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate leading-tight">{f.personName}</p>
                        <p className="text-xs text-muted-foreground truncate">{f.roleName}</p>
                      </div>
                    </div>
                    {can('write') && (
                      <div className="flex shrink-0 items-center gap-1.5">
                        <label
                          className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                          title={f.imageUrl ? 'Change year picture' : 'Set year picture'}
                        >
                          <Camera className="size-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleUploadYearPicture(f, file)
                              e.target.value = ''
                            }}
                          />
                        </label>
                        {f.imageUrl && (
                          <button
                            type="button"
                            title="Remove year picture"
                            onClick={() => handleRemoveYearPicture(f.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Remove from year"
                          onClick={() => handleRemoveFunctie(f.id, membersYear!.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {can('write') && membersYear && (
              <div className="flex flex-col gap-2 pt-3 border-t">
                <p className="text-xs font-medium text-muted-foreground">Add member</p>
                <div className="flex gap-2">
                  <PersonSearch people={people} value={newPersonId} onChange={setNewPersonId} />
                  <Select value={newRoleId} onValueChange={setNewRoleId}>
                    <SelectTrigger className="w-40 shrink-0">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {rollen.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" size="sm" className="shrink-0"
                    disabled={!newPersonId || !newRoleId || addingFunctie}
                    onClick={() => handleAddFunctie(membersYear.id)}>
                    <Check className="size-4" />
                  </Button>
                </div>
                {membersError && <p className="text-xs text-destructive">{membersError}</p>}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit / Create dialog ──────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={(open) => { if (!open) setEditOpen(false) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingYear ? `Edit Year ${editingYear.yearId}` : 'Add Year'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="yearId">Year</Label>
              <Input id="yearId" type="number" value={form.yearId}
                onChange={(e) => setForm({ ...form, yearId: Number(e.target.value) })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" placeholder="e.g. 2025-09-01" value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" placeholder="e.g. 2026-08-31" value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
              </div>
            </div>
            {editError && <p className="text-xs text-destructive">{editError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : editingYear ? 'Save' : 'Create & Add Members'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ───────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete year?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this year and all its member connections. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
