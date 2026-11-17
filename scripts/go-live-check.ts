// Go-live-Prüfung der Website (Plan vom 17.11.2026, AP-A13 „Website online schalten“).
// Listet, was vor dem Merge auf main noch offen ist. Die Vorschau baut trotzdem; gemergt wird erst bei leerer Liste.
// Aufruf: pnpm check:golive   (Exit-Code 1, solange etwas offen ist)

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')
const blockers: string[] = []

// 1. Platzhalter ⟦…⟧ in Impressum und Datenschutz (Antwort vom 17.11.2026: „Daten folgen, Platzhalter“).
for (const locale of ['de', 'en']) {
  const found = read(`lib/i18n/${locale}.ts`).match(/⟦[^⟧]*⟧/g) ?? []
  if (found.length) blockers.push(`Wörterbuch ${locale}: ${found.length} Platzhalter, z. B. ${found.slice(0, 3).join(', ')}`)
}

// 2. Rechtliches ist als Entwurf markiert, bis ein Jurist geprüft hat. Danach legal.draft im Wörterbuch leeren.
if (/draft: '[^']+'/.test(read('lib/i18n/de.ts').split('\n  legal: {')[1] ?? '')) blockers.push('Impressum und Datenschutz: noch „Entwurf, juristisch zu prüfen“')

// 3. Migrationen, die in Supabase noch nicht eingespielt sind. Nach dem Einspielen hier austragen (nur mit OK der Projektleitung).
const pending = ['20261103090000_warteliste.sql']
for (const file of pending) {
  if (existsSync(join(root, 'supabase/migrations', file))) blockers.push(`Supabase: Migration ${file} einspielen (Whitelist braucht die Tabelle)`)
}

// 4. Alter Stand in den Texten (dieselbe Prüfung wie für die Planungsseiten).
try {
  execFileSync('python3', [join(root, 'plan/pruefe_alle.py')], { stdio: 'pipe' })
} catch (error) {
  const out = String((error as { stdout?: Buffer }).stdout ?? '')
  blockers.push(`Texte mit altem Stand: ${out.trim().split('\n').pop() ?? 'pruefe_alle.py meldet Fehler'}`)
}

// 5. Produktion muss indexierbar sein und die echte Adresse kennen (Netlify-Umgebung, nicht im Repository).
blockers.push('Netlify Produktion: SITE_INDEXABLE=true und NEXT_PUBLIC_SITE_URL=https://x-portal.eu setzen und prüfen (hier nicht sichtbar)')

if (blockers.length) {
  console.log(`Noch nicht bereit für main (${blockers.length}):`)
  for (const item of blockers) console.log(`- ${item}`)
  process.exit(1)
}
console.log('Bereit für main.')
