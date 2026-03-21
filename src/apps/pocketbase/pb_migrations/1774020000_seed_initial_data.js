/// <reference path="../pb_data/types.d.ts" />

// ─── inlined data (mirrors src/apps/data.ts) ────────────────────────────────

const SPONSORS = [
  {
    startYear: 2025, endYear: 2026,
    list: [
      {
        name: "BDO",
        content: [
          "BDO is een internationale organisatie in accountancy en advies. Met diensten zoals audit, belastingadvies en consultancy ondersteunen zij ondernemers bij duurzame groei.",
          "BDO investeert daarnaast sterk in jongeren via stages, traineeships en opleidingsprogramma's, en biedt jong talent alle kansen om zich professioneel te ontwikkelen.",
          "Wij zijn trots dat BDO dit jaar onze jaarsponsor is!"
        ],
        image: "bdo.png",
        url: "https://www.bdo.be/nl-be/home"
      },
      {
        name: "AH Peeters Govers",
        content: [
          "AH Peeters-Govers is een trotse Albert Heijn-franchisepartner met meerdere winkels in de regio. Dagelijks zetten zij zich in om klanten te voorzien van verse producten, kwaliteit en uitstekende service.",
          "Met hun betrokkenheid bij de lokale gemeenschap en steun aan verenigingen en initiatieven maken zij echt het verschil. Wij zijn dan ook erg dankbaar voor hun steun als jaarsponsor!"
        ],
        image: "ah.png",
        url: ""
      }
    ]
  }
]

