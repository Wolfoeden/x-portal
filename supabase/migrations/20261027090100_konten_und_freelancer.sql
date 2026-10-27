-- Konten, Freelancer-Profile, Referenzprojekte, Lebensläufe und Einwilligungen.
-- Kontaktdaten (E-Mail) stehen nur in auth.users, nie in einer öffentlich lesbaren Tabelle.

-- Konto ---------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  company text check (char_length(company) <= 160),
  locale public.app_locale not null default 'de',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is 'Ein Datensatz je Konto. Wird beim Anlegen des Kontos automatisch erzeugt.';

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select, update (full_name, company, locale) on table public.profiles to authenticated;
grant all on table public.profiles to service_role;

create policy "Konto: eigenes lesen" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Konto: eigenes ändern" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create trigger profiles_touch before update on public.profiles
  for each row execute function private.touch_updated_at();

create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, full_name, locale)
  values (
    new.id,
    left(nullif(trim(coalesce(meta ->> 'full_name', meta ->> 'name')), ''), 120),
    case when meta ->> 'locale' = 'en' then 'en'::public.app_locale else 'de'::public.app_locale end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- Freelancer ------------------------------------------------------------------

create table public.freelancers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  slug extensions.citext not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  first_name text not null check (char_length(trim(first_name)) between 1 and 60),
  last_name text check (char_length(last_name) <= 80),
  role_title text check (char_length(role_title) <= 120),
  role_key public.freelancer_role,
  skills text[] not null default '{}' check (cardinality(skills) <= 30),
  languages text[] not null default '{}' check (cardinality(languages) <= 12),
  headline text check (char_length(headline) <= 160),
  about text check (char_length(about) <= 4000),
  day_rate_eur integer check (day_rate_eur between 100 and 5000),
  hourly_rate_eur integer check (hourly_rate_eur between 10 and 700),
  availability public.availability,
  work_mode public.work_mode,
  location_text text check (char_length(location_text) <= 120),
  links jsonb not null default '[]'::jsonb check (jsonb_typeof(links) = 'array'),
  avatar_path text check (char_length(avatar_path) <= 300),
  status public.freelancer_status not null default 'draft',
  verification public.verification_level not null default 'self_reported',
  consent_showcase boolean not null default false,
  consent_search_index boolean not null default false,
  consent_market_stats boolean not null default false,
  legacy_profile_id uuid unique,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.freelancers is 'Freelancer-Profile. Öffentlich ist nur, was in showcase_profiles steht.';
comment on column public.freelancers.consent_showcase is 'Einwilligung: Anzeige auf der Website. Wird aus consents gesetzt, nie direkt.';
comment on column public.freelancers.consent_search_index is 'Einwilligung: Profilseite in Suchmaschinen. Wird aus consents gesetzt, nie direkt.';
comment on column public.freelancers.consent_market_stats is 'Einwilligung: anonyme Marktstatistik. Wird aus consents gesetzt, nie direkt.';
comment on column public.freelancers.legacy_profile_id is 'ID im alten Projekt (x-portal.eu), für Weiterleitungen von /profil/[id].';

alter table public.freelancers enable row level security;
revoke all on table public.freelancers from anon, authenticated;
-- Konto-Inhaber pflegen ihr Profil. Slug, Prüfstufe und Einwilligungen setzt nur der Server.
grant select on table public.freelancers to authenticated;
grant insert (first_name, last_name, role_title, role_key, skills, languages, headline, about, day_rate_eur, hourly_rate_eur,
  availability, work_mode, location_text, links, status)
  on table public.freelancers to authenticated;
grant update (first_name, last_name, role_title, role_key, skills, languages, headline, about, day_rate_eur, hourly_rate_eur,
  availability, work_mode, location_text, links, avatar_path, status)
  on table public.freelancers to authenticated;
grant delete on table public.freelancers to authenticated;
grant all on table public.freelancers to service_role;

create policy "Freelancer: eigenes Profil lesen" on public.freelancers
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Freelancer: eigenes Profil anlegen" on public.freelancers
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Freelancer: eigenes Profil ändern" on public.freelancers
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Freelancer: eigenes Profil löschen" on public.freelancers
  for delete to authenticated using (user_id = (select auth.uid()));

create function private.slugify(value text) returns text
language sql immutable set search_path = '' as $$
  select trim(both '-' from regexp_replace(
    lower(translate(value, 'ÄÖÜäöüßÀÁÂÃÅàáâãåÈÉÊËèéêëÌÍÎÏìíîïÒÓÔÕòóôõÙÚÛùúûÇçÑñŁłŚśŹźŻżĆćŃńĘęĄąŠšŽžČčŘřĎďŤťŇň',
                          'AOUaouSAAAAAaaaaaEEEEeeeeIIIIiiiiOOOOooooUUUuuuCcNnLlSsZzZzCcNnEeAaSsZzCcRrDdTtNn')),
    '[^a-z0-9]+', '-', 'g'))
$$;

-- Prüft das Profil, vergibt den Slug und übernimmt die zuletzt erteilten Einwilligungen.
create function private.freelancer_before_write() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  base text;
begin
  new.first_name := trim(new.first_name);
  new.skills := array(select distinct trim(s) from unnest(new.skills) s where trim(s) <> '');

  -- Fotos liegen im Bucket avatars unter <Konto-ID>/…
  if new.avatar_path is not null and new.avatar_path not like new.user_id::text || '/%' then
    raise exception 'Fotopfad gehört nicht zu diesem Konto.' using errcode = 'check_violation';
  end if;

  if tg_op = 'INSERT' then
    if new.slug is null then
      base := coalesce(nullif(private.slugify(new.first_name), ''), 'profil');
      new.slug := left(base, 60) || '-' || substr(md5(gen_random_uuid()::text), 1, 6);
    end if;
    select
      coalesce(bool_or(granted) filter (where purpose = 'showcase'), false),
      coalesce(bool_or(granted) filter (where purpose = 'search_index'), false),
      coalesce(bool_or(granted) filter (where purpose = 'market_stats'), false)
      into new.consent_showcase, new.consent_search_index, new.consent_market_stats
      from (
        select distinct on (purpose) purpose, granted
          from public.consents
         where user_id = new.user_id
         order by purpose, created_at desc, id desc
      ) latest;
  end if;

  if new.status = 'published' then
    if coalesce(new.role_key::text, nullif(trim(new.role_title), '')) is null
       or cardinality(new.skills) = 0
       or new.day_rate_eur is null
       or new.work_mode is null then
      raise exception 'Profil unvollständig: Rolle, mindestens eine Stärke, Tagessatz und Arbeitsort fehlen.'
        using errcode = 'check_violation';
    end if;
    if new.published_at is null then
      new.published_at := now();
    end if;
  end if;

  return new;
end;
$$;
revoke all on function private.freelancer_before_write() from public;

create trigger freelancers_before_write before insert or update on public.freelancers
  for each row execute function private.freelancer_before_write();
create trigger freelancers_touch before update on public.freelancers
  for each row execute function private.touch_updated_at();
create trigger freelancers_audit after insert or update or delete on public.freelancers
  for each row execute function audit.record();

-- Referenzprojekte ---------------------------------------------------------------

create table public.freelancer_projects (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.freelancers (id) on delete cascade,
  position smallint not null default 0,
  title text not null check (char_length(title) between 2 and 160),
  client_label text check (char_length(client_label) <= 160),
  industry text check (char_length(industry) <= 80),
  project_role text check (char_length(project_role) <= 120),
  started_on date,
  ended_on date,
  ongoing boolean not null default false,
  technologies text[] not null default '{}' check (cardinality(technologies) <= 30),
  outcome text check (char_length(outcome) <= 2000),
  link_url text check (link_url ~ '^https://' and char_length(link_url) <= 500),
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ended_on is null or started_on is null or ended_on >= started_on)
);
create index freelancer_projects_freelancer_idx on public.freelancer_projects (freelancer_id, position);

