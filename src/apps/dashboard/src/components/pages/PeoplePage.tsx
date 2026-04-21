import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  getPeople,
  createPerson,
  updatePerson,
  deletePerson,
  getPersonFuncties,
  addPersonFunctie,
  removePersonFunctie,
  getRollen,
  type Person,
  type PersonCreate,
  type PersonFunctie,
} from '@/lib/db/people'
import { getYears, type Year } from '@/lib/db/years'
import { useRole } from '@/lib/RoleContext'

const emptyForm: PersonCreate = {
  externalId: 0,
  firstName: '',
  lastName: '',
  description: '',
  imageUrl: '',
}

export function PeoplePage() {
  const { can } = useRole()
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Person | null>(null)
  const [form, setForm] = useState<PersonCreate>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // year/role connections
  const [functies, setFuncties] = useState<PersonFunctie[]>([])
  const [years, setYears] = useState<Year[]>([])
  const [rollen, setRollen] = useState<{ id: string; name: string }[]>([])
  const [newYearId, setNewYearId] = useState('')
  const [newRoleId, setNewRoleId] = useState('')
  const [addingFunctie, setAddingFunctie] = useState(false)

  const load = () => {
    setLoading(true)
    getPeople()
      .then(setPeople)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFuncties([])
    setError('')
    setDialogOpen(true)
    Promise.all([getYears(), getRollen()]).then(([y, r]) => {
      setYears(y)
      setRollen(r)
    })
  }

  const openEdit = (person: Person) => {
    setEditing(person)
    setForm({
      externalId: person.externalId,
      firstName: person.firstName,
      lastName: person.lastName,
      description: person.description ?? '',
      imageUrl: person.imageUrl ?? '',
    })
    setFuncties([])
    setNewYearId('')
    setNewRoleId('')
    setError('')
    setDialogOpen(true)
    Promise.all([getYears(), getRollen(), getPersonFuncties(person.id)]).then(([y, r, f]) => {
      setYears(y)
      setRollen(r)
      setFuncties(f)
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await updatePerson(editing.id, form)
      } else {
        await createPerson(form)
      }
      setDialogOpen(false)
      load()
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deletePerson(deleteId)
      setDeleteId(null)
      load()
    } catch {
      setDeleteId(null)
    }
  }

  const handleAddFunctie = async () => {
    if (!editing || !newYearId || !newRoleId) return
    setAddingFunctie(true)
    try {
      await addPersonFunctie(editing.id, newYearId, newRoleId)
      const updated = await getPersonFuncties(editing.id)
      setFuncties(updated)
      setNewYearId('')
      setNewRoleId('')
    } finally {
      setAddingFunctie(false)
    }
  }

  const handleRemoveFunctie = async (functieId: string) => {
    await removePersonFunctie(functieId)
    setFuncties(f => f.filter(x => x.id !== functieId))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">People</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage presidium members.</p>
        </div>
        {can('write') && (
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="size-4" /> Add Person
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Loading…
            </div>
          ) : people.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
              <Users className="size-8 opacity-30" />
              <p className="text-sm">No people yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Image URL</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                          {person.firstName[0]}
                        </div>
                        {person.firstName} {person.lastName}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{person.externalId}</TableCell>
                    <TableCell className="max-w-40 truncate text-muted-foreground">
                      {person.imageUrl || '—'}
                    </TableCell>
                    <TableCell className="max-w-55 truncate text-muted-foreground">
                      {person.description || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {can('write') && (
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(person)}>
                            <Pencil className="size-3.5" />
                          </Button>
                        )}
                        {can('delete') && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(person.id)}
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Person' : 'Add Person'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="externalId">External ID</Label>
              <Input
                id="externalId"
                type="number"
                value={form.externalId}
                onChange={(e) => setForm({ ...form, externalId: Number(e.target.value) })}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="e.g. nils2025.jpg"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Short bio…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>

            {/* Year/role connections — only shown when editing an existing person */}
            {editing && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <Label>Year connections</Label>
                  {functies.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No year connections yet.</p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {functies.map(f => (
                        <div key={f.id} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
                          <span>{f.yearLabel} — <span className="text-muted-foreground">{f.roleName}</span></span>
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
                      <Select value={newYearId} onValueChange={setNewYearId}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map(y => (
                            <SelectItem key={y.id} value={y.id}>
                              {y.startDate} – {y.endDate}
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
                        disabled={!newYearId || !newRoleId || addingFunctie}
                        onClick={handleAddFunctie}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete person?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this person and remove them from all years. This action cannot be undone.
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