const YEARS = [
  {
    id: 2025, startDate: "2025", endDate: "2026",
    leden: [
      { id: 202501, firstName: "Elien",    lastName: "Van Looveren", description: "",            imageUrl: "elien2025.jpg",     rols: ["Praeses"] },
      { id: 202502, firstName: "Tibo",     lastName: "Van Daele",    description: "",            imageUrl: "tibo2025.jpg",      rols: ["Vice-Praeses", "Media"] },
      { id: 202503, firstName: "Anne",     lastName: "Peeters",      description: "",            imageUrl: "anne2025.jpg",      rols: ["Quaestor", "PR"] },
      { id: 202504, firstName: "Nils",     lastName: "Mertens",      description: "",            imageUrl: "nils2025.jpg",      rols: ["S.O.C.", "Ab-Actis"] },
      { id: 202505, firstName: "Linda",    lastName: "Bruyneels",    description: "",            imageUrl: "linda2025.jpg",     rols: ["S.O.C.", "Schachtentemmer"] },
      { id: 202506, firstName: "Andries",  lastName: "Lamberts",     description: "",            imageUrl: "",                  rols: ["Keizer", "Cantor"] },
      { id: 202507, firstName: "Django",   lastName: "Van Gool",     description: "",            imageUrl: "django2025.jpg",    rols: ["Feest", "Schachtentemmer"] },
      { id: 202508, firstName: "Rafaella", lastName: "Jardim",       description: "",            imageUrl: "rafaella2025.jpg",  rols: ["Mentor"] },
      { id: 202509, firstName: "Vincent",  lastName: "Orban",        description: "AKA Panini",  imageUrl: "vincent2025.png",   rols: ["Peter"] },
    ]
  },
  {
    id: 2024, startDate: "2024", endDate: "2025",
    leden: [
      { id: 202401, firstName: "Rafaella",  lastName: "Jardim",          description: "", imageUrl: "", rols: ["Praeses"] },
      { id: 202402, firstName: "Tibo",      lastName: "Van Daele",        description: "", imageUrl: "", rols: ["Vice-Praeses", "Schachtentemmer"] },
      { id: 202403, firstName: "Vincent",   lastName: "Orban",            description: "", imageUrl: "", rols: ["Quaestor"] },
      { id: 202404, firstName: "Tobias",    lastName: "Depoorter",        description: "", imageUrl: "", rols: ["Ab-Actis", "S.O.C."] },
      { id: 202405, firstName: "Andries",   lastName: "Lamberts",         description: "", imageUrl: "", rols: ["Cantor"] },
      { id: 202406, firstName: "Timon",     lastName: "Van Puyenbroeck",  description: "", imageUrl: "", rols: ["Feest", "Media"] },
      { id: 202407, firstName: "Julie",     lastName: "Swinnen",          description: "", imageUrl: "", rols: ["Feest", "Schachtentemmer"] },
      { id: 202408, firstName: "Hannelore", lastName: "Beugnies",         description: "", imageUrl: "", rols: ["Meter"] },
      { id: 202409, firstName: "Sam",       lastName: "Keustermans",      description: "", imageUrl: "", rols: ["Mentor"] },
    ]
  },
  {
    id: 2022, startDate: "2022", endDate: "2023",
    leden: [
      { id: 202201, firstName: "Sam",       lastName: "Keustermans",  description: "", imageUrl: "", rols: ["Praeses", "PR"] },
      { id: 202202, firstName: "Thibaut",   lastName: "Degenaers",    description: "", imageUrl: "", rols: ["Quaestor"] },
      { id: 202203, firstName: "Nina",      lastName: "Verreth",      description: "", imageUrl: "", rols: ["Ab-Actis", "Schachtenmeester"] },
      { id: 202204, firstName: "Toon",      lastName: "Van Dijck",    description: "", imageUrl: "", rols: ["Cantor"] },
      { id: 202205, firstName: "Andries",   lastName: "Lamberts",     description: "", imageUrl: "", rols: ["Feest"] },
      { id: 202206, firstName: "Vincent",   lastName: "Orban",        description: "AKA Panini", imageUrl: "", rols: ["Feest"] },
      { id: 202207, firstName: "Hannelore", lastName: "Beugnies",     description: "", imageUrl: "", rols: ["Media"] },
      { id: 202208, firstName: "Iris",      lastName: "Meeus",        description: "", imageUrl: "", rols: ["Schachtentemmer"] },
      { id: 202209, firstName: "Amelia",    lastName: "Van Herck",    description: "", imageUrl: "", rols: ["Cultuur & Ontspanning"] },
      { id: 202210, firstName: "Rafaella",  lastName: "Jardim",       description: "", imageUrl: "", rols: ["Cultuur & Ontspanning"] },
      { id: 202211, firstName: "Lisa",      lastName: "Knoops",       description: "", imageUrl: "", rols: ["Mentor"] },
      { id: 202212, firstName: "Tom",       lastName: "De Bièvre",    description: "", imageUrl: "", rols: ["Mentor"] },
      { id: 202213, firstName: "Cedric",    lastName: "De Backer",    description: "", imageUrl: "", rols: ["Mentor"] },
    ]
  },
  {
    id: 2021, startDate: "2021", endDate: "2022",
    leden: [
      { id: 202101, firstName: "Lisa",      lastName: "Knoops",       description: "", imageUrl: "", rols: ["Praeses"] },
      { id: 202102, firstName: "Bram",      lastName: "Vos",          description: "", imageUrl: "", rols: ["Vice-Praeses", "Quaestor"] },
      { id: 202103, firstName: "Marije",    lastName: "Hoeve",        description: "", imageUrl: "", rols: ["Ab-Actis"] },
      { id: 202104, firstName: "Wouter",    lastName: "Oyen",         description: "", imageUrl: "", rols: ["PR"] },
      { id: 202105, firstName: "Toon",      lastName: "Van Dijck",    description: "", imageUrl: "", rols: ["Cantor"] },
      { id: 202106, firstName: "Chelsea",   lastName: "Borgers",      description: "", imageUrl: "", rols: ["Feest"] },
      { id: 202107, firstName: "Shani",     lastName: "Cremers",      description: "", imageUrl: "", rols: ["Feest", "Media"] },
      { id: 202108, firstName: "Olivier",   lastName: "Huybrighs",    description: "", imageUrl: "", rols: ["Sport"] },
      { id: 202109, firstName: "Kato",      lastName: "Dermaut",      description: "", imageUrl: "", rols: ["Media"] },
      { id: 202110, firstName: "Cedric",    lastName: "De Backer",    description: "", imageUrl: "", rols: ["Schachtenmeester"] },
      { id: 202111, firstName: "Nina",      lastName: "Verreth",      description: "", imageUrl: "", rols: ["Schachtentemmer"] },
      { id: 202112, firstName: "Claudia",   lastName: "Walschots",    description: "", imageUrl: "", rols: ["Cultuur & Ontspanning"] },
      { id: 202113, firstName: "Caro",      lastName: "De Paepe",     description: "", imageUrl: "", rols: ["Mentor"] },
      { id: 202114, firstName: "Laura",     lastName: "Van Herck",    description: "", imageUrl: "", rols: ["Meter"] },
    ]
  },
  {
    id: 2020, startDate: "2020", endDate: "2021",
    leden: [
      { id: 202001, firstName: "Caro",       lastName: "De Paepe",    description: "", imageUrl: "", rols: ["Praeses"] },
      { id: 202002, firstName: "Lisa",       lastName: "Knoops",      description: "", imageUrl: "", rols: ["Vice-Praeses"] },
      { id: 202003, firstName: "Bram",       lastName: "Vos",         description: "", imageUrl: "", rols: ["Quaestor"] },
      { id: 202004, firstName: "Claudia",    lastName: "Walschots",   description: "", imageUrl: "", rols: ["Ab-Actis", "Media"] },
      { id: 202005, firstName: "Laura",      lastName: "Van Herck",   description: "", imageUrl: "", rols: ["PR"] },
      { id: 202006, firstName: "Toon",       lastName: "Van Dijck",   description: "", imageUrl: "", rols: ["Cantor"] },
      { id: 202007, firstName: "Marie-Lien", lastName: "Menten",      description: "", imageUrl: "", rols: ["Feest"] },
      { id: 202008, firstName: "Shani",      lastName: "Cremers",     description: "", imageUrl: "", rols: ["Feest"] },
      { id: 202009, firstName: "Lukas",      lastName: "Dugardyn",    description: "", imageUrl: "", rols: ["Sport"] },
      { id: 202010, firstName: "Cedric",     lastName: "De Backer",   description: "", imageUrl: "", rols: ["Schachtenmeester"] },
      { id: 202011, firstName: "Lukas",      lastName: "Dugardyn",    description: "", imageUrl: "", rols: ["Schachtentemmer"] },
      { id: 202012, firstName: "Nathalie",   lastName: "Hölzken",     description: "", imageUrl: "", rols: ["Cultuur & Ontspanning"] },
      { id: 202013, firstName: "Lieze",      lastName: "Verfaillie",  description: "", imageUrl: "", rols: ["Mentor"] },
      { id: 202014, firstName: "Wouter",     lastName: "Oyen",        description: "", imageUrl: "", rols: ["Peter"] },
    ]
  },
  {
    id: 2019, startDate: "2019", endDate: "2020",
    leden: [
      { id: 201901, firstName: "Lieze",      lastName: "Verfaillie",   description: "", imageUrl: "", rols: ["Praeses"] },
      { id: 201902, firstName: "Gerben",     lastName: "Martens",      description: "", imageUrl: "", rols: ["Vice-Praeses"] },
      { id: 201903, firstName: "Styn",       lastName: "Vercauteren",  description: "", imageUrl: "", rols: ["Quaestor"] },
      { id: 201904, firstName: "Claudia",    lastName: "Walschots",    description: "", imageUrl: "", rols: ["Ab-Actis"] },
      { id: 201905, firstName: "Wouter",     lastName: "Oyen",         description: "", imageUrl: "", rols: ["PR"] },
      { id: 201906, firstName: "Fen",        lastName: "Somers",       description: "", imageUrl: "", rols: ["Cantor"] },
      { id: 201907, firstName: "Caro",       lastName: "de Paepe",     description: "", imageUrl: "", rols: ["Feest"] },
      { id: 201908, firstName: "Anne",       lastName: "Smolders",     description: "", imageUrl: "", rols: ["Feest"] },
      { id: 201909, firstName: "Cedric",     lastName: "De Backer",    description: "", imageUrl: "", rols: ["Sport"] },
      { id: 201910, firstName: "Bram",       lastName: "Vos",          description: "", imageUrl: "", rols: ["Web"] },
      { id: 201911, firstName: "Nathalie",   lastName: "Hölzken",      description: "", imageUrl: "", rols: ["Media"] },
      { id: 201912, firstName: "Ashley",     lastName: "Heylen",       description: "", imageUrl: "", rols: ["Schachtenmeester"] },
      { id: 201913, firstName: "Benedicte",  lastName: "Houben",       description: "gestopt december 2019", imageUrl: "", rols: ["Schachtentemmer"] },
      { id: 201914, firstName: "Laura",      lastName: "Van Herck",    description: "", imageUrl: "", rols: ["Cultuur & Ontspanning"] },
      { id: 201915, firstName: "Lieze",      lastName: "Verfaillie",   description: "", imageUrl: "", rols: ["Mentor"] },
      { id: 201916, firstName: "Vincent",    lastName: "Orban",        description: "", imageUrl: "", rols: ["Peter"] },
    ]
  },
  {
    id: 2018, startDate: "2018", endDate: "2019",
    leden: [
      { id: 201801, firstName: "Dante",      lastName: "Meeus",           description: "", imageUrl: "", rols: ["Praeses"] },
      { id: 201802, firstName: "Benedicte",  lastName: "Houben",          description: "", imageUrl: "", rols: ["Vice-Praeses"] },
      { id: 201803, firstName: "Vincent",    lastName: "Orban",           description: "", imageUrl: "", rols: ["Quaestor"] },
      { id: 201804, firstName: "Bram",       lastName: "Vos",             description: "", imageUrl: "", rols: ["Ab-Actis"] },
      { id: 201805, firstName: "Wouter",     lastName: "Oyen",            description: "", imageUrl: "", rols: ["PR"] },
      { id: 201806, firstName: "Fen",        lastName: "Somers",          description: "", imageUrl: "", rols: ["Cantor"] },
      { id: 201807, firstName: "Laura",      lastName: "Van Herck",       description: "", imageUrl: "", rols: ["Feest"] },
      { id: 201808, firstName: "Ivana",      lastName: "Bradvica",        description: "", imageUrl: "", rols: ["Feest"] },
      { id: 201809, firstName: "Gerben",     lastName: "Martens",         description: "", imageUrl: "", rols: ["Sport"] },
      { id: 201810, firstName: "Anne",       lastName: "Smolders",        description: "", imageUrl: "", rols: ["Media"] },
      { id: 201811, firstName: "Ashley",     lastName: "Heylen",          description: "", imageUrl: "", rols: ["Schachtenmeester"] },
      { id: 201812, firstName: "Benjamin",   lastName: "Van Tongelen",    description: "", imageUrl: "", rols: ["Schachtentemmer"] },
      { id: 201813, firstName: "Selina",     lastName: "Mathyssen",       description: "", imageUrl: "", rols: ["Cultuur & Ontspanning"] },
      { id: 201814, firstName: "Lieze",      lastName: "Verfaillie",      description: "", imageUrl: "", rols: ["Mentor"] },
      { id: 201815, firstName: "Nick",       lastName: "Peeters",         description: "", imageUrl: "", rols: ["Dux Festi"] },
      { id: 201816, firstName: "Tim",        lastName: "Matthijs",        description: "", imageUrl: "", rols: ["Dux Festi"] },
    ]
  },
  {
    id: 2017, startDate: "2017", endDate: "2018",
    leden: [
      { id: 201701, firstName: "Lieze",      lastName: "Verfaillie",      description: "", imageUrl: "", rols: ["Praeses"] },
      { id: 201702, firstName: "Dante",      lastName: "Meeus",           description: "", imageUrl: "", rols: ["Vice-Praeses"] },
      { id: 201703, firstName: "Fen",        lastName: "Somers",          description: "", imageUrl: "", rols: ["Quaestor"] },
      { id: 201704, firstName: "Stefaan",    lastName: "Van den Heuvel",  description: "", imageUrl: "", rols: ["Ab-Actis"] },
      { id: 201705, firstName: "Anne",       lastName: "Smolders",        description: "", imageUrl: "", rols: ["PR"] },
      { id: 201706, firstName: "Tim",        lastName: "Matthijs",        description: "", imageUrl: "", rols: ["PR"] },
      { id: 201707, firstName: "Gilles",     lastName: "Obourdin",        description: "", imageUrl: "", rols: ["Cantor"] },
      { id: 201708, firstName: "Benedicte",  lastName: "Houben",          description: "gestopt november 2017", imageUrl: "", rols: ["Feest"] },
      { id: 201709, firstName: "Noah",       lastName: "Vermeerbergen",   description: "gestopt november 2017", imageUrl: "", rols: ["Feest"] },
      { id: 201710, firstName: "Brecht",     lastName: "Pallemans",       description: "", imageUrl: "", rols: ["Sport"] },
      { id: 201711, firstName: "Ashley",     lastName: "Heylen",          description: "", imageUrl: "", rols: ["Media"] },
      { id: 201712, firstName: "Malika",     lastName: "Kuchkarova",      description: "", imageUrl: "", rols: ["Schachtenmeester"] },
      { id: 201713, firstName: "Andreas",    lastName: "de Rop",          description: "gestopt november 2017", imageUrl: "", rols: ["Schachtentemmer"] },
      { id: 201714, firstName: "Vincent",    lastName: "Vanhove",         description: "", imageUrl: "", rols: ["Peter"] },
      { id: 201715, firstName: "Nick",       lastName: "Peeters",         description: "Mentor/moeder", imageUrl: "", rols: ["Mentor/moeder"] },
    ]
  },
  {
    id: 2016, startDate: "2016", endDate: "2017",
    leden: [
      { id: 201601, firstName: "Nick",       lastName: "Peeters",         description: "", imageUrl: "", rols: ["Praeses"] },
      { id: 201602, firstName: "Gilles",     lastName: "Obourdin",        description: "", imageUrl: "", rols: ["Vice-Praeses", "Cantor"] },
      { id: 201603, firstName: "Andreas",    lastName: "De Rop",          description: "", imageUrl: "", rols: ["Quaestor"] },
      { id: 201604, firstName: "Gregory",    lastName: "Viekevorst",      description: "", imageUrl: "", rols: ["Ab-Actis"] },
      { id: 201605, firstName: "Anne",       lastName: "Smolders",        description: "", imageUrl: "", rols: ["PR"] },
      { id: 201606, firstName: "Lieze",      lastName: "Verfaillie",      description: "", imageUrl: "", rols: ["Feest"] },
      { id: 201607, firstName: "Tom",        lastName: "De Bièvre",       description: "", imageUrl: "", rols: ["Sport"] },
      { id: 201608, firstName: "William",    lastName: "Verbiest",        description: "", imageUrl: "", rols: ["Media"] },
      { id: 201609, firstName: "Dante",      lastName: "Meeus",           description: "", imageUrl: "", rols: ["Schachtenmeester"] },
      { id: 201610, firstName: "Vincent",    lastName: "Vanhove",         description: "", imageUrl: "", rols: ["Schachtentemmer"] },
      { id: 201611, firstName: "Sofie",      lastName: "de Wit",          description: "", imageUrl: "", rols: ["Zedenmeesteres"] },
    ]
  },
]

