-- Öffentliche Profilkarten für Startseite, Talentpool und /freelancer/[slug].
-- Eine eigene Tabelle statt einer Sicht: Sie enthält nur freigegebene Felder, wird per Trigger gepflegt
-- und lässt sich ohne Security-Definer-Sicht öffentlich lesen.

create table public.showcase_profiles (
  freelancer_id uuid primary key references public.freelancers (id) on delete cascade,
  slug extensions.citext not null unique,
  first_name text not null,
  role_title text,
  role_key public.freelancer_role,
  skills text[] not null,
  languages text[] not null,
  availability public.availability,
  work_mode public.work_mode,
  day_rate_eur integer,
  location_text text,
  verification public.verification_level not null,
  has_avatar boolean not null,
  indexable boolean not null,
  published_at timestamptz,
  updated_at timestamptz not null default now()
);
comment on table public.showcase_profiles is 'Öffentliche Profilkarten. Nur veröffentlichte Profile mit Einwilligung „showcase“. Ohne Nachname, Kontakt und Fotopfad.';
comment on column public.showcase_profiles.indexable is 'Einwilligung „search_index“: Profilseite darf in Suchmaschinen erscheinen.';

alter table public.showcase_profiles enable row level security;
revoke all on table public.showcase_profiles from anon, authenticated;
grant select on table public.showcase_profiles to anon, authenticated;
grant all on table public.showcase_profiles to service_role;

create policy "Profilkarten: öffentlich lesbar" on public.showcase_profiles
  for select to anon, authenticated using (true);

create function private.sync_showcase() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'published' and new.consent_showcase then
    insert into public.showcase_profiles as s (
      freelancer_id, slug, first_name, role_title, role_key, skills, languages, availability, work_mode,
      day_rate_eur, location_text, verification, has_avatar, indexable, published_at, updated_at
    ) values (
      new.id, new.slug, new.first_name, new.role_title, new.role_key, new.skills, new.languages, new.availability, new.work_mode,
      new.day_rate_eur, new.location_text, new.verification, new.avatar_path is not null, new.consent_search_index, new.published_at, now()
    )
    on conflict (freelancer_id) do update set
      slug = excluded.slug,
      first_name = excluded.first_name,
      role_title = excluded.role_title,
      role_key = excluded.role_key,
      skills = excluded.skills,
      languages = excluded.languages,
      availability = excluded.availability,
      work_mode = excluded.work_mode,
      day_rate_eur = excluded.day_rate_eur,
      location_text = excluded.location_text,
      verification = excluded.verification,
      has_avatar = excluded.has_avatar,
      indexable = excluded.indexable,
      published_at = excluded.published_at,
      updated_at = now();
  else
    delete from public.showcase_profiles where freelancer_id = new.id;
  end if;
  return new;
end;
$$;
revoke all on function private.sync_showcase() from public;

create trigger freelancers_sync_showcase after insert or update on public.freelancers
  for each row execute function private.sync_showcase();
