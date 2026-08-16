import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import { useRole } from '@/lib/RoleContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  getSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  type Sponsor,
} from '@/lib/db/sponsors'

const currentYear = new Date().getFullYear()

type FormState = {
  name: string
  contentRaw: string
  url: string
  startYear: number
  endYear: number
}

const emptyForm: FormState = {
  name: '',
  contentRaw: '',
  url: '',
  startYear: currentYear,
  endYear: currentYear,
}

export function SponsorsPage() {
  const { can } = useRole()
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Sponsor | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    getSponsors()
      .then(setSponsors)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setSelectedFile(null)
    setRemoveImage(false)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (sponsor: Sponsor) => {
    setEditing(sponsor)
    setForm({
      name: sponsor.name,
      contentRaw: (sponsor.content ?? []).join('\n'),
      url: sponsor.url ?? '',
      startYear: sponsor.startYear,
      endYear: sponsor.endYear,
    })
    setSelectedFile(null)
    setRemoveImage(false)
    setError('')
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const content = form.contentRaw.split('\n').map(line => line.trim()).filter(Boolean)
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('url', form.url ?? '')
      formData.append('startYear', form.startYear.toString())
      formData.append('endYear', form.endYear.toString())
      formData.append('content', JSON.stringify(content))
      if (selectedFile) {
        formData.append('imageFile', selectedFile)
      } else if (removeImage) {
        formData.append('imageFile', '')
      }
      if (editing) {
        await updateSponsor(editing.id, formData)
      } else {
        await createSponsor(formData)
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
      await deleteSponsor(deleteId)
      setDeleteId(null)
      load()
    } catch {
      setDeleteId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sponsors</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage Fenrir's sponsors.</p>
        </div>
        {can('write') && (
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="size-4" /> Add Sponsor
          </Button>
        )}
      </div>

      <div className="rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading…
          </div>
        ) : sponsors.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <Building2 className="size-8 opacity-30" />
            <p className="text-sm">No sponsors yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Years</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sponsors.map((sponsor) => (
                <TableRow key={sponsor.id}>
                  <TableCell className="font-medium">{sponsor.name}</TableCell>
                  <TableCell className="max-w-45 truncate text-muted-foreground">
                    {sponsor.url || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {sponsor.startYear}–{sponsor.endYear}
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

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Sponsor' : 'Add Sponsor'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="startYear">Start Year</Label>
                <Input
                  id="startYear"
                  type="number"
                  value={form.startYear}
                  onChange={(e) => setForm({ ...form, startYear: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="endYear">End Year</Label>
                <Input
                  id="endYear"
                  type="number"
                  value={form.endYear}
                  onChange={(e) => setForm({ ...form, endYear: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="content">Content (one item per line)</Label>
              <Textarea
                id="content"
                placeholder="Partnership benefit 1&#10;Partnership benefit 2"
                value={form.contentRaw}
                onChange={(e) => setForm({ ...form, contentRaw: e.target.value })}
                rows={4}
              />
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
              This will permanently delete this sponsor. This action cannot be undone.
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
