---
tipo: historico
atualizado: 2026-11-04
---

# Histórico de mudanças

## 2026-11-04 — Busca por nome e aporte por preço médio

- Adicionada busca por nome abaixo do cabeçalho da listagem, combinada com os filtros existentes.
- Incluído seletor Valor total/Preço médio nos aportes de renda variável; preço por unidade e quantidade geram o mesmo total persistido de antes.
- Sem mudança de banco; TypeScript e 13 testes de domínio aprovados. Após solicitação explícita, build release instalado no Galaxy A54 com dados preservados; abertura e busca visível confirmadas.
- Detalhes: [[03-Fluxos/Investimentos]] e [[06-Desenvolvimento/Investimentos]].

## 2026-11-04 — Publicação da branch de investimentos

- Criada `codex/investimentos-por-objetivo` a partir da main remota atualizada e registrado o commit da funcionalidade.
- Corrigido o remoto local deste checkout de HTTPS para o alias SSH pessoal, sem alterar a configuração de trabalho.
- Autenticação pessoal e push confirmados. Orientações em [[05-Operacao/Como-rodar]].

## 2026-11-04 — Alinhamento do botão de filtros

- Título da listagem à esquerda e botão Filtros à direita, com centros alinhados verticalmente.
- Limpar filtros aparece abaixo, preservando o alinhamento do cabeçalho.
- TypeScript verificado; após pedido explícito, última versão release do dia instalada no Galaxy A54 com abertura e alinhamento confirmados. Detalhes: [[06-Desenvolvimento/Investimentos-filtros-e-vencimento]].

## 2026-11-04 — Botões dos detalhes de investimentos

- Padronizados largura, altura mínima e espaçamento das ações do investimento, incluindo edição de vencimento.
- Verificação TypeScript; sem build ou instalação no celular.
- Detalhes: [[06-Desenvolvimento/Investimentos]].

## 2026-11-04 — Vencimento opcional e filtros de investimentos

- Adicionado vencimento opcional à renda fixa, com edição/remoção em posições existentes.
- Incluídos filtros combinados por categoria, instituição, tipo dependente da categoria e ano de vencimento exclusivo da renda fixa, incluindo Sem vencimento.
- Criada migração 0010, aplicada pelo usuário. Após pedido explícito, versão release instalada no Galaxy A54 com abertura e painel de filtros verificados.
- Detalhes: [[06-Desenvolvimento/Investimentos-filtros-e-vencimento|registro]] e [[03-Fluxos/Investimentos|fluxo]].

## 2026-11-04 — Exclusão de investimento e voltar do Android

- Adicionada exclusão de investimento com confirmação, incluindo seus aportes em cascata.
- Corrigido voltar do celular: detalhes → objetivo → visão geral, sem pular para Orçamento.
- Sem nova migração. Detalhes: [[03-Fluxos/Investimentos]] e [[06-Desenvolvimento/Investimentos]].

## 2026-11-04 — Seleção direta de instituição

- Removido o campo de busca de instituição no cadastro de investimentos; somente a lista permanece.
- Sem alteração de banco ou catálogo. Detalhes: [[03-Fluxos/Investimentos]].

## 2026-11-04 — Resumo geral e páginas de objetivos

- Resumo da página principal passou a consolidar os três objetivos.
- Cada objetivo abre uma página própria com resumo, cadastro e listagem de seus investimentos.
- Alteração de navegação e apresentação, sem migração de banco.
- Detalhes: [[03-Fluxos/Investimentos|fluxo]] e [[06-Desenvolvimento/Investimentos|registro de mudança]].

## 2026-11-04 — Investimentos por objetivo

- Criada a área Investimentos para Liberdade financeira, Apartamento e Metas.
- Adicionados cadastro com instituição e tipo, aportes datados, quantidades, preço médio e avaliação manual do valor atual.
- Incluída migração `0009_investments.sql` com RLS e operações transacionais; aplicada pelo usuário com catálogo de instituições reduzido.
- Instalada a versão de produção no Galaxy A54, preservando os dados; abertura e carga da área de investimentos verificadas.
- Detalhes: [[03-Fluxos/Investimentos|fluxo]] e [[06-Desenvolvimento/Investimentos|registro de mudança]].

## 2026-09-02 — Ajustes no resumo e lançamentos

- Exibida a data de inclusão de rendas e gastos com trabalho.
- Reordenados os indicadores do resumo para ganhos líquidos, gastos e saldo restante.
- Ajustado o espaçamento antes do filtro de categorias.
- Detalhes: [[06-Desenvolvimento/Ajustes-resumo-e-lancamentos|registro de mudança]].

## 2026-09-02 — Categoria Apartamento

- Adicionada a categoria Apartamento, inicialmente com meta de 0%.
- Criadas migrações para incluir a categoria e sua meta nas casas existentes.
- Detalhes: [[06-Desenvolvimento/Categoria-apartamento|registro de mudança]].

## 2026-08-03 — Gastos com trabalho

- Adicionada a dedução mensal de custos profissionais da renda disponível do orçamento.
- Criada a migração da tabela `work_expenses` com RLS.
- Ajustado o rodapé do resumo para rolar horizontalmente e não quebrar valores grandes.
- Detalhes: [[03-Fluxos/Gastos-com-trabalho|fluxo]] e [[06-Desenvolvimento/Gastos-com-trabalho|registro de mudança]].

## 2026-07-30 — Vault inicial

- Criada a base de documentação Obsidian do projeto.
- Registradas arquitetura, fluxos de orçamento e carteiras pessoais, dados Supabase, execução e convenções de manutenção.

> Para mudanças futuras, copie [[Templates/Registro-de-mudanca|o template]], documente a decisão e adicione aqui um resumo com links para as notas atualizadas.
