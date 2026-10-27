-- Grundlagen: nichts ist über die API erreichbar, was nicht ausdrücklich freigegeben ist.
-- Jede Tabelle bekommt RLS und eigene Grants in ihrer Migration.

-- Neue Tabellen und Funktionen in public sind nicht mehr automatisch für anon und authenticated offen.
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete, truncate, references, trigger on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke usage, select, update on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

create extension if not exists citext with schema extensions;

-- private: Hilfsfunktionen und interne Tabellen. ops: Backoffice-Sichten für Studio. audit: Änderungsprotokoll.
-- Keins der drei Schemas ist für die API freigegeben.
create schema if not exists private;
create schema if not exists ops;
create schema if not exists audit;
revoke all on schema private, ops, audit from public, anon, authenticated;
grant usage on schema private to service_role;

comment on schema ops is 'Backoffice: lesbare Sichten für Supabase Studio. Nicht über die API erreichbar.';
comment on schema audit is 'Wer hat wann was geändert. Wird per Trigger gefüllt.';

-- Aufzählungen
create type public.freelancer_status as enum ('draft', 'published', 'paused');
create type public.verification_level as enum ('self_reported', 'identity_checked', 'operator_verified');
create type public.freelancer_role as enum ('ki', 'data', 'auto', 'pm', 'design', 'isms');
create type public.availability as enum ('now', 'month', 'part');
create type public.work_mode as enum ('onsite', 'remote', 'both');
create type public.consent_purpose as enum ('showcase', 'search_index', 'market_stats', 'newsletter');
create type public.request_kind as enum ('team', 'freelancer', 'search');
create type public.request_status as enum ('new', 'in_progress', 'introduced', 'closed');
create type public.inbox_status as enum ('new', 'answered', 'closed');
create type public.lead_status as enum ('pending', 'confirmed', 'sent', 'unsubscribed');
create type public.payment_provider as enum ('stripe', 'cardano');
create type public.order_status as enum ('open', 'paid', 'expired', 'cancelled', 'refunded');
create type public.app_locale as enum ('de', 'en');

-- updated_at bei jeder Änderung setzen.
create function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Änderungsprotokoll. Gespeichert werden nur geänderte Felder, bei Anlegen und Löschen nur die Zeilen-ID.
create table audit.log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor uuid,
  db_role text not null default current_user,
  table_name text not null,
  row_id text,
  op text not null check (op in ('INSERT', 'UPDATE', 'DELETE')),
  changes jsonb
);
create index log_table_row_idx on audit.log (table_name, row_id);
comment on table audit.log is 'Änderungsprotokoll. actor ist das angemeldete Konto, db_role die Datenbankrolle (service_role = Server, postgres = Studio).';

create function audit.record() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  old_row jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  new_row jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  diff jsonb;
begin
  if tg_op = 'UPDATE' then
    select jsonb_object_agg(key, jsonb_build_object('old', old_row -> key, 'new', value))
      into diff
      from jsonb_each(new_row)
     where key <> 'updated_at' and (old_row -> key) is distinct from value;
    if diff is null then
      return new;
    end if;
  end if;
  insert into audit.log (actor, table_name, row_id, op, changes)
  values (
    auth.uid(),
    tg_table_schema || '.' || tg_table_name,
    coalesce(new_row, old_row) ->> 'id',
    tg_op,
    diff
  );
  return coalesce(new, old);
end;
$$;
revoke all on function audit.record() from public;
revoke all on function private.touch_updated_at() from public;
