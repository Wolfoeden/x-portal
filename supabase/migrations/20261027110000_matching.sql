-- KI-Matching: Fingerabdrücke (Embeddings) der Profile, Vorauswahl per Vektornähe, Verbrauch der KI.
-- Ablauf und Vorlage: supabase/migrations/20261019110000_ki_vorauswahl.sql im alten Repo.
-- Der Fingerabdruck entsteht aus Rolle, Kurzbeschreibung, Stärken und „Über mich“, ohne Namen und Kontakt.
-- Passt input_hash nicht mehr zum Profil, rechnet der Server ihn bei der nächsten Analyse neu.
-- Alles hier liest und schreibt nur der Server (service_role).

create extension if not exists vector with schema extensions;

create table public.freelancer_embeddings (
  freelancer_id uuid primary key references public.freelancers (id) on delete cascade,
  input_hash text not null check (input_hash ~ '^[0-9a-f]{64}$'),
  model text not null check (char_length(model) between 1 and 120),
  embedding extensions.vector(1536) not null,
  created_at timestamptz not null default now()
);
comment on table public.freelancer_embeddings is 'Inhalts-Fingerabdruck je Profil für die Vorauswahl. input_hash = SHA-256 der Angaben samt Modell.';

-- Die nächsten veröffentlichten Profile zum Fingerabdruck einer Anfrage.
-- Arbeitsort: vor Ort braucht onsite oder both, remote braucht remote oder both, hybrid nimmt alle.
create function public.match_freelancers(
  p_embedding extensions.vector(1536),
  p_model text,
  p_work_mode public.work_mode default null,
  p_limit integer default 20
)
returns table (freelancer_id uuid, similarity double precision)
language sql stable set search_path = '' as $$
  select f.id, 1 - (e.embedding operator(extensions.<=>) p_embedding)
    from public.freelancers f
    join public.freelancer_embeddings e on e.freelancer_id = f.id and e.model = p_model
   where f.status = 'published'
     and (p_work_mode is null or p_work_mode = 'both' or f.work_mode in (p_work_mode, 'both'))
   order by e.embedding operator(extensions.<=>) p_embedding
   limit least(greatest(coalesce(p_limit, 20), 1), 50)
$$;
comment on function public.match_freelancers(extensions.vector, text, public.work_mode, integer) is 'Vorauswahl für eine Anfrage: veröffentlichte Profile, nächste zuerst. Nur für den Server.';

-- Verbrauch der KI, ohne Bezug zu Personen: nur Art, Modell und Tokens.
create table public.ai_usage (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  kind text not null check (kind in ('brief', 'embedding')),
  model text not null check (char_length(model) between 1 and 120),
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0)
);
create index ai_usage_at_idx on public.ai_usage (at);
comment on table public.ai_usage is 'Ein Eintrag je Aufruf bei OpenAI. Grundlage für die Monatsgrenze AI_MONTHLY_TOKEN_LIMIT.';

create function public.ai_tokens_this_month()
returns bigint
language sql stable set search_path = '' as $$
  select coalesce(sum(input_tokens + output_tokens), 0)::bigint
    from public.ai_usage
   where at >= date_trunc('month', now())
$$;

do $$
declare
  t text;
begin
  foreach t in array array['freelancer_embeddings', 'ai_usage'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant all on table public.%I to service_role', t);
    execute format('create policy "Nur Server" on public.%I for all to service_role using (true) with check (true)', t);
  end loop;
end;
$$;

revoke all on function public.match_freelancers(extensions.vector, text, public.work_mode, integer) from public, anon, authenticated;
grant execute on function public.match_freelancers(extensions.vector, text, public.work_mode, integer) to service_role;
revoke all on function public.ai_tokens_this_month() from public, anon, authenticated;
grant execute on function public.ai_tokens_this_month() to service_role;

-- Anfragen halten die Analyse der KI und die Treffer zum Zeitpunkt der Anfrage fest.
alter table public.requests
  add column analysis jsonb check (analysis is null or jsonb_typeof(analysis) = 'object'),
  add column matches jsonb check (matches is null or jsonb_typeof(matches) = 'array');
comment on column public.requests.analysis is 'Brief der KI zur Anfrage (Titel, Rollen, Stärken, Arbeitsort …).';
comment on column public.requests.matches is 'Vorgeschlagene Profile mit Begründung, Stand beim Absenden.';

create view ops.ki_kosten with (security_invoker = true) as
  select (date_trunc('day', at))::date as tag, kind as art, model as modell, count(*) as aufrufe,
         sum(input_tokens) as tokens_eingabe, sum(output_tokens) as tokens_ausgabe
    from public.ai_usage
   group by 1, 2, 3
   order by 1 desc, 2;
comment on view ops.ki_kosten is 'Aufrufe und Tokens je Tag. Die Kosten in Euro zeigt das OpenAI-Dashboard.';
revoke all on all tables in schema ops from public, anon, authenticated;
