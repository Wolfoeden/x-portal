// Rückkehr vom Bestätigungslink der Warteliste: /orte?waitlist=ok#warteliste oder ?waitlist=expired.
// Eigene Datei ohne server-only, weil Server (Weiterleitung) und Formular (Anzeige) denselben Namen brauchen.
export const WAITLIST_RESULT_PARAM = 'waitlist'
export type WaitlistResultValue = 'ok' | 'expired'