alter table public.freelancer_projects enable row level security;
revoke all on table public.freelancer_projects from anon, authenticated;
grant select, insert, update, delete on table public.freelancer_projects to authenticated;
grant all on table public.freelancer_projects to service_role;

create policy "Projekte: eigene verwalten" on public.freelancer_projects
  for all to authenticated
  using (exists (select 1 from public.freelancers f where f.id = freelancer_id and f.user_id = (select auth.uid())))
  with check (exists (select 1 from public.freelancers f where f.id = freelancer_id and f.user_id = (select auth.uid())));

create trigger freelancer_projects_touch before update on public.freelancer_projects
  for each row execute function private.touch_updated_at();

-- Lebensläufe (Datei im privaten Bucket cvs) --------------------------------------

create table public.freelancer_documents (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.freelancers (id) on delete cascade,
  storage_path text not null unique check (char_length(storage_path) <= 300),
  file_name text not null check (char_length(file_name) between 1 and 200),
  mime_type text not null check (mime_type = 'application/pdf'),
  byte_size bigint not null check (byte_size between 1 and 10485760),
  uploaded_at timestamptz not null default now()
);
create index freelancer_documents_freelancer_idx on public.freelancer_documents (freelancer_id);

alter table public.freelancer_documents enable row level security;
revoke all on table public.freelancer_documents from anon, authenticated;
grant select, insert, delete on table public.freelancer_documents to authenticated;
grant all on table public.freelancer_documents to service_role;

