import React, { useEffect, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Tags,
  PartyPopper,
  Music,
  Trophy,
  Film,
  Tent,
  CalendarDays,
  Beer,
  MapPin,
  HeartHandshake,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  getEventCategories,
  createEventCategory,
  updateEventCategory,
  deleteEventCategory,
  type EventCategory,
} from '@/lib/db/eventCategories'
import { useRole } from '@/lib/RoleContext'

/** Curated lucide icons editors can pick (mirrors the website's icon map). */
const categoryIcons: Record<string, LucideIcon> = {
  PartyPopper,
  Music,
  Trophy,
  Film,
  Tent,
  CalendarDays,
  Beer,
  MapPin,
  HeartHandshake,
  Sparkles,
}

function getCategoryIcon(name?: string): LucideIcon {
  return (name && categoryIcons[name]) || Sparkles
}

function CategoryIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = getCategoryIcon(name)
  return <Icon className={className ?? 'size-4 text-purple-400'} />
}

type FormState = {
  name: string
  description: string
  icon: string
  sortOrder: number
  active: boolean
}

const emptyForm: FormState = {
  name: '',
  description: '',
  icon: '',
  sortOrder: 0,
  active: true,
}

export function CategoriesPage() {
  const { can } = useRole()
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<EventCategory | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const load = () => {
    setLoading(true)
    getEventCategories()
      .then(setCategories)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (cat: EventCategory) => {
    setEditing(cat)
    setForm({
      name: cat.name,
      description: cat.description ?? '',
      icon: cat.icon ?? '',
      sortOrder: cat.sortOrder ?? 0,
      active: cat.active !== false,
    })
    setError('')
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const data = {
        name: form.name.trim(),
        description: form.description.trim(),
        icon: form.icon,
        sortOrder: form.sortOrder,
        active: form.active,
      }
      if (editing) {
        await updateEventCategory(editing.id, data)
      } else {
        await createEventCategory(data)
      }
      setDialogOpen(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteError('')
    try {
      await deleteEventCategory(deleteId)
      setDeleteId(null)
      load()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete category.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the “Wat doen wij” activity categories shown on the website.
          </p>
        </div>
        {can('write') && (
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="size-4" /> Add Category
          </Button>
        )}
      </div>

      <div className="rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading…
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <Tags className="size-8 opacity-30" />
            <p className="text-sm">No categories yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-16">Order</TableHead>
                <TableHead className="w-20">Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id} className={cat.active === false ? 'opacity-60' : ''}>
                  <TableCell>{cat.icon ? <CategoryIcon name={cat.icon} className="size-4 text-purple-400" /> : '—'}</TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="max-w-72 truncate text-muted-foreground">
                    {cat.description || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{cat.sortOrder ?? '—'}</TableCell>
                  <TableCell>
                    {cat.active === false ? (
                      <Badge variant="outline" className="text-muted-foreground">Hidden</Badge>
                    ) : (
                      <Badge variant="default" className="gap-1 font-normal">
                        <span className="size-1.5 rounded-full bg-white" /> Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {can('write') && (
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(cat)}>
                          <Pencil className="size-3.5" />
                        </Button>
                      )}
                      {can('delete') && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setDeleteError('')
                            setDeleteId(cat.id)
                          }}
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
            <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name (Dutch)</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="TD's & feestjes"
                required
              />
              <p className="text-xs text-muted-foreground">
                English is auto-translated (DeepL) — same as sponsors.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Icon</Label>
              <Select value={form.icon || 'Sparkles'} onValueChange={(v) => setForm({ ...form, icon: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick an icon" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryIcons).map(([name]) => (
                    <SelectItem key={name} value={name}>
                      <CategoryIcon name={name} className="size-4 text-purple-400" />
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Icon shown on the activity cards on the website.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description (Dutch)</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description shown on the activity cards"
                rows={3}
              />
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sortOrder">Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  className="w-28"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2 pb-2">
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
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this category. Events that still use it
              will block the deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // Keep the dialog open on failure so the guard message is visible.
                e.preventDefault()
                handleDelete()
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
