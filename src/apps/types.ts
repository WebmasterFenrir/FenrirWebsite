export interface Sponsor {
    name: string
    content: string[]
    image: string
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
    yearId : YearId[]
    preasidiumRols : PreasidiumRolInWhatYear[]
}

export interface PreasidiumYear {
    startDate : Date
    endDate : Date
    PreasidiumLeden : PreasidiumLid[]
}

interface PreasidiumRolInWhatYear {
    role : PreasidiumRol
    year : number
}

export interface PreasidiumRol {
    role : string
}