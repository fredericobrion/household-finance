-- =============================================================
-- Data do gasto (dia) — coluna occurred_on em expenses
-- Rode no Supabase: SQL Editor > New query > Run
-- =============================================================

alter table expenses add column occurred_on date;

-- backfill dos gastos antigos: usa a data de criação
update expenses set occurred_on = created_at::date where occurred_on is null;

alter table expenses alter column occurred_on set default current_date;
alter table expenses alter column occurred_on set not null;
