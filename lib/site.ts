// Adresse der Seite und ob Suchmaschinen sie aufnehmen dürfen. Nur mit SITE_INDEXABLE=true (Produktion) wird indexiert.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://xportal-vorschau.netlify.app'
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === 'true'
