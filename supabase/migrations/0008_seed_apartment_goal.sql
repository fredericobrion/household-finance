-- Cria a meta de Apartamento nas casas existentes sem alterar a distribuição atual.
insert into goals (household_id, category, percentage)
select id, 'apartamento', 0
from households
on conflict (household_id, category) do nothing;
