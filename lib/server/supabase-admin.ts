import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { supabaseConfig } from '@/lib/server/env'

/** Server-Zugriff mit dem Service-Role-Schlüssel. Nie im Browser verwenden. */
export function supabaseAdmin(): SupabaseClient | null {
  const config = supabaseConfig()
  if (!config) return null
  return createClient(config.url, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