create policy "Lebenslauf: eigene lesen" on public.freelancer_documents
  for select to authenticated
  using (exists (select 1 from public.freelancers f where f.id = freelancer_id and f.user_id = (select auth.uid())));
create policy "Lebenslauf: eigenen hochladen" on public.freelancer_documents
  for insert to authenticated
  with check (
    storage_path like (select auth.uid())::text || '/%'
    and exists (select 1 from public.freelancers f where f.id = freelancer_id and f.user_id = (select auth.uid()))
  );
create policy "Lebenslauf: eigenen löschen" on public.freelancer_documents
  for delete to authenticated
  using (exists (select 1 from public.freelancers f where f.id = freelancer_id and f.user_id = (select auth.uid())));

-- Einwilligungen -------------------------------------------------------------------
-- Nur anfügen, nie ändern: Jede Erteilung und jeder Widerruf ist eine eigene Zeile.

create table public.consents (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  purpose public.consent_purpose not null,
  granted boolean not null,
  text_version text not null check (char_length(text_version) between 1 and 40),
  source text not null default 'profile' check (source in ('profile', 'mail_link', 'migration', 'operator')),
  created_at timestamptz not null default now()
);
create index consents_user_purpose_idx on public.consents (user_id, purpose, created_at desc);
comment on table public.consents is 'Einwilligungen mit Textversion und Zeitpunkt. Nur anfügen; der letzte Eintrag je Zweck gilt.';

alter table public.consents enable row level security;
revoke all on table public.consents from anon, authenticated;
grant select, insert (purpose, granted, text_version) on table public.consents to authenticated;
grant all on table public.consents to service_role;

create policy "Einwilligung: eigene lesen" on public.consents
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Einwilligung: eigene erteilen oder widerrufen" on public.consents
  for insert to authenticated with check (user_id = (select auth.uid()));

create function private.apply_consent() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.purpose = 'showcase' then
    update public.freelancers set consent_showcase = new.granted where user_id = new.user_id;
  elsif new.purpose = 'search_index' then
    update public.freelancers set consent_search_index = new.granted where user_id = new.user_id;
  elsif new.purpose = 'market_stats' then
    update public.freelancers set consent_market_stats = new.granted where user_id = new.user_id;
  end if;
  return new;
end;
$$;
revoke all on function private.apply_consent() from public;

create trigger consents_apply after insert on public.consents
  for each row execute function private.apply_consent();
