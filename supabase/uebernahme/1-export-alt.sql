-- Schritt 1, im alten Projekt (x-portal.eu, xmoxzfqmcnsntvqxhtfb) ausführen. Liest nur.
-- Ergebnis: payload (jsonb) und pruefsumme (md5 von payload::text) für den Abgleich in Schritt 2.
-- Konten: alle echten (nicht anonymen) Konten, nur E-Mail, Name und Anmeldeart. Keine Passwort-Hashes:
-- Die neue Anmeldung läuft über Magic Link und OAuth; Anbieterdaten frischt Supabase beim nächsten Login auf.
-- Profile: nur Freelancer mit eigenem Konto; vom Betreiber angelegte Profile bleiben zurück.
with own as (
  select * from public.freelancer_profiles where owner_user_id is not null
),
konten as (
  select id from auth.users where not is_anonymous
),
daten as (
select jsonb_build_object(
  'users', (
    select coalesce(jsonb_agg(to_jsonb(u)), '[]'::jsonb) from (
      select id, email, email_confirmed_at, created_at,
             jsonb_strip_nulls(jsonb_build_object('provider', raw_app_meta_data -> 'provider', 'providers', raw_app_meta_data -> 'providers')) as raw_app_meta_data,
             jsonb_strip_nulls(jsonb_build_object('full_name', coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name'))) as raw_user_meta_data
        from auth.users where id in (select id from konten)
    ) u),
  'identities', (
    select coalesce(jsonb_agg(to_jsonb(i)), '[]'::jsonb) from (
      select id, user_id, provider_id, provider, created_at,
             jsonb_strip_nulls(jsonb_build_object('sub', identity_data -> 'sub', 'email', identity_data -> 'email',
               'email_verified', identity_data -> 'email_verified')) as identity_data
        from auth.identities where user_id in (select id from konten)
    ) i),
  'profiles', (
    select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) from (
      select id, owner_user_id, display_name, role_title, skill_tags, languages, location_text, work_modes,
             experience_summary, verification_status, day_rate_minor, hourly_rate_minor, availability_status,
             availability_from, profile_links, avatar_path, profile_status, created_at
        from own
    ) p),
  'projects', (
    select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from (
      select pr.profile_id, pr.position, pr.title, pr.client_label, pr.industry, pr.project_role, pr.started_on,
             pr.ended_on, pr.ongoing, pr.technologies, pr.outcome, pr.link_url, pr.is_public, pr.created_at
        from public.freelancer_projects pr where pr.profile_id in (select id from own)
    ) x),
  'cvs', (
    select coalesce(jsonb_agg(to_jsonb(d)), '[]'::jsonb) from (
      select profile_id, storage_bucket, storage_path, original_filename, mime_type, byte_size, version, uploaded_at
        from public.freelancer_cv_documents where profile_id in (select id from own)
    ) d),
  'stripe_customers', (
    select coalesce(jsonb_agg(to_jsonb(s)), '[]'::jsonb) from (
      select user_id, stripe_customer_id from public.user_ai_credit_accounts
       where stripe_customer_id is not null and user_id in (select owner_user_id from own)
    ) s)
) as payload
)
select payload, md5(payload::text) as pruefsumme from daten;
