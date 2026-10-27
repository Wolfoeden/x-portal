-- Kontaktanfragen zu einer Leistung: welche, damit der Posteingang sie zeigt.

alter table public.contact_requests
  add column service text check (service in ('automation', 'training', 'isms'));
alter table public.contact_requests
  add constraint contact_requests_service_topic check (service is null or topic = 'services');
comment on column public.contact_requests.service is 'Nur bei topic = services: automation (KI-Automatisierung), training (KI-Schulung) oder isms.';

create or replace view ops.posteingang with (security_invoker = true) as
  select 'Anfrage'::text as art, r.id, r.created_at as eingegangen, r.status::text as status,
         r.contact_name as name, r.contact_email::text as email, r.company as firma, left(r.brief, 240) as inhalt
    from public.requests r
   where r.status in ('new', 'in_progress')
  union all
  select 'Kontakt' || case c.service when 'automation' then ' · KI-Automatisierung' when 'training' then ' · KI-Schulung' when 'isms' then ' · ISMS' else '' end,
         c.id, c.created_at, c.status::text, c.name, c.email::text, c.company, left(c.message, 240)
    from public.contact_requests c
   where c.status = 'new'
  union all
  select 'Deck', l.id, l.created_at, l.status::text, l.name, l.email::text, l.organisation, l.investor_kind
    from public.investor_leads l
   where l.status = 'confirmed'
  union all
  select 'Neues Profil', f.id, f.created_at, f.status::text, f.first_name || coalesce(' ' || f.last_name, ''), u.email::text, null, f.role_title
    from public.freelancers f
    join auth.users u on u.id = f.user_id
   where f.created_at > now() - interval '14 days';
