// Länder für das Whitelist-Formular (ISO 3166-1 alpha-2). Die Namen kommen aus Intl.DisplayNames in der Sprache der Seite.

export const COUNTRY_CODES = (
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ ' +
  'DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT ' +
  'JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI ' +
  'NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK ' +
  'TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW'
).split(' ')

/** Häufige Länder der Zielgruppe zuerst, danach alle übrigen alphabetisch. */
export const TOP_COUNTRIES = ['DE', 'AT', 'CH', 'UA', 'PL', 'NL', 'GB', 'US']

export function countryOptions(locale: 'de' | 'en') {
  const names = new Intl.DisplayNames([locale], { type: 'region' })
  const name = (code: string) => names.of(code) ?? code
  const rest = COUNTRY_CODES.filter((code) => !TOP_COUNTRIES.includes(code))
    .map((code) => ({ code, name: name(code) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale))
  return { top: TOP_COUNTRIES.map((code) => ({ code, name: name(code) })), rest }
}

/** Land aus der Browsersprache, z. B. de-AT → AT. Leer, wenn keins erkennbar ist. */
export function countryFromLanguages(languages: readonly string[]) {
  for (const tag of languages) {
    const region = tag.split('-')[1]?.toUpperCase()
    if (region && COUNTRY_CODES.includes(region)) return region
  }
  return ''
}
