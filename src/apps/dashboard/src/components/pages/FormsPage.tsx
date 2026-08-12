import React, { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Check,
  ClipboardList,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
  Inbox,
  ExternalLink,
  MoreHorizontal,
  BarChart3,
  Send,
  FileText,
  Sparkles,
  Type,
  AlignLeft,
  Mail,
  Hash,
  ChevronDown,
  CircleDot,
  CheckSquare,
  CalendarDays,
  Heading,
  Image as ImageIcon,
  Upload,
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell } from 'recharts'
import ReactMarkdown from 'react-markdown'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  getForms,
  createForm,
  updateForm,
  deleteForm,
  getFormSubmissions,
  uploadFormImage,
  deleteFormImage,
  formImageRecordId,
  formUrl,
  FORM_HOOKS,
  type Form,
  type FormSubmission,
  type FormFieldType,
  type FormField,
} from '@/lib/db/forms'
import { useRole } from '@/lib/RoleContext'

// ── Builder draft types ──────────────────────────────────────────────────────
interface FieldDraft {
  id: string
  label: string
  label_en: string
  type: FormFieldType
  required: boolean
  options: string[]
  placeholder: string
  /** section only — markdown body (NL + optional EN). */
  content: string
  content_en: string
  /** image only — URL of the image shown between questions. */
  imageUrl: string
  /** image only — pending upload picked in the builder (uploaded on save). */
  imageFile: File | null
  /** image only — form_images record id of the ORIGINAL image (for cleanup). */
  imageOldRecordId: string | null
}

interface FormDraft {
  title: string
  description: string
  multiLanguage: boolean
  active: boolean
  hook: string
  fields: FieldDraft[]
}

const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'radio', label: 'Radio' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'date', label: 'Date' },
  { value: 'section', label: 'Text section' },
  { value: 'image', label: 'Image' },
]

// Builder-card aid: each field type gets an icon + accent color so the cards
// in the form maker are instantly distinguishable. The preview (and the real
// form site) intentionally show none of this — members just see the inputs.
const FIELD_TYPE_META: Record<FormFieldType, { label: string; icon: LucideIcon; accent: string }> = {
  text: { label: 'Text', icon: Type, accent: 'var(--chart-1)' },
  textarea: { label: 'Long text', icon: AlignLeft, accent: 'var(--chart-2)' },
  email: { label: 'Email', icon: Mail, accent: 'var(--chart-3)' },
  number: { label: 'Number', icon: Hash, accent: 'var(--chart-4)' },
  select: { label: 'Dropdown', icon: ChevronDown, accent: 'var(--chart-5)' },
  radio: { label: 'Multiple choice', icon: CircleDot, accent: 'var(--chart-1)' },
  checkbox: { label: 'Checkboxes', icon: CheckSquare, accent: 'var(--chart-2)' },
  date: { label: 'Date', icon: CalendarDays, accent: 'var(--chart-3)' },
  section: { label: 'Section', icon: Heading, accent: 'var(--chart-4)' },
  image: { label: 'Image', icon: ImageIcon, accent: 'var(--chart-5)' },
}

const emptyForm: FormDraft = {
  title: '',
  description: '',
  multiLanguage: false,
  active: true,
  hook: 'none',
  fields: [],
}

// Options that map to GitHub issue labels — mirrors the knownLabels allowlist
// in pb_hooks/forms.pb.js. Used for the bugticket panel preview.
const ISSUE_LABEL_OPTIONS = [
  'bug', 'enhancement', 'improvement', 'urgent', 'question',
  'documentation', 'spelling mistake', 'breaking bug',
]

/**
 * The standard fields the bugticket hook needs. Each gets a fresh id; the
 * caller decides which ones to actually add (skip ones that already exist).
 */
function bugticketDefaultFields(): FieldDraft[] {
  const base = (): FieldDraft => ({
    id: newFieldId(),
    label: '',
    label_en: '',
    type: 'text',
    required: false,
    options: [],
    placeholder: '',
    content: '',
    content_en: '',
    imageUrl: '',
    imageFile: null,
    imageOldRecordId: null,
  })
  return [
    {
      ...base(),
      label: 'Titel',
      label_en: 'Title',
      type: 'text',
      required: true,
      placeholder: 'Korte titel van het probleem',
    },
    {
      ...base(),
      label: 'Beschrijf de issue',
      label_en: 'Describe the issue',
      type: 'textarea',
      required: true,
      placeholder: 'Wat ging er mis? Wat had je verwacht?',
    },
    {
      ...base(),
      label: 'Type',
      label_en: 'Type',
      type: 'select',
      options: [...ISSUE_LABEL_OPTIONS],
    },
  ]
}

let fieldCounter = 0
function newFieldId(): string {
  fieldCounter += 1
  return `fld_${Date.now().toString(36)}_${fieldCounter}`
}

function draftFromForm(form: Form): FormDraft {
  return {
    title: form.title,
    description: form.description ?? '',
    multiLanguage: form.multiLanguage,
    active: form.active,
    hook: form.hook || 'none',
    fields: form.fields.map((f) => ({
      id: f.id,
      label: f.label,
      label_en: f.label_en ?? '',
      type: f.type,
      required: f.required,
      options: f.options ?? [],
      placeholder: f.placeholder ?? '',
      content: f.content ?? '',
      content_en: f.content_en ?? '',
      imageUrl: f.imageUrl ?? '',
      imageFile: null,
      imageOldRecordId: formImageRecordId(f.imageUrl ?? ''),
    })),
  }
}

