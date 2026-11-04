-- Executar como administrador, depois de identificar a sessão legítima.
-- Substituir UUID_DA_CONTA_PRESERVADA pelo UUID confirmado no aparelho.
-- Só remove se houver exatamente quatro outros membros na mesma casa.
-- Exportar as linhas retornadas se for necessário reconstituir os perfis.
with owner_profile as (
  select p.id, p.household_id
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id = 'UUID_DA_CONTA_PRESERVADA'::uuid
    and u.is_anonymous = false
    and u.email_confirmed_at is not null
), candidates as (
  select p.id from public.profiles p
  join owner_profile o on p.household_id = o.household_id
  where p.id <> o.id
)
delete from public.profiles p
using candidates c
where p.id = c.id
  and (select count(*) from candidates) = 4
returning p.id, p.household_id, p.display_name, p.created_at;
