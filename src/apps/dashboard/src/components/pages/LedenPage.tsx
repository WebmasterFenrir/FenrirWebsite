import { useEffect, useState } from 'react'
import { Users, Trash2, Download, Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { getLeden, createLid, updateLid, deleteLid, type Lid } from '@/lib/db/leden'
import { getYears, type Year } from '@/lib/db/years'
import { useRole } from '@/lib/RoleContext'

interface LidEditForm {
  name: string
  email: string
  phone: string
  birthdate: string
  language: string
  kdg_student: string
  student_number: string
  richting: string
  sport_event: string
  student_doop: string
  payment_method: string
}

const emptyEditForm: LidEditForm = {
  name: '',
  email: '',
  phone: '',
  birthdate: '',
  language: '',
  kdg_student: '',
  student_number: '',
  richting: '',
  sport_event: '',
  student_doop: '',
  payment_method: '',
}

function lidToForm(lid: Lid): LidEditForm {
  return {
    name: lid.name ?? '',
    email: lid.email ?? '',
    phone: lid.phone ?? '',
    birthdate: lid.birthdate ?? '',
    language: lid.language ?? '',
    kdg_student: lid.kdg_student ?? '',
    student_number: lid.student_number ?? '',
    richting: lid.richting ?? '',
    sport_event: lid.sport_event ?? '',
    student_doop: lid.student_doop ?? '',
    payment_method: lid.payment_method ?? '',
  }
}

function yearLabel(y: Year): string {
  const start = /^\d{4}$/.test(y.startDate) ? y.startDate : String(y.yearId)
  const end = /^\d{4}$/.test(y.endDate) ? y.endDate : String(y.yearId + 1)
  return `${start}–${end}`
}

const cell = (v: string | undefined) => (v ? v : '—')

// CSV cell escaping: quote fields that contain a comma, quote or newline and
// double any embedded quotes (RFC 4180).
function csvCell(v: string | undefined): string {
  const s = v ?? ''
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function exportLedenCsv(leden: Lid[], yearSlug: string): void {
  const header = [
    'Name', 'Phone', 'KdG-student', 'Richting', 'Student nr', 'Language',
    'Birthdate', 'Sport event', 'Doop', 'Payment', 'E-mail',
  ]
  const rows = leden.map((l) => [
    l.name, l.phone, l.kdg_student, l.richting, l.student_number, l.language,
    l.birthdate, l.sport_event, l.student_doop, l.payment_method, l.email,
  ])
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
  // BOM so Excel opens the UTF-8 names/emails correctly.
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `leden-${yearSlug || 'all'}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function LedenPage() {
  const { can } = useRole()

  const [years, setYears] = useState<Year[]>([])
  const [selectedYearId, setSelectedYearId] = useState('')
  const [leden, setLeden] = useState<Lid[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [addYearId, setAddYearId] = useState('')
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState('')
  const [editLid, setEditLid] = useState<Lid | null>(null)
  const [editForm, setEditForm] = useState<LidEditForm>(emptyEditForm)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const load = async (yearId?: string) => {
    setLoading(true)
    try {
      const ys = await getYears()
      setYears(ys)
      // Default to the current active year (newest `-yearId`), then to whatever
      // the admin picked. `yearId` (passed by the selector) always wins.
      const target = yearId || selectedYearId || ys[0]?.id || ''
      if (target !== selectedYearId) setSelectedYearId(target)
      setLeden(await getLeden(target || undefined))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedYear = years.find((y) => y.id === selectedYearId)

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteLid(deleteId)
    } finally {
      setDeleteId(null)
      load(selectedYearId || undefined)
    }
  }

  const openEdit = (lid: Lid) => {
    setEditLid(lid)
    setEditForm(lidToForm(lid))
    setEditError('')
  }

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editLid) return
    const name = editForm.name.trim()
    if (!name) {
      setEditError('Name is required.')
      return
    }
    setEditSaving(true)
    setEditError('')
    try {
      await updateLid(editLid.id, {
        name,
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        birthdate: editForm.birthdate.trim(),
        language: editForm.language.trim(),
        kdg_student: editForm.kdg_student.trim(),
        student_number: editForm.student_number.trim(),
        richting: editForm.richting.trim(),
        sport_event: editForm.sport_event.trim(),
        student_doop: editForm.student_doop.trim(),
        payment_method: editForm.payment_method.trim(),
      })
      setEditLid(null)
      load(selectedYearId || undefined)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to save changes. Please try again.')
    } finally {
      setEditSaving(false)
    }
  }

  const openAdd = () => {
    // Default to the club year currently shown in the table.
    setNewName('')
    setAddYearId(selectedYearId || years[0]?.id || '')
    setAddError('')
    setAddOpen(true)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) {
      setAddError('Name is required.')
      return
    }
    if (!addYearId) {
      setAddError('Pick a club year.')
      return
    }
    setSaving(true)
    setAddError('')
    try {
      await createLid({ name, year: addYearId })
      setAddOpen(false)
      load(addYearId)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add member. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leden</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Members signed up via the “Lid worden” form or added manually, grouped by club year.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Club year</span>
          <Select
            value={selectedYearId}
            onValueChange={(v) => {
              setSelectedYearId(v)
              load(v)
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y.id} value={y.id}>
                  {yearLabel(y)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={loading || leden.length === 0}
            onClick={() =>
              exportLedenCsv(
                leden,
                (selectedYear ? yearLabel(selectedYear) : 'all').replace(/[^a-z0-9-]+/gi, '-').toLowerCase(),
              )
            }
          >
            <Download className="size-4" /> Export CSV
          </Button>
          {can('write') && (
            <Button size="sm" className="gap-1.5" onClick={openAdd}>
              <Plus className="size-4" /> Add lid
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Loading…
        </div>
      ) : leden.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
          <Users className="size-8 opacity-30" />
          <p className="text-sm">
            No members for {selectedYear ? yearLabel(selectedYear) : 'this year'} yet.
          </p>
          {can('write') && (
            <Button size="sm" className="gap-1.5" onClick={openAdd}>
              <Plus className="size-4" /> Add lid
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 font-normal">
              <Users className="size-3" />
              {leden.length}
            </Badge>
            <span className="text-sm text-muted-foreground">
              member{leden.length === 1 ? '' : 's'} · {selectedYear ? yearLabel(selectedYear) : ''}
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>KdG-student</TableHead>
                  <TableHead>Richting</TableHead>
                  <TableHead>Student nr</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Birthdate</TableHead>
                  <TableHead>Sport event</TableHead>
                  <TableHead>Doop</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>E-mail</TableHead>
                  {(can('write') || can('delete')) && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {leden.map((lid) => (
                  <TableRow key={lid.id}>
                    <TableCell className="font-semibold">{lid.name}</TableCell>
                    <TableCell>{cell(lid.phone)}</TableCell>
                    <TableCell>{cell(lid.kdg_student)}</TableCell>
                    <TableCell>{cell(lid.richting)}</TableCell>
                    <TableCell>{cell(lid.student_number)}</TableCell>
                    <TableCell>{cell(lid.language)}</TableCell>
                    <TableCell>{cell(lid.birthdate)}</TableCell>
                    <TableCell>{cell(lid.sport_event)}</TableCell>
                    <TableCell>{cell(lid.student_doop)}</TableCell>
                    <TableCell>{cell(lid.payment_method)}</TableCell>
                    <TableCell className="text-muted-foreground">{cell(lid.email)}</TableCell>
                    {(can('write') || can('delete')) && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {can('write') && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Edit member"
                              onClick={() => openEdit(lid)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          )}
                          {can('delete') && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              title="Delete member"
                              onClick={() => setDeleteId(lid.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Add member dialog — only the name is required; all other fields
          stay empty (unlike form-derived rows). */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add lid</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lid-name">Name</Label>
              <Input
                id="lid-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Jan Peeters"
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Only the name is required — other fields can be added later.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Club year</Label>
              <Select
                value={addYearId}
                onValueChange={setAddYearId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y.id} value={y.id}>
                      {yearLabel(y)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {addError && <p className="text-xs text-destructive">{addError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Adding…' : 'Add lid'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit member dialog — fill in or correct any field later */}
      <Dialog open={!!editLid} onOpenChange={(o) => !o && setEditLid(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit lid</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Jan Peeters"
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-birthdate">Birthdate</Label>
                <Input
                  id="edit-birthdate"
                  value={editForm.birthdate}
                  onChange={(e) => setEditForm({ ...editForm, birthdate: e.target.value })}
                  placeholder="12/03/2003"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-language">Language</Label>
                <Input
                  id="edit-language"
                  value={editForm.language}
                  onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-kdg">KdG-student</Label>
                <Input
                  id="edit-kdg"
                  value={editForm.kdg_student}
                  onChange={(e) => setEditForm({ ...editForm, kdg_student: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-studentnr">Student nr</Label>
                <Input
                  id="edit-studentnr"
                  value={editForm.student_number}
                  onChange={(e) => setEditForm({ ...editForm, student_number: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-richting">Richting</Label>
                <Input
                  id="edit-richting"
                  value={editForm.richting}
                  onChange={(e) => setEditForm({ ...editForm, richting: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-sport">Sport event</Label>
                <Input
                  id="edit-sport"
                  value={editForm.sport_event}
                  onChange={(e) => setEditForm({ ...editForm, sport_event: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-doop">Doop</Label>
                <Input
                  id="edit-doop"
                  value={editForm.student_doop}
                  onChange={(e) => setEditForm({ ...editForm, student_doop: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-payment">Payment</Label>
                <Input
                  id="edit-payment"
                  value={editForm.payment_method}
                  onChange={(e) => setEditForm({ ...editForm, payment_method: e.target.value })}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              All fields are optional except the name — fill in only what you know.
            </p>
            {editError && <p className="text-xs text-destructive">{editError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditLid(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editSaving}>
                {editSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this member from the Leden table. This cannot be undone.
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
