---
tipo: registro-de-mudanca
data: 2026-08-03
area: orçamento
---

# Registro de mudança — Gastos com trabalho

## Contexto

A renda pode ter custos obrigatórios de trabalho, como impostos, que não devem ser tratados como gastos do orçamento doméstico, mas precisam reduzir o valor realmente disponível no mês.

## O que mudou

- Criada a seção mensal de gastos com trabalho abaixo da renda.
- Incluídos lançamento e exclusão de custos profissionais independentes de qualquer renda.
- Resumo e metas passaram a usar a renda disponível, após essa dedução.
- O rodapé do resumo passou a ter rolagem horizontal, preservando a leitura dos totais em valores altos.
- Adicionada a tabela `work_expenses` ao Supabase.

## Como funciona

O usuário lança a renda bruta normalmente. Cada gasto com trabalho soma ao total profissional do mês; a aplicação calcula `renda disponível = renda - gastos com trabalho`. Os gastos domésticos e o gráfico permanecem separados desses custos.

## Impacto técnico

- Rotas/componentes: tela principal de Orçamento, formulário de renda reutilizado com rótulos de gasto profissional e tabela de resumo com rodapé rolável.
- Provider/repositório: `BudgetProvider`, contrato de repositório e implementações local e Supabase passam a listar, criar e excluir gastos com trabalho.
- Banco/migração: `0006_work_expenses.sql` cria `work_expenses`, índice por casa/mês e RLS.
- Variáveis/configuração: nenhuma alteração.

## Casos de atenção

- Se os gastos com trabalho superarem a renda, a renda disponível pode ficar negativa; os limites das categorias são zerados para não criar orçamentos negativos.

## Verificação

- [ ] Lint/testes executados
- [ ] Fluxo manual exercitado
- [x] Notas relacionadas atualizadas
- [x] Entrada adicionada a [[06-Desenvolvimento/Historico-de-mudancas]]
