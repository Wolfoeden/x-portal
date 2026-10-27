# Datenbank (Supabase)

## Migrationen (`migrations/`)

| Datei | Inhalt |
|---|---|
| `…090000_grundlagen` | Keine automatischen API-Rechte mehr in `public`, Schemas `private`/`ops`/`audit`, Aufzählungen, Änderungsprotokoll |
| `…090100_konten_und_freelancer` | Konto (`profiles`), `freelancers`, Referenzprojekte, Lebensläufe, Einwilligungen (`consents`) |
| `…090200_startseite` | `showcase_profiles`: öffentliche Profilkarten, nur mit Einwilligung, per Trigger gepflegt |
| `…090300_kontakt` | Anfragen, Kontaktformular, Deck-Anfragen, Sperrliste, `consume_rate_limit` |
| `…090400_zahlungen` | Bestellungen (Stripe und Cardano), Webhook-Ereignisse, Abos, Stripe-Kunden |
| `…090500_speicher` | Private Buckets `avatars` und `cvs`, Zugriff nur auf den eigenen Ordner |
| `…090600_backoffice` | Sichten für Studio: `ops.posteingang`, `ops.freelancer`, `ops.zahlungen`, `ops.wochenzahlen` |

Regeln:
- Jede Tabelle hat RLS und eigene Grants. Ohne Konto ist nur `showcase_profiles` lesbar.
- Formulare schreibt nur der Server mit dem Service-Role-Schlüssel.
- Einwilligungen werden nur angefügt. Der letzte Eintrag je Zweck gilt, die Spalten `consent_*` folgen per Trigger.
- Ein Profil ist erst veröffentlicht, wenn Rolle, mindestens eine Stärke, Tagessatz und Arbeitsort gesetzt sind.

## Tests (`tests/database/`)

pgTAP, läuft mit `supabase test db`. Geprüft wird, wer was sehen und ändern darf: fremde Profile, Einwilligung, Widerruf, Speicher, Anfragen, Bestellungen und Rate-Limit.

## Übernahme aus x-portal.eu (`uebernahme/`)

Nur die Freelancer mit eigenem Konto (Stand 26.10.2026: 6 Konten, 12 Projekte, 5 Lebensläufe, 2 Fotos).
1. `1-export-alt.sql` im alten Projekt ausführen. Liest nur und gibt ein JSON aus, ohne Passwort-Hashes.
2. `2-import-neu.sql` im neuen Projekt ausführen, `__PAYLOAD__` durch das JSON ersetzen. Der Lauf ist wiederholbar und endet mit dem Abgleich der Zahlen.
3. `3-dateien-kopieren.mjs` lokal ausführen, mit den Service-Role-Schlüsseln beider Projekte als Umgebungsvariablen.
4. `infomail.md` an die Übernommenen schicken, erst nach Freigabe.

Nicht übernommen: Passwörter (die Anmeldung läuft über Magic Link und OAuth), alte Einwilligungen (es gab keine für eine öffentliche Anzeige), das gekündigte Stripe-Abo (übernommen wird nur die Kunden-ID).
