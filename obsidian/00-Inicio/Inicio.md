---
tipo: indice
projeto: Finance App
atualizado: 2026-07-30
---

# Finance App

Vault de contexto vivo do aplicativo **Orçamento**. Use esta nota como ponto de partida e atualize o vault junto com cada mudança de produto, arquitetura ou operação.

## Mapa

- [[01-Produto/Visao-geral|Visão geral]] — propósito, funcionalidades e limites atuais.
- [[02-Arquitetura/Arquitetura|Arquitetura]] — camadas, rotas, providers e dependências.
- [[03-Fluxos/Orcamento|Fluxo: Orçamento]]
- [[03-Fluxos/Gastos-pessoais|Fluxo: Gastos pessoais]]
- [[04-Dados/Modelo-de-dados|Modelo de dados]] — Supabase, RLS e migrações.
- [[05-Operacao/Como-rodar|Como rodar]] — pré-requisitos, variáveis e comandos.
- [[06-Desenvolvimento/Convencoes-e-manutencao|Convenções e manutenção]]
- [[Templates/Registro-de-mudanca|Template: registro de mudança]]

## Estado atual

- Plataforma: Expo SDK 56 / React Native / TypeScript.
- Persistência em uso: Supabase; os repositórios locais existem como alternativa, mas não estão ativos.
- Acesso: login anônimo do Supabase, com sessão persistida no dispositivo.
- Navegação: drawer principal, abas de Orçamento e tela de Gastos pessoais.

## Regra do vault

Toda implementação deve atualizar pelo menos uma nota existente ou gerar uma nova nota em `03-Fluxos`, `04-Dados` ou `06-Desenvolvimento`. Inclua também uma entrada em [[06-Desenvolvimento/Historico-de-mudancas|Histórico de mudanças]] quando a alteração for relevante para compreender o sistema.
