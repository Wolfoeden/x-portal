-- Backoffice in Supabase Studio: lesbare Sichten im Schema ops. Nicht über die API erreichbar.
-- Geändert wird im Table Editor direkt in den Tabellen, meist nur das Feld status.

create view ops.posteingang with (security_invoker = true) as
  select 'Anfrage'::text as art, r.id, r.created_at as eingegangen, r.status::text as status,
         r.contact_name as name, r.contact_email::text as email, r.company as firma, left(r.brief, 240) as inhalt
    from public.requests r
   where r.status in ('new', 'in_progress')
  union all
  select 'Kontakt', c.id, c.created_at, c.status::text, c.name, c.email::text, c.company, left(c.message, 240)
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
comment on view ops.posteingang is 'Was zu tun ist: offene Anfragen, neue Kontaktnachrichten, bestätigte Deck-Anfragen, Profile der letzten 14 Tage. Neueste zuerst sortieren.';

create view ops.freelancer with (security_invoker = true) as
  select f.id,
         f.first_name || coalesce(' ' || f.last_name, '') as name,
         u.email::text as email,
         f.role_title as rolle,
         f.status::text as status,
         f.verification::text as pruefung,
         f.day_rate_eur as tagessatz_eur,
         f.availability::text as verfuegbar,
         f.work_mode::text as arbeitsort,
         cardinality(f.skills) as staerken,
         (select count(*) from public.freelancer_projects p where p.freelancer_id = f.id) as projekte,
         (select count(*) from public.freelancer_documents d where d.freelancer_id = f.id) as lebenslaeufe,
         f.avatar_path is not null as foto,
         f.consent_showcase as auf_website,
         f.consent_search_index as in_suchmaschinen,
         f.consent_market_stats as marktstatistik,
         f.slug,
         f.legacy_profile_id is not null as uebernommen,
         f.created_at as angelegt,
         f.updated_at as geaendert
    from public.freelancers f
    join auth.users u on u.id = f.user_id;
comment on view ops.freelancer is 'Alle Freelancer mit Stand, Einwilligungen und Kontakt-E-Mail. Die E-Mail nie weitergeben ohne Vorstellung.';

create view ops.zahlungen with (security_invoker = true) as
  select o.id, o.created_at as angelegt, o.paid_at as bezahlt_am, o.status::text as status, o.provider::text as weg,
         o.product_key as produkt, round(o.amount_eur_cents / 100.0, 2) as betrag_eur,
         round(o.ada_lovelace / 1000000.0, 6) as betrag_ada, o.cardano_tx_hash as transaktion, o.email::text as email
    from public.orders o;
comment on view ops.zahlungen is 'Bestellungen über Stripe und Cardano. Bei Cardano zeigt transaktion den Hash für den Explorer.';

create view ops.wochenzahlen with (security_invoker = true) as
  with wochen as (
    select generate_series(date_trunc('week', now()) - interval '11 weeks', date_trunc('week', now()), interval '1 week') as woche
  )
  select w.woche::date as woche_ab,
         (select count(*) from public.freelancers f where date_trunc('week', f.created_at) = w.woche) as neue_profile,
         (select count(*) from public.freelancers f where date_trunc('week', f.published_at) = w.woche) as veroeffentlicht,
         (select count(*) from public.requests r where date_trunc('week', r.created_at) = w.woche) as anfragen,
         (select count(*) from public.requests r where date_trunc('week', r.introduced_at) = w.woche) as vorgestellt,
         (select count(*) from public.investor_leads l where date_trunc('week', l.confirmed_at) = w.woche) as deck_anfragen,
         (select coalesce(sum(o.amount_eur_cents), 0) / 100.0 from public.orders o
           where o.status = 'paid' and o.provider = 'stripe' and date_trunc('week', o.paid_at) = w.woche) as umsatz_stripe_eur,
         (select coalesce(sum(o.amount_eur_cents), 0) / 100.0 from public.orders o
           where o.status = 'paid' and o.provider = 'cardano' and date_trunc('week', o.paid_at) = w.woche) as umsatz_ada_eur
    from wochen w
   order by w.woche desc;
comment on view ops.wochenzahlen is 'Die letzten zwölf Wochen. Umsatz Cardano in Euro zum Kurs beim Angebot.';

revoke all on all tables in schema ops from public, anon, authenticated;
revoke all on all tables in schema audit from public, anon, authenticated;
