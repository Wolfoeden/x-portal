-- Primärschlüssel für die Rate-Limit-Treffer (Hinweis des Performance-Advisors).
alter table private.rate_limit_hits add column id bigint generated always as identity primary key;
