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
