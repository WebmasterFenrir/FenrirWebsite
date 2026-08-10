/**
 * i18n dictionaries for the Fenrir website.
 *
 * The Dutch dictionary (`nl`) is the source of truth for available keys and is
 * kept byte-for-byte identical to the original site copy. The English
 * dictionary (`en`) must contain the exact same keys (enforced by TypeScript).
 */

export const languages = {
  nl: "Nederlands",
  en: "English",
} as const;

export type Locale = keyof typeof languages;

export const defaultLang: Locale = "nl";

/** When false, the default locale ("nl") gets no URL prefix: /activiteiten */
export const showDefaultLang = false;

// ─── Dutch (source of truth for the key shape) ───────────────────────────────
const nl = {
  // Navigation
  "nav.home": "Home",
  "nav.activiteiten": "Activiteiten",
  "nav.over-ons": "Over ons",
  "nav.praesidium": "Praesidium",
  "nav.sponsors": "Sponsors",
  "nav.menuTitle": "Menu",
  "nav.menuDescription": "Verken onze website!",
  "nav.language": "Taal",

  // Homepage
  "home.heroSubtitle": "De vriendelijkste club van Antwerpen!",
  "home.joinCta": "Word lid!",
  "home.activitiesCta": "Bekijk activiteiten",
  "home.welcomeTitle": "Bij Fenrir zit je goed!",
  "home.welcomeSubtitle":
    "De studentenclub waar vriendschap en gezelligheid voorop staan. Klein van omvang, maar groot in sfeer en saamhorigheid.",
  "home.welcomeP1":
    "Wij zijn studentenvereniging Fenrir, een toffe gezellige vereniging verbonden aan Karel de Grote hogeschool. We nemen je mee in het Antwerps studentleven. Ontmoet vrienden voor het leven, maak de gekste avonturen mee, ontdek Antwerpen en geniet van het studentenleven.",
  "home.welcomeP2":
    "Wekelijks organiseren we verschillende activiteiten zoals onder andere feestjes, cultuuractiviteiten en sport.",
  "home.welcomeP3":
    "Kom erbij en geniet van je studentenleven! Dansen, lachen, brullen, gieren,… dat beleef je met Fenrir!",
  "home.whyTitle": "Waarom Fenrir",
  "home.whyDescription":
    "Studentenleven draait om meer dan alleen studeren. Bij Fenrir vind je vrienden, ontdek je de stad en beleef je samen onvergetelijke momenten.",
  "home.why1Title": "hechte vriendengroep",
  "home.why1Desc":
    "Je bent nooit alleen. Samen met andere studenten maken we er elke activiteit een gezellige tijd van.",
  "home.why2Title": "Activiteiten het hele jaar",
  "home.why2Desc":
    "Van feestjes en cantussen tot sport en cultuur: er is altijd iets om naar uit te kijken.",
  "home.why3Title": "Antwerpen ontdekken",
  "home.why3Desc":
    "We leren je de leukste plekken van de stad kennen, van goedkope eettentjes tot de beste uitgaansgelegenheden.",
  "home.why4Title": "Iedereen is welkom",
  "home.why4Desc":
    "Je studierichting maakt niet uit. Bij Fenrir is plezier en respect belangrijker dan waar je vandaan komt.",
  "home.praesidiumTitle": "Huidig Praesidium",
  "home.praesidiumDescription":
    "Het praesidium is het kloppend hart van Fenrir dat elk evenement zijn best doet om er weer een geweldige tijd van te maken.",
  "home.sponsorsTitle": "Onze Sponsors",
  "home.sponsorsDescription":
    "Dankzij deze partners kunnen we onze werking verder uitbouwen en onze studenten blijven ondersteunen.",
  "home.activitiesTitle": "Komende activiteiten",
  "home.activitiesDescription":
    "Ontdek hieronder wat er bij Fenrir op de planning staat. Zin om mee te doen? Iedereen is welkom!",
  "home.activitiesViewAll": "Bekijk alle activiteiten",
  "home.praesidiumCtaTitle": "Ontdek ons volledige praesidium",
  "home.praesidiumCtaDescription":
    "Bekijk alle leden, rollen en verhalen van onze vereniging.",
  "common.more": "Meer ontdekken",

  // Activities page
  "activities.title": "Activiteiten",
  "activities.subtitle":
    "Bij Fenrir is er altijd wel iets te beleven. Feestjes, cantussen, sport en cultuur: ontdek wat we voor jou in petto hebben.",
  "activities.whatTitle": "Wat doen wij",
  "activities.whatDescription":
    "Als studentenclub organiseren we het hele jaar door activiteiten. Sommige zijn exclusief voor leden, andere open voor iedereen die gezelligheid zoekt.",
  "activities.card1Title": "TD's & feestjes",
  "activities.card1Desc":
    "Themafeestjes in ons stamcafé Den Echo en samenwerkingen met andere Antwerpse studentenverenigingen. Elke twee weken iets te vieren.",
  "activities.card2Title": "Cantussen",
  "activities.card2Desc":
    "Samen zingen en drinken in De Wagetol. Van klassieke cantusliederen tot ons eigen clublied: er is altijd sfeer.",
  "activities.card3Title": "Sport",
  "activities.card3Desc":
    "Blijf fit en sport mee. We doen mee aan voetbal- en basketbaltoernooien in Wilrijk en organiseren sportieve uitstapjes.",
  "activities.card4Title": "Cultuur & ontspanning",
  "activities.card4Desc":
    "Filmavonden, spelletjesavonden en jeneverwandelingen. Ideaal om even te onthaasten tussen de lessen door.",
  "activities.card5Title": "Ledenweekend",
  "activities.card5Desc":
    "Een weekend in de Ardennen vol cantussen, kwissen, sport en goed eten. Vriendschap en plezier gegarandeerd.",
  "activities.howTitle": "Hoe werkt het",
  "activities.howDescription":
    "Iedereen is welkom om een activiteit mee te maken. Wil je voordeelprijzen en mee naar het ledenweekend? Dan wordt je lid.",
  "activities.step1Title": "Ontdek",
  "activities.step1Desc":
    "Bekijk hier of op onze socials welke activiteiten er aanstaan.",
  "activities.step2Title": "Kom langs",
  "activities.step2Desc":
    "Je hoeft geen lid te zijn om mee te doen. Kom gerust een keertje kijken.",
  "activities.step3Title": "Word lid",
  "activities.step3Desc":
    "Vaste bezoeker? Word lid voor korting en exclusieve evenementen.",
  "activities.readyTitle": "Klaar om mee te doen?",
  "activities.readyDesc":
    "Volg ons op Facebook en Instagram voor de laatste data en foto's, of word direct lid en geniet van voordeelprijzen op al onze activiteiten.",
  "activities.joinCta": "Word lid!",
  "activities.facebookCta": "Facebook",
  "activities.upcomingTitle": "Komende activiteiten",
  "activities.upcomingDescription":
    "Dit zijn de aankomende activiteiten van Fenrir, rechtstreeks van onze Facebook-pagina. Volg ons daar voor de allerlaatste updates.",
  "activities.noEvents":
    "Er staan momenteel geen activiteiten gepland. Kijk binnenkort nog eens terug!",
  "activities.viewOnFacebook": "Bekijk op Facebook",

  // Over ons page
  "about.title": "Over ons",
  "about.heading": "Over Ons",
  "about.subtitle":
    "Lees meer over onze geschiedenis, roots in Brugge en Antwerpen, en de mythische oorsprong van onze naam.",
  "about.historyTitle": "Onze Geschiedenis",
  "about.historyDescription":
    "Opgericht in Brugge (2014). Na een korte stop verdergezet als studentenclub in Antwerpen (vanaf 2016).",
  "about.historyP1":
    "Opgericht in Brugge (2014). Na een korte stop verdergezet als studentenclub in Antwerpen (vanaf 2016).\nSinds 2016 groeide Fenrir verder in Antwerpen. Hieronder lees je hoe dat verliep.",
  "about.antwerpenTitle": "Fenrir Antwerpen",
  "about.antwerpenP1":
    "Fenrir Antwerpen werd op 9 mei 2016 officieel opgericht door Nick Peeters, Gilles Obourdin, Andreas de Rop en Dario Tielens. Het nieuwe schild had nog steeds een aantal verbintenissen naar de oude club. Bovenaan staat de naam, in hetzelfde lettertype als het vorige schild. Ook de wolf is terug te vinden op het nieuwe schild. De kleuren veranderden naar paars-geel-zilver. Voor 9 mei werden er nog een aantal activiteiten georganiseerd in Brugge, maar de meesten werden naar Antwerpen over gebracht. Zo maakte Fenrir Antwerpen indruk met de Bierfietscantus, waarbij ze met een grote bierfiets (en een hoop bier, natuurlijk) al zingend door stad Antwerpen reden.",
  "about.antwerpenP2":
    "Het was pas eind juni 2016 dat Fenrir Antwerpen een café vond dat volledig bij de club paste. La Dolce Vita werd dan ook vanaf dan hét clubcafé van Fenrir Antwerpen. In 2021, is Fenrir Antwerpen van stamcafé veranderd. Voortaan vind je ons In Den Echo.",
  "about.antwerpenP3":
    "Na vele gesprekken geleid door Nick Peeters en Gilles Obourdin, werd besloten dat Fenrir Antwerpen vanaf het schooljaar 2017-2018 deel zou uitmaken van KdG Hogeschool, specifiek KdG campus Groenplaats.",
  "about.bruggeTitle": "Fenrir Brugge",
  "about.bruggeP1":
    "Fenrir is opgericht in Brugge op 25 november 2014. De club was op dat moment verbonden met Howest, Hogeschool West-Vlaanderen. Het clubcafé was Charlie Rockets, waar er een aantal cantussen en feestjes georganiseerd zijn.",
  "about.bruggeP2":
    "Fenrir Brugge stond bekend om de zilver-rode linten en de interessante lezingen, beter bekend als Fentalks. Deze lezingen waren voor iedereen die geïnteresseerd was. Ook de thema’s en gastsprekers verschilden telkens, om een zo breed mogelijk publiek aan te kunnen spreken. De club werd onder de leuze ‘No one can stop the wolf, we are Fenrir’ geleid door de eerste praesidia.",
  "about.bruggeP3": "Op 11 oktober 2015 werd de club op non-actief gezet.",
  "about.bruggeP4":
    "Deze stopzetting was van korte duur, Fenrir maakte een comeback met zijn Fenrir is back cantus op 19 februari 2016. De cantus werd feestelijk ingezet met de bekendmaking van het vernieuwde schild, nieuwe praesidium- en schachtenlinten en de nieuwe vlag. Dit was het startschot voor Fenrir Antwerpen.",
  "about.nameTitle": "De naam Fenrir",
  "about.nameDescription":
    "Noordse mythologie: de reusachtige wolf, zoon van Loki; sleutelrol in Ragnarok.",
  "about.nameP1":
    "De naam Fenrir komt uit de Noordse mythologie. Fenrir was de middelste zoon Loki, de God van de Misleiding. Hij was geen mens of god, maar leek toen hij klein was op een klein hondje. De oppergod Odin nam Fenrir mee naar Asgard, waar de volgelingen van Odin woonden.",
  "about.nameP2":
    "Fenrir stond bekend als een kwaadaardig wezen. Het wezen ontwikkelde zich tot een reusachtige wolf met verschrikkelijke kaken. De wolf had de sluwheid van zijn vader Loki geërfd.",
  "about.nameP3":
    "Al snel werd de wolf als onhandelbaar gezien. De goden beraamden onder elkaar een plan om hem vast te binden. Na veel zoeken lieten de aesen een speciale ketting maken. Toen Fenrir vastgebonden werd, kon hij zichzelf niet bevrijden. Uit woede hapte de wolf naar de aesen, maar zij staken een zwaard in zijn muil met de punt omhoog zodat hij niet kon bijten. Door het gekwijl van Fenrir ontstond de rivier Van.",
  "about.nameP4":
    "Fenrir stierf aan het einde van de wereld, tijdens Ragnarok. De zoon van Odin, genaamd Vidar, doodde hem om zijn vader te wreken.",
  "about.clubSongTitle": "Ons Clublied",
  "about.clubSongDescription":
    "Gezongen op cantussen en bij bijzondere momenten. melodie: De Blauwvoet",
  "about.clubSongP1":
    "Ons clublied is een vaste waarde tijdens cantussen en grote momenten zoals openingsactiviteiten, doop of lustrum. Het brengt sfeer, verbindt generaties leden en zet de toon voor de avond.",
  "about.clubSongP2":
    "De strofe wordt doorgaans ingezet door de aanwezigen, terwijl de keerzang door iedereen voluit wordt meegezongen. De melodie is gebaseerd op",
  "about.strofe": "Strofe",
  "about.keerzang": "Keerzang",
  "about.strofeL1": "Brugse wolven sta nu recht",
  "about.strofeL2": "Moeders wees gewaarschuwd",
  "about.strofeL3": "Wij gaan ons hier bezuipen",
  "about.strofeL4": "Gelijk de wereld morgen eind",
  "about.keerzangL1": "Nu het lied der Brugse wolven",
  "about.keerzangL2": "Stralend gaan wij naar de kloten",
  "about.keerzangL3": "Geen keten houdt ons tegen",
  "about.keerzangL4": "Straalt Fenrir, drinkt er nog een!",

  // Praesidium page
  "praesidium.title": "Praesidium",
  "praesidium.heading": "Het Praesidium",
  "praesidium.subtitle":
    "Het praesidium is het kloppend hart van Fenrir. Een team van gemotiveerde studenten dat activiteiten organiseert, nieuwe leden onthaalt en zorgt dat onze club blijft draaien.",
  "praesidium.whatTitle": "Wat Doet Het Praesidium",
  "praesidium.whatDescription":
    "Van planning tot promotie en van cantussen tot sport en cultuur: elk lid heeft een eigen rol en verantwoordelijkheid. Samen zorgen ze voor een warm welkom, een goed gevulde kalender en onvergetelijke momenten.",
  "praesidium.intro":
    "Het praesidium bestaat uit verschillende functies zoals praeses, vice-praeses, quaestor, ab-actis, cantor, feest, media, sport, schachtenmeester/-temmer, cultuur & ontspanning, mentor/meter/peter ... Elke functie draagt bij aan de werking van onze vereniging.",
  "praesidium.item1": "Praeses & Vice-Praeses: leiden het team en bewaken de visie.",
  "praesidium.item2": "Quaestor & Ab-Actis: financien en administratie op orde.",
  "praesidium.item3": "Cantor & Feest: zorgen voor sfeer, cantus en events.",
  "praesidium.item4": "Media & PR: communicatie, socials en promotie.",
  "praesidium.item5": "Sport & Cultuur: activiteiten voor elk wat wils.",
  "praesidium.item6": "Schachtenwerking: onthaalt nieuwe leden met respect en fun.",
  "praesidium.outro":
    "Heb je vragen of wil je mee het verschil maken? Spreek iemand van het praesidium aan tijdens een activiteit of stuur ons een berichtje via onze kanalen.",
  "praesidium.yearsTitle": "Praesidium Per Jaar",
  "praesidium.yearsDescription":
    "Bekijk wie er de voorbije jaren mee de schouders onder Fenrir zette.",

  // Sponsors page
  "sponsors.title": "Sponsors",
  "sponsors.heading": "Onze Sponsors",
  "sponsors.subtitle":
    "Dankzij deze geweldige partners kunnen wij onze werking uitbouwen en onze studenten ondersteunen.",
  "sponsors.partnersTitle": "Partners Van Fenrir",
  "sponsors.partnersDescription": "Samen maken we meer mogelijk voor onze leden.",
  "sponsors.whyTitle": "Waarom Fenrir Sponsoren?",
  "sponsors.whyDescription":
    "Bereik studenten in Antwerpen, bouw merkvoorkeur op en maak tastbare impact.",
  "sponsors.becomeTitle": "Sponsor Worden?",
  "sponsors.becomeDescription":
    "Unieke samenwerking met wederzijds voordeel: snel en laagdrempelig geregeld.",
  "sponsors.intro":
    "We verkennen graag jullie doelen (zichtbaarheid, rekrutering, activatie) en stellen op basis daarvan een voorstel voor.",
  "sponsors.step1Title": "Kennismaking",
  "sponsors.step1Desc":
    "Doelen, doelgroep en timing afstemmen voor een optimale match.",
  "sponsors.step2Title": "Voorstel",
  "sponsors.step2Desc":
    "Een concreet pakket op maat (zichtbaarheid, activatie, rekrutering).",
  "sponsors.step3Title": "Start",
  "sponsors.step3Desc": "Afspraken vastleggen en samen de campagne lanceren.",
  "sponsors.contactTitle": "Interesse of meer info?",
  "sponsors.contactCta": "Neem contact op",
  "sponsors.partnerLabel": "partner",
  "sponsors.value1Title": "Bereik & zichtbaarheid",
  "sponsors.value1What": "Website, socials, vermelding op events",
  "sponsors.value1Impact": "Meer merkherkenning",
  "sponsors.value2Title": "Talent & instroom",
  "sponsors.value2What": "Intro naar leden, stage- en jobposts",
  "sponsors.value2Impact": "Snellere rekrutering",
  "sponsors.value3Title": "Lokale verankering",
  "sponsors.value3What": "Samenwerking met Antwerpse club",
  "sponsors.value3Impact": "Community-waarde",
  "sponsors.value4Title": "Activering op events",
  "sponsors.value4What": "Sampling, promo of stand opties",
  "sponsors.value4Impact": "Directe interactie",
  "sponsors.value5Title": "Flexibele formules",
  "sponsors.value5What": "Financieel of in natura, kort of jaar",
  "sponsors.value5Impact": "Efficiënte ROI",
  "sponsors.value6Title": "Content & storytelling",
  "sponsors.value6What": "Gezamenlijke posts en cases",
  "sponsors.value6Impact": "Relevante brand stories",

  // 404
  "notFound.title": "404 – Pagina niet gevonden",
  "notFound.alt": "404 – pagina niet gevonden",
  "notFound.heading": "Pagina niet gevonden",
  "notFound.subtitle":
    "Deze pagina bestaat niet of werd verplaatst. Ga terug naar de homepagina.",
  "notFound.cta": "Terug naar home",

  // Footer
  "footer.label": "Fenrir Club",
  "footer.title": "Blijf in de loop",
  "footer.description":
    "Volg ons online voor meldingen van evenementen en zo veel meer",
  "footer.followHint": "Volg ons",
  "footer.social": "Social",
  "footer.contact": "Contact",
  "footer.rights": "Alle rechten voorbehouden.",
  "footer.builtBy": "Gebouwd door het Fenrir Web Team.",
  "footer.openSource": "Open Source",
  "footer.contributors": "Bijdragers",
  "footer.humans": "{count} geweldige mensen",

  // Dynamic content components
  "preasidiumLid.noDescription": "Geen beschrijving beschikbaar.",
  "preasidiumLid.detailedInfo": "Gedetailleerde informatie over {name}",
} as const;

