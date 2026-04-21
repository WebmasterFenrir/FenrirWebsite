import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, CalendarRange, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
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
  removeYearFunctie,
  type Year,
  type YearCreate,
  type YearFunctie,
} from '@/lib/db/years'
import { getPeople, getRollen, type Person } from '@/lib/db/people'
import { useRole } from '@/lib/RoleContext'

const emptyForm: YearCreate = { yearId: new Date().getFullYear(), startDate: '', endDate: '' }

export function YearsPage() {
  const { can } = useRole()
  const [years, setYears] = useState<Year[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Year | null>(null)
  const [form, setForm] = useState<YearCreate>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // people connections
  const [functies, setFuncties] = useState<YearFunctie[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [rollen, setRollen] = useState<{ id: string; name: string }[]>([])
  const [newPersonId, setNewPersonId] = useState('')
  const [newRoleId, setNewRoleId] = useState('')
  const [addingFunctie, setAddingFunctie] = useState(false)
  // track the saved year id while in "create" mode so we can add functies immediately
  const [createdYearId, setCreatedYearId] = useState<string | null>(null)

  const activeYearId = editing?.id ?? createdYearId

  const load = () => {
    setLoading(true)
    getYears().then(setYears).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const loadSidePanelData = (yearId?: string) => {
    Promise.all([getPeople(), getRollen()]).then(([p, r]) => {
      setPeople(p)
      setRollen(r)
    })
    if (yearId) {
      getYearFuncties(yearId).then(setFuncties)
    } else {
      setFuncties([])
    }
  }

  const openCreate = () => {
    setEditing(null)
    setCreatedYearId(null)
    setForm(emptyForm)
    setNewPersonId('')
    setNewRoleId('')
    setError('')
    setDialogOpen(true)
    loadSidePanelData()
  }

  const openEdit = (year: Year) => {
    setEditing(year)
    setCreatedYearId(null)
    setForm({ yearId: year.yearId, startDate: year.startDate, endDate: year.endDate })
    setNewPersonId('')
    setNewRoleId('')
    setError('')
    setDialogOpen(true)
    loadSidePanelData(year.id)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await updateYear(editing.id, form)
        setDialogOpen(false)
        load()
      } else {
        const created = await createYear(form)
        setCreatedYearId(created.id)
        load()
      }
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteYear(deleteId)
      setDeleteId(null)
      load()
    } catch {
      setDeleteId(null)
    }
  }

  const handleAddFunctie = async () => {
    if (!activeYearId || !newPersonId || !newRoleId) return
    setAddingFunctie(true)
    try {
      await addYearFunctie(activeYearId, newPersonId, newRoleId)
      const updated = await getYearFuncties(activeYearId)
      setFuncties(updated)
      setNewPersonId('')
      setNewRoleId('')
    } finally {
      setAddingFunctie(false)
    }
  }

  const handleRemoveFunctie = async (functieId: string) => {
    await removeYearFunctie(functieId)
    setFuncties(f => f.filter(x => x.id !== functieId))
  }

  const handleClose = () => {
    setDialogOpen(false)
    setCreatedYearId(null)
    load()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Years</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage presidium academic years.</p>
        </div>
        {can('write') && (
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="size-4" /> Add Year
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Loading…
            </div>
          ) : years.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
              <CalendarRange className="size-8 opacity-30" />
              <p className="text-sm">No years yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year ID</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {years.map((year) => (
                  <TableRow key={year.id}>
                    <TableCell className="font-medium">{year.yearId}</TableCell>
                    <TableCell>{year.startDate}</TableCell>
                    <TableCell>{year.endDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {can('write') && (
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(year)}>
                            <Pencil className="size-3.5" />
                          </Button>
                        )}
                        {can('delete') && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(year.id)}
                          >
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
        </CardContent>
      </Card>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Year' : createdYearId ? 'Year Created' : 'Add Year'}</DialogTitle>
          </DialogHeader>

          {/* Year fields — hide after create so user focuses on members */}
          {!createdYearId && (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="yearId">Year ID</Label>
                <Input
                  id="yearId"
                  type="number"
                  value={form.yearId}
                  onChange={(e) => setForm({ ...form, yearId: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  placeholder="e.g. 2025-09-01"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  placeholder="e.g. 2026-08-31"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save' : 'Create & Add Members'}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Member connections — shown after year exists (edit or just created) */}
          {(editing || createdYearId) && (
            <>
              {editing && <Separator />}
              <div className="flex flex-col gap-2">
                <Label>Members</Label>
                {functies.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No members yet.</p>
                ) : (
                  <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                    {functies.map(f => (
                      <div key={f.id} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
                        <span>{f.personName} — <span className="text-muted-foreground">{f.roleName}</span></span>
                        {can('write') && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFunctie(f.id)}
                            className="ml-2 text-destructive hover:text-destructive/80"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {can('write') && (
                  <div className="flex gap-2 pt-1">
                    <Select value={newPersonId} onValueChange={setNewPersonId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Person" />
                      </SelectTrigger>
                      <SelectContent>
                        {people.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.firstName} {p.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={newRoleId} onValueChange={setNewRoleId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {rollen.map(r => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!newPersonId || !newRoleId || addingFunctie}
                      onClick={handleAddFunctie}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                )}

                {createdYearId && (
                  <div className="flex justify-end pt-2">
                    <Button type="button" onClick={handleClose}>Done</Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete year?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this year and remove all its member connections. This action cannot be undone.
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
