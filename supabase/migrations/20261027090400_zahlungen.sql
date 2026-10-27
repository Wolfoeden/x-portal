-- Bestellungen und Zahlungen: Stripe (Abos und Einmalprodukte) und Cardano (nur Einmalprodukte).
-- Preise kommen aus der Konfiguration der Website, der Betrag wird hier je Bestellung festgehalten.
-- Die Cardano-Empfangsadresse steht nur in der Server-Konfiguration, nicht in der Datenbank.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email extensions.citext not null check (private.valid_email(email::text)),
  product_key text not null check (product_key ~ '^[a-z0-9_]{2,60}$'),
  amount_eur_cents integer not null check (amount_eur_cents between 1 and 10000000),
  provider public.payment_provider not null,
  status public.order_status not null default 'open',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  ada_lovelace bigint check (ada_lovelace > 0),
  ada_rate_eur numeric(14, 6) check (ada_rate_eur > 0),
  ada_quote_expires_at timestamptz,
  cardano_tx_hash text unique check (cardano_tx_hash ~ '^[0-9a-f]{64}$'),
  confirmations integer not null default 0 check (confirmations >= 0),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (provider <> 'cardano' or (ada_lovelace is not null and ada_rate_eur is not null and ada_quote_expires_at is not null)),
  check (status <> 'paid' or paid_at is not null)
);
create index orders_user_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status, created_at desc);
comment on table public.orders is 'Eine Zeile je Kauf. Cardano: ADA-Betrag und Kurs sind ein Angebot bis ada_quote_expires_at; bezahlt erst nach Prüfung von Adresse, Betrag, Metadaten und Bestätigungen.';

alter table public.orders enable row level security;
revoke all on table public.orders from anon, authenticated;
grant select on table public.orders to authenticated;
grant all on table public.orders to service_role;

create policy "Bestellungen: eigene lesen" on public.orders
  for select to authenticated using (user_id = (select auth.uid()));

create trigger orders_touch before update on public.orders
  for each row execute function private.touch_updated_at();
create trigger orders_audit after insert or update or delete on public.orders
  for each row execute function audit.record();

-- Webhook-Ereignisse: jedes nur einmal verarbeiten.
create table public.payment_events (
  provider public.payment_provider not null,
  event_id text not null check (char_length(event_id) between 1 and 200),
  event_type text not null check (char_length(event_type) <= 120),
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error text,
  primary key (provider, event_id)
);
comment on table public.payment_events is 'Eingegangene Webhooks von Stripe und Blockfrost. Der Primärschlüssel verhindert doppelte Verarbeitung.';

-- Abos, gespiegelt von Stripe.
create table public.subscriptions (
  id text primary key check (id ~ '^sub_'),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id text not null check (stripe_customer_id ~ '^cus_'),
  product_key text not null check (product_key ~ '^[a-z0-9_]{2,60}$'),
  price_id text not null check (price_id ~ '^price_'),
  status text not null check (status in ('trialing', 'active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'incomplete_expired', 'paused')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions (user_id);

alter table public.subscriptions enable row level security;
revoke all on table public.subscriptions from anon, authenticated;
grant select on table public.subscriptions to authenticated;
grant all on table public.subscriptions to service_role;

create policy "Abos: eigene lesen" on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()));

create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function private.touch_updated_at();
create trigger subscriptions_audit after insert or update or delete on public.subscriptions
  for each row execute function audit.record();

create table public.stripe_customers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text not null unique check (stripe_customer_id ~ '^cus_'),
  created_at timestamptz not null default now()
);

do $$
declare
  t text;
begin
  foreach t in array array['payment_events', 'stripe_customers'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant all on table public.%I to service_role', t);
    execute format('create policy "Nur Server" on public.%I for all to service_role using (true) with check (true)', t);
  end loop;
end;
$$;
