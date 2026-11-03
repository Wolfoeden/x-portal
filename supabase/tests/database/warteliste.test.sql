-- Warteliste: nur der Server. Läuft mit `supabase test db`.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(5);

select ok(not has_table_privilege('anon', 'public.waitlist_entries', 'insert'), 'Besucher schreiben nicht direkt');
select ok(not has_table_privilege('anon', 'public.waitlist_entries', 'select'), 'Besucher lesen die Warteliste nicht');
select ok(not has_table_privilege('authenticated', 'public.waitlist_entries', 'select'), 'Konten lesen die Warteliste nicht');
select throws_ok(
  $$insert into public.waitlist_entries (name, email, interest, consent_text_version, status) values ('Lena', 'lena@example.de', 'rent', 'v1', 'confirmed')$$,
  '23514', null, 'Bestätigt nur mit Zeitpunkt');
select lives_ok(
  $$insert into public.waitlist_entries (name, email, interest, consent_text_version, confirm_token_hash, confirm_expires_at) values ('Lena', 'lena@example.de', 'rent', 'v1', repeat('a', 64), now() + interval '7 days')$$,
  'Offener Eintrag mit Hash');

select * from finish();
rollback;
