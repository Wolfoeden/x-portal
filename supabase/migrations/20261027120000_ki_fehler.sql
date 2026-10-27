-- Warum zeigt die Seite die Demo statt echter Treffer? Fehler der KI-Analyse ohne Inhalte: nur Schritt und Fehlerart.

create table public.ai_errors (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  stage text not null check (char_length(stage) between 1 and 40),
  detail text not null check (char_length(detail) between 1 and 200)
);
create index ai_errors_at_idx on public.ai_errors (at desc);
comment on table public.ai_errors is 'Fehler der KI-Analyse, z. B. brief:429:insufficient_quota. Ohne Anfragetext, ohne IP.';

alter table public.ai_errors enable row level security;
revoke all on table public.ai_errors from anon, authenticated;
grant all on table public.ai_errors to service_role;
create policy "Nur Server" on public.ai_errors for all to service_role using (true) with check (true);

create view ops.ki_fehler with (security_invoker = true) as
  select at as zeitpunkt, stage as schritt, detail as fehler
    from public.ai_errors
   order by at desc;
comment on view ops.ki_fehler is 'Neueste Fehler der KI-Analyse zuerst. Häufige Ursachen: 401 Schlüssel falsch, 429 kein Guthaben bei OpenAI, 404 Modell nicht freigeschaltet.';
revoke all on all tables in schema ops from public, anon, authenticated;
