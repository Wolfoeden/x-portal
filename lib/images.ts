// Alle Bilder der Seiten Orte und Investoren an einer Stelle: Datei, Art der Entstehung, Name im Bildnachweis.
// Die Kennzeichnung (das kleine i) und der Bildnachweis lesen beide hier, damit sie sich nicht widersprechen.
//   drone:  Drohnenfoto des Grundstücks, Gebäude mit KI eingesetzt
//   render: Schaubild, vollständig mit KI erstellt
// Neu am 17.11.2026: hang-kommunalgebaeude und zielbild-node001 aus dem Whitepaper (plan/whitepaper/bilder).

export type ImageKind = 'drone' | 'render'
export type ImageKey = 'hub01' | 'community' | 'unit' | 'blocks' | 'path' | 'terrace' | 'slope' | 'target'

export const IMAGES: Record<ImageKey, { src: string; kind: ImageKind }> = {
  hub01: { src: '/orte/hub-01-hang.webp', kind: 'drone' },
  community: { src: '/orte/gemeinschaftshaus-hang.webp', kind: 'drone' },
  unit: { src: '/orte/modul-wald.webp', kind: 'drone' },
  blocks: { src: '/orte/holzbloecke.webp', kind: 'render' },
  path: { src: '/orte/gemeinschaft-weg.webp', kind: 'drone' },
  terrace: { src: '/orte/terrasse-abend.webp', kind: 'drone' },
  slope: { src: '/orte/hang-kommunalgebaeude.webp', kind: 'render' },
  target: { src: '/orte/zielbild-node001.webp', kind: 'render' },
}

/** Wo welches Bild zu sehen ist, für den Bildnachweis. blocks, path und terrace stehen seit dem 17.11.2026 auf keiner Seite (Abschnitt „Alltag“ entfallen). */
export const IMAGE_USE: Record<ImageKey, ('places' | 'investors')[]> = {
  hub01: ['places', 'investors'],
  community: ['places'],
  unit: ['places'],
  blocks: [],
  path: [],
  terrace: [],
  slope: ['places', 'investors'],
  target: ['places', 'investors'],
}
