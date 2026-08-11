import React, { useEffect, useState } from 'react'
import { CalendarDays, Plus, Pencil, RefreshCw, Settings, Trash2, ExternalLink, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
  getActiviteiten,
  createActiviteit,
  updateActiviteit,
  deleteActiviteit,
  getFacebookSettings,
  saveFacebookSettings,
  triggerSync,
  type Activiteit,
  type FacebookSettings,
} from '@/lib/db/activiteiten'
import { getEventCategories, type EventCategory } from '@/lib/db/eventCategories'
import { useRole } from '@/lib/RoleContext'

/** Pull the real message out of a PocketBase/JS error (ClientResponseError has the useful text in .data.message). */
function errMessage(err: unknown): string {
  const e = err as { status?: number; data?: { message?: string }; message?: string }
  if (e?.data?.message) return `${e.status ? `[${e.status}] ` : ''}${e.data.message}`
  if (e?.message) return e.message
  return String(err)
}

function fmtDateTime(d?: string) {
  if (!d) return '—'
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return d
  return date.toLocaleString('nl-BE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/** ISO -> local "YYYY-MM-DDTHH:mm" for <input type="datetime-local">. */
function toLocalInput(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type EventForm = {
  name: string
  category: string
  start: string
  end: string
  placeName: string
  description: string
  fbUrl: string
  active: boolean
}

const emptyEventForm: EventForm = {
  name: '',
  category: '',
  start: '',
  end: '',
  placeName: '',
  description: '',
  fbUrl: '',
  active: true,
}

export function ActiviteitenPage() {
  const { can } = useRole()
  const [events, setEvents] = useState<Activiteit[]>([])
  const [settings, setSettings] = useState<FacebookSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Activiteit | null>(null)
  const [eventForm, setEventForm] = useState<EventForm>(emptyEventForm)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [savingEvent, setSavingEvent] = useState(false)
  const [eventError, setEventError] = useState('')
  const [pageUrl, setPageUrl] = useState('')
  const [cookieFile, setCookieFile] = useState<File | null>(null)
  const [formError, setFormError] = useState('')
  const [syncError, setSyncError] = useState('')
  const [loadError, setLoadError] = useState('')

  const refresh = async () => {
    setLoading(true)
    try {
      const [evts, st] = await Promise.all([getActiviteiten(), getFacebookSettings()])
      setEvents(evts)
      setSettings(st)
      if (st) setPageUrl(st.pageUrl ?? '')
      setLoadError('')
    } catch (err) {
      console.error('[ActiviteitenPage] load failed:', err)
      setLoadError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([getActiviteiten(), getFacebookSettings(), getEventCategories()])
      .then(([evts, st, cats]) => {
        if (cancelled) return
        setEvents(evts)
        setSettings(st)
        setCategories(cats)
        if (st) setPageUrl(st.pageUrl ?? '')
        setLoadError('')
      })
      .catch((err) => {
        if (cancelled) return
        console.error('[ActiviteitenPage] initial load failed:', err)
        setLoadError(errMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const openSettings = () => {
    setPageUrl(settings?.pageUrl ?? '')
    setCookieFile(null)
    setFormError('')
    setSettingsOpen(true)
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings && !cookieFile) {
      setFormError('Upload a cookie file (JSON) to enable syncing.')
      return
    }
    setSavingSettings(true)
    setFormError('')
    try {
      const formData = new FormData()
      formData.append('pageUrl', pageUrl.trim())
      if (cookieFile) formData.append('cookiesFile', cookieFile)
      const saved = await saveFacebookSettings(formData, settings?.id)
      setSettings(saved)
      setSettingsOpen(false)
    } catch (err) {
      console.error('[ActiviteitenPage] save settings failed:', err)
      setFormError(`Failed to save settings: ${errMessage(err)}`)
    } finally {
      setSavingSettings(false)
    }
  }

  const handleSyncNow = async () => {
    setSyncing(true)
    setSyncError('')
    try {
      const res = await triggerSync()
      if (!res.ok) {
        setSyncError(res.error || 'Sync failed. Check the sync service.')
      }
    } catch (err) {
      console.error('[ActiviteitenPage] sync failed:', err)
      setSyncError(`Sync failed: ${errMessage(err)}`)
    } finally {
      setSyncing(false)
      refresh()
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteActiviteit(deleteId)
      setDeleteId(null)
      refresh()
    } catch {
      setDeleteId(null)
    }
  }

  const openCreateEvent = () => {
    setEditingEvent(null)
    setEventForm(emptyEventForm)
    setSelectedFile(null)
    setRemoveImage(false)
    setEventError('')
    setEventDialogOpen(true)
  }

  const openEditEvent = (ev: Activiteit) => {
    setEditingEvent(ev)
    setEventForm({
      name: ev.name,
      category: ev.category ?? '',
      start: toLocalInput(ev.startTime),
      end: toLocalInput(ev.endTime),
      placeName: ev.placeName ?? '',
      description: ev.description ?? '',
      fbUrl: ev.fbUrl ?? '',
      active: ev.active !== false,
    })
    setSelectedFile(null)
    setRemoveImage(false)
    setEventError('')
    setEventDialogOpen(true)
  }

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventForm.name.trim()) {
      setEventError('Event name is required.')
      return
    }
    if (!eventForm.start) {
      setEventError('Start date and time are required.')
      return
    }
    setSavingEvent(true)
    setEventError('')
    try {
      const startIso = new Date(eventForm.start).toISOString()
      const formData = new FormData()
      formData.append('name', eventForm.name.trim())
      formData.append('category', eventForm.category || '')
      formData.append('startTime', startIso)
      formData.append('endTime', eventForm.end ? new Date(eventForm.end).toISOString() : '')
      formData.append('placeName', eventForm.placeName.trim())
      formData.append('description', eventForm.description.trim())
      formData.append('fbUrl', eventForm.fbUrl.trim())
      formData.append('active', String(eventForm.active))
      // Manual events: keep the past flag in sync with the chosen start date.
      formData.append('past', String(new Date(startIso).getTime() < Date.now()))
      if (selectedFile) {
        formData.append('imageFile', selectedFile)
      } else if (removeImage) {
        formData.append('imageFile', '')
      }
      if (editingEvent) {
        await updateActiviteit(editingEvent.id, formData)
      } else {
        await createActiviteit(formData)
      }
      setEventDialogOpen(false)
      refresh()
    } catch (err) {
      console.error('[ActiviteitenPage] save event failed:', err)
      setEventError(`Failed to save event: ${errMessage(err)}`)
    } finally {
      setSavingEvent(false)
    }
  }

  const statusOk = settings?.lastSyncStatus === 'ok'
  const hasCredentials = !!settings?.cookiesFile
  const upcomingCount = events.filter((e) => !e.past).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activiteiten</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sync Fenrir's Facebook events to the website.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {can('write') && (
            <Button onClick={openCreateEvent} size="sm" className="gap-1.5">
              <Plus className="size-4" />
              Add event
            </Button>
          )}
          <Button
            onClick={openSettings}
            size="sm"
            variant="outline"
            className="gap-1.5"
          >
            <Settings className="size-4" />
            Sync settings
          </Button>
          {can('manageUsers') && (
            <Button
              onClick={handleSyncNow}
              size="sm"
              disabled={syncing}
              className="gap-1.5"
            >
              <RefreshCw className={`size-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing…' : 'Sync now'}
            </Button>
          )}
        </div>
      </div>
      {syncError && (
        <p className="text-xs text-destructive">{syncError}</p>
      )}
      {loadError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      )}

      {/* Status cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sync status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {settings?.lastSyncStatus ? (
                <Badge variant={statusOk ? 'default' : 'destructive'} className="gap-1 font-normal">
                  <span className={`size-1.5 rounded-full ${statusOk ? 'bg-white' : 'bg-white/80'}`} />
                  {statusOk ? 'OK' : 'Error'}
                </Badge>
              ) : (
                <Badge variant="outline" className="font-normal">Never run</Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {settings?.lastSyncAt ? fmtDateTime(settings.lastSyncAt) : '—'}
              </span>
            </div>
            {settings?.lastSyncError && (
              <p className="text-xs text-destructive leading-relaxed">{settings.lastSyncError}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Facebook credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={hasCredentials ? 'default' : 'outline'} className="font-normal">
                {hasCredentials ? 'Cookies uploaded' : 'No cookies'}
              </Badge>
              {hasCredentials && settings?.cookiesFile && (
                <span className="truncate text-xs text-muted-foreground max-w-40">
                  {settings.cookiesFile.split('/').pop()}
                </span>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {settings?.pageUrl || 'No page URL configured'}
            </p>
            <p className="text-xs text-muted-foreground">
              Updated {settings?.updated ? fmtDateTime(settings.updated) : '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Synced events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              <span className="text-2xl font-bold">{loading ? '—' : upcomingCount}</span>
              <span className="text-sm text-muted-foreground">upcoming</span>
            </div>
            {!loading && events.length > upcomingCount && (
              <p className="text-xs text-muted-foreground">
                +{events.length - upcomingCount} past event{events.length - upcomingCount === 1 ? '' : 's'} kept
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Events table */}
      <div className="rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading…
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <CalendarDays className="size-8 opacity-30" />
            <p className="text-sm">No events synced yet.</p>
            <p className="text-xs max-w-sm text-center">
              Upload your Facebook cookies and press “Sync now” — the scheduler
              also runs automatically every 6 hours.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Starts</TableHead>
                <TableHead>Place</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((ev) => (
                <TableRow key={ev.id} className={ev.past ? 'opacity-60' : ''}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      {ev.name}
                      {ev.past && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                          Past
                        </Badge>
                      )}
                      {!ev.fbEventId && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-purple-400">
                          Manual
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ev.categoryName ? (
                      <Badge variant="secondary" className="font-normal">{ev.categoryName}</Badge>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {fmtDateTime(ev.startTime)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{ev.placeName || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {can('write') && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEditEvent(ev)}
                          title="Edit event"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      )}
                      {ev.fbUrl && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          asChild
                          title="Open on Facebook"
                        >
                          <a href={ev.fbUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="size-3.5" />
                          </a>
                        </Button>
                      )}
                      {can('delete') && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(ev.id)}
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

      {/* Create / edit event dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEvent} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="eventName">Name</Label>
              <Input
                id="eventName"
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                placeholder="Halloween cantus"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select
                value={eventForm.category || 'none'}
                onValueChange={(v) => setEventForm({ ...eventForm, category: v === 'none' ? '' : v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="eventStart">Starts</Label>
                <Input
                  id="eventStart"
                  type="datetime-local"
                  value={eventForm.start}
                  onChange={(e) => setEventForm({ ...eventForm, start: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="eventEnd">Ends (optional)</Label>
                <Input
                  id="eventEnd"
                  type="datetime-local"
                  value={eventForm.end}
                  onChange={(e) => setEventForm({ ...eventForm, end: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="eventPlace">Location</Label>
              <Input
                id="eventPlace"
                value={eventForm.placeName}
                onChange={(e) => setEventForm({ ...eventForm, placeName: e.target.value })}
                placeholder="Den Echo"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="eventDescription">Description</Label>
              <Textarea
                id="eventDescription"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Short paragraph about the event"
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="eventUrl">External link</Label>
              <Input
                id="eventUrl"
                type="url"
                value={eventForm.fbUrl}
                onChange={(e) => setEventForm({ ...eventForm, fbUrl: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="eventImage">Cover image</Label>
              <Input
                id="eventImage"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setSelectedFile(e.target.files?.[0] ?? null)
                  if (e.target.files?.[0]) setRemoveImage(false)
                }}
              />
              {editingEvent?.imageFile && !selectedFile && (
                <div className="flex items-center gap-2">
                  <input
                    id="removeEventImage"
                    type="checkbox"
                    checked={removeImage}
                    onChange={(e) => setRemoveImage(e.target.checked)}
                    className="size-4 rounded border-input"
                  />
                  <Label htmlFor="removeEventImage" className="text-xs text-muted-foreground font-normal cursor-pointer">
                    Remove current image
                  </Label>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="eventActive"
                type="checkbox"
                checked={eventForm.active}
                onChange={(e) => setEventForm({ ...eventForm, active: e.target.checked })}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="eventActive" className="text-sm font-normal cursor-pointer">
                Visible on website
              </Label>
            </div>
            {eventError && <p className="text-xs text-destructive">{eventError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEventDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingEvent}>
                {savingEvent ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sync settings dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Facebook sync settings</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pageUrl">Facebook page URL</Label>
              <Input
                id="pageUrl"
                type="url"
                placeholder="https://www.facebook.com/fenrir.antwerpen"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cookiesFile">Session cookies (JSON)</Label>
              <Input
                id="cookiesFile"
                type="file"
                accept=".json,application/json,text/plain"
                onChange={(e) => setCookieFile(e.target.files?.[0] ?? null)}
              />
              {settings?.cookiesFile ? (
                <p className="text-xs text-muted-foreground">
                  Current file: {settings.cookiesFile.split('/').pop()} — upload a
                  new file to replace it.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Export c_user, xs, sb, datr, fr from your browser while logged in
                  (see the events-sync README for the exact steps).
                </p>
              )}
            </div>
            {formError && <p className="text-xs text-destructive">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingSettings} className="gap-1.5">
                <Upload className="size-4" />
                {savingSettings ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the event from the website. It will return on the next
              sync if it's still on the Facebook page.
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
