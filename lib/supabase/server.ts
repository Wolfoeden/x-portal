import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AUTH_COOKIE_OPTIONS, OAUTH_PROVIDERS, supabasePublicEnv, type OAuthProvider } from '@/lib/supabase/env'

/**
 * Welche Anmeldewege in Supabase eingeschaltet sind. So zeigt die Seite keinen Knopf, der auf einer Fehlerseite von
 * Supabase endet. Antwortet Supabase nicht, zeigt sie alle, damit nichts still verschwindet.
 */
export async function enabledSignInMethods(): Promise<{ oauth: OAuthProvider[]; email: boolean } | null> {
  const env = supabasePublicEnv()
  if (!env) return null
  try {
    const response = await fetch(`${env.url}/auth/v1/settings`, {
      headers: { apikey: env.publishableKey },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3_000),
    })
    if (!response.ok) throw new Error(`settings ${response.status}`)
    const settings = (await response.json()) as { external?: Record<string, boolean> }
    return { oauth: OAUTH_PROVIDERS.filter((provider) => settings.external?.[provider] === true), email: settings.external?.email !== false }
  } catch {
    return { oauth: [...OAUTH_PROVIDERS], email: true }
  }
}

/** Supabase mit der Sitzung des Besuchers (RLS greift). Für Seiten und Route Handler. */
export async function serverSupabase() {
  // Erst die Cookies: Damit bleibt jede Seite, die das hier nutzt, dynamisch, auch ohne Variablen beim Bauen.
  const cookieStore = await cookies()
  const env = supabasePublicEnv()
  if (!env) return null
  return createServerClient(env.url, env.publishableKey, {
    cookieOptions: AUTH_COOKIE_OPTIONS,
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options)
        } catch {
          // Server-Komponenten dürfen keine Cookies schreiben; das übernimmt proxy.ts auf den Kontoseiten.
        }
      },
    },
  })
}
