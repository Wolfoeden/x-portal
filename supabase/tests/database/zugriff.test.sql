-- Zugriffsregeln: wer darf was sehen und ändern. Läuft mit `supabase test db`.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(46);

-- Grundsätzliches --------------------------------------------------------------------

select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity),
  0, 'Jede Tabelle in public hat RLS');

select is(
  (select array_agg(table_name::text order by table_name) from information_schema.role_table_grants
    where grantee = 'anon' and table_schema = 'public'),
  array['showcase_profiles'], 'anon darf nur die Profilkarten lesen');

select is(
  (select array_agg(distinct privilege_type::text) from information_schema.role_table_grants
    where grantee = 'anon' and table_schema = 'public'),
  array['SELECT'], 'anon darf nur lesen');

select ok(not has_function_privilege('anon', 'public.consume_rate_limit(text, text, integer, integer)', 'execute'), 'anon darf das Rate-Limit nicht aufrufen');
select ok(not has_function_privilege('authenticated', 'public.consume_rate_limit(text, text, integer, integer)', 'execute'), 'Konten dürfen das Rate-Limit nicht aufrufen');
select ok(not has_schema_privilege('anon', 'ops', 'usage') and not has_schema_privilege('authenticated', 'ops', 'usage'), 'ops ist für die API gesperrt');
select ok(not has_schema_privilege('authenticated', 'audit', 'usage'), 'audit ist für die API gesperrt');
select ok(not has_schema_privilege('authenticated', 'private', 'usage'), 'private ist für die API gesperrt');

-- Zwei Konten -------------------------------------------------------------------------

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'mara@example.com', '{"full_name": "Mara Muster", "locale": "en"}'),
  ('22222222-2222-2222-2222-222222222222', 'ben@example.com', '{}');

select is((select locale::text from profiles where id = '11111111-1111-1111-1111-111111111111'), 'en', 'Konto bekommt ein Profil mit Sprache');

-- Konto A legt ein Profil an.
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$insert into freelancers (first_name, last_name, role_title, skills) values ('Mara', 'Muster', 'KI-Entwicklerin', array['RAG', 'Python'])$$,
  'Konto legt eigenes Profil an');
select matches((select slug::text from freelancers), '^mara-[0-9a-f]{6}$', 'Slug wird aus dem Vornamen erzeugt');
select is((select status::text from freelancers), 'draft', 'Neues Profil ist ein Entwurf');

select throws_ok(
  $$update freelancers set verification = 'operator_verified'$$,
  '42501', null, 'Prüfstufe kann das Konto nicht selbst setzen');
select throws_ok(
  $$update freelancers set consent_showcase = true$$,
  '42501', null, 'Einwilligung lässt sich nicht direkt setzen');
select throws_ok(
  $$update freelancers set slug = 'chef'$$,
  '42501', null, 'Slug setzt nur der Server');
select throws_ok(
  $$update freelancers set status = 'published'$$,
  '23514', null, 'Unvollständiges Profil lässt sich nicht veröffentlichen');

select lives_ok(
  $$update freelancers set role_key = 'ki', day_rate_eur = 950, work_mode = 'both', availability = 'now', status = 'published'$$,
  'Vollständiges Profil wird veröffentlicht');
select isnt((select published_at from freelancers), null, 'Veröffentlichungszeit gesetzt');
select is((select count(*)::int from showcase_profiles), 0, 'Ohne Einwilligung keine Profilkarte');

select lives_ok(
  $$insert into consents (purpose, granted, text_version) values ('showcase', true, 'showcase-2026-10')$$,
  'Einwilligung für die Website erteilen');
select is((select first_name from showcase_profiles), 'Mara', 'Mit Einwilligung erscheint die Profilkarte');
select is((select indexable from showcase_profiles), false, 'Ohne Einwilligung „search_index“ nicht in Suchmaschinen');
select hasnt_column('public', 'showcase_profiles', 'last_name', 'Profilkarte hat keinen Nachnamen');

select throws_ok(
  $$update freelancers set avatar_path = '22222222-2222-2222-2222-222222222222/foto.jpg'$$,
  '23514', null, 'Foto aus fremdem Ordner wird abgelehnt');

select lives_ok(
  $$insert into storage.objects (bucket_id, name) values ('avatars', '11111111-1111-1111-1111-111111111111/foto.jpg')$$,
  'Foto in eigenen Ordner hochladen');
select throws_ok(
  $$insert into storage.objects (bucket_id, name) values ('cvs', '22222222-2222-2222-2222-222222222222/cv.pdf')$$,
  '42501', null, 'Datei in fremden Ordner wird abgelehnt');

