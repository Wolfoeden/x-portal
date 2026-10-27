-- Lebenslauf per KI: eigene Art im Verbrauch, damit ops.ki_kosten sie getrennt zeigt und die Monatsgrenze sie mitzählt.
alter table public.ai_usage drop constraint ai_usage_kind_check;
alter table public.ai_usage add constraint ai_usage_kind_check check (kind in ('brief', 'embedding', 'cv'));
