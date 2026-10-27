-- Stärken behalten ihre Reihenfolge: Die ersten stehen auf der Profilkarte vorn.
create or replace function private.freelancer_before_write() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  base text;
begin
  new.first_name := trim(new.first_name);
  -- Doppelte Stärken entfernen (ohne Groß-/Kleinschreibung), Reihenfolge behalten.
  new.skills := array(
    select s from (
      select distinct on (lower(trim(s))) trim(s) as s, n
        from unnest(new.skills) with ordinality as u(s, n)
       where trim(s) <> ''
       order by lower(trim(s)), n
    ) q order by n);

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
