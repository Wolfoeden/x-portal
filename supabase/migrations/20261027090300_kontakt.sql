-- Anfragen von Unternehmen, Kontaktformular, Deck-Anfragen von Investoren, Sperrliste und Rate-Limit.
-- Alles hier schreibt und liest nur der Server (service_role). Der Browser hat keinen Zugriff.

create function private.valid_email(value text) returns boolean
language sql immutable set search_path = '' as $$
  select value ~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' and char_length(value) <= 254
$$;

-- Anfragen von Unternehmen ----------------------------------------------------------

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  kind public.request_kind not null,
  freelancer_id uuid references public.freelancers (id) on delete set null,
  brief text not null check (char_length(brief) between 10 and 4000),
  contact_name text not null check (char_length(trim(contact_name)) between 2 and 120),
  contact_email extensions.citext not null check (private.valid_email(contact_email::text)),
  company text check (char_length(company) <= 160),
  phone text check (char_length(phone) <= 40),
  locale public.app_locale not null default 'de',
  source_page text check (char_length(source_page) <= 200),
  status public.request_status not null default 'new',
  operator_note text check (char_length(operator_note) <= 4000),
  introduced_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (kind <> 'freelancer' or freelancer_id is not null or status <> 'new')
);
create index requests_status_idx on public.requests (status, created_at desc);
create index requests_freelancer_idx on public.requests (freelancer_id);
comment on table public.requests is 'Anfragen von Unternehmen: team = Team aus dem Satz, freelancer = ein bestimmtes Profil, search = Suchauftrag.';
comment on column public.requests.status is 'new → in_progress → introduced (Vorstellungsmails an beide Seiten) → closed.';

create function private.request_status_times() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'introduced' and new.introduced_at is null then
      new.introduced_at := now();
    elsif new.status = 'closed' and new.closed_at is null then
      new.closed_at := now();
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.request_status_times() from public;

create trigger requests_status_times before update on public.requests
  for each row execute function private.request_status_times();
create trigger requests_touch before update on public.requests
  for each row execute function private.touch_updated_at();
create trigger requests_audit after insert or update or delete on public.requests
  for each row execute function audit.record();

-- Kontaktformular -------------------------------------------------------------------

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  topic text not null check (topic in ('general', 'services', 'investors', 'press', 'privacy')),
  name text not null check (char_length(trim(name)) between 2 and 120),
  email extensions.citext not null check (private.valid_email(email::text)),
  company text check (char_length(company) <= 160),
  message text not null check (char_length(message) between 10 and 4000),
  locale public.app_locale not null default 'de',
  status public.inbox_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index contact_requests_status_idx on public.contact_requests (status, created_at desc);

create trigger contact_requests_touch before update on public.contact_requests
  for each row execute function private.touch_updated_at();
create trigger contact_requests_audit after insert or update or delete on public.contact_requests
  for each row execute function audit.record();

-- Deck-Anfragen (Double-Opt-in) ---------------------------------------------------------

create table public.investor_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  email extensions.citext not null check (private.valid_email(email::text)),
  organisation text check (char_length(organisation) <= 160),
  investor_kind text check (char_length(investor_kind) <= 60),
  locale public.app_locale not null default 'de',
  consent_text_version text not null check (char_length(consent_text_version) between 1 and 40),
  confirm_token_hash text unique check (confirm_token_hash ~ '^[0-9a-f]{64}$'),
  confirm_expires_at timestamptz,
  confirmed_at timestamptz,
  deck_sent_at timestamptz,
  status public.lead_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index investor_leads_status_idx on public.investor_leads (status, created_at desc);
comment on column public.investor_leads.confirm_token_hash is 'SHA-256 des Bestätigungslinks. Der Link selbst wird nie gespeichert.';

create trigger investor_leads_touch before update on public.investor_leads
  for each row execute function private.touch_updated_at();
create trigger investor_leads_audit after insert or update or delete on public.investor_leads
  for each row execute function audit.record();

-- Sperrliste für Mails ---------------------------------------------------------------------

create table public.email_suppressions (
  email extensions.citext primary key check (private.valid_email(email::text)),
  reason text not null check (reason in ('unsubscribe', 'bounce', 'complaint', 'manual')),
  created_at timestamptz not null default now()
);
comment on table public.email_suppressions is 'An diese Adressen geht keine Mail mehr, außer der Bestätigung eines eigenen Vorgangs.';

-- Rechte: nur der Server ------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array['requests', 'contact_requests', 'investor_leads', 'email_suppressions'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant all on table public.%I to service_role', t);
    execute format('create policy "Nur Server" on public.%I for all to service_role using (true) with check (true)', t);
  end loop;
end;
$$;

-- Rate-Limit ---------------------------------------------------------------------------------
-- Der Server übergibt einen Schlüssel ohne Personenbezug (z. B. HMAC der IP). Treffer verfallen nach einem Tag.

create table private.rate_limit_hits (
  bucket text not null,
  key text not null,
  hit_at timestamptz not null default now()
);
create index rate_limit_hits_lookup_idx on private.rate_limit_hits (bucket, key, hit_at desc);
create index rate_limit_hits_age_idx on private.rate_limit_hits (hit_at);
revoke all on table private.rate_limit_hits from public, anon, authenticated;

create function public.consume_rate_limit(p_bucket text, p_key text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  used integer;
begin
  if p_bucket !~ '^[a-z0-9_:-]{1,60}$' or char_length(p_key) not between 8 and 128
     or p_max not between 1 and 10000 or p_window_seconds not between 1 and 86400 then
    raise exception 'Ungültige Rate-Limit-Parameter' using errcode = 'invalid_parameter_value';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_bucket || ':' || p_key, 0));

  select count(*) into used
    from private.rate_limit_hits
   where bucket = p_bucket and key = p_key and hit_at > now() - make_interval(secs => p_window_seconds);

  if used >= p_max then
    return false;
  end if;

  insert into private.rate_limit_hits (bucket, key) values (p_bucket, p_key);

  if random() < 0.01 then
    delete from private.rate_limit_hits where hit_at < now() - interval '1 day';
  end if;
  return true;
end;
$$;
comment on function public.consume_rate_limit(text, text, integer, integer) is 'true = Anfrage erlaubt (und gezählt), false = Limit erreicht. Nur für den Server.';
revoke all on function public.consume_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;
