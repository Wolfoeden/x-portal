// Öffentliche Supabase-Werte: dürfen in den Browser. Fehlen sie, ist die Anmeldung aus, die Seite läuft weiter.
export function supabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  return url && publishableKey ? { url, publishableKey } : null
}

/** Anmeldewege wie im alten Projekt, dazu der Link per E-Mail. */
export const OAUTH_PROVIDERS = ['google', 'linkedin_oidc', 'github'] as const
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number]

export const AUTH_COOKIE_OPTIONS = { path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production' } as const

/** Nur Pfade auf dieser Seite, nie `//fremd.de` oder Steuerzeichen. */
export function safePath(candidate: string | null, fallback: string) {
  if (!candidate?.startsWith('/') || candidate.startsWith('//') || /[\\\u0000-\u001f\u007f]/u.test(candidate)) return fallback
  const target = new URL(candidate, 'https://xportal.invalid/')
  return target.origin === 'https://xportal.invalid' ? `${target.pathname}${target.search}` : fallback
}