select throws_ok(
  $$insert into requests (kind, brief, contact_name, contact_email) values ('team', 'Wir brauchen einen Chatbot.', 'Test', 'a@b.de')$$,
  '42501', null, 'Anfragen schreibt nur der Server');

-- Konto B sieht und ändert nichts von A.
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is((select count(*)::int from freelancers), 0, 'Fremdes Profil ist unsichtbar');
select is((select count(*)::int from profiles), 1, 'Nur das eigene Konto ist sichtbar');
select is((select count(*)::int from showcase_profiles), 1, 'Profilkarten sind für alle lesbar');
update freelancers set first_name = 'Hack' where first_name = 'Mara';
select throws_ok(
  $$insert into freelancer_projects (freelancer_id, title) select freelancer_id, 'Fremdes Projekt' from showcase_profiles$$,
  '42501', null, 'Kein Projekt in fremdes Profil');
select is((select count(*)::int from storage.objects), 0, 'Fremde Dateien sind unsichtbar');
select throws_ok(
  $$insert into consents (user_id, purpose, granted, text_version) values ('11111111-1111-1111-1111-111111111111', 'showcase', false, 'x')$$,
  '42501', null, 'Keine Einwilligung im Namen eines anderen Kontos');

-- Ohne Konto
set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select is((select count(*)::int from showcase_profiles), 1, 'Besucher sehen die Profilkarten');
select throws_ok($$select * from freelancers$$, '42501', null, 'Besucher lesen keine Profile direkt');
select throws_ok($$select * from orders$$, '42501', null, 'Besucher lesen keine Bestellungen');

reset role;
select is((select first_name from freelancers), 'Mara', 'Änderung durch fremdes Konto blieb wirkungslos');

-- Widerruf und Pause
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
insert into consents (purpose, granted, text_version) values ('showcase', false, 'showcase-2026-10');
select is((select count(*)::int from showcase_profiles), 0, 'Widerruf entfernt die Profilkarte sofort');
insert into consents (purpose, granted, text_version) values ('showcase', true, 'showcase-2026-10');
update freelancers set status = 'paused' where user_id = '11111111-1111-1111-1111-111111111111';
select is((select count(*)::int from showcase_profiles), 0, 'Pausiertes Profil hat keine Profilkarte');

-- Server: Anfragen, Rate-Limit, Bestellungen
reset role;
set local role service_role;
insert into requests (kind, brief, contact_name, contact_email) values ('team', 'Wir brauchen einen Chatbot für den Kundenservice.', 'Eva Beispiel', 'eva@example.com');
update requests set status = 'introduced' where contact_email = 'eva@example.com';
select isnt((select introduced_at from requests), null, 'Status „introduced“ setzt den Zeitpunkt');
select is(
  array[public.consume_rate_limit('kontakt', 'schluessel-1', 2, 60), public.consume_rate_limit('kontakt', 'schluessel-1', 2, 60), public.consume_rate_limit('kontakt', 'schluessel-1', 2, 60)],
  array[true, true, false], 'Rate-Limit greift nach zwei Treffern');
insert into orders (user_id, email, product_key, amount_eur_cents, provider, ada_lovelace, ada_rate_eur, ada_quote_expires_at)
values ('11111111-1111-1111-1111-111111111111', 'mara@example.com', 'ki_automatisierung_anzahlung', 49000, 'cardano', 1400000000, 0.35, now() + interval '15 minutes');
select throws_ok(
  $$insert into orders (email, product_key, amount_eur_cents, provider) values ('x@example.com', 'analyse_paket', 4900, 'cardano')$$,
  '23514', null, 'Cardano-Bestellung braucht ein ADA-Angebot');

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select is((select count(*)::int from orders), 0, 'Fremde Bestellungen sind unsichtbar');
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select is((select count(*)::int from orders), 1, 'Eigene Bestellung ist sichtbar');

-- Einwilligung vor dem Profil: gilt ab dem Anlegen.
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
insert into consents (purpose, granted, text_version) values ('showcase', true, 'showcase-2026-10');
insert into freelancers (first_name) values ('Ben');
select is((select consent_showcase from freelancers), true, 'Frühere Einwilligung gilt ab dem Anlegen des Profils');

reset role;
select ok(
  (select changes ? 'status' from audit.log where table_name = 'public.freelancers' and op = 'UPDATE' and changes ? 'status' limit 1),
  'Audit hält Statusänderungen fest');

select * from finish();
rollback;
