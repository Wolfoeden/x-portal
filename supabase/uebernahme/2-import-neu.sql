-- Schritt 2, im neuen Projekt ausführen (als postgres). __PAYLOAD__ und __PRUEFSUMME__ durch das Ergebnis von Schritt 1 ersetzen.
-- Stimmt die Prüfsumme nicht, bricht der Import ab: Dann wurde das JSON beim Übertragen verändert.
-- Mehrfach ausführbar: Was schon da ist, bleibt unverändert.
-- Konten behalten ihre ID, damit Magic Link, GitHub und LinkedIn weiter funktionieren.
-- Einwilligungen werden nicht übernommen: Auf die Website kommt nur, wer nach der Infomail neu zustimmt.
begin;

create temporary table uebernahme on commit drop as
  select $payload$__PAYLOAD__$payload$::jsonb as p;

do $$
begin
  if (select md5(p::text) from uebernahme) <> '__PRUEFSUMME__' then
    raise exception 'Prüfsumme stimmt nicht: Das JSON ist nicht dasselbe wie im Export.';
  end if;
end;
$$;

-- Konten. Die Token-Spalten müssen leer statt NULL sein, sonst scheitert die Anmeldung.
insert into auth.users (
  instance_id, id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, last_sign_in_at, confirmation_token, recovery_token, email_change_token_new, email_change
)
select '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email, u.email_confirmed_at,
       coalesce(u.raw_app_meta_data, '{}'::jsonb), coalesce(u.raw_user_meta_data, '{}'::jsonb),
       u.created_at, coalesce(u.updated_at, now()), u.last_sign_in_at, '', '', '', ''
  from uebernahme,
       jsonb_to_recordset(p -> 'users') as u(id uuid, email text, email_confirmed_at timestamptz, raw_app_meta_data jsonb,
         raw_user_meta_data jsonb, created_at timestamptz, updated_at timestamptz, last_sign_in_at timestamptz)
on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select i.id, i.user_id, i.provider_id, i.provider, i.identity_data, i.last_sign_in_at, i.created_at, coalesce(i.updated_at, now())
  from uebernahme,
       jsonb_to_recordset(p -> 'identities') as i(id uuid, user_id uuid, provider_id text, provider text, identity_data jsonb,
         last_sign_in_at timestamptz, created_at timestamptz, updated_at timestamptz)
on conflict do nothing;

-- Profile. Der Slug entsteht neu aus dem Vornamen; der alte enthielt den Nachnamen.
with alt as (
  select f.*, lower(coalesce(f.role_title, '')) as r
    from uebernahme,
         jsonb_to_recordset(p -> 'profiles') as f(id uuid, owner_user_id uuid, display_name text, role_title text,
           skill_tags text[], languages text[], location_text text, work_modes text[], experience_summary text,
           verification_status text, day_rate_minor bigint, hourly_rate_minor bigint, availability_status text,
           availability_from date, profile_links jsonb, avatar_path text, profile_status text, created_at timestamptz)
),
neu as (
  select
    a.id,
    a.owner_user_id as user_id,
    left(split_part(trim(a.display_name), ' ', 1), 60) as first_name,
    nullif(left(trim(substr(trim(a.display_name), char_length(split_part(trim(a.display_name), ' ', 1)) + 1)), 80), '') as last_name,
    -- „Titel ~ Satz“: vorn der Rollentitel, hinten die Kurzbeschreibung.
    nullif(left(trim(split_part(a.role_title, ' ~ ', 1)), 120), '') as role_title,
    case when strpos(a.role_title, ' ~ ') > 0
      then nullif(left(trim(substr(a.role_title, strpos(a.role_title, ' ~ ') + 3)), 160), '') end as headline,
    (case
      when a.r ~ '(isms|iso ?27001|security|sicherheit)' then 'isms'
      when a.r ~ '(\mki\M|\mai\M|machine learning|\mml\M|llm|genai|künstlich)' then 'ki'
      when a.r ~ '(data|daten|\mbi\M|analyt|statist)' then 'data'
      when a.r ~ '(automat|n8n|\mrpa\M|workflow)' then 'auto'
      when a.r ~ '(design|\mux\M|\mui\M)' then 'design'
      when a.r ~ '(projekt|project|\mpm\M|scrum|agil|product owner|produktmanag)' then 'pm'
    end)::public.freelancer_role as role_key,
    -- Alte Tags heißen „Skill: …“ und „Industry: …“. Übernommen werden nur Stärken, ohne Präfix, in alter Reihenfolge.
    coalesce((
      select array_agg(s order by n) from (
        select s, n from (
          select distinct on (lower(s)) s, n
            from (select regexp_replace(trim(t), '^Skill:\s*', '') as s, n
                    from unnest(a.skill_tags) with ordinality as x(t, n)
                   where trim(t) <> '' and trim(t) !~* '^Industry:') y
           order by lower(s), n
        ) z order by n limit 30
      ) w), '{}') as skills,
    coalesce((select array_agg(l) from (select l from unnest(a.languages) l limit 12) q), '{}') as languages,
    left(a.experience_summary, 4000) as about,
    case when round(a.day_rate_minor / 100.0) between 100 and 5000 then round(a.day_rate_minor / 100.0)::int end as day_rate_eur,
    case when round(a.hourly_rate_minor / 100.0) between 10 and 700 then round(a.hourly_rate_minor / 100.0)::int end as hourly_rate_eur,
    (case
      when a.availability_status = 'available' and (a.availability_from is null or a.availability_from <= current_date) then 'now'
      when a.availability_status = 'available' then 'month'
    end)::public.availability as availability,
    (case
      when 'hybrid' = any(a.work_modes) or ('remote' = any(a.work_modes) and 'onsite' = any(a.work_modes)) then 'both'
      when 'remote' = any(a.work_modes) then 'remote'
      when 'onsite' = any(a.work_modes) then 'onsite'
    end)::public.work_mode as work_mode,
    left(a.location_text, 120) as location_text,
    case jsonb_typeof(a.profile_links)
      when 'array' then a.profile_links
      when 'object' then (select coalesce(jsonb_agg(jsonb_build_object('label', key, 'url', value)), '[]'::jsonb) from jsonb_each_text(a.profile_links))
      else '[]'::jsonb
    end as links,
    case when a.avatar_path is not null
      then a.owner_user_id::text || '/avatar.' || coalesce(lower(substring(a.avatar_path from '\.([A-Za-z0-9]+)$')), 'jpg')
    end as avatar_path,
    (case a.verification_status
      when 'identity_checked' then 'identity_checked'
      when 'operator_verified' then 'operator_verified'
      else 'self_reported'
    end)::public.verification_level as verification,
    a.profile_status,
    a.created_at
  from alt a
)
insert into public.freelancers (
  id, user_id, first_name, last_name, role_title, headline, role_key, skills, languages, about, day_rate_eur, hourly_rate_eur,
  availability, work_mode, location_text, links, avatar_path, status, verification, legacy_profile_id, created_at
)
select
  n.id, n.user_id, n.first_name, n.last_name, n.role_title, n.headline, n.role_key, n.skills, n.languages, n.about, n.day_rate_eur, n.hourly_rate_eur,
  n.availability, n.work_mode, n.location_text, n.links, n.avatar_path,
  -- Veröffentlicht bleibt nur, was die Regeln des neuen Profils erfüllt; der Rest wird Entwurf.
  case when n.profile_status = 'active' and coalesce(n.role_key::text, n.role_title) is not null and cardinality(n.skills) > 0
            and n.day_rate_eur is not null and n.work_mode is not null
       then 'published' else 'draft' end::public.freelancer_status,
  n.verification, n.id, n.created_at
