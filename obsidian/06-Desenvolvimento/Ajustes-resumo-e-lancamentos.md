---
tipo: registro-de-mudanca
data: 2026-09-02
---

# Registro de mudança — Ajustes no resumo e lançamentos

## Contexto

Tornar a origem temporal de rendas e gastos com trabalho visível e deixar os valores principais do resumo mais claros.

## O que mudou

- Rendas e gastos com trabalho agora mostram a data de inclusão abaixo da descrição.
- O rodapé do resumo passou a exibir, nesta ordem: Ganhos líquidos, Total gastos e Saldo restante.
- Adicionado espaçamento entre Incluir recorrente e o filtro de categoria.

## Como funciona

Ganhos líquidos correspondem à renda total menos os gastos com trabalho. Saldo restante corresponde aos ganhos líquidos menos os gastos domésticos totais. A data mostrada nas listas vem de `createdAt`.

## Impacto técnico

- Rotas/componentes: tela Orçamento e tabela de resumo.
- Provider/repositório: sem alterações; os dados de criação já eram retornados.
- Banco/migração: sem alterações.
- Variáveis/configuração: sem alterações.

## Casos de atenção

- O saldo restante pode ser negativo quando os gastos domésticos superarem os ganhos líquidos.

## Verificação

- [ ] Lint/testes executados
- [ ] Fluxo manual exercitado
- [x] Notas relacionadas atualizadas
- [x] Entrada adicionada a [[06-Desenvolvimento/Historico-de-mudancas]]
