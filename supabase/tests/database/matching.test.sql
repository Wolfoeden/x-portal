-- Matching: Rechte und Vorauswahl. Läuft mit `supabase test db`.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(9);

select ok(not has_function_privilege('anon', 'public.match_freelancers(extensions.vector, text, public.work_mode, integer)', 'execute'), 'Besucher dürfen nicht matchen');
select ok(not has_function_privilege('authenticated', 'public.match_freelancers(extensions.vector, text, public.work_mode, integer)', 'execute'), 'Konten dürfen nicht matchen');
select ok(not has_table_privilege('authenticated', 'public.freelancer_embeddings', 'select'), 'Fingerabdrücke sind privat');
select ok(not has_table_privilege('anon', 'public.ai_usage', 'select'), 'KI-Verbrauch ist privat');

insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'a@example.com'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'b@example.com'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'c@example.com');
insert into freelancers (id, user_id, first_name, role_title, skills, day_rate_eur, work_mode, status) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Nah', 'KI', array['RAG'], 900, 'remote', 'published'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', 'Fern', 'ISMS', array['ISO 27001'], 900, 'onsite', 'published'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000003', 'Entwurf', 'KI', array['RAG'], 900, 'remote', 'draft');

-- Vektoren mit 1536 Stellen: Nah zeigt in Richtung der Anfrage, Fern nicht.
insert into freelancer_embeddings (freelancer_id, input_hash, model, embedding)
select id, repeat('a', 64), 'test-model', (
  '[' || array_to_string(array(select case when g = 1 then v1 when g = 2 then v2 else 0 end from generate_series(1, 1536) g), ',') || ']'
)::extensions.vector
  from (values ('bbbbbbbb-0000-0000-0000-000000000001'::uuid, 1.0, 0.1),
               ('bbbbbbbb-0000-0000-0000-000000000002'::uuid, 0.1, 1.0),
               ('bbbbbbbb-0000-0000-0000-000000000003'::uuid, 1.0, 0.0)) as v(id, v1, v2);

create temporary table anfrage on commit drop as
  select ('[' || array_to_string(array(select case when g = 1 then 1 else 0 end from generate_series(1, 1536) g), ',') || ']')::extensions.vector as v;
grant select on anfrage to service_role;

set local role service_role;
select is(
  (select array_agg(freelancer_id order by similarity desc) from match_freelancers((select v from anfrage), 'test-model')),
  array['bbbbbbbb-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002']::uuid[],
  'Nächstes Profil zuerst, Entwürfe nie');
select is(
  (select array_agg(freelancer_id) from match_freelancers((select v from anfrage), 'test-model', 'onsite')),
  array['bbbbbbbb-0000-0000-0000-000000000002']::uuid[],
  'Vor Ort: nur onsite oder both');
select is(
  (select count(*)::int from match_freelancers((select v from anfrage), 'anderes-modell')),
  0, 'Nur Fingerabdrücke desselben Modells zählen');

insert into ai_usage (kind, model, input_tokens, output_tokens) values ('brief', 'm', 100, 50), ('embedding', 'e', 30, 0);
select is(ai_tokens_this_month(), 180::bigint, 'Monatsverbrauch zählt Ein- und Ausgabe');
reset role;

select throws_ok(
  $$insert into public.requests (kind, brief, analysis, contact_name, contact_email) values ('team', 'Ein Satz mit Inhalt.', '"Text"', 'Eva', 'eva@example.com')$$,
  '23514', null, 'Analyse muss ein Objekt sein');

select * from finish();
rollback;