export type UiKey = keyof typeof nl;
export type Ui = Record<UiKey, string>;

// ─── English ─────────────────────────────────────────────────────────────────
const en: Ui = {
  // Navigation
  "nav.home": "Home",
  "nav.activiteiten": "Activities",
  "nav.over-ons": "About us",
  "nav.praesidium": "Praesidium",
  "nav.sponsors": "Sponsors",
  "nav.menuTitle": "Menu",
  "nav.menuDescription": "Explore our website!",
  "nav.language": "Language",

  // Homepage
  "home.heroSubtitle": "The friendliest club in Antwerp!",
  "home.joinCta": "Join us!",
  "home.activitiesCta": "See activities",
  "home.welcomeTitle": "You're in good hands at Fenrir!",
  "home.welcomeSubtitle":
    "The student club where friendship and cosiness come first. Small in size, but big on atmosphere and togetherness.",
  "home.welcomeP1":
    "We are student association Fenrir, a fun and cosy club connected to Karel de Grote University of Applied Sciences. We'll introduce you to student life in Antwerp. Meet friends for life, go on the craziest adventures, discover Antwerp and enjoy student life.",
  "home.welcomeP2":
    "Every week we organise a range of activities, including parties, cultural events and sports.",
  "home.welcomeP3":
    "Come join us and enjoy your student life! Dancing, laughing, shouting, screaming… that's what you experience with Fenrir!",
  "home.whyTitle": "Why Fenrir",
  "home.whyDescription":
    "Student life is about more than just studying. At Fenrir you'll find friends, discover the city and share unforgettable moments together.",
  "home.why1Title": "A close group of friends",
  "home.why1Desc":
    "You're never alone. Together with other students we make every activity a good time.",
  "home.why2Title": "Activities all year round",
  "home.why2Desc":
    "From parties and cantuses to sports and culture: there's always something to look forward to.",
  "home.why3Title": "Discover Antwerp",
  "home.why3Desc":
    "We'll show you the best spots in the city, from cheap eateries to the best nightlife.",
  "home.why4Title": "Everyone is welcome",
  "home.why4Desc":
    "Your field of study doesn't matter. At Fenrir, fun and respect matter more than where you come from.",
  "home.praesidiumTitle": "Current Praesidium",
  "home.praesidiumDescription":
    "The praesidium is the beating heart of Fenrir, doing its best at every event to make it a great time again.",
  "home.sponsorsTitle": "Our Sponsors",
  "home.sponsorsDescription":
    "Thanks to these partners we can keep growing our organisation and supporting our students.",
  "home.activitiesTitle": "Upcoming activities",
  "home.activitiesDescription":
    "Check out what's coming up at Fenrir below. Fancy joining? Everyone is welcome!",
  "home.activitiesViewAll": "View all activities",
  "home.praesidiumCtaTitle": "Discover our full praesidium",
  "home.praesidiumCtaDescription":
    "See all the members, roles and stories of our club.",
  "common.more": "Discover more",

  // Activities page
  "activities.title": "Activities",
  "activities.subtitle":
    "There's always something going on at Fenrir. Parties, cantuses, sports and culture: discover what we have in store for you.",
  "activities.whatTitle": "What we do",
  "activities.whatDescription":
    "As a student club we organise activities all year round. Some are exclusive to members, others are open to everyone looking for a good time.",
  "activities.card1Title": "TDs & parties",
  "activities.card1Desc":
    "Theme parties in our home café Den Echo and collaborations with other Antwerp student associations. Something to celebrate every two weeks.",
  "activities.card2Title": "Cantuses",
  "activities.card2Desc":
    "Singing and drinking together in De Wagetol. From classic cantus songs to our own club song: there's always a great atmosphere.",
  "activities.card3Title": "Sports",
  "activities.card3Desc":
    "Stay fit and join in. We take part in football and basketball tournaments in Wilrijk and organise sporting trips.",
  "activities.card4Title": "Culture & relaxation",
  "activities.card4Desc":
    "Movie nights, games nights and jenever (Dutch gin) walks. Perfect for unwinding between classes.",
  "activities.card5Title": "Members' weekend",
  "activities.card5Desc":
    "A weekend in the Ardennes full of cantuses, quizzes, sports and good food. Friendship and fun guaranteed.",
  "activities.howTitle": "How it works",
  "activities.howDescription":
    "Everyone is welcome to join an activity. Want discounted prices and a spot on the members' weekend? Then become a member.",
  "activities.step1Title": "Discover",
  "activities.step1Desc":
    "Check here or on our socials which activities are coming up.",
  "activities.step2Title": "Come along",
  "activities.step2Desc":
    "You don't need to be a member to join. Feel free to come and have a look.",
  "activities.step3Title": "Become a member",
  "activities.step3Desc":
    "Regular visitor? Become a member for discounts and exclusive events.",
  "activities.readyTitle": "Ready to join?",
  "activities.readyDesc":
    "Follow us on Facebook and Instagram for the latest dates and photos, or become a member right away and enjoy discounted prices on all our activities.",
  "activities.joinCta": "Join us!",
  "activities.facebookCta": "Facebook",
  "activities.upcomingTitle": "Upcoming activities",
  "activities.upcomingDescription":
    "These are Fenrir's upcoming activities, straight from our Facebook page. Follow us there for the very latest updates.",
  "activities.noEvents":
    "No activities are currently scheduled. Check back soon!",
  "activities.viewOnFacebook": "View on Facebook",

  // Over ons page
  "about.title": "About us",
  "about.heading": "About Us",
  "about.subtitle":
    "Read more about our history, our roots in Bruges and Antwerp, and the mythical origins of our name.",
  "about.historyTitle": "Our History",
  "about.historyDescription":
    "Founded in Bruges (2014). After a short break, continued as a student club in Antwerp (from 2016).",
  "about.historyP1":
    "Founded in Bruges (2014). After a short break, continued as a student club in Antwerp (from 2016).\nSince 2016 Fenrir has grown further in Antwerp. Below you can read how that went.",
  "about.antwerpenTitle": "Fenrir Antwerpen",
  "about.antwerpenP1":
    "Fenrir Antwerpen was officially founded on 9 May 2016 by Nick Peeters, Gilles Obourdin, Andreas de Rop and Dario Tielens. The new coat of arms still had several ties to the old club. The name is at the top, in the same typeface as the previous shield. The wolf also made its way onto the new shield. The colours changed to purple-yellow-silver. Before 9 May, a number of activities were still organised in Bruges, but most of them were moved to Antwerp. Fenrir Antwerpen made an impression with the Bierfietscantus (beer-bike cantus), riding through the city of Antwerp on a big beer bike (with plenty of beer, of course) while singing.",
  "about.antwerpenP2":
    "It wasn't until the end of June 2016 that Fenrir Antwerpen found a café that suited the club perfectly. From then on, La Dolce Vita became Fenrir Antwerpen's club café. In 2021, Fenrir Antwerpen changed its home café. From now on you'll find us at In Den Echo.",
  "about.antwerpenP3":
    "After many talks led by Nick Peeters and Gilles Obourdin, it was decided that Fenrir Antwerpen would become part of KdG University of Applied Sciences from the 2017-2018 academic year, specifically KdG campus Groenplaats.",
  "about.bruggeTitle": "Fenrir Brugge",
  "about.bruggeP1":
    "Fenrir was founded in Bruges on 25 November 2014. At that time the club was connected to Howest, University of Applied Sciences West Flanders. The club café was Charlie Rockets, where a number of cantuses and parties were organised.",
  "about.bruggeP2":
    "Fenrir Brugge was known for its silver-red ribbons and its interesting lectures, better known as Fentalks. These lectures were open to anyone interested. The themes and guest speakers varied every time, to reach as broad an audience as possible. The club was led under the motto 'No one can stop the wolf, we are Fenrir' by the first praesidia.",
  "about.bruggeP3": "On 11 October 2015 the club was put on hold.",
  "about.bruggeP4":
    "That pause was short-lived: Fenrir made a comeback with its 'Fenrir is back' cantus on 19 February 2016. The cantus kicked off festively with the unveiling of the renewed coat of arms, new praesidium and freshman ribbons and the new flag. This was the starting shot for Fenrir Antwerpen.",
  "about.nameTitle": "The name Fenrir",
  "about.nameDescription":
    "Norse mythology: the giant wolf, son of Loki; a key figure in Ragnarok.",
  "about.nameP1":
    "The name Fenrir comes from Norse mythology. Fenrir was the middle son of Loki, the God of Mischief. He was neither man nor god, but as a small pup he looked like a little dog. The Allfather Odin took Fenrir to Asgard, where Odin's followers lived.",
  "about.nameP2":
    "Fenrir was known as an evil creature. The creature grew into a giant wolf with terrifying jaws. The wolf had inherited the cunning of his father Loki.",
  "about.nameP3":
    "Soon the wolf was seen as uncontrollable. The gods devised a plan among themselves to bind him. After much searching, the Aesir had a special chain made. When Fenrir was tied up, he couldn't free himself. In anger the wolf snapped at the Aesir, but they stuck a sword in his mouth with the point upwards so he couldn't bite. From Fenrir's drool the river Van was born.",
  "about.nameP4":
    "Fenrir died at the end of the world, during Ragnarok. Odin's son, named Vidar, killed him to avenge his father.",
  "about.clubSongTitle": "Our Club Song",
  "about.clubSongDescription":
    "Sung at cantuses and special occasions. Melody: De Blauwvoet",
  "about.clubSongP1":
    "Our club song is a staple during cantuses and big moments such as opening activities, baptisms or anniversaries. It brings atmosphere, connects generations of members and sets the tone for the evening.",
  "about.clubSongP2":
    "The verse is usually started by those present, while the chorus is sung at full volume by everyone. The melody is based on",
  "about.strofe": "Verse",
  "about.keerzang": "Chorus",
  "about.strofeL1": "Bruges wolves, stand up now",
  "about.strofeL2": "Mothers, be warned",
  "about.strofeL3": "We're going to get wasted here",
  "about.strofeL4": "As if the world ends tomorrow",
  "about.keerzangL1": "Now the song of the Bruges wolves",
  "about.keerzangL2": "Radiantly we go to the dogs",
  "about.keerzangL3": "No chain can hold us back",
  "about.keerzangL4": "Shine on, Fenrir, have another one!",

  // Praesidium page
  "praesidium.title": "Praesidium",
  "praesidium.heading": "The Praesidium",
  "praesidium.subtitle":
    "The praesidium is the beating heart of Fenrir. A team of motivated students that organises activities, welcomes new members and keeps our club running.",
  "praesidium.whatTitle": "What the Praesidium Does",
  "praesidium.whatDescription":
    "From planning to promotion and from cantuses to sports and culture: every member has their own role and responsibility. Together they ensure a warm welcome, a well-filled calendar and unforgettable moments.",
  "praesidium.intro":
    "The praesidium consists of various roles such as praeses, vice-praeses, quaestor, ab-actis, cantor, party, media, sports, freshman master/tamer, culture & leisure, mentor/godmother/godfather... Every role contributes to how our club operates.",
  "praesidium.item1": "Praeses & Vice-Praeses: lead the team and guard the vision.",
  "praesidium.item2": "Quaestor & Ab-Actis: keep finances and administration in order.",
  "praesidium.item3": "Cantor & Party: provide atmosphere, cantus and events.",
  "praesidium.item4": "Media & PR: communication, socials and promotion.",
  "praesidium.item5": "Sports & Culture: activities for everyone.",
  "praesidium.item6": "Freshman work: welcomes new members with respect and fun.",
  "praesidium.outro":
    "Have questions or want to help make a difference? Talk to someone from the praesidium during an activity or send us a message through our channels.",
  "praesidium.yearsTitle": "Praesidium by Year",
  "praesidium.yearsDescription":
    "See who helped carry Fenrir over the past years.",

  // Sponsors page
  "sponsors.title": "Sponsors",
  "sponsors.heading": "Our Sponsors",
  "sponsors.subtitle":
    "Thanks to these great partners we can grow our organisation and support our students.",
  "sponsors.partnersTitle": "Fenrir's Partners",
  "sponsors.partnersDescription": "Together we make more possible for our members.",
  "sponsors.whyTitle": "Why Sponsor Fenrir?",
  "sponsors.whyDescription":
    "Reach students in Antwerp, build brand preference and create tangible impact.",
  "sponsors.becomeTitle": "Become a Sponsor?",
  "sponsors.becomeDescription":
    "A unique collaboration with mutual benefit: arranged quickly and without fuss.",
  "sponsors.intro":
    "We're happy to explore your goals (visibility, recruitment, activation) and put together a proposal based on them.",
  "sponsors.step1Title": "Introduction",
  "sponsors.step1Desc":
    "Aligning goals, target audience and timing for an optimal match.",
  "sponsors.step2Title": "Proposal",
  "sponsors.step2Desc":
    "A concrete tailor-made package (visibility, activation, recruitment).",
  "sponsors.step3Title": "Start",
  "sponsors.step3Desc": "Agree on the details and launch the campaign together.",
  "sponsors.contactTitle": "Interested or want more info?",
  "sponsors.contactCta": "Get in touch",
  "sponsors.partnerLabel": "partner",
  "sponsors.value1Title": "Reach & visibility",
  "sponsors.value1What": "Website, socials, mention at events",
  "sponsors.value1Impact": "More brand recognition",
  "sponsors.value2Title": "Talent & recruitment",
  "sponsors.value2What": "Introduction to members, internship and job posts",
  "sponsors.value2Impact": "Faster recruitment",
  "sponsors.value3Title": "Local anchoring",
  "sponsors.value3What": "Collaboration with an Antwerp club",
  "sponsors.value3Impact": "Community value",
  "sponsors.value4Title": "Activation at events",
  "sponsors.value4What": "Sampling, promo or stand options",
  "sponsors.value4Impact": "Direct interaction",
  "sponsors.value5Title": "Flexible packages",
  "sponsors.value5What": "Financial or in kind, short-term or yearly",
  "sponsors.value5Impact": "Efficient ROI",
  "sponsors.value6Title": "Content & storytelling",
  "sponsors.value6What": "Joint posts and case studies",
  "sponsors.value6Impact": "Relevant brand stories",

  // 404
  "notFound.title": "404 – Page not found",
  "notFound.alt": "404 – page not found",
  "notFound.heading": "Page not found",
  "notFound.subtitle":
    "This page doesn't exist or has been moved. Go back to the homepage.",
  "notFound.cta": "Back to home",

  // Footer
  "footer.label": "Fenrir Club",
  "footer.title": "Stay in the loop",
  "footer.description":
    "Follow us online for updates on events and much more",
  "footer.followHint": "Follow us",
  "footer.social": "Social",
  "footer.contact": "Contact",
  "footer.rights": "All rights reserved.",
  "footer.builtBy": "Built by the Fenrir Web Team.",
  "footer.openSource": "Open Source",
  "footer.contributors": "Contributors",
  "footer.humans": "{count} amazing humans",

  // Dynamic content components
  "preasidiumLid.noDescription": "No description provided.",
  "preasidiumLid.detailedInfo": "Detailed information about {name}",
};

