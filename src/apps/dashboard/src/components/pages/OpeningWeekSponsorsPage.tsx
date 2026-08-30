import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, CalendarClock } from 'lucide-react'
import { useRole } from '@/lib/RoleContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { getYears, type Year } from '@/lib/db/years'
import {
  getWeekForYear,
  createWeek,
  updateWeek,
  getSponsorsForWeek,
  createOpeningWeekSponsor,
  updateOpeningWeekSponsor,
  deleteOpeningWeekSponsor,
  type OpeningWeek,
  type OpeningWeekSponsor,
} from '@/lib/db/openingWeekSponsors'

function yearLabel(y: Year): string {
  const start = /^\d{4}$/.test(y.startDate) ? y.startDate : String(y.yearId)
  const end = /^\d{4}$/.test(y.endDate) ? y.endDate : String(y.yearId + 1)
  return `${start}–${end}`
}

/** ISO -> local "YYYY-MM-DD" for <input type="date">. */
function toLocalDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

type FormState = {
  name: string
  contentRaw: string
  url: string
  active: boolean
}

const emptyForm: FormState = {
  name: '',
  contentRaw: '',
  url: '',
  active: true,
}

export function OpeningWeekSponsorsPage() {
  const { can } = useRole()

  const [years, setYears] = useState<Year[]>([])
  const [selectedYearId, setSelectedYearId] = useState('')
  const [week, setWeek] = useState<OpeningWeek | null>(null)
  const [sponsors, setSponsors] = useState<OpeningWeekSponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Week window form (date-only — no times).
  const [weekStart, setWeekStart] = useState('')
  const [weekEnd, setWeekEnd] = useState('')
  const [savingWeek, setSavingWeek] = useState(false)
  const [weekError, setWeekError] = useState('')

  // Sponsor dialog.
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<OpeningWeekSponsor | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = async (yearId?: string) => {
    setLoading(true)
    setLoadError('')
    try {
      const ys = await getYears()
      setYears(ys)
      // Default to the current active year (newest `-yearId`), then to whatever
      // the admin picked. `yearId` (passed by the selector) always wins.
      const target = yearId || selectedYearId || ys[0]?.id || ''
      if (target !== selectedYearId) setSelectedYearId(target)

      const wk = target ? await getWeekForYear(target) : null
      setWeek(wk)
      if (wk) {
        setWeekStart(toLocalDate(wk.startDate))
        setWeekEnd(toLocalDate(wk.endDate))
        setSponsors(await getSponsorsForWeek(wk.id))
      } else {
        setWeekStart('')
        setWeekEnd('')
        setSponsors([])
      }
    } catch (err) {
      console.error('[OpeningWeekSponsorsPage] load failed:', err)
      setLoadError('Failed to load the opening week data. Check that PocketBase is running and the migrations are applied.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedYear = years.find((y) => y.id === selectedYearId)

  const handleSaveWeek = async (e: React.FormEvent) => {
    e.preventDefault()
    setWeekError('')
    if (!weekStart || !weekEnd) {
      setWeekError('Pick a start and end date for the week.')
      return
    }
    if (new Date(weekEnd).getTime() < new Date(weekStart).getTime()) {
      setWeekError('The end date must be after the start date.')
      return
    }
    setSavingWeek(true)
    try {
      // Week window is date-only: start at 00:00, end at the last second of
      // the day so the end date stays inclusive on the website.
      const data = {
        preasidium: selectedYearId,
        startDate: new Date(`${weekStart}T00:00:00`).toISOString(),
        endDate: new Date(`${weekEnd}T23:59:59`).toISOString(),
      }
      if (week) {
        await updateWeek(week.id, data)
      } else {
        await createWeek(data)
      }
      await load(selectedYearId)
    } catch {
      setWeekError('Failed to save the week. Please try again.')
    } finally {
      setSavingWeek(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setSelectedFile(null)
    setRemoveImage(false)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (sponsor: OpeningWeekSponsor) => {
    setEditing(sponsor)
    setForm({
      name: sponsor.name,
      contentRaw: (sponsor.content ?? []).join('\n'),
      url: sponsor.url ?? '',
      active: sponsor.active !== false,
    })
    setSelectedFile(null)
    setRemoveImage(false)
    setError('')
    setDialogOpen(true)
  }

  const handleSaveSponsor = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }
    if (!week) {
      setError('Save the week first.')
      return
    }
    setSaving(true)
    try {
      const content = form.contentRaw.split('\n').map(line => line.trim()).filter(Boolean)
      const formData = new FormData()
      formData.append('week', week.id)
      formData.append('name', form.name.trim())
      formData.append('url', form.url.trim())
      formData.append('active', String(form.active))
      formData.append('content', JSON.stringify(content))
      if (selectedFile) {
        formData.append('imageFile', selectedFile)
      } else if (removeImage) {
        formData.append('imageFile', '')
      }
      if (editing) {
        await updateOpeningWeekSponsor(editing.id, formData)
      } else {
        await createOpeningWeekSponsor(formData)
      }
      setDialogOpen(false)
      await load(selectedYearId)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteOpeningWeekSponsor(deleteId)
      setDeleteId(null)
      await load(selectedYearId)
    } catch {
      setDeleteId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Opening Week Sponsors</h1>
          <p className="text-sm text-muted-foreground mt-1">
            One opening week per club year. The website shows the latest year's sponsors.
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
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Loading…
        </div>
      ) : (
        <>
          {/* Week window */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Opening week {selectedYear ? yearLabel(selectedYear) : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveWeek} className="flex flex-col gap-3">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="weekStart">Starts</Label>
                    <Input
                      id="weekStart"
                      type="date"
                      value={weekStart}
                      onChange={(e) => setWeekStart(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="weekEnd">Ends</Label>
                    <Input
                      id="weekEnd"
                      type="date"
                      value={weekEnd}
                      onChange={(e) => setWeekEnd(e.target.value)}
                      required
                    />
                  </div>
                  {can('write') && (
                    <Button type="submit" disabled={savingWeek} className="gap-1.5">
                      <CalendarClock className="size-4" />
                      {savingWeek ? 'Saving…' : week ? 'Save dates' : 'Add week'}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  The sponsors are shown on the website between these two dates.
                  {!week && ' Set the dates first, then add the sponsors below.'}
                </p>
                {weekError && <p className="text-xs text-destructive">{weekError}</p>}
              </form>
            </CardContent>
          </Card>

          {/* Sponsors of this week */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Sponsors</h2>
              <p className="text-sm text-muted-foreground">
                {week
                  ? `Shown during ${yearLabel(selectedYear!)}'s opening week.`
                  : 'No opening week set up for this year yet.'}
              </p>
            </div>
            {can('write') && week && (
              <Button onClick={openCreate} size="sm" className="gap-1.5">
                <Plus className="size-4" /> Add Sponsor
              </Button>
            )}
          </div>

          <div className="rounded-lg overflow-hidden">
            {sponsors.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                <CalendarClock className="size-8 opacity-30" />
                <p className="text-sm">
                  {week ? 'No sponsors for this week yet.' : 'Add the opening week dates to get started.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sponsors.map((sponsor) => (
                    <TableRow key={sponsor.id} className={sponsor.active === false ? 'opacity-60' : ''}>
                      <TableCell className="font-medium">{sponsor.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={sponsor.active === false ? 'outline' : 'default'}
                          className="gap-1 font-normal"
                        >
                          {sponsor.active === false ? 'Hidden' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-45 truncate text-muted-foreground">
                        {sponsor.url || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {can('write') && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEdit(sponsor)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          )}
                          {can('delete') && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(sponsor.id)}
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
          </div>
        </>
      )}

      {/* Create / Edit sponsor dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Sponsor' : 'Add Sponsor'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSponsor} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Acme Corp"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://…"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="imageFile">Logo image</Label>
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setSelectedFile(e.target.files?.[0] ?? null)
                  if (e.target.files?.[0]) setRemoveImage(false)
                }}
              />
              {editing?.imageFile && !selectedFile && (
                <div className="flex items-center gap-2">
                  <input
                    id="removeImage"
                    type="checkbox"
                    checked={removeImage}
                    onChange={(e) => setRemoveImage(e.target.checked)}
                    className="size-4 rounded border-input"
                  />
                  <Label htmlFor="removeImage" className="text-xs text-muted-foreground font-normal cursor-pointer">
                    Remove current image
                  </Label>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="content">Content (one paragraph per line)</Label>
              <Textarea
                id="content"
                placeholder="Short description of the company&#10;A second paragraph"
                value={form.contentRaw}
                onChange={(e) => setForm({ ...form, contentRaw: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="active"
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="active" className="text-sm font-normal cursor-pointer">
                Visible on website
              </Label>
            </div>
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
            <AlertDialogTitle>Delete sponsor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this opening week sponsor. This action cannot be undone.
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
