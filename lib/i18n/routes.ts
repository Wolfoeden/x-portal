// Seiten und Anker je Sprache. Deutsch ohne Präfix, Englisch unter /en.

export const LOCALES = ['de', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const PAGES = {
  home: { de: '/', en: '/en' },
  freelancer: { de: '/digitale-nomaden', en: '/en/digital-nomads' }, // bis 17.11.2026 /freelancer, /en/freelancers (Weiterleitung in next.config.ts)
  investors: { de: '/investoren', en: '/en/investors' },
  places: { de: '/orte', en: '/en/places' },
  contact: { de: '/kontakt', en: '/en/contact' },
  signIn: { de: '/anmelden', en: '/en/sign-in' },
  account: { de: '/konto', en: '/en/account' },
  imprint: { de: '/impressum', en: '/en/imprint' },
  privacy: { de: '/datenschutz', en: '/en/privacy' },
} as const
export type PageKey = keyof typeof PAGES

/** Anker-IDs je Sprache, damit Adressen wie /en#deck lesbar bleiben. */
export const IDS = {
  de: {
    project: 'projekt',
    reasons: 'begruendung',
    platform: 'plattform',
    data: 'daten',
    hubs: 'nodes',
    start: 'einstieg',
    team: 'team',
    services: 'leistungen',
    pricing: 'preise',
    contact: 'kontakt',
    imprint: 'impressum',
    privacy: 'datenschutz',
    terms: 'agb',
    signIn: 'anmelden',
    doorCompanies: 'unternehmen',
    doorFreelancers: 'nomaden',
    doorInvestors: 'investoren',
    profile: 'profil',
    requests: 'anfragen',
    private: 'privat',
    workplace: 'arbeitsort',
    costs: 'kosten',
    faq: 'fragen',
    loop: 'kreislauf',
    whyNow: 'warum-jetzt',
    revenue: 'erloese',
    hub01: 'node001',
    plots: 'mieten',
    about: 'wer-wir-sind',
    status: 'stand',
    capital: 'kapital',
    roadmap: 'roadmap',
    deck: 'deck',
    place: 'ort',
    offers: 'angebote',
    day: 'ein-tag',
    plan: 'fahrplan',
    detail: 'detailplan',
    placeInvestors: 'fuer-investoren',
    everyday: 'alltag',
    waitlist: 'warteliste',
    topicAutomation: 'ki-automatisierung',
    topicTraining: 'ki-schulung',
    topicIsms: 'isms',
    topicPlaces: 'orte',
  },
  en: {
    project: 'project',
    reasons: 'reasons',
    platform: 'platform',
    data: 'data',
    hubs: 'nodes',
    start: 'start',
    team: 'team',
    services: 'services',
    pricing: 'pricing',
    contact: 'contact',
    imprint: 'imprint',
    privacy: 'privacy',
    terms: 'terms',
    signIn: 'sign-in',
    doorCompanies: 'companies',
    doorFreelancers: 'nomads',
    doorInvestors: 'investors',
    profile: 'profile',
    requests: 'requests',
    private: 'private',
    workplace: 'workplace',
    costs: 'costs',
    faq: 'faq',
    loop: 'flywheel',
    whyNow: 'why-now',
    revenue: 'revenue',
    hub01: 'node001',
    plots: 'rent',
    about: 'about',
    status: 'status',
    capital: 'capital',
    roadmap: 'roadmap',
    deck: 'deck',
    place: 'place',
    offers: 'offers',
    day: 'a-day',
    plan: 'plan',
    detail: 'detail-plan',
    placeInvestors: 'for-investors',
    everyday: 'everyday',
    waitlist: 'waitlist',
    topicAutomation: 'ai-automation',
    topicTraining: 'ai-training',
    topicIsms: 'isms',
    topicPlaces: 'places',
  },
} satisfies Record<Locale, Record<string, string>>
export type Ids = (typeof IDS)['de']
export type IdKey = keyof Ids

export function pagePath(page: PageKey, locale: Locale) {
  return PAGES[page][locale]
}

/** Kontaktthemen stehen in der Adresse, damit auch ein Klick im Menü auf der Kontaktseite das Thema wechselt. */
export const TOPIC_PARAM = { de: 'thema', en: 'topic' } as const
export const TOPIC_ANCHORS = ['topicAutomation', 'topicTraining', 'topicIsms', 'topicPlaces'] as const satisfies readonly IdKey[]

/** Pfad mit Anker, z. B. pageHref('home', 'en', 'deck') → /en#deck. Themen der Kontaktseite → /kontakt?thema=isms. */
export function pageHref(page: PageKey, locale: Locale, anchor?: IdKey) {
  const path = PAGES[page][locale]
  if (!anchor) return path
  if (page === 'contact' && (TOPIC_ANCHORS as readonly IdKey[]).includes(anchor)) return `${path}?${TOPIC_PARAM[locale]}=${IDS[locale][anchor]}`
  return `${path}#${IDS[locale][anchor]}`
}

/** Das Kontaktthema aus `?thema=` in der anderen Sprache, falls es eins gibt. */
export function translateTopic(search: string, from: Locale, to: Locale) {
  const slug = new URLSearchParams(search).get(TOPIC_PARAM[from])
  const key = TOPIC_ANCHORS.find((item) => IDS[from][item] === slug)
  return key ? `?${TOPIC_PARAM[to]}=${IDS[to][key]}` : ''
}

/** Welche Seite ein Pfad ist, egal in welcher Sprache. */
export function pageOf(pathname: string): { page: PageKey; locale: Locale } | null {
  const clean = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  for (const page of Object.keys(PAGES) as PageKey[]) {
    for (const locale of LOCALES) if (PAGES[page][locale] === clean) return { page, locale }
  }
  return null
}

/** Der gleiche Anker in der anderen Sprache, falls es ihn gibt. */
export function translateAnchor(hash: string, from: Locale, to: Locale) {
  const id = hash.replace(/^#/, '')
  const key = (Object.keys(IDS[from]) as IdKey[]).find((item) => IDS[from][item] === id)
  return key ? `#${IDS[to][key]}` : ''
}