const NEW_WINDOW_MS = 48 * 60 * 60 * 1000 // "new" badge window
const CARD_PREVIEW_FIELDS = 2 // option fields shown per card

// Donut palette — cycles through the theme's chart tokens (--chart-1..5).
const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

interface DonutDatum {
  label: string
  count: number
  fill: string
}

function toDonutData(t: FieldTally): DonutDatum[] {
  return t.counts.map((c, i) => ({
    label: c.label,
    count: c.count,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }))
}

export function FormsPage() {
  const { can } = useRole()
  const [forms, setForms] = useState<Form[]>([])
  const [submissionsByForm, setSubmissionsByForm] = useState<Record<string, FormSubmission[]>>({})
  const [loading, setLoading] = useState(true)

  // builder dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Form | null>(null)
  const [draft, setDraft] = useState<FormDraft>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // delete
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')

  // responses sheet
  const [responsesForm, setResponsesForm] = useState<Form | null>(null)
  const [responses, setResponses] = useState<FormSubmission[]>([])
  const [responsesLoading, setResponsesLoading] = useState(false)

  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const list = await getForms()
      setForms(list)
      // Counts + "new" badge are computed client-side from the submissions.
      const entries = await Promise.all(
        list.map(async (f) => [f.id, await getFormSubmissions(f.id)] as const),
      )
      setSubmissionsByForm(Object.fromEntries(entries))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCreate = () => {
    setEditing(null)
    setDraft(emptyForm)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (form: Form) => {
    setEditing(form)
    setDraft(draftFromForm(form))
    setError('')
    setDialogOpen(true)
  }

  const updateField = (id: string, patch: Partial<FieldDraft>) => {
    setDraft((d) => ({
      ...d,
      fields: d.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }))
  }

  const moveField = (index: number, dir: -1 | 1) => {
    setDraft((d) => {
      const fields = [...d.fields]
      const target = index + dir
      if (target < 0 || target >= fields.length) return d
      ;[fields[index], fields[target]] = [fields[target], fields[index]]
      return { ...d, fields }
    })
  }

  const removeField = (id: string) => {
    setDraft((d) => ({ ...d, fields: d.fields.filter((f) => f.id !== id) }))
  }

  const addField = () => {
    setDraft((d) => ({
      ...d,
      fields: [
        ...d.fields,
        {
          id: newFieldId(),
          label: '',
          label_en: '',
          type: 'text',
          required: false,
          options: [],
          placeholder: '',
          content: '',
          content_en: '',
          imageUrl: '',
          imageFile: null,
          imageOldRecordId: null,
        },
      ],
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.title.trim()) {
      setError('Title is required.')
      return
    }
    if (draft.fields.length === 0) {
      setError('Add at least one field.')
      return
    }
    for (const f of draft.fields) {
      if (isDisplayField(f)) {
        if (f.type === 'image' && !f.imageUrl.trim() && !f.imageFile) {
          setError(`Image "${f.label || '(no label)'}" needs an image.`)
          return
        }
        continue // sections are fine without a label (markdown-only)
      }
      if (!f.label.trim()) {
        setError('Every question needs a label.')
        return
      }
      if ((f.type === 'select' || f.type === 'radio' || f.type === 'checkbox') && f.options.filter((o) => o.trim()).length === 0) {
        setError(`Field "${f.label || '(no label)'}" needs at least one option.`)
        return
      }
    }

    // New uploads (resolved to URLs after the form is saved — the form id is
    // needed for the form_images relation) + old uploads that must be deleted
    // because they were replaced or removed.
    const pendingUploads: { fieldId: string; file: File }[] = []
    const oldUploadIds: string[] = []

    const fields: FormField[] = draft.fields.map((f) => {
      if (isDisplayField(f)) {
        if (f.type === 'image') {
          const hasNew = f.imageFile !== null
          const hasImage = f.imageUrl.trim() !== '' || hasNew
          if (hasNew) pendingUploads.push({ fieldId: f.id, file: f.imageFile as File })
          if (f.imageOldRecordId && (hasNew || !hasImage)) {
            oldUploadIds.push(f.imageOldRecordId)
          }
          return {
            id: f.id,
            label: f.label.trim(),
            ...(draft.multiLanguage && f.label_en.trim() ? { label_en: f.label_en.trim() } : {}),
            type: 'image',
            required: false,
            // New uploads get their resolved URL via a follow-up update below.
            ...(hasNew || !hasImage ? {} : { imageUrl: f.imageUrl.trim() }),
          }
        }
        // Display fields collect no answer — no label/required requirements.
        return {
          id: f.id,
          label: f.label.trim(),
          ...(draft.multiLanguage && f.label_en.trim() ? { label_en: f.label_en.trim() } : {}),
          type: f.type,
          required: false,
          ...(f.type === 'section'
            ? {
                ...(f.content.trim() ? { content: f.content.trim() } : {}),
                ...(draft.multiLanguage && f.content_en.trim()
                  ? { content_en: f.content_en.trim() }
                  : {}),
              }
            : {}),
        }
      }
      return {
        id: f.id,
        label: f.label.trim(),
        ...(draft.multiLanguage && f.label_en.trim() ? { label_en: f.label_en.trim() } : {}),
        type: f.type,
        required: f.required,
        ...(f.type === 'select' || f.type === 'radio' || f.type === 'checkbox'
          ? { options: f.options.map((o) => o.trim()).filter(Boolean) }
          : {}),
        ...(f.placeholder.trim() ? { placeholder: f.placeholder.trim() } : {}),
      }
    })

    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim() || undefined,
      multiLanguage: draft.multiLanguage,
      active: draft.active,
      hook: draft.hook,
      fields,
    }

    setSaving(true)
    setError('')
    try {
      // Resolve pending uploads to URLs. When editing we already have the form
      // id, so we upload FIRST and save once with the resolved URLs — no window
      // where a failed upload leaves the form without its image. For new forms
      // the id only exists after create, so it's a two-step save.
      const uploadPending = async (formId: string) => {
        const urlByField: Record<string, string> = {}
        for (const up of pendingUploads) {
          const img = await uploadFormImage(formId, up.fieldId, up.file)
          urlByField[up.fieldId] = img.url
        }
        return urlByField
      }

      if (editing && pendingUploads.length > 0) {
        const urlByField = await uploadPending(editing.id)
        const fieldsWithUrls: FormField[] = fields.map((f) =>
          urlByField[f.id] ? { ...f, imageUrl: urlByField[f.id] } : f,
        )
        await updateForm(editing.id, { ...payload, fields: fieldsWithUrls })
      } else {
        const saved = editing ? await updateForm(editing.id, payload) : await createForm(payload)
        if (pendingUploads.length > 0) {
          const urlByField = await uploadPending(saved.id)
          const updatedFields: FormField[] = (saved.fields ?? []).map((f) =>
            urlByField[f.id] ? { ...f, imageUrl: urlByField[f.id] } : f,
          )
          await updateForm(saved.id, { fields: updatedFields })
        }
      }

      // Best-effort cleanup of replaced/removed uploads — never blocks the save.
      for (const id of oldUploadIds) {
        try {
          await deleteFormImage(id)
        } catch {
          // orphaned file, acceptable
        }
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
      await deleteForm(deleteId)
      setDeleteId(null)
      load()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete form.')
    }
  }

  const openResponses = async (form: Form) => {
    setResponsesForm(form)
    setResponsesLoading(true)
    setResponses([])
    try {
      setResponses(await getFormSubmissions(form.id))
    } catch {
      setResponses([])
    } finally {
      setResponsesLoading(false)
    }
  }

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(formUrl(code))
      setCopiedCode(code)
      setTimeout(() => setCopiedCode((c) => (c === code ? null : c)), 1500)
    } catch {
      // clipboard unavailable — ignore
    }
  }

  // Counts + "new" badge per form, derived from the fetched submissions.
  const counts = useMemo(() => {
    const now = Date.now()
    const map: Record<string, { count: number; latest?: string; hasNew: boolean; newCount: number }> = {}
    for (const [id, subs] of Object.entries(submissionsByForm)) {
      let newCount = 0
      for (const s of subs) {
        const t = s.created ? new Date(s.created).getTime() : NaN
        if (!Number.isNaN(t) && now - t < NEW_WINDOW_MS) newCount += 1
      }
      map[id] = {
        count: subs.length,
        latest: subs[0]?.created,
        hasNew: newCount > 0,
        newCount,
      }
    }
    return map
  }, [submissionsByForm])

  // Overview stat cards.
  const stats = useMemo(() => {
    const totalResponses = Object.values(counts).reduce((s, c) => s + c.count, 0)
    const newResponses = Object.values(counts).reduce(
      (s, c) => s + c.newCount,
      0,
    )
    return {
      totalForms: forms.length,
      totalResponses,
      activeForms: forms.filter((f) => f.active !== false).length,
      newResponses,
    }
  }, [forms, counts])

  const hasOptionsType = (f: FieldDraft) =>
    f.type === 'select' || f.type === 'radio' || f.type === 'checkbox'

  // Display-only fields (section / image) render content between questions
  // and collect no answer — they have no label/options/required semantics.
  const isDisplayField = (f: FieldDraft) => f.type === 'section' || f.type === 'image'

  // Selected processing hook — used to show what inputs it needs.
  const selectedHook = FORM_HOOKS.find((h) => h.value === draft.hook)

  // ── bugticket panel: what the created GitHub issue would look like ───────
  // Title source: the first text/textarea question (its answer becomes the title).
  const bugticketTitleField = draft.fields.find(
    (f) => f.type === 'text' || f.type === 'textarea',
  )
  // Options across select/radio/checkbox questions that match repo labels.
  const bugticketLabelOptions = [
    ...new Set(
      draft.fields
        .filter((f) => f.type === 'select' || f.type === 'radio' || f.type === 'checkbox')
        .flatMap((f) =>
          f.options.map((o) => o.trim()).filter((o) => ISSUE_LABEL_OPTIONS.includes(o.toLowerCase())),
        ),
    ),
  ]
  const bugticketAnswerCount = draft.fields.filter(
    (f) => f.type !== 'section' && f.type !== 'image',
  ).length
  const bugticketDefaultsMissing = () => {
    const has = (t: FormFieldType) => draft.fields.some((f) => f.type === t)
    // A textarea covers the title slot, so only those two are strictly needed.
    return !has('textarea') || !has('select')
  }

  /** Insert the hook's standard fields, skipping any that already exist. */
  const addHookDefaultFields = () => {
    if (selectedHook?.value !== 'bugticket') return
    // Generate the drafts up front — newFieldId() mutates a module counter, and
    // the setDraft updater must stay pure (React may invoke it twice in dev).
    const [titleDef, descDef, typeDef] = bugticketDefaultFields()
    setDraft((d) => {
      const fields = [...d.fields]
      const has = (t: FormFieldType) => fields.some((f) => f.type === t)
      if (!has('text') && !has('textarea')) fields.push(titleDef)
      if (!has('textarea')) fields.push(descDef)
      if (!has('select')) fields.push(typeDef)
      return { ...d, fields }
    })
  }

  // Tallies for the responses sheet's donut cards.
  const sheetTallies = responsesForm ? computeTallies(responsesForm, responses) : []

  // Answer columns for the responses table — one per answer field, plus any
  // answers whose field id no longer exists (form edited after responses came in).
  const sheetAnswerFields =
    responsesForm?.fields.filter((f) => f.type !== 'section' && f.type !== 'image') ?? []
  const knownFieldIds = new Set(sheetAnswerFields.map((f) => f.id))
  const sheetColumnIds = [
    ...sheetAnswerFields.map((f) => f.id),
    ...new Set(
      responses.flatMap((sub) =>
        Object.keys(sub.answers ?? {}).filter((id) => !knownFieldIds.has(id)),
      ),
    ),
  ]
  const sheetColumnLabel = (id: string) =>
    sheetAnswerFields.find((f) => f.id === id)?.label ?? id

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forms</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build forms for the public form site (form.fenrirclub.be) and view their responses.
          </p>
        </div>
        {can('manageForms') && (
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="size-4" /> New Form
          </Button>
        )}
      </div>

      {/* Overview stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card size="sm">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Total forms</CardTitle>
            <ClipboardList className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{stats.totalForms}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Total responses</CardTitle>
            <Send className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{stats.totalResponses}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Active forms</CardTitle>
            <BarChart3 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{stats.activeForms}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">New responses (48h)</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{stats.newResponses}</p>
          </CardContent>
        </Card>
      </div>

      {/* Form cards grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading…</div>
      ) : forms.length === 0 ? (
        <Card className="items-center justify-center py-16 text-center">
          <ClipboardList className="size-8 opacity-30" />
          <p className="text-sm text-muted-foreground">No forms yet.</p>
          {can('manageForms') && (
            <Button onClick={openCreate} variant="outline" size="sm" className="mt-2 gap-1.5">
              <Plus className="size-3.5" /> Create your first form
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {forms.map((form) => {
            const info = counts[form.id] ?? { count: 0, hasNew: false }
            const subs = submissionsByForm[form.id] ?? []
            const tallies = computeTallies(form, subs)
            return (
              <Card key={form.id} className={form.active === false ? 'opacity-70' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                      {form.title}
                      {info.hasNew && (
                        <Badge className="gap-1 font-normal">
                          <span className="size-1.5 rounded-full bg-white" /> new
                        </Badge>
                      )}
                    </CardTitle>
                    {(can('manageForms') || can('delete')) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" title="Actions">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {can('manageForms') && (
                            <DropdownMenuItem onClick={() => openResponses(form)}>
                              <Eye className="size-3.5" /> View responses
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => copyCode(form.code)}>
                            {copiedCode === form.code ? (
                              <Check className="size-3.5" /> 
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                            {copiedCode === form.code ? 'Link copied' : 'Copy link'}
                          </DropdownMenuItem>
                          {can('manageForms') && (
                            <DropdownMenuItem onClick={() => openEdit(form)}>
                              <Pencil className="size-3.5" /> Edit
                            </DropdownMenuItem>
                          )}
                          {can('delete') && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => {
                                  setDeleteError('')
                                  setDeleteId(form.id)
                                }}
                              >
                                <Trash2 className="size-3.5" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {form.active === false ? (
                      <Badge variant="outline" className="text-muted-foreground">Closed</Badge>
                    ) : (
                      <Badge variant="default" className="gap-1 font-normal">
                        <span className="size-1.5 rounded-full bg-white" /> Active
                      </Badge>
                    )}
                    {form.multiLanguage
                      ? <Badge variant="secondary" className="font-normal">NL + EN</Badge>
                      : <Badge variant="outline" className="font-normal text-muted-foreground">NL</Badge>}
                  </div>
                  {form.description && (
                    <div className="markdown-body line-clamp-2 text-sm text-foreground/90">
                      <ReactMarkdown>{form.description}</ReactMarkdown>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Send className="size-3.5" />
                      {info.count} response{info.count === 1 ? '' : 's'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {info.latest ? `latest ${fmtDateTime(info.latest)}` : 'no responses yet'}
                    </span>
                  </div>

                  {/* Option-count preview donuts */}
                  {tallies.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {tallies.slice(0, CARD_PREVIEW_FIELDS).map((t) => {
                        const data = toDonutData(t)
                        return (
                          <div key={t.field.id} className="flex items-center gap-4">
                            <ChartContainer config={{}} className="h-24 w-24 shrink-0">
                              <PieChart>
                                <Pie
                                  data={data}
                                  dataKey="count"
                                  nameKey="label"
                                  innerRadius={30}
                                  outerRadius={42}
                                  strokeWidth={3}
                                >
                                  {data.map((d, i) => (
                                    <Cell key={`${i}-${d.label}`} fill={d.fill} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ChartContainer>
                            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                              <p className="truncate text-xs font-medium">{t.field.label}</p>
                              <div className="flex flex-col gap-1">
                                {data.map((d, i) => (
                                  <div key={`${i}-${d.label}`} className="flex items-center gap-2 text-xs">
                                    <span
                                      className="size-2 shrink-0 rounded-full"
                                      style={{ backgroundColor: d.fill }}
                                    />
                                    <span className="w-28 truncate text-muted-foreground">{d.label}</span>
                                    <span className="ml-auto font-medium tabular-nums">{d.count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {tallies.length > CARD_PREVIEW_FIELDS && (
                        <p className="text-xs text-muted-foreground">
                          +{tallies.length - CARD_PREVIEW_FIELDS} more field{tallies.length - CARD_PREVIEW_FIELDS > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="mt-auto justify-between gap-2">
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">/{form.code}</code>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" title="Copy public link" onClick={() => copyCode(form.code)}>
                      {copiedCode === form.code
                        ? <Check className="size-3.5 text-primary" />
                        : <Copy className="size-3.5" />}
                    </Button>
                    <a
                      href={formUrl(form.code)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      title="Open public form"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create / Edit dialog — the form builder */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex h-[92vh] w-[95vw] max-w-[95vw] flex-col overflow-hidden sm:max-w-[95vw]">
          <DialogHeader className="flex-row items-center justify-between gap-4 pr-9">
            <DialogTitle>{editing ? 'Edit Form' : 'New Form'}</DialogTitle>
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="form-builder" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </DialogHeader>
          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
              {error}
            </p>
          )}
          <div className="grid min-h-0 flex-1 grid-rows-2 gap-5 overflow-hidden lg:grid-cols-2 lg:grid-rows-1">
            {/* Left — builder */}
            <form id="form-builder" onSubmit={handleSave} className="flex min-h-0 flex-col gap-5 overflow-y-auto pr-1">
            {/* Basics */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="form-title">Title</Label>
                <Input
                  id="form-title"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Ledenweekend inschrijving"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Processing hook</Label>
                <Select value={draft.hook} onValueChange={(v) => setDraft({ ...draft, hook: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORM_HOOKS.map((h) => (
                      <SelectItem key={h.value} value={h.value}>
                        {h.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedHook && selectedHook.value !== 'none' && (
                  <div className="flex flex-col gap-2 rounded-md border bg-muted/40 p-2.5">
                    <p className="text-xs text-muted-foreground">{selectedHook.description}</p>

                    {selectedHook.value === 'bugticket' && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-fit gap-1.5"
                          disabled={!bugticketDefaultsMissing()}
                          onClick={addHookDefaultFields}
                        >
                          <Sparkles className="size-3.5" />
                          {bugticketDefaultsMissing()
                            ? 'Add the fields this hook needs'
                            : 'Default fields added'}
                        </Button>

                        {/* Live preview of the GitHub issue that would be created */}
                        <div className="flex flex-col gap-1 rounded border bg-background/60 p-2 text-xs">
                          <p className="font-medium text-foreground">
                            GitHub issue that will be created
                          </p>
                          <p className="break-words text-muted-foreground">
                            <span className="font-medium text-foreground">Title:</span>{' '}
                            {bugticketTitleField
                              ? `answer of “${bugticketTitleField.label || 'the first text question'}”`
                              : `fallback “Form submission: ${draft.title.trim() || '…'}”`}
                          </p>
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Body:</span>{' '}
                            all answers ({bugticketAnswerCount} question
                            {bugticketAnswerCount === 1 ? '' : 's'})
                          </p>
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Possible labels:</span>{' '}
                            {bugticketLabelOptions.length > 0
                              ? bugticketLabelOptions.join(', ')
                              : 'bug (default)'}
                          </p>
                        </div>
                      </>
                    )}

                    {selectedHook.value === 'bugticket' && !bugticketTitleField && (
                      <p className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                        No text question yet — click “Add the fields this hook needs” to create one.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="form-description">Description (optional)</Label>
              <Textarea
                id="form-description"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Short intro shown above the fields — markdown supported"
                rows={3}
              />
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 shrink-0" />
                <span className="mr-0.5">Markdown:</span>
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">**bold**</code>
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">*italic*</code>
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">[link](url)</code>
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">- list</code>
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]"># heading</code>
              </div>
            </div>

            <div className="flex flex-wrap gap-5">
              <div className="flex items-center gap-2">
                <input
                  id="form-multiLang"
                  type="checkbox"
                  checked={draft.multiLanguage}
                  onChange={(e) => setDraft({ ...draft, multiLanguage: e.target.checked })}
                  className="size-4 rounded border-input"
                />
                <Label htmlFor="form-multiLang" className="text-sm font-normal cursor-pointer">
                  Support NL + EN (adds a language toggle + English labels)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="form-active"
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                  className="size-4 rounded border-input"
                />
                <Label htmlFor="form-active" className="text-sm font-normal cursor-pointer">
                  Accept responses (uncheck to close the form)
                </Label>
              </div>
            </div>

            {/* Fields editor */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Fields</Label>
                <Button type="button" variant="outline" size="sm" onClick={addField} className="gap-1.5">
                  <Plus className="size-3.5" /> Add field
                </Button>
              </div>

              {draft.fields.length === 0 && (
                <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                  No fields yet — add your first field.
                </p>
              )}

              <div className="grid gap-3 xl:grid-cols-2">
              {draft.fields.map((f, i) => {
                const meta = FIELD_TYPE_META[f.type]
                return (
                <div
                  key={f.id}
                  className="rounded-lg border border-l-4 p-4"
                  style={{ borderLeftColor: meta.accent }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        aria-hidden="true"
                        className="inline-flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${meta.accent} 14%, transparent)`,
                        }}
                      >
                        <meta.icon className="size-3.5 shrink-0" style={{ color: meta.accent }} />
                        <span className="truncate">{meta.label}</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="flex flex-col">
                          <button type="button" className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={i === 0} onClick={() => moveField(i, -1)}>
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button type="button" className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={i === draft.fields.length - 1} onClick={() => moveField(i, 1)}>
                            <ArrowDown className="size-3.5" />
                          </button>
                        </div>
                        <Button type="button" variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => removeField(f.id)}>
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        value={f.label}
                        onChange={(e) => updateField(f.id, { label: e.target.value })}
                        placeholder="Label (Dutch)"
                        className="font-medium"
                      />
                      <Select value={f.type} onValueChange={(v) => updateField(f.id, { type: v as FormFieldType })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {draft.multiLanguage && (
                      <Input
                        value={f.label_en}
                        onChange={(e) => updateField(f.id, { label_en: e.target.value })}
                        placeholder="Label (English)"
                      />
                    )}
                    {/* TODO (later): auto-translate label_en/content_en when empty —
                        DeepL hook pattern exists in translate.pb.js; the Dutch
                        label is required and serves as the translation source. */}

                    {f.type === 'section' && (
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Content (markdown)
                        </Label>
                        <Textarea
                          value={f.content}
                          onChange={(e) => updateField(f.id, { content: e.target.value })}
                          placeholder={'**Bold**, _italic_, lists, links…'}
                          rows={4}
                        />
                        {draft.multiLanguage && (
                          <Textarea
                            value={f.content_en}
                            onChange={(e) => updateField(f.id, { content_en: e.target.value })}
                            placeholder="Content (markdown, English)"
                            rows={3}
                          />
                        )}
                      </div>
                    )}

                    {f.type === 'image' && (
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">Image</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => document.getElementById(`image-file-${f.id}`)?.click()}
                          >
                            <Upload className="size-3.5" />
                            {f.imageFile || f.imageUrl ? 'Replace image' : 'Upload image'}
                          </Button>
                          {(f.imageFile || f.imageUrl) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => updateField(f.id, { imageFile: null, imageUrl: '' })}
                            >
                              Remove
                            </Button>
                          )}
                          <input
                            id={`image-file-${f.id}`}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null
                              if (file) {
                                updateField(f.id, {
                                  imageFile: file,
                                  imageUrl: URL.createObjectURL(file),
                                })
                              }
                              e.target.value = ''
                            }}
                          />
                        </div>
                        {f.imageUrl.trim() && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={f.imageUrl.trim()}
                            alt={f.label || 'Image'}
                            className="max-h-48 w-full rounded-md border object-contain"
                            onError={(e) => {
                              ;(e.currentTarget as HTMLImageElement).style.opacity = '0.3'
                            }}
                            onLoad={(e) => {
                              ;(e.currentTarget as HTMLImageElement).style.opacity = '1'
                            }}
                          />
                        )}
                      </div>
                    )}

                    {!isDisplayField(f) && (
                      <Input
                        value={f.placeholder}
                        onChange={(e) => updateField(f.id, { placeholder: e.target.value })}
                        placeholder="Placeholder (optional)"
                      />
                    )}

                    {hasOptionsType(f) && (
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">Options</Label>
                        {f.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <Input
                              value={opt}
                              onChange={(e) => {
                                const options = [...f.options]
                                options[oi] = e.target.value
                                updateField(f.id, { options })
                              }}
                              placeholder={`Option ${oi + 1}`}
                              className="h-8 text-sm"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => updateField(f.id, { options: f.options.filter((_, x) => x !== oi) })}
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-fit gap-1 px-2 text-xs"
                          onClick={() => updateField(f.id, { options: [...f.options, ''] })}
                        >
                          <Plus className="size-3" /> Add option
                        </Button>
                      </div>
                    )}

                    {!isDisplayField(f) && (
                      <div className="flex items-center gap-2">
                        <input
                          id={`required-${f.id}`}
                          type="checkbox"
                          checked={f.required}
                          onChange={(e) => updateField(f.id, { required: e.target.checked })}
                          className="size-4 rounded border-input"
                        />
                        <Label htmlFor={`required-${f.id}`} className="text-sm font-normal cursor-pointer">
                          Required
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
                )
              })}
              </div>
              </div>
            </form>
            {/* Right — live preview (card handles its own internal scroll) */}
            <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Preview</p>
                <Badge variant="outline" className="font-normal text-muted-foreground">
                  live preview
                </Badge>
              </div>
              <FormPreview draft={draft} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Responses — full-screen results view: donut charts + table */}
      <Dialog open={!!responsesForm} onOpenChange={(o) => !o && setResponsesForm(null)}>
        <DialogContent className="flex h-[92vh] w-[95vw] max-w-[95vw] flex-col overflow-hidden sm:max-w-[95vw]">
          <DialogHeader className="flex-row items-center justify-between gap-4 pr-9">
            <div className="min-w-0">
              <DialogTitle className="text-lg">{responsesForm?.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {responses.length} response{responses.length === 1 ? '' : 's'} · latest first
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {responsesLoading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
            ) : responses.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <Inbox className="size-8 opacity-30" />
                <p className="text-sm">No responses yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Donut charts — one compact card per option field with data */}
                {sheetTallies.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold">Answers per question</h3>
                      <p className="text-xs text-muted-foreground">
                        {sheetTallies.length} question{sheetTallies.length === 1 ? '' : 's'} with options
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {sheetTallies.map((t) => {
                        const data = toDonutData(t)
                        return (
                          <div key={t.field.id} className="flex flex-col gap-3 rounded-lg border p-4">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="truncate text-sm font-medium">{t.field.label}</p>
                              <p className="shrink-0 text-xs text-muted-foreground">
                                {t.field.type === 'checkbox'
                                  ? `${t.total} ticks`
                                  : `${t.total} answer${t.total === 1 ? '' : 's'}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <ChartContainer config={{}} className="h-28 w-28 shrink-0">
                                <PieChart>
                                  <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                  />
                                  <Pie
                                    data={data}
                                    dataKey="count"
                                    nameKey="label"
                                    innerRadius={31}
                                    outerRadius={45}
                                    strokeWidth={3}
                                  >
                                    {data.map((d, i) => (
                                      <Cell key={`${i}-${d.label}`} fill={d.fill} />
                                    ))}
                                  </Pie>
                                </PieChart>
                              </ChartContainer>
                              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                {data.map((d, i) => (
                                  <div key={`${i}-${d.label}`} className="flex items-center gap-2 text-xs">
                                    <span
                                      className="size-2 shrink-0 rounded-full"
                                      style={{ backgroundColor: d.fill }}
                                    />
                                    <span className="truncate text-muted-foreground">{d.label}</span>
                                    <span className="ml-auto font-medium tabular-nums">{d.count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Table of all submissions — row per response, column per field */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold">All responses</h3>
                  </div>
                  {sheetColumnIds.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      This form has no answer fields to display.
                    </p>
                  ) : (
                    <div className="overflow-hidden rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-44">Submitted</TableHead>
                            {sheetColumnIds.map((id) => (
                              <TableHead key={id} className="max-w-64 truncate">
                                {sheetColumnLabel(id)}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {responses.map((sub, i) => (
                            <TableRow key={sub.id} className={i % 2 === 1 ? 'bg-muted/30' : undefined}>
                              <TableCell className="whitespace-nowrap text-muted-foreground">
                                {fmtDateTime(sub.created)}
                              </TableCell>
                              {sheetColumnIds.map((id) => (
                                <TableCell key={id} className="whitespace-normal break-words align-top">
                                  {fmtValue((sub.answers ?? {})[id])}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the form <strong>and all of its
              responses</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // Keep the dialog open on failure so the message is visible.
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

function fmtDateTime(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fmtValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

interface OptionCount {
  label: string
  count: number
}

interface FieldTally {
  field: FormField
  counts: OptionCount[]
  total: number
}

/**
 * Tally answers for one option field across submissions. Select/radio store a
 * single option string, checkbox an array of strings (counted per tick).
 * Unmatched values (form options changed after responses came in) land in an
 * "(other)" bucket so counts always add up.
 */
function computeFieldCounts(field: FormField, responses: FormSubmission[]): OptionCount[] {
  const options = field.options ?? []
  const counts = new Map<string, number>()
  let total = 0
  for (const sub of responses) {
    const raw = (sub.answers ?? {})[field.id]
    const values = Array.isArray(raw) ? raw : raw === undefined || raw === null ? [] : [raw]
    for (const v of values) {
      counts.set(String(v), (counts.get(String(v)) ?? 0) + 1)
      total += 1
    }
  }
  if (total === 0) return []

  const out: OptionCount[] = []
  let other = 0
  for (const opt of options) {
    const key = String(opt)
    const c = counts.get(key) ?? 0
    if (c > 0) out.push({ label: key, count: c })
    counts.delete(key)
  }
  for (const [, c] of counts) other += c
  if (other > 0) out.push({ label: '(other)', count: other })
  return out
}

/** Per-field tallies for all option fields of a form that have any data. */
function computeTallies(form: Form, responses: FormSubmission[]): FieldTally[] {
  return form.fields
    .filter((f) => f.type === 'select' || f.type === 'radio' || f.type === 'checkbox')
    .map((f) => {
      const counts = computeFieldCounts(f, responses)
      return {
        field: f,
        counts,
        total: counts.reduce((s, c) => s + c.count, 0),
      }
    })
    .filter((t) => t.counts.length > 0)
}

// ── Live preview — mirrors the public form site's FormRenderer ───────────────
type PreviewValue = string | number | string[]

// Textareas render on a white field (matches the real form site).
const previewTextareaClass =
  'flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none'

function FormPreview({ draft }: { draft: FormDraft }) {
  const [lang, setLang] = useState<'nl' | 'en'>('nl')
  const [answers, setAnswers] = useState<Record<string, PreviewValue>>({})

  const label = (f: FieldDraft) =>
    draft.multiLanguage && lang === 'en' && f.label_en ? f.label_en : f.label

  const inputClass =
    'flex h-10 w-full rounded-md border border-input bg-input/40 px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none'

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
      {/* Header — pinned so the title stays visible while fields scroll */}
      <div className="shrink-0 border-b border-border p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            F
          </div>
          {draft.multiLanguage && (
            <div className="flex items-center gap-0.5 rounded-full border border-border bg-background/60 p-1 text-xs font-medium">
              {(['nl', 'en'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={
                    lang === l
                      ? 'rounded-full bg-primary px-2 py-0.5 text-primary-foreground'
                      : 'rounded-full px-2 py-0.5 text-muted-foreground hover:text-foreground'
                  }
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">{draft.title || 'Untitled form'}</h2>
        {draft.description && (
          <div className="markdown-body mt-1.5 text-sm text-foreground/90">
            <ReactMarkdown>{draft.description}</ReactMarkdown>
          </div>
        )}
        {draft.active === false && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
            This form is closed — responses are not accepted.
          </p>
        )}
      </div>

      {/* Fields — the scrollable area */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="flex flex-col gap-6 p-6">
          {draft.fields.length === 0 && (
            <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              No fields yet — add your first field on the left.
            </p>
          )}
          {draft.fields.map((f) =>
            f.type === 'section' || f.type === 'image' ? (
              <PreviewDisplayField
                key={f.id}
                field={f}
                label={label(f)}
                content={draft.multiLanguage && lang === 'en' && f.content_en ? f.content_en : f.content}
                lang={lang}
              />
            ) : (
              <PreviewField
                key={f.id}
                field={f}
                label={label(f)}
                lang={lang}
                value={answers[f.id]}
                inputClass={inputClass}
                onChange={(v) => setAnswers((a) => ({ ...a, [f.id]: v }))}
              />
            ),
          )}
        </div>
      </div>

      {/* Submit — pinned so it's always reachable, like a real form footer */}
      {draft.fields.length > 0 && (
        <div className="shrink-0 border-t border-border p-4">
          <button
            type="button"
            tabIndex={-1}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm"
          >
            {lang === 'en' ? 'Submit' : 'Verzenden'}
          </button>
        </div>
      )}
    </div>
  )
}

function PreviewDisplayField({
  field,
  label,
  content,
  lang,
}: {
  field: FieldDraft
  label: string
  content?: string
  lang: 'nl' | 'en'
}) {
  if (field.type === 'image') {
    return (
      <div>
        {field.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={field.imageUrl}
            alt={label || 'Fenrir'}
            lang={lang}
            className="max-h-96 w-full rounded-xl border border-border object-contain"
          />
        )}
        {label && <p className="mt-2 text-sm text-foreground/75">{label}</p>}
      </div>
    )
  }

  // section — heading + markdown body
  return (
    <div className="flex flex-col gap-1.5">
      {label && <p className="text-sm font-semibold">{label}</p>}
      {content && (
        <div className="markdown-body text-sm text-foreground/90">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}

function PreviewField({
  field,
  label,
  lang,
  value,
  inputClass,
  onChange,
}: {
  field: FieldDraft
  label: string
  lang: 'nl' | 'en'
  value: PreviewValue | undefined
  inputClass: string
  onChange: (v: PreviewValue) => void
}) {
  const options = field.options ?? []
  const requiredMark = field.required ? <span className="text-destructive"> *</span> : null

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label}
        {requiredMark}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={previewTextareaClass}
        />
      ) : field.type === 'select' ? (
        <select
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            {field.placeholder ?? '—'}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : field.type === 'radio' ? (
        <div className="flex flex-col gap-2">
          {options.map((o) => (
            <label
              key={o}
              className="flex cursor-pointer items-center gap-2.5 rounded-md border border-border px-3 py-2 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/10"
            >
              <input
                type="radio"
                name={field.id}
                value={o}
                checked={value === o}
                onChange={() => onChange(o)}
                className="size-4 accent-primary"
              />
              {o}
            </label>
          ))}
        </div>
      ) : field.type === 'checkbox' ? (
        <div className="flex flex-col gap-2">
          {options.map((o) => {
            const checked = Array.isArray(value) && value.includes(o)
            return (
              <label
                key={o}
                className="flex cursor-pointer items-center gap-2.5 rounded-md border border-border px-3 py-2 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/10"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const current = Array.isArray(value) ? [...value] : []
                    onChange(
                      e.target.checked
                        ? [...current, o]
                        : current.filter((x) => x !== o),
                    )
                  }}
                  className="size-4 rounded accent-primary"
                />
                {o}
              </label>
            )
          })}
        </div>
      ) : (
        <input
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text'}
          value={typeof value === 'string' || typeof value === 'number' ? value : ''}
          onChange={(e) => {
            const raw = e.target.value
            onChange(field.type === 'number' ? (raw === '' ? '' : Number(raw)) : raw)
          }}
          placeholder={field.placeholder}
          step={field.type === 'number' ? 'any' : undefined}
          lang={lang}
          className={inputClass}
        />
      )}
    </div>
  )
}
