// Setzt vor dem ersten Zeichnen data-auth="in" am <html>, wenn ein Supabase-Sitzungscookie da ist.
// Der Header zeigt dann „Konto“ statt „Anmelden“, und „Projekt starten“ führt in die App. Ohne Flackern und
// ohne dass Seiten dynamisch werden. Das ist nur Anzeige: Geschützt wird auf dem Server mit der echten Sitzung.
// Das Cookie heißt sb-<Projekt>-auth-token, bei großen Sitzungen in Stücken (.0, .1); -code-verifier zählt nicht.
const SCRIPT = `try{if(/(?:^|;\\s*)sb-[a-z0-9]+-auth-token(?:\\.\\d+)?=/.test(document.cookie))document.documentElement.dataset.auth='in'}catch(e){}`

export function AuthStateScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
}
