-- Parcelamento de gastos do orçamento.
alter table expenses add column group_id text;
alter table expenses add column installment_index int not null default 1;
alter table expenses add column installment_count int not null default 1;

create index expenses_group_id_idx on expenses (group_id) where group_id is not null;
