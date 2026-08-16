export interface Sponsor {
    name: string
    content: string[]
    image: string
    url : string
}

export interface Activiteit {
    id: string
    /** Facebook event id — only synced events have one; manual events don't. */
    fbEventId?: string
    name: string
    startTime: string
    endTime?: string
    description?: string
    placeName?: string
    coverUrl?: string
    fbUrl?: string
    /** True when the event has already started — kept as history, hidden from "upcoming". */
    past?: boolean
    /** False hides the event from the public site without deleting it. */
    active?: boolean
    /** Resolved category name (locale-aware). */
    category?: string
    /** Resolved public file URL for a manually uploaded cover image. */
    image?: string
}

export interface EventCategory {
    id: string
    name: string
    description?: string
    /** Lucide icon name (e.g. "PartyPopper") shown on the activity cards. */
    icon?: string
    sortOrder: number
}

export interface Sponsors {
    list : Sponsor[]
    startYear : number
    endYear : number
}

type YearId = number;
type PersonId = number;

export interface PreasidiumLid {
    id : PersonId
    firstName : string
    lastName : string
    birthdate : string
    description : string
    imageUrl : string;
    yearIds : YearId[]
    preasidiumRols : PreasidiumRolInWhatYear[]
}

export interface PreasidiumYear {
    id : number
    startDate : string
    endDate : string
    PreasidiumLeden : PreasidiumLid[]
    PreasidiumLedenIds : number[]
}

interface PreasidiumRolInWhatYear {
    role : PreasidiumRol
    year : StartandEndYear
}

type StartandEndYear = `${number} - ${number}`;

type PreasidiumRol = string

// ─── Forms (form.fenrirclub.be + dashboard form builder) ─────────────────────

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  // Display-only fields — render content between questions, collect no answer.
  | 'section'
  | 'image'

export interface FormField {
  /** Stable id generated when the field is added (e.g. "fld_ab12"). */
  id: string
  /** Dutch label — the source of truth. */
  label: string
  /** English label — only used when the form has multiLanguage = true. */
  label_en?: string
  type: FormFieldType
  /** Only meaningful for answer fields (text…date); false for display fields. */
  required: boolean
  /** select / radio / checkbox only. */
  options?: string[]
  /** Optional placeholder for text-ish inputs. */
  placeholder?: string
  /** section only: markdown body (Dutch). */
  content?: string
  /** section only: markdown body in English (multiLanguage forms). */
  content_en?: string
  /** image only: URL of the image shown between questions. */
  imageUrl?: string
}

export interface FenrirForm {
  id: string
  /** Random URL-safe code the public form lives at: form.fenrirclub.be/{code}. */
  code: string
  title: string
  /** English title — only used when the form has multiLanguage = true. */
  title_en?: string
  description?: string
  /** English description — only used when the form has multiLanguage = true. */
  description_en?: string
  /** When true the form site shows a NL/EN toggle and uses label_en. */
  multiLanguage: boolean
  /** Closed forms reject new submissions (still viewable as "closed"). */
  active: boolean
  /** The form's field schema. */
  fields: FormField[]
}