export const ui: Record<Locale, Ui> = { nl, en };

/** Translate a single key for a locale, falling back to the default locale. */
export function useTranslations(lang: Locale) {
  return function t(key: UiKey): string {
    return ui[lang]?.[key] ?? ui[defaultLang][key];
  };
}

/**
 * Translate a praesidium role name (stored in Dutch in PocketBase) into the
 * requested locale. Club-specific roles without a translation fall back to
 * the original (Dutch) name.
 */
export const roleTranslations: Partial<Record<Locale, Record<string, string>>> = {
  en: {
    Feest: "Party",
    Sport: "Sports",
    "Cultuur & Ontspanning": "Culture & Leisure",
    Schachtenmeester: "Freshman Master",
    Schachtentemmer: "Freshman Tamer",
    Meter: "Godmother",
    Peter: "Godfather",
    Keizer: "Emperor",
    "Mentor/moeder": "Mentor/mother",
  },
};

export function translateRole(role: string, lang: Locale): string {
  return roleTranslations[lang]?.[role] ?? role;
}

/** Adjectives used for the random "… partner" label on sponsor cards. */
export const partnerAdjectives: Record<Locale, string[]> = {
  nl: [
    "Geweldige",
    "Uitstekende",
    "Fabuleuze",
    "Fantastische",
    "Prachtige",
    "Sublieme",
    "Magnifieke",
    "Adembenemende",
    "Indrukwekkende",
    "Uitzonderlijke",
    "Wonderbaarlijke",
  ],
  en: [
    "Amazing",
    "Outstanding",
    "Fabulous",
    "Fantastic",
    "Wonderful",
    "Superb",
    "Magnificent",
    "Remarkable",
    "Impressive",
    "Exceptional",
    "Incredible",
  ],
};
