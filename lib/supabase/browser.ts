'use client'

import { createBrowserClient } from '@supabase/ssr'
import { AUTH_COOKIE_OPTIONS, supabasePublicEnv } from '@/lib/supabase/env'

let client: ReturnType<typeof createBrowserClient> | null = null

/** Supabase im Browser, nur mit dem öffentlichen Schlüssel. null, solange die Variablen fehlen. */
export function browserSupabase() {
  if (client) return client
  const env = supabasePublicEnv()
  if (!env) return null
  client = createBrowserClient(env.url, env.publishableKey, { cookieOptions: AUTH_COOKIE_OPTIONS, isSingleton: true })
  return client
}
