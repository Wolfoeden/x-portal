// Prüft die Texte der Website gegen die Schreibregeln vom 17.11.2026 (StoryBrand, fürs Handy geschrieben).
//   - höchstens 20 Wörter je Satz
//   - Überschriften (Schlüssel title, titleGray) höchstens 6 Wörter
//   - Seitentitel höchstens 60 Zeichen, Beschreibungen der Hauptseiten 120–155 Zeichen
//   - Kernaussagen höchstens dreimal je Seite (z. B. „2027“, „kein Verkauf“)
// Aufruf: pnpm check:copy   (Exit-Code 1 bei Treffern)

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const MAX_SENTENCE = 20
const MAX_HEADING = 6
const MAIN_PAGES = ['home', 'freelancer', 'investors', 'places', 'contact']
// Kernaussagen, die je Seitenblock nicht ständig wiederholt werden sollen.
const REPEATS: [RegExp, number][] = [
  [/2027/g, 3],
  [/kein Verkauf|Verkauft wird nichts|verkaufen sie nicht|nothing (is )?(for sale|sold)|do not sell/gi, 2],
]
// Rechtstexte und Fachlisten sind ausgenommen von der Satzlänge (Wortlaut der Pflichtangaben).
const SKIP_BLOCKS = new Set(['legal', 'talentRoles', 'live', 'account', 'auth'])

const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length
const problems: string[] = []

for (const locale of ['de', 'en']) {
  const source = readFileSync(join(root, `lib/i18n/${locale}.ts`), 'utf8')
  // Oberste Blöcke (zwei Leerzeichen eingerückt) und ihre Texte.
  const blocks = new Map<string, string>()
  let current = ''
  for (const line of source.split('\n')) {
    const top = line.match(/^ {2}(\w+): (?:\{|typed)/)
    if (top) current = top[1]
    blocks.set(current, (blocks.get(current) ?? '') + line + '\n')
  }
  for (const [block, text] of blocks) {
    if (!block || SKIP_BLOCKS.has(block)) continue
    for (const match of text.matchAll(/(?:(\w+): )?'((?:[^'\\]|\\.)*)'/g)) {
      const key = match[1] ?? ''
      const value = match[2]
      if (/^(src|href|id|key|icon|photo|linkedin|skill|who|use|tone)$/.test(key)) continue
      for (const sentence of value.split(/(?<=[.!?:])\s+/)) {
        if (words(sentence) > MAX_SENTENCE) problems.push(`${locale} ${block}.${key}: Satz mit ${words(sentence)} Wörtern: „${sentence.slice(0, 90)}…“`)
      }
      if ((key === 'title' || key === 'titleGray') && block !== 'meta' && words(value) > MAX_HEADING) problems.push(`${locale} ${block}.${key}: Überschrift mit ${words(value)} Wörtern: „${value}“`)
    }
    for (const [pattern, max] of REPEATS) {
      const hits = text.replace(/^\s*\/\/.*$/gm, '').match(pattern) ?? []
      if (block !== 'seo' && block !== 'meta' && hits.length > max) problems.push(`${locale} ${block}: „${pattern.source}“ ${hits.length}× (höchstens ${max})`)
    }
  }
  const meta = blocks.get('meta') ?? ''
  for (const match of meta.matchAll(/ {4}(\w+): \{\n {6}title: '([^']*)',\n {6}description: '([^']*)',/g)) {
    const [, page, title, description] = match
    if (title.length > 60) problems.push(`${locale} meta.${page}: Titel ${title.length} Zeichen (höchstens 60)`)
    if (MAIN_PAGES.includes(page) && (description.length < 120 || description.length > 155)) problems.push(`${locale} meta.${page}: Beschreibung ${description.length} Zeichen (120–155)`)
  }
}

if (problems.length) {
  console.log(`Texte: ${problems.length} Stellen`)
  for (const item of problems) console.log(`- ${item}`)
  process.exit(1)
}
console.log('Texte: alle Regeln eingehalten.')
