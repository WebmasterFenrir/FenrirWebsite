import type { PreasidiumYear, Sponsors } from "./types";

export const SponsorData : Sponsors[] = [
	{
		startYear : 2025,
		endYear : 2026, 
		list : [
			{name : "BDO", 
			content : ["BDO is een internationale organisatie in accountancy en advies. Met diensten zoals audit, belastingadvies en consultancy ondersteunen zij ondernemers bij duurzame groei.",
				"BDO investeert daarnaast sterk in jongeren via stages, traineeships en opleidingsprogramma’s, en biedt jong talent alle kansen om zich professioneel te ontwikkelen.",
				"Wij zijn trots dat BDO dit jaar onze jaarsponsor is!"
			], 
			image : "bdo.png",
            url : "https://www.bdo.be/nl-be/home"
			},
			{name : "AH Peeters Govers", 
			content : ["AH Peeters-Govers is een trotse Albert Heijn-franchisepartner met meerdere winkels in de regio. Dagelijks zetten zij zich in om klanten te voorzien van verse producten, kwaliteit en uitstekende service.", "Met hun betrokkenheid bij de lokale gemeenschap en steun aan verenigingen en initiatieven maken zij echt het verschil. Wij zijn dan ook erg dankbaar voor hun steun als jaarsponsor!"], 
			image : "ah.png",
            url : ""
			}
		]
	}
]

export const PreasidiumYearsData : PreasidiumYear[] = [
    {
        id : 1,
        startDate : "2025",
        endDate : "2026",
        PreasidiumLeden : [
            { 
                id : 1,
                firstName : "Tibo",
                lastName : "Van Daalen",
                birthdate : "12-11-2005",
                description : "Dit is Tibo.Dixit, Rafaella Jardim (Mentor)Tibo, ik ben trots op jou en ik weet dat je dit geweldig gaat doen!Tijdens zijn schachtenjaar was hij erélke keer bij, altijd met volle inzet enpassie voor onze club.",
                yearIds : [1],
                imageUrl : "",
                preasidiumRols : [            {
                    role : "vice-preases",
                    year : "2025 - 2026"
                },{
                    role : "vice-preases",
                    year : "2024 - 2025"
                }
]
            },
                        { 
                id : 2,
                firstName : "Elien",
                lastName : "Van looveren",
                birthdate : "12-11-2005",
                description : "Preases",
                yearIds : [1],
                imageUrl : "",
                preasidiumRols : [{
                    role : "preases",
                    year : "2025 - 2026"
                }]
            },
            { 
                id : 1,
                firstName : "Tibo",
                lastName : "Van Daalen",
                birthdate : "12-11-2005",
                description : "vice-Preases",
                yearIds : [1],
                imageUrl : "",
                preasidiumRols : [            {
                    role : "vice-preases",
                    year : "2025 - 2026"
                },{
                    role : "vice-preases",
                    year : "2024 - 2025"
                }
]
            },
                        { 
                id : 2,
                firstName : "Elien",
                lastName : "Van looveren",
                birthdate : "12-11-2005",
                description : "Preases",
                yearIds : [1],
                imageUrl : "",
                preasidiumRols : [{
                    role : "preases",
                    year : "2025 - 2026"
                }]
            },
            { 
                id : 1,
                firstName : "Tibo",
                lastName : "Van Daalen",
                birthdate : "12-11-2005",
                description : "vice-Preases",
                yearIds : [1],
                imageUrl : "",
                preasidiumRols : [            {
                    role : "vice-preases",
                    year : "2025 - 2026"
                },{
                    role : "vice-preases",
                    year : "2024 - 2025"
                }
]
            },
                    
        ],
        PreasidiumLedenIds : [1,2]
    }
]