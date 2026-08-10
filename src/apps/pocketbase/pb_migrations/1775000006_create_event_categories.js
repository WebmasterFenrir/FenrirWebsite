/// <reference path="../pb_data/types.d.ts" />

// Event categories ("Wat doen wij") — manageable data for the website cards.
// Seeds the 5 categories that were previously hardcoded in ActivitiesPage.astro.
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3123456789",
        "max": 0,
        "min": 0,
        "name": "name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text4123456789",
        "max": 0,
        "min": 0,
        "name": "name_en",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text5123456789",
        "max": 0,
        "min": 0,
        "name": "description",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text6123456789",
        "max": 0,
        "min": 0,
        "name": "description_en",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text7123456789",
        "max": 0,
        "min": 0,
        "name": "emoji",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "number8123456789",
        "max": null,
        "min": null,
        "name": "sortOrder",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "bool9123456789",
        "name": "active",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      }
    ],
    "id": "pbc_7234567892",
    "indexes": [],
    "listRule": "",
    "name": "event_categories",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": ""
  });

  app.save(collection);

  // Seed the categories that were previously hardcoded on the website
  // (copy from src/apps/website/src/i18n/ui.ts "activities.card*" keys).
  const CATEGORIES = [
    {
      name: "TD's & feestjes",
      name_en: "TDs & parties",
      description:
        "Themafeestjes in ons stamcafé Den Echo en samenwerkingen met andere Antwerpse studentenverenigingen. Elke twee weken iets te vieren.",
      description_en:
        "Theme parties in our home café Den Echo and collaborations with other Antwerp student associations. Something to celebrate every two weeks.",
      emoji: "🎉",
      sortOrder: 1,
    },
    {
      name: "Cantussen",
      name_en: "Cantuses",
      description:
        "Samen zingen en drinken in De Wagetol. Van klassieke cantusliederen tot ons eigen clublied: er is altijd sfeer.",
      description_en:
        "Singing and drinking together in De Wagetol. From classic cantus songs to our own club song: there's always a great atmosphere.",
      emoji: "🎵",
      sortOrder: 2,
    },
    {
      name: "Sport",
      name_en: "Sports",
      description:
        "Blijf fit en sport mee. We doen mee aan voetbal- en basketbaltoernooien in Wilrijk en organiseren sportieve uitstapjes.",
      description_en:
        "Stay fit and join in. We take part in football and basketball tournaments in Wilrijk and organise sporting trips.",
      emoji: "🏀",
      sortOrder: 3,
    },
    {
      name: "Cultuur & ontspanning",
      name_en: "Culture & relaxation",
      description:
        "Filmavonden, spelletjesavonden en jeneverwandelingen. Ideaal om even te onthaasten tussen de lessen door.",
      description_en:
        "Movie nights, games nights and jenever (Dutch gin) walks. Perfect for unwinding between classes.",
      emoji: "🍿",
      sortOrder: 4,
    },
    {
      name: "Ledenweekend",
      name_en: "Members' weekend",
      description:
        "Een weekend in de Ardennen vol cantussen, kwissen, sport en goed eten. Vriendschap en plezier gegarandeerd.",
      description_en:
        "A weekend in the Ardennes full of cantuses, quizzes, sports and good food. Friendship and fun guaranteed.",
      emoji: "🏕️",
      sortOrder: 5,
    },
  ];

  for (const cat of CATEGORIES) {
    const r = new Record(collection, {
      name: cat.name,
      name_en: cat.name_en,
      description: cat.description,
      description_en: cat.description_en,
      emoji: cat.emoji,
      sortOrder: cat.sortOrder,
      active: true,
    });
    app.save(r);
  }

}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_7234567892");

  return app.delete(collection);
});
