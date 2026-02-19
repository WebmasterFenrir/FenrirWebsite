export interface Sponsor {
    name: string
    content: string[]
    image: string
    url : string
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