// ─── migration ───────────────────────────────────────────────────────────────

migrate((app) => {
  const rollenCol   = app.findCollectionByNameOrId("preasidium_rollen")
  const ledenCol    = app.findCollectionByNameOrId("preasidium_leden")
  const yearsCol    = app.findCollectionByNameOrId("preasidium_years")
  const functiesCol = app.findCollectionByNameOrId("preasidium_jaar_functies")
  const sponsorsCol = app.findCollectionByNameOrId("sponsors")

  // 1. Collect and seed all unique roles
  const allRoleNames = new Set()
  for (const year of YEARS) {
    for (const lid of year.leden) {
      for (const rol of lid.rols) allRoleNames.add(rol)
    }
  }
  const roleMap = {} // role name -> PB record id
  for (const name of allRoleNames) {
    const r = new Record(rollenCol, { name })
    app.save(r)
    roleMap[name] = r.id
  }

  // 2. Seed leden and build a map from externalId to PB id
  const lidMap = {} // externalId -> PB record id
  for (const year of YEARS) {
    for (const lid of year.leden) {
      const r = new Record(ledenCol, {
        externalId:  lid.id,
        firstName:   lid.firstName,
        lastName:    lid.lastName,
        description: lid.description,
        imageUrl:    lid.imageUrl,
      })
      app.save(r)
      lidMap[lid.id] = r.id
    }
  }

  // 3. Seed years and jaar_functies
  for (const year of YEARS) {
    const yr = new Record(yearsCol, {
      yearId:    year.id,
      startDate: year.startDate,
      endDate:   year.endDate,
    })
    app.save(yr)

    for (const lid of year.leden) {
      for (const rol of lid.rols) {
        const f = new Record(functiesCol, {
          lid:  lidMap[lid.id],
          year: yr.id,
          role: roleMap[rol],
        })
        app.save(f)
      }
    }
  }

  // 4. Seed sponsors
  for (const yearGroup of SPONSORS) {
    for (const sponsor of yearGroup.list) {
      const r = new Record(sponsorsCol, {
        name:      sponsor.name,
        content:   sponsor.content,
        image:     sponsor.image,
        url:       sponsor.url,
        startYear: yearGroup.startYear,
        endYear:   yearGroup.endYear,
      })
      app.save(r)
    }
  }

}, (app) => {
  // Rollback: delete all seeded records in reverse dependency order
  for (const colName of ["preasidium_jaar_functies", "sponsors", "preasidium_leden", "preasidium_years", "preasidium_rollen"]) {
    const records = app.findRecordsByFilter(colName, "id != ''")
    for (const r of records) {
      app.delete(r)
    }
  }
})
