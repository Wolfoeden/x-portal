// Seiten und Anker je Sprache. Deutsch ohne Präfix, Englisch unter /en.

export const LOCALES = ['de', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const PAGES = {
  home: { de: '/', en: '/en' },
  freelancer: { de: '/freelancer', en: '/en/freelancers' },
  investors: { de: '/investoren', en: '/en/investors' },
  places: { de: '/orte', en: '/en/places' },
  contact: { de: '/kontakt', en: '/en/contact' },
  signIn: { de: '/anmelden', en: '/en/sign-in' },
  account: { de: '/konto', en: '/en/account' },
} as const
export type PageKey = keyof typeof PAGES

/** Anker-IDs je Sprache, damit Adressen wie /en#deck lesbar bleiben. */
export const IDS = {
  de: {
    project: 'projekt',
    reasons: 'begruendung',
    platform: 'plattform',
    data: 'daten',
    hubs: 'hubs',
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
    doorFreelancers: 'freelancer',
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
    hub01: 'hub-01',
    roadmap: 'roadmap',
    deck: 'deck',
    place: 'ort',
    offers: 'angebote',
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
    hubs: 'hubs',
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
    doorFreelancers: 'freelancers',
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
    hub01: 'hub-01',
    roadmap: 'roadmap',
    deck: 'deck',
    place: 'place',
    offers: 'offers',
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
