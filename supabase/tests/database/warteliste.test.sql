-- Warteliste: nur der Server. Läuft mit `supabase test db`.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(7);

select ok(not has_table_privilege('anon', 'public.waitlist_entries', 'insert'), 'Besucher schreiben nicht direkt');
select ok(not has_table_privilege('anon', 'public.waitlist_entries', 'select'), 'Besucher lesen die Warteliste nicht');
select ok(not has_table_privilege('authenticated', 'public.waitlist_entries', 'select'), 'Konten lesen die Warteliste nicht');
select throws_ok(
  $$insert into public.waitlist_entries (first_name, email, interest, timing, consent_text_version, status) values ('Lena', 'lena@example.de', 'rent', 'now', 'v1', 'confirmed')$$,
  '23514', null, 'Bestätigt nur mit Zeitpunkt');
select lives_ok(
  $$insert into public.waitlist_entries (email, interest, timing, campaign, consent_text_version, confirm_token_hash, confirm_expires_at) values ('lena@example.de', 'buy', 'later', 'kaufen', 'v1', repeat('a', 64), now() + interval '7 days')$$,
  'Offener Eintrag mit Hash, ohne Vorname');
select throws_ok(
  $$insert into public.waitlist_entries (email, interest, timing, consent_text_version) values ('lena@example.de', 'buy', 'bald', 'v1')$$,
  '23514', null, 'Zeitpunkt nur now oder later');
-- Dieselbe Adresse zweimal: Die Übersicht zählt die Person einmal.
insert into public.waitlist_entries (email, interest, timing, consent_text_version, confirm_token_hash, confirm_expires_at) values ('lena@example.de', 'buy', 'now', 'v1', repeat('b', 64), now() + interval '7 days');
select is((select offen from ops.warteliste where node = 'node001' and interest = 'buy'), 1::bigint, 'Übersicht zählt Personen, nicht Einträge');

select * from finish();
rollback;
