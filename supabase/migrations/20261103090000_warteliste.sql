-- Warteliste für Node001 (Seite Orte): Interessenten für Workation, Miete oder Kauf.
-- Double-Opt-in: Ein Eintrag zählt erst, wenn der Link aus der Mail geklickt wurde. Nur der Server liest und schreibt.

create type public.waitlist_interest as enum ('workation', 'rent', 'buy');

create table public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  node text not null default 'node001' check (node ~ '^[a-z0-9-]{1,40}$'),
  first_name text check (first_name is null or char_length(trim(first_name)) between 2 and 120),
  email extensions.citext not null check (private.valid_email(email::text)),
  interest public.waitlist_interest not null,
  timing text not null check (timing in ('now', 'later')),
  campaign text check (char_length(campaign) <= 40),
  locale public.app_locale not null default 'de',
  consent_text_version text not null check (char_length(consent_text_version) between 1 and 40),
  confirm_token_hash text unique check (confirm_token_hash ~ '^[0-9a-f]{64}$'),
  confirm_expires_at timestamptz,
  confirmed_at timestamptz,
  status public.lead_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'confirmed' or confirmed_at is not null)
);
create index waitlist_entries_status_idx on public.waitlist_entries (node, status, created_at desc);
comment on table public.waitlist_entries is 'Warteliste je Node. pending = Link verschickt, confirmed = per Link bestätigt, unsubscribed = abgemeldet.';
comment on column public.waitlist_entries.timing is 'now = sofort, later = nur Interesse, für später.';
comment on column public.waitlist_entries.campaign is 'Kampagnen-Link der Seite, z. B. ?angebot=kaufen. Nur zur Auswertung.';
comment on column public.waitlist_entries.confirm_token_hash is 'SHA-256 des Bestätigungslinks. Der Link selbst wird nie gespeichert.';

create trigger waitlist_entries_touch before update on public.waitlist_entries
  for each row execute function private.touch_updated_at();
create trigger waitlist_entries_audit after insert or update or delete on public.waitlist_entries
  for each row execute function audit.record();

alter table public.waitlist_entries enable row level security;
revoke all on table public.waitlist_entries from anon, authenticated;
grant all on table public.waitlist_entries to service_role;
create policy "Nur Server" on public.waitlist_entries for all to service_role using (true) with check (true);

-- Übersicht für Paul und Roman: Personen je Wunsch. Wer sich zweimal einträgt, zählt einmal.
create view ops.warteliste with (security_invoker = true) as
  select node,
         interest,
         count(distinct email) filter (where status = 'confirmed') as bestaetigt,
         count(distinct email) filter (where status = 'pending') as offen
    from public.waitlist_entries
   group by node, interest;
revoke all on ops.warteliste from public, anon, authenticated;
grant select on ops.warteliste to service_role;
