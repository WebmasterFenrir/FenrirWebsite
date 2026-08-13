import { useState } from 'react'
import PocketBase from 'pocketbase'
import ReactMarkdown from 'react-markdown'
import { CheckCircle2, Globe } from 'lucide-react'
import type { FenrirForm, FormField } from '../../../types'
import { ui, pickLocale, type Locale } from '@/i18n/ui'

// The browser submits straight to the public PocketBase instance — the create
// rule on form_submissions is open and the server-side hook is the real guard.
const PUBLIC_PB_URL = import.meta.env.PUBLIC_PB_URL ?? 'http://127.0.0.1:8090'
const pb = new PocketBase(PUBLIC_PB_URL)

type AnswerValue = string | number | string[]
type Answers = Record<string, AnswerValue>

interface FormRendererProps {
  form: FenrirForm
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const inputClass =
  'flex h-10 w-full rounded-md border border-input bg-input/40 px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
// Textareas render on a white field (readability on the dark page background).
const textareaClass =
  'flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
const errorClass = 'mt-1.5 text-xs text-destructive'

export function FormRenderer({ form }: FormRendererProps) {
  const [lang, setLang] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('lang')
      if (q === 'en' || q === 'nl') return q
      if ((navigator.language || '').toLowerCase().startsWith('en')) return 'en'
    }
    return pickLocale(null)
  })
  const t = ui[lang]

  const [answers, setAnswers] = useState<Answers>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  const label = (f: FormField) =>
    form.multiLanguage && lang === 'en' && f.label_en ? f.label_en : f.label

  // Display-only fields (section / image) render between questions and never
  // collect an answer, so they are excluded from validation.
  const isDisplayField = (f: FormField) => f.type === 'section' || f.type === 'image'
  const content = (f: FormField) =>
    form.multiLanguage && lang === 'en' && f.content_en ? f.content_en : f.content

  const setValue = (id: string, value: AnswerValue) => {
    setAnswers((a) => ({ ...a, [id]: value }))
    setErrors((e) => {
      const next = { ...e }
      delete next[id]
      return next
    })
  }

  const isEmpty = (v: AnswerValue | undefined) =>
    v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {}
    for (const f of form.fields) {
      if (isDisplayField(f)) continue // no answer expected
      const v = answers[f.id]
      if (f.required && isEmpty(v)) {
        errs[f.id] = t.errorRequired
        continue
      }
      if (isEmpty(v)) continue
      if (f.type === 'email' && (typeof v !== 'string' || !EMAIL_RE.test(v))) {
        errs[f.id] = t.errorEmail
      } else if (f.type === 'number' && Number.isNaN(Number(v))) {
        errs[f.id] = t.errorNumber
      } else if (
        (f.type === 'select' || f.type === 'radio') &&
        (typeof v !== 'string' || !(f.options ?? []).includes(v))
      ) {
        errs[f.id] = t.errorOption
      } else if (
        f.type === 'checkbox' &&
        !(Array.isArray(v) && v.every((x) => (f.options ?? []).includes(x)))
      ) {
        errs[f.id] = t.errorOption
      } else if (f.type === 'date' && (typeof v !== 'string' || !DATE_RE.test(v))) {
        errs[f.id] = t.errorDate
      }
    }
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      await pb.collection('form_submissions').create({ form: form.id, answers })
      setSuccess(true)
    } catch (err) {
      // Prefer the server's message (e.g. "This form is closed…", rate limit).
      const data = (err as { data?: { message?: string } } | null)?.data?.message
      setSubmitError(data || t.submitFailed)
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setAnswers({})
    setErrors({})
    setSubmitError('')
    setSuccess(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card p-10 text-center shadow-lg">
        <CheckCircle2 className="size-12 text-primary" />
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t.successTitle}</h1>
          <p className="mt-2 text-sm text-foreground/90">{t.successText}</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background/60 px-4 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          {t.successAgain}
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between gap-4">
          <img src="/schild.png" alt="Fenrir" className="size-10 shrink-0 object-contain" />
          {form.multiLanguage && (
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2 py-1">
              <Globe className="size-3.5 text-muted-foreground" />
              <div className="flex gap-0.5 text-xs font-medium">
                {(['nl', 'en'] as Locale[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={
                      lang === l
                        ? 'rounded-full bg-primary px-2 py-0.5 text-primary-foreground'
                        : 'rounded-full px-2 py-0.5 text-muted-foreground hover:text-foreground'
                    }
                    aria-pressed={lang === l}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          {form.multiLanguage && lang === 'en' && form.title_en ? form.title_en : form.title}
        </h1>
        {(form.description || (form.multiLanguage && lang === 'en' && form.description_en)) && (
          <div className="markdown-body mt-1.5 text-sm text-foreground/90">
            <ReactMarkdown>
              {form.multiLanguage && lang === 'en' && form.description_en
                ? form.description_en
                : form.description}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Fields */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 p-6">
        {form.fields.map((f) => (
          <div key={f.id}>
            {f.type === 'section' || f.type === 'image' ? (
              <DisplayField
                field={f}
                label={label(f)}
                content={content(f)}
                lang={lang}
              />
            ) : (
              <Field
                field={f}
                label={label(f)}
                lang={lang}
                value={answers[f.id]}
                error={errors[f.id]}
                onChange={(v) => setValue(f.id, v)}
                inputClass={inputClass}
                errorClass={errorClass}
              />
            )}
          </div>
        ))}

        {submitError && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]"
        >
          {submitting ? t.submitting : t.submit}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          <a href="https://fenrirclub.be" className="underline-offset-2 hover:underline">
            fenrirclub.be
          </a>
        </p>
      </form>
    </div>
  )
}

function DisplayField({
  field,
  label,
  content,
  lang,
}: {
  field: FormField
  label: string
  content?: string
  lang: Locale
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

function Field({
  field,
  label,
  lang,
  value,
  error,
  onChange,
  inputClass,
  errorClass,
}: {
  field: FormField
  label: string
  lang: Locale
  value: AnswerValue | undefined
  error?: string
  onChange: (v: AnswerValue) => void
  inputClass: string
  errorClass: string
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
          className={textareaClass}
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
                  value={o}
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

      {error && <p className={errorClass}>{error}</p>}
    </div>
  )
}
