import { ProfileInput } from '@/lib/profile/schema'

// Entwurf aus dem Assistenten auf /freelancer, bis das Konto bestätigt ist. localStorage statt sessionStorage,
// weil der Link aus der Mail in einem neuen Tab öffnet. Nach einem Tag oder nach dem Speichern ist er weg.

const KEY = 'xportal:profil-entwurf'
const MAX_AGE_MS = 24 * 60 * 60 * 1_000

export function keepPendingProfile(profile: ProfileInput) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), profile }))
  } catch {
    // Ohne Speicher im Browser legt man das Profil nach der Anmeldung im Konto an.
  }
}

export function readPendingProfile(): ProfileInput | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const stored = JSON.parse(raw) as { at?: unknown; profile?: unknown }
    if (typeof stored.at !== 'number' || Date.now() - stored.at > MAX_AGE_MS) {
      window.localStorage.removeItem(KEY)
      return null
    }
    const parsed = ProfileInput.safeParse(stored.profile)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function dropPendingProfile() {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // nichts zu tun
  }
}
