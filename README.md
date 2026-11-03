# XPORTAL

Website x-portal.eu: KI-Matching für Projekte, Freelancer-Konten, Kontakt. Deutsch unter `/`, Englisch unter `/en`.

- Next.js 16 (App Router) auf Netlify, Supabase (Auth, Postgres mit RLS, Storage), OpenAI für Brief und Matching, IONOS-SMTP für Mails.
- Datenbank: `supabase/migrations/` (eingespielt im Projekt `xportal2027`), Tests in `supabase/tests/`.
- Lokal: `pnpm install`, `pnpm dev`, Prüfung mit `npx tsc --noEmit -p .`, `npx vitest run`, `pnpm build`.
- Geheime Werte nur als Umgebungsvariablen in Netlify, nie im Repo.
- Deploy: Netlify baut `main` automatisch. Bei privatem Repo baut Netlify nur Commits von Mitgliedern des Netlify-Teams. Änderungen von Claude kommen deshalb als PR; erst der Merge in GitHub löst den Deploy aus.
