---
tipo: registro-de-mudanca
data: 2026-09-02
---

# Registro de mudança — Categoria Apartamento

## Contexto

Permitir separar o percentual reservado para apartamento das demais categorias do orçamento.

## O que mudou

- Adicionada a categoria `Apartamento` às metas, lançamentos e recorrentes.
- A meta padrão é 0%, preservando a distribuição padrão anterior de 100%.
- Criadas migrações para incluir a categoria e a meta nas casas já existentes.

## Como funciona

A categoria aparece na tela Metas e nos seletores de categoria. A pessoa usuária pode atribuir-lhe um percentual desde que a soma de todas as categorias permaneça em 100%.

## Impacto técnico

- Rotas/componentes: telas que usam a lista central de categorias.
- Provider/repositório: leitura e gravação de metas incluem `apartamento`.
- Banco/migração: enum `budget_category` e tabela `goals` atualizados pelas migrações `0007` e `0008`.
- Variáveis/configuração: sem alterações.

## Casos de atenção

- Aplicar as duas migrações em sequência: a segunda depende do novo valor do enum criado pela primeira.

## Verificação

- [x] Checagem de tipos executada (`npx tsc --noEmit`).
- [ ] Lint pendente: a configuração automática apontou erros preexistentes em telas e componentes fora desta mudança.
- [ ] Fluxo manual exercitado
- [x] Notas relacionadas atualizadas
- [x] Entrada adicionada a [[06-Desenvolvimento/Historico-de-mudancas]]
