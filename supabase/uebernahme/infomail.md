# Infomail an die übernommenen Freelancer (Entwurf, wartet auf Freigabe)

Geht an die 6 Freelancer mit eigenem Konto, **nach** der Übernahme und **bevor** die neue Seite live ist.
Es ist eine Vorgangsmail an bestehende Nutzer (Art. 13 DSGVO), keine Werbung. Ohne Freigabe des Betreibers wird nichts verschickt.
Platzhalter in eckigen Klammern. Impressum und Datenschutzerklärung müssen vorher online sein.

---

**Betreff:** Ihr XPORTAL-Profil zieht um

Guten Tag [Vorname],

Sie haben bei XPORTAL ein Freelancer-Profil angelegt. Wir bauen die Plattform neu und haben Ihr Profil dorthin übernommen. Sie müssen dafür nichts tun.

**Was übernommen wurde**
- Ihr Konto mit derselben Anmeldung (Magic Link, LinkedIn oder GitHub)
- Ihr Profil: Rolle, Stärken, Sprachen, Tagessatz, Verfügbarkeit, Arbeitsort, Beschreibung
- Ihre Referenzprojekte und, falls vorhanden, Lebenslauf und Foto

**Was sich ändert**
- Die Daten liegen in einer neuen Datenbank in der EU ([Frankfurt]), betrieben von Supabase. Zweck und Rechtsgrundlage bleiben gleich: die Vermittlung von Projekten (Art. 6 Abs. 1 lit. b DSGVO).
- Ihre Kontaktdaten bleiben privat. Unternehmen sehen Ihr Profil ohne E-Mail und Telefon und erreichen Sie nur über eine Vorstellung durch uns.
- Öffentlich zeigen wir Profile nur mit Ihrer Zustimmung, siehe unten. Bisher hatten Sie keiner öffentlichen Anzeige zugestimmt, deshalb ist Ihr Profil auf der Website nicht zu sehen.

**Freiwillig: Ihr Profil auf der Website zeigen**
Auf der Startseite stellen wir echte Profile vor, mit Vornamen, Rolle, Stärken, Verfügbarkeit und Arbeitsort, ohne Nachnamen und ohne Kontaktdaten. Wenn Sie dabei sein möchten:
[Ja, mein Profil auf der Website zeigen]
Sie können das jederzeit in Ihrem Konto zurücknehmen.

**Bitte prüfen**
[Profil ansehen und ergänzen] – [nur wenn Entwurf: Damit Ihr Profil Projekte bekommt, fehlen noch: …]

Wenn Sie den Umzug nicht möchten, antworten Sie auf diese Mail. Dann löschen wir Ihr Konto und alle Daten. Mehr zu Ihren Rechten steht in der Datenschutzerklärung: [Link].

Viele Grüße
[Name]
XPORTAL · [Impressum-Link]

---

## Einwilligungstext „Profil auf der Website“ (Version `showcase-2026-10`)

Wird so im Konto und auf der Seite hinter dem Link angezeigt und mit Version und Zeitpunkt in `consents` gespeichert.

> **DE:** Ich bin einverstanden, dass XPORTAL mein Profil auf der Website zeigt: Vorname, Rolle, Stärken, Sprachen, Verfügbarkeit, Arbeitsort, Tagessatz und, falls hochgeladen, mein Foto. Nachname und Kontaktdaten werden nicht gezeigt. Ich kann die Einwilligung jederzeit im Konto widerrufen; das Profil verschwindet dann sofort von der Website.

> **EN:** I agree that XPORTAL may show my profile on its website: first name, role, skills, languages, availability, work mode, day rate and, if uploaded, my photo. My last name and contact details are not shown. I can withdraw this consent at any time in my account; the profile is then removed from the website immediately.

Getrennt davon, ebenfalls freiwillig (Version `search-index-2026-10`):

> **DE:** Meine Profilseite darf in Suchmaschinen wie Google erscheinen.
>
> **EN:** My profile page may appear in search engines such as Google.
