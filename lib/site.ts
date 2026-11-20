// Adresse der Seite und ob Suchmaschinen sie aufnehmen dürfen.
// Indexiert wird nur, wenn SITE_INDEXABLE=true gesetzt ist (Netlify: nur im Production-Kontext).
// Deploy-Previews und Branch-Deploys bleiben noindex, auch wenn die Variable dort versehentlich mit true ankommt.
export function siteIsIndexable(context: string | undefined, flag: string | undefined): boolean {
  if (context === 'deploy-preview' || context === 'branch-deploy') return false
  return flag === 'true'
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://xportal-vorschau.netlify.app'
export const SITE_INDEXABLE = siteIsIndexable(process.env.CONTEXT, process.env.SITE_INDEXABLE)

/** Einstieg in die App für Angemeldete: zeigt die Ladeanimation, später leitet sie auf app.x-portal.eu weiter. */
export const APP_START_PATH = '/app'

/** Ziel nach der Ladeanimation. Leer: Die Animation ist vorerst der Endpunkt, es wird nicht weitergeleitet. */
export const APP_URL = ''
