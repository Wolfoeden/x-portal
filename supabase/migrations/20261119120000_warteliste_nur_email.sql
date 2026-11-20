-- Whitelist-Formular seit 19.11.2026: nur E-Mail und Einwilligung.
-- Nutzung und Zeitpunkt bleiben leer, wenn niemand danach gefragt wird.
-- Wirkt auch, wenn 20261103090000 schon mit Pflichtfeldern eingespielt wurde.

alter table public.waitlist_entries alter column interest drop not null;

alter table public.waitlist_entries drop constraint if exists waitlist_entries_timing_check;
alter table public.waitlist_entries
  add constraint waitlist_entries_timing_check check (timing is null or timing in ('now', 'later'));
