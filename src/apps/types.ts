export interface Sponsor {
    name: string
    content: string[]
    image: string
    url : string
}

export interface Activiteit {
    id: string
    fbEventId: string
    name: string
    startTime: string
    endTime?: string
    description?: string
    placeName?: string
    coverUrl?: string
    fbUrl?: string
    /** True when the event has already started — kept as history, hidden from "upcoming". */
    past?: boolean
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