from neu n
where exists (select 1 from auth.users u where u.id = n.user_id)
on conflict (id) do nothing;

insert into public.freelancer_projects (
  freelancer_id, position, title, client_label, industry, project_role, started_on, ended_on, ongoing, technologies, outcome,
  link_url, is_public, created_at
)
select x.profile_id, coalesce(x.position, 0), left(trim(x.title), 160), left(x.client_label, 160), left(x.industry, 80),
       left(x.project_role, 120), x.started_on,
       case when x.started_on is null or x.ended_on >= x.started_on then x.ended_on end,
       coalesce(x.ongoing, false),
       coalesce((select array_agg(t) from (select t from unnest(x.technologies) t limit 30) q), '{}'),
       left(x.outcome, 2000),
       case when x.link_url ~ '^https://' then left(x.link_url, 500) end,
       coalesce(x.is_public, true), x.created_at
  from uebernahme,
       jsonb_to_recordset(p -> 'projects') as x(profile_id uuid, position smallint, title text, client_label text, industry text,
         project_role text, started_on date, ended_on date, ongoing boolean, technologies text[], outcome text, link_url text,
         is_public boolean, created_at timestamptz)
 where char_length(trim(x.title)) >= 2
   and exists (select 1 from public.freelancers f where f.id = x.profile_id)
   and not exists (
     select 1 from public.freelancer_projects p
      where p.freelancer_id = x.profile_id and p.position = coalesce(x.position, 0) and p.title = left(trim(x.title), 160));

insert into public.freelancer_documents (freelancer_id, storage_path, file_name, mime_type, byte_size, uploaded_at)
select d.profile_id, f.user_id::text || '/lebenslauf.pdf', left(coalesce(nullif(d.original_filename, ''), 'lebenslauf.pdf'), 200),
       'application/pdf', d.byte_size, coalesce(d.uploaded_at, now())
  from uebernahme,
       jsonb_to_recordset(p -> 'cvs') as d(profile_id uuid, storage_bucket text, storage_path text, original_filename text,
         mime_type text, byte_size bigint, version bigint, uploaded_at timestamptz)
  join public.freelancers f on f.id = d.profile_id
 where d.mime_type = 'application/pdf' and d.byte_size between 1 and 10485760
on conflict (storage_path) do nothing;

insert into public.stripe_customers (user_id, stripe_customer_id)
select s.user_id, s.stripe_customer_id
  from uebernahme, jsonb_to_recordset(p -> 'stripe_customers') as s(user_id uuid, stripe_customer_id text)
 where exists (select 1 from auth.users u where u.id = s.user_id)
on conflict do nothing;

-- Abgleich: muss zu den Zahlen aus Schritt 1 passen.
select
  (select jsonb_array_length(p -> 'users') from uebernahme) as konten_alt,
  (select count(*) from auth.users u where u.id in (select (e ->> 'id')::uuid from uebernahme, jsonb_array_elements(p -> 'users') e)) as konten_neu,
  (select jsonb_array_length(p -> 'profiles') from uebernahme) as profile_alt,
  (select count(*) from public.freelancers where legacy_profile_id is not null) as profile_neu,
  (select count(*) from public.freelancers where legacy_profile_id is not null and status = 'published') as davon_veroeffentlicht,
  (select jsonb_array_length(p -> 'projects') from uebernahme) as projekte_alt,
  (select count(*) from public.freelancer_projects p join public.freelancers f on f.id = p.freelancer_id where f.legacy_profile_id is not null) as projekte_neu,
  (select jsonb_array_length(p -> 'cvs') from uebernahme) as lebenslaeufe_alt,
  (select count(*) from public.freelancer_documents) as lebenslaeufe_neu,
  (select count(*) from public.freelancers where avatar_path is not null) as fotos;

commit;
