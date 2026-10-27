// Adresse der Seite und ob Suchmaschinen sie aufnehmen dürfen. Nur mit SITE_INDEXABLE=true (Produktion) wird indexiert.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://xportal-vorschau.netlify.app'
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === 'true'

/** Einstieg in die App für Angemeldete: zeigt die Ladeanimation, später leitet sie auf app.x-portal.eu weiter. */
export const APP_START_PATH = '/app'

/** Ziel nach der Ladeanimation. Leer: Die Animation ist vorerst der Endpunkt, es wird nicht weitergeleitet. */
export const APP_URL = ''
