-- Adiciona a categoria Apartamento para instalações já existentes.
-- A inclusão das metas das casas existentes ocorre na próxima migração,
-- depois que o novo valor do enum tiver sido confirmado no banco.
alter type budget_category add value if not exists 'apartamento';
