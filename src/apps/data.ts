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
    // Antwerpen 2025-2026
    {
        id: 2025,
        startDate: "2025",
        endDate: "2026",
        PreasidiumLeden: [
            { id: 202501, firstName: "Elien", lastName: "Van Looveren", birthdate: "", description: "", imageUrl: "elien2025.jpg", yearIds: [2025], preasidiumRols: [ { role: "Praeses", year: "2025 - 2026" } ] },
            { id: 202502, firstName: "Tibo", lastName: "Van Daele", birthdate: "", description: "", imageUrl: "tibo2025.jpg", yearIds: [2025], preasidiumRols: [ { role: "Vice-Praeses", year: "2025 - 2026" }, { role: "Media", year: "2025 - 2026" } ] },
            { id: 202503, firstName: "Anne", lastName: "Peeters", birthdate: "", description: "", imageUrl: "anne2025.jpg", yearIds: [2025], preasidiumRols: [ { role: "Quaestor", year: "2025 - 2026" }, { role: "PR", year: "2025 - 2026" } ] },
            { id: 202504, firstName: "Nils", lastName: "Mertens", birthdate: "", description: "", imageUrl: "nils2025.jpg", yearIds: [2025], preasidiumRols: [ { role: "S.O.C.", year: "2025 - 2026" }, { role: "Ab-Actis", year: "2025 - 2026" } ] },
            { id: 202505, firstName: "Linda", lastName: "Bruyneels", birthdate: "", description: "", imageUrl: "linda2025.jpg", yearIds: [2025], preasidiumRols: [ { role: "S.O.C.", year: "2025 - 2026" }, { role: "Schachtentemmer", year: "2025 - 2026" } ] },
            { id: 202506, firstName: "Andries", lastName: "Lamberts", birthdate: "", description: "", imageUrl: "", yearIds: [2025], preasidiumRols: [ { role: "Keizer", year: "2025 - 2026" }, { role: "Cantor", year: "2025 - 2026" } ] },
            { id: 202507, firstName: "Django", lastName: "Van Gool", birthdate: "", description: "", imageUrl: "django2025.jpg", yearIds: [2025], preasidiumRols: [ { role: "Feest", year: "2025 - 2026" }, { role: "Schachtentemmer", year: "2025 - 2026" } ] },
            { id: 202508, firstName: "Rafaella", lastName: "Jardim", birthdate: "", description: "", imageUrl: "rafaella2025.jpg", yearIds: [2025], preasidiumRols: [ { role: "Mentor", year: "2025 - 2026" } ] },
            { id: 202509, firstName: "Vincent", lastName: "Orban", birthdate: "", description: "AKA Panini", imageUrl: "vincent2025.png", yearIds: [2025], preasidiumRols: [ { role: "Peter", year: "2025 - 2026" } ] }
        ],
        PreasidiumLedenIds: [202501,202502,202503,202504,202505,202506,202507,202508,202509]
    },
    // Antwerpen 2024-2025
    {
        id: 2024,
        startDate: "2024",
        endDate: "2025",
        PreasidiumLeden: [
            { id: 202401, firstName: "Rafaella", lastName: "Jardim", birthdate: "", description: "", imageUrl: "", yearIds: [2024], preasidiumRols: [ { role: "Praeses", year: "2024 - 2025" } ] },
            { id: 202402, firstName: "Tibo", lastName: "Van Daele", birthdate: "", description: "", imageUrl: "", yearIds: [2024], preasidiumRols: [ { role: "Vice-Praeses", year: "2024 - 2025" }, { role: "Schachtentemmer", year: "2024 - 2025" } ] },
            { id: 202403, firstName: "Vincent", lastName: "Orban", birthdate: "", description: "", imageUrl: "", yearIds: [2024], preasidiumRols: [ { role: "Quaestor", year: "2024 - 2025" } ] },
            { id: 202404, firstName: "Tobias", lastName: "Depoorter", birthdate: "", description: "", imageUrl: "", yearIds: [2024], preasidiumRols: [ { role: "Ab-Actis", year: "2024 - 2025" }, { role: "S.O.C.", year: "2024 - 2025" } ] },
            { id: 202405, firstName: "Andries", lastName: "Lamberts", birthdate: "", description: "", imageUrl: "", yearIds: [2024], preasidiumRols: [ { role: "Cantor", year: "2024 - 2025" } ] },
            { id: 202406, firstName: "Timon", lastName: "Van Puyenbroeck", birthdate: "", description: "", imageUrl: "", yearIds: [2024], preasidiumRols: [ { role: "Feest", year: "2024 - 2025" }, { role: "Media", year: "2024 - 2025" } ] },
            { id: 202407, firstName: "Julie", lastName: "Swinnen", birthdate: "", description: "", imageUrl: "", yearIds: [2024], preasidiumRols: [ { role: "Feest", year: "2024 - 2025" }, { role: "Schachtentemmer", year: "2024 - 2025" } ] },
            { id: 202408, firstName: "Hannelore", lastName: "Beugnies", birthdate: "", description: "", imageUrl: "", yearIds: [2024], preasidiumRols: [ { role: "Meter", year: "2024 - 2025" } ] },
            { id: 202409, firstName: "Sam", lastName: "Keustermans", birthdate: "", description: "", imageUrl: "", yearIds: [2024], preasidiumRols: [ { role: "Mentor", year: "2024 - 2025" } ] }
        ],
        PreasidiumLedenIds: [202401,202402,202403,202404,202405,202406,202407,202408,202409]
    },

    // Antwerpen 2022-2023
    {
        id: 2022,
        startDate: "2022",
        endDate: "2023",
        PreasidiumLeden: [
            { id: 202201, firstName: "Sam", lastName: "Keustermans", birthdate: "", description: "", imageUrl: "", yearIds: [2022], preasidiumRols: [ { role: "Praeses", year: "2022 - 2023" }, { role: "PR", year: "2022 - 2023" } ] },
            { id: 202202, firstName: "Thibaut", lastName: "Degenaers", birthdate: "", description: "", imageUrl: "", yearIds: [2022], preasidiumRols: [ { role: "Quaestor", year: "2022 - 2023" } ] },
            { id: 202203, firstName: "Nina", lastName: "Verreth", birthdate: "", description: "", imageUrl: "", yearIds: [2022], preasidiumRols: [ { role: "Ab-Actis", year: "2022 - 2023" }, { role: "Schachtenmeester", year: "2022 - 2023" } ] },
            { id: 202204, firstName: "Toon", lastName: "Van Dijck", birthdate: "", description: "", imageUrl: "", yearIds: [2022], preasidiumRols: [ { role: "Cantor", year: "2022 - 2023" } ] },
            { id: 202205, firstName: "Andries", lastName: "Lamberts", birthdate: "", description: "", imageUrl: "", yearIds: [2022], preasidiumRols: [ { role: "Feest", year: "2022 - 2023" } ] },
            { id: 202206, firstName: "Vincent", lastName: "Orban", birthdate: "", description: "AKA Panini", imageUrl: "", yearIds: [2022], preasidiumRols: [ { role: "Feest", year: "2022 - 2023" } ] },
            { id: 202207, firstName: "Hannelore", lastName: "Beugnies", birthdate: "", description: "", imageUrl: "", yearIds: [2022], preasidiumRols: [ { role: "Media", year: "2022 - 2023" } ] },
            { id: 202208, firstName: "Iris", lastName: "Meeus", birthdate: "", description: "", imageUrl: "", yearIds: [2022], preasidiumRols: [ { role: "Schachtentemmer", year: "2022 - 2023" } ] },
            { id: 202209, firstName: "Amelia", lastName: "Van Herck", birthdate: "", description: "", imageUrl: "", yearIds: [2022], preasidiumRols: [ { role: "Cultuur & Ontspanning", year: "2022 - 2023" } ] },
            { id: 202210, firstName: "Rafaella", lastName: "Jardim", birthdate: "", description: "", imageUrl: "", yearIds: [2022], preasidiumRols: [ { role: "Cultuur & Ontspanning", year: "2022 - 2023" } ] },
            { id: 202211, firstName: "Lisa", lastName: "Knoops", birthdate: "", description: "", imageUrl: "", yearIds: [2022], preasidiumRols: [ { role: "Mentor", year: "2022 - 2023" } ] },
            { id: 202212, firstName: "Tom", lastName: "De Bièvre", birthdate: "", description: "", imageUrl: "", yearIds: [2022], preasidiumRols: [ { role: "Mentor", year: "2022 - 2023" } ] },
            { id: 202213, firstName: "Cedric", lastName: "De Backer", birthdate: "", description: "", imageUrl: "", yearIds: [2022], preasidiumRols: [ { role: "Mentor", year: "2022 - 2023" } ] }
        ],
        PreasidiumLedenIds: [202201,202202,202203,202204,202205,202206,202207,202208,202209,202210,202211,202212,202213]
    },

    // Antwerpen 2021-2022
    {
        id: 2021,
        startDate: "2021",
        endDate: "2022",
        PreasidiumLeden: [
            { id: 202101, firstName: "Lisa", lastName: "Knoops", birthdate: "", description: "", imageUrl: "", yearIds: [2021], preasidiumRols: [ { role: "Praeses", year: "2021 - 2022" } ] },
            { id: 202102, firstName: "Bram", lastName: "Vos", birthdate: "", description: "", imageUrl: "", yearIds: [2021], preasidiumRols: [ { role: "Vice-Praeses", year: "2021 - 2022" }, { role: "Quaestor", year: "2021 - 2022" } ] },
            { id: 202103, firstName: "Marije", lastName: "Hoeve", birthdate: "", description: "", imageUrl: "", yearIds: [2021], preasidiumRols: [ { role: "Ab-Actis", year: "2021 - 2022" } ] },
            { id: 202104, firstName: "Wouter", lastName: "Oyen", birthdate: "", description: "", imageUrl: "", yearIds: [2021], preasidiumRols: [ { role: "PR", year: "2021 - 2022" } ] },
            { id: 202105, firstName: "Toon", lastName: "Van Dijck", birthdate: "", description: "", imageUrl: "", yearIds: [2021], preasidiumRols: [ { role: "Cantor", year: "2021 - 2022" } ] },
            { id: 202106, firstName: "Chelsea", lastName: "Borgers", birthdate: "", description: "", imageUrl: "", yearIds: [2021], preasidiumRols: [ { role: "Feest", year: "2021 - 2022" } ] },
            { id: 202107, firstName: "Shani", lastName: "Cremers", birthdate: "", description: "", imageUrl: "", yearIds: [2021], preasidiumRols: [ { role: "Feest", year: "2021 - 2022" }, { role: "Media", year: "2021 - 2022" } ] },
            { id: 202108, firstName: "Olivier", lastName: "Huybrighs", birthdate: "", description: "", imageUrl: "", yearIds: [2021], preasidiumRols: [ { role: "Sport", year: "2021 - 2022" } ] },
            { id: 202109, firstName: "Kato", lastName: "Dermaut", birthdate: "", description: "", imageUrl: "", yearIds: [2021], preasidiumRols: [ { role: "Media", year: "2021 - 2022" } ] },
            { id: 202110, firstName: "Cedric", lastName: "De Backer", birthdate: "", description: "", imageUrl: "", yearIds: [2021], preasidiumRols: [ { role: "Schachtenmeester", year: "2021 - 2022" } ] },
            { id: 202111, firstName: "Nina", lastName: "Verreth", birthdate: "", description: "", imageUrl: "", yearIds: [2021], preasidiumRols: [ { role: "Schachtentemmer", year: "2021 - 2022" } ] },
            { id: 202112, firstName: "Claudia", lastName: "Walschots", birthdate: "", description: "", imageUrl: "", yearIds: [2021], preasidiumRols: [ { role: "Cultuur & Ontspanning", year: "2021 - 2022" } ] },
            { id: 202113, firstName: "Caro", lastName: "De Paepe", birthdate: "", description: "", imageUrl: "", yearIds: [2021], preasidiumRols: [ { role: "Mentor", year: "2021 - 2022" } ] },
            { id: 202114, firstName: "Laura", lastName: "Van Herck", birthdate: "", description: "", imageUrl: "", yearIds: [2021], preasidiumRols: [ { role: "Meter", year: "2021 - 2022" } ] }
        ],
        PreasidiumLedenIds: [202101,202102,202103,202104,202105,202106,202107,202108,202109,202110,202111,202112,202113,202114]
    },

    // Antwerpen 2020-2021
    {
        id: 2020,
        startDate: "2020",
        endDate: "2021",
        PreasidiumLeden: [
            { id: 202001, firstName: "Caro", lastName: "De Paepe", birthdate: "", description: "", imageUrl: "", yearIds: [2020], preasidiumRols: [ { role: "Praeses", year: "2020 - 2021" } ] },
            { id: 202002, firstName: "Lisa", lastName: "Knoops", birthdate: "", description: "", imageUrl: "", yearIds: [2020], preasidiumRols: [ { role: "Vice-Praeses", year: "2020 - 2021" } ] },
            { id: 202003, firstName: "Bram", lastName: "Vos", birthdate: "", description: "", imageUrl: "", yearIds: [2020], preasidiumRols: [ { role: "Quaestor", year: "2020 - 2021" } ] },
            { id: 202004, firstName: "Claudia", lastName: "Walschots", birthdate: "", description: "", imageUrl: "", yearIds: [2020], preasidiumRols: [ { role: "Ab-Actis", year: "2020 - 2021" }, { role: "Media", year: "2020 - 2021" } ] },
            { id: 202005, firstName: "Laura", lastName: "Van Herck", birthdate: "", description: "", imageUrl: "", yearIds: [2020], preasidiumRols: [ { role: "PR", year: "2020 - 2021" } ] },
            { id: 202006, firstName: "Toon", lastName: "Van Dijck", birthdate: "", description: "", imageUrl: "", yearIds: [2020], preasidiumRols: [ { role: "Cantor", year: "2020 - 2021" } ] },
            { id: 202007, firstName: "Marie-Lien", lastName: "Menten", birthdate: "", description: "", imageUrl: "", yearIds: [2020], preasidiumRols: [ { role: "Feest", year: "2020 - 2021" } ] },
            { id: 202008, firstName: "Shani", lastName: "Cremers", birthdate: "", description: "", imageUrl: "", yearIds: [2020], preasidiumRols: [ { role: "Feest", year: "2020 - 2021" } ] },
            { id: 202009, firstName: "Lukas", lastName: "Dugardyn", birthdate: "", description: "", imageUrl: "", yearIds: [2020], preasidiumRols: [ { role: "Sport", year: "2020 - 2021" } ] },
            { id: 202010, firstName: "Cedric", lastName: "De Backer", birthdate: "", description: "", imageUrl: "", yearIds: [2020], preasidiumRols: [ { role: "Schachtenmeester", year: "2020 - 2021" } ] },
            { id: 202011, firstName: "Lukas", lastName: "Dugardyn", birthdate: "", description: "", imageUrl: "", yearIds: [2020], preasidiumRols: [ { role: "Schachtentemmer", year: "2020 - 2021" } ] },
            { id: 202012, firstName: "Nathalie", lastName: "Hölzken", birthdate: "", description: "", imageUrl: "", yearIds: [2020], preasidiumRols: [ { role: "Cultuur & Ontspanning", year: "2020 - 2021" } ] },
            { id: 202013, firstName: "Lieze", lastName: "Verfaillie", birthdate: "", description: "", imageUrl: "", yearIds: [2020], preasidiumRols: [ { role: "Mentor", year: "2020 - 2021" } ] },
            { id: 202014, firstName: "Wouter", lastName: "Oyen", birthdate: "", description: "", imageUrl: "", yearIds: [2020], preasidiumRols: [ { role: "Peter", year: "2020 - 2021" } ] }
        ],
        PreasidiumLedenIds: [202001,202002,202003,202004,202005,202006,202007,202008,202009,202010,202011,202012,202013,202014]
    },

    // Antwerpen 2019-2020
    {
        id: 2019,
        startDate: "2019",
        endDate: "2020",
        PreasidiumLeden: [
            { id: 201901, firstName: "Lieze", lastName: "Verfaillie", birthdate: "", description: "", imageUrl: "", yearIds: [2019], preasidiumRols: [ { role: "Praeses", year: "2019 - 2020" } ] },
            { id: 201902, firstName: "Gerben", lastName: "Martens", birthdate: "", description: "", imageUrl: "", yearIds: [2019], preasidiumRols: [ { role: "Vice-Praeses", year: "2019 - 2020" } ] },
            { id: 201903, firstName: "Styn", lastName: "Vercauteren", birthdate: "", description: "", imageUrl: "", yearIds: [2019], preasidiumRols: [ { role: "Quaestor", year: "2019 - 2020" } ] },
            { id: 201904, firstName: "Claudia", lastName: "Walschots", birthdate: "", description: "", imageUrl: "", yearIds: [2019], preasidiumRols: [ { role: "Ab-Actis", year: "2019 - 2020" } ] },
            { id: 201905, firstName: "Wouter", lastName: "Oyen", birthdate: "", description: "", imageUrl: "", yearIds: [2019], preasidiumRols: [ { role: "PR", year: "2019 - 2020" } ] },
            { id: 201906, firstName: "Fen", lastName: "Somers", birthdate: "", description: "", imageUrl: "", yearIds: [2019], preasidiumRols: [ { role: "Cantor", year: "2019 - 2020" } ] },
            { id: 201907, firstName: "Caro", lastName: "de Paepe", birthdate: "", description: "", imageUrl: "", yearIds: [2019], preasidiumRols: [ { role: "Feest", year: "2019 - 2020" } ] },
            { id: 201908, firstName: "Anne", lastName: "Smolders", birthdate: "", description: "", imageUrl: "", yearIds: [2019], preasidiumRols: [ { role: "Feest", year: "2019 - 2020" } ] },
            { id: 201909, firstName: "Cedric", lastName: "De Backer", birthdate: "", description: "", imageUrl: "", yearIds: [2019], preasidiumRols: [ { role: "Sport", year: "2019 - 2020" } ] },
            { id: 201910, firstName: "Bram", lastName: "Vos", birthdate: "", description: "", imageUrl: "", yearIds: [2019], preasidiumRols: [ { role: "Web", year: "2019 - 2020" } ] },
            { id: 201911, firstName: "Nathalie", lastName: "Hölzken", birthdate: "", description: "", imageUrl: "", yearIds: [2019], preasidiumRols: [ { role: "Media", year: "2019 - 2020" } ] },
            { id: 201912, firstName: "Ashley", lastName: "Heylen", birthdate: "", description: "", imageUrl: "", yearIds: [2019], preasidiumRols: [ { role: "Schachtenmeester", year: "2019 - 2020" } ] },
            { id: 201913, firstName: "Benedicte", lastName: "Houben", birthdate: "", description: "gestopt december 2019", imageUrl: "", yearIds: [2019], preasidiumRols: [ { role: "Schachtentemmer", year: "2019 - 2020" } ] },
            { id: 201914, firstName: "Laura", lastName: "Van Herck", birthdate: "", description: "", imageUrl: "", yearIds: [2019], preasidiumRols: [ { role: "Cultuur & Ontspanning", year: "2019 - 2020" } ] },
            { id: 201915, firstName: "Lieze", lastName: "Verfaillie", birthdate: "", description: "", imageUrl: "", yearIds: [2019], preasidiumRols: [ { role: "Mentor", year: "2019 - 2020" } ] },
            { id: 201916, firstName: "Vincent", lastName: "Orban", birthdate: "", description: "", imageUrl: "", yearIds: [2019], preasidiumRols: [ { role: "Peter", year: "2019 - 2020" } ] }
        ],
        PreasidiumLedenIds: [201901,201902,201903,201904,201905,201906,201907,201908,201909,201910,201911,201912,201913,201914,201915,201916]
    },

    // Antwerpen 2018-2019
    {
        id: 2018,
        startDate: "2018",
        endDate: "2019",
        PreasidiumLeden: [
            { id: 201801, firstName: "Dante", lastName: "Meeus", birthdate: "", description: "", imageUrl: "", yearIds: [2018], preasidiumRols: [ { role: "Praeses", year: "2018 - 2019" } ] },
            { id: 201802, firstName: "Benedicte", lastName: "Houben", birthdate: "", description: "", imageUrl: "", yearIds: [2018], preasidiumRols: [ { role: "Vice-Praeses", year: "2018 - 2019" } ] },
            { id: 201803, firstName: "Vincent", lastName: "Orban", birthdate: "", description: "", imageUrl: "", yearIds: [2018], preasidiumRols: [ { role: "Quaestor", year: "2018 - 2019" } ] },
            { id: 201804, firstName: "Bram", lastName: "Vos", birthdate: "", description: "", imageUrl: "", yearIds: [2018], preasidiumRols: [ { role: "Ab-Actis", year: "2018 - 2019" } ] },
            { id: 201805, firstName: "Wouter", lastName: "Oyen", birthdate: "", description: "", imageUrl: "", yearIds: [2018], preasidiumRols: [ { role: "PR", year: "2018 - 2019" } ] },
            { id: 201806, firstName: "Fen", lastName: "Somers", birthdate: "", description: "", imageUrl: "", yearIds: [2018], preasidiumRols: [ { role: "Cantor", year: "2018 - 2019" } ] },
            { id: 201807, firstName: "Laura", lastName: "Van Herck", birthdate: "", description: "", imageUrl: "", yearIds: [2018], preasidiumRols: [ { role: "Feest", year: "2018 - 2019" } ] },
            { id: 201808, firstName: "Ivana", lastName: "Bradvica", birthdate: "", description: "", imageUrl: "", yearIds: [2018], preasidiumRols: [ { role: "Feest", year: "2018 - 2019" } ] },
            { id: 201809, firstName: "Gerben", lastName: "Martens", birthdate: "", description: "", imageUrl: "", yearIds: [2018], preasidiumRols: [ { role: "Sport", year: "2018 - 2019" } ] },
            { id: 201810, firstName: "Anne", lastName: "Smolders", birthdate: "", description: "", imageUrl: "", yearIds: [2018], preasidiumRols: [ { role: "Media", year: "2018 - 2019" } ] },
            { id: 201811, firstName: "Ashley", lastName: "Heylen", birthdate: "", description: "", imageUrl: "", yearIds: [2018], preasidiumRols: [ { role: "Schachtenmeester", year: "2018 - 2019" } ] },
            { id: 201812, firstName: "Benjamin", lastName: "Van Tongelen", birthdate: "", description: "", imageUrl: "", yearIds: [2018], preasidiumRols: [ { role: "Schachtentemmer", year: "2018 - 2019" } ] },
            { id: 201813, firstName: "Selina", lastName: "Mathyssen", birthdate: "", description: "", imageUrl: "", yearIds: [2018], preasidiumRols: [ { role: "Cultuur & Ontspanning", year: "2018 - 2019" } ] },
            { id: 201814, firstName: "Lieze", lastName: "Verfaillie", birthdate: "", description: "", imageUrl: "", yearIds: [2018], preasidiumRols: [ { role: "Mentor", year: "2018 - 2019" } ] },
            { id: 201815, firstName: "Nick", lastName: "Peeters", birthdate: "", description: "", imageUrl: "", yearIds: [2018], preasidiumRols: [ { role: "Dux Festi", year: "2018 - 2019" } ] },
            { id: 201816, firstName: "Tim", lastName: "Matthijs", birthdate: "", description: "", imageUrl: "", yearIds: [2018], preasidiumRols: [ { role: "Dux Festi", year: "2018 - 2019" } ] }
        ],
        PreasidiumLedenIds: [201801,201802,201803,201804,201805,201806,201807,201808,201809,201810,201811,201812,201813,201814,201815,201816]
    },

    // Antwerpen 2017-2018
    {
        id: 2017,
        startDate: "2017",
        endDate: "2018",
        PreasidiumLeden: [
            { id: 201701, firstName: "Lieze", lastName: "Verfaillie", birthdate: "", description: "", imageUrl: "", yearIds: [2017], preasidiumRols: [ { role: "Praeses", year: "2017 - 2018" } ] },
            { id: 201702, firstName: "Dante", lastName: "Meeus", birthdate: "", description: "", imageUrl: "", yearIds: [2017], preasidiumRols: [ { role: "Vice-Praeses", year: "2017 - 2018" } ] },
            { id: 201703, firstName: "Fen", lastName: "Somers", birthdate: "", description: "", imageUrl: "", yearIds: [2017], preasidiumRols: [ { role: "Quaestor", year: "2017 - 2018" } ] },
            { id: 201704, firstName: "Stefaan", lastName: "Van den Heuvel", birthdate: "", description: "", imageUrl: "", yearIds: [2017], preasidiumRols: [ { role: "Ab-Actis", year: "2017 - 2018" } ] },
            { id: 201705, firstName: "Anne", lastName: "Smolders", birthdate: "", description: "", imageUrl: "", yearIds: [2017], preasidiumRols: [ { role: "PR", year: "2017 - 2018" } ] },
            { id: 201706, firstName: "Tim", lastName: "Matthijs", birthdate: "", description: "", imageUrl: "", yearIds: [2017], preasidiumRols: [ { role: "PR", year: "2017 - 2018" } ] },
            { id: 201707, firstName: "Gilles", lastName: "Obourdin", birthdate: "", description: "", imageUrl: "", yearIds: [2017], preasidiumRols: [ { role: "Cantor", year: "2017 - 2018" } ] },
            { id: 201708, firstName: "Benedicte", lastName: "Houben", birthdate: "", description: "gestopt november 2017", imageUrl: "", yearIds: [2017], preasidiumRols: [ { role: "Feest", year: "2017 - 2018" } ] },
            { id: 201709, firstName: "Noah", lastName: "Vermeerbergen", birthdate: "", description: "gestopt november 2017", imageUrl: "", yearIds: [2017], preasidiumRols: [ { role: "Feest", year: "2017 - 2018" } ] },
            { id: 201710, firstName: "Brecht", lastName: "Pallemans", birthdate: "", description: "", imageUrl: "", yearIds: [2017], preasidiumRols: [ { role: "Sport", year: "2017 - 2018" } ] },
            { id: 201711, firstName: "Ashley", lastName: "Heylen", birthdate: "", description: "", imageUrl: "", yearIds: [2017], preasidiumRols: [ { role: "Media", year: "2017 - 2018" } ] },
            { id: 201712, firstName: "Malika", lastName: "Kuchkarova", birthdate: "", description: "", imageUrl: "", yearIds: [2017], preasidiumRols: [ { role: "Schachtenmeester", year: "2017 - 2018" } ] },
            { id: 201713, firstName: "Andreas", lastName: "de Rop", birthdate: "", description: "gestopt november 2017", imageUrl: "", yearIds: [2017], preasidiumRols: [ { role: "Schachtentemmer", year: "2017 - 2018" } ] },
            { id: 201714, firstName: "Vincent", lastName: "Vanhove", birthdate: "", description: "", imageUrl: "", yearIds: [2017], preasidiumRols: [ { role: "Peter", year: "2017 - 2018" } ] },
            { id: 201715, firstName: "Nick", lastName: "Peeters", birthdate: "", description: "Mentor/moeder", imageUrl: "", yearIds: [2017], preasidiumRols: [ { role: "Mentor/moeder", year: "2017 - 2018" } ] }
        ],
        PreasidiumLedenIds: [201701,201702,201703,201704,201705,201706,201707,201708,201709,201710,201711,201712,201713,201714,201715]
    },

    // Antwerpen 2016-2017
    {
        id: 2016,
        startDate: "2016",
        endDate: "2017",
        PreasidiumLeden: [
            { id: 201601, firstName: "Nick", lastName: "Peeters", birthdate: "", description: "", imageUrl: "", yearIds: [2016], preasidiumRols: [ { role: "Praeses", year: "2016 - 2017" } ] },
            { id: 201602, firstName: "Gilles", lastName: "Obourdin", birthdate: "", description: "", imageUrl: "", yearIds: [2016], preasidiumRols: [ { role: "Vice-Praeses", year: "2016 - 2017" }, { role: "Cantor", year: "2016 - 2017" } ] },
            { id: 201603, firstName: "Andreas", lastName: "De Rop", birthdate: "", description: "", imageUrl: "", yearIds: [2016], preasidiumRols: [ { role: "Quaestor", year: "2016 - 2017" } ] },
            { id: 201604, firstName: "Gregory", lastName: "Viekevorst", birthdate: "", description: "", imageUrl: "", yearIds: [2016], preasidiumRols: [ { role: "Ab-Actis", year: "2016 - 2017" } ] },
            { id: 201605, firstName: "Anne", lastName: "Smolders", birthdate: "", description: "", imageUrl: "", yearIds: [2016], preasidiumRols: [ { role: "PR", year: "2016 - 2017" } ] },
            { id: 201606, firstName: "Lieze", lastName: "Verfaillie", birthdate: "", description: "", imageUrl: "", yearIds: [2016], preasidiumRols: [ { role: "Feest", year: "2016 - 2017" } ] },
            { id: 201607, firstName: "Tom", lastName: "De Bièvre", birthdate: "", description: "", imageUrl: "", yearIds: [2016], preasidiumRols: [ { role: "Sport", year: "2016 - 2017" } ] },
            { id: 201608, firstName: "William", lastName: "Verbiest", birthdate: "", description: "", imageUrl: "", yearIds: [2016], preasidiumRols: [ { role: "Media", year: "2016 - 2017" } ] },
            { id: 201609, firstName: "Dante", lastName: "Meeus", birthdate: "", description: "", imageUrl: "", yearIds: [2016], preasidiumRols: [ { role: "Schachtenmeester", year: "2016 - 2017" } ] },
            { id: 201610, firstName: "Vincent", lastName: "Vanhove", birthdate: "", description: "", imageUrl: "", yearIds: [2016], preasidiumRols: [ { role: "Schachtentemmer", year: "2016 - 2017" } ] },
            { id: 201611, firstName: "Sofie", lastName: "de Wit", birthdate: "", description: "", imageUrl: "", yearIds: [2016], preasidiumRols: [ { role: "Zedenmeesteres", year: "2016 - 2017" } ] }
        ],
        PreasidiumLedenIds: [201601,201602,201603,201604,201605,201606,201607,201608,201609,201610,201611]
    }
]
