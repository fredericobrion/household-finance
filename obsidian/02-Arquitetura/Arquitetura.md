---
tipo: arquitetura
atualizado: 2026-11-04
---

# Arquitetura

## Visão de camadas

```text
Expo Router (src/app)
  -> Providers de estado (src/data/*Provider.tsx)
    -> Contratos de repositório (repository.ts / funRepository.ts)
      -> Supabase (fonte ativa) ou AsyncStorage (alternativa local)
        -> Supabase Auth + PostgreSQL com RLS
```

## Navegação e estado

- `src/app/_layout.tsx`: envolve a aplicação com `GestureHandlerRootView`, `SafeAreaProvider` e `AuthProvider`; só libera o drawer após obter sessão.
- Drawer: **Orçamento** (`(tabs)`), **Gastos Pessoais** (`besteira`) e **Investimentos** (`investimentos`).
- `src/app/(tabs)/_layout.tsx`: adiciona `BudgetProvider` às abas Orçamento, Recorrentes e Metas.
- `src/app/besteira/_layout.tsx`: adiciona `BesteiraProvider` à carteira pessoal.
- `AuthProvider`: reutiliza sessão persistida ou chama `signInAnonymously()`; expõe erro e tentativa novamente.
- `BudgetProvider` e `BesteiraProvider`: concentram carregamento, estado da UI e tratamento de erro com `Alert`.
- `src/app/investimentos/_layout.tsx`: stack interno para visão geral (`index.tsx`) e páginas de objetivo (`[objective].tsx`). A rota dinâmica valida os três identificadores permitidos.
- `src/components/InvestmentsScreen.tsx`: tela compartilhada com objetivo opcional; sem objetivo mostra os três cards e resumo consolidado, com objetivo mostra seus detalhes, cadastro e investimentos. Estado da carteira e seleção do investimento são locais; carrega ao receber foco e registra `BackHandler` apenas durante o foco para respeitar os níveis de navegação. `InvestmentFormModal` reúne os formulários de cadastro, aporte e avaliação, mantendo erros no formulário.
- `InvestmentFiltersModal`: rascunho de filtros com aplicação/cancelamento e campos dependentes. `filterInvestments` faz a filtragem local; os resumos continuam usando a carteira completa do objetivo.
- `InvestmentRepository`: acesso dedicado às tabelas de investimentos e à função de criação transacional. `src/lib/investments.ts` concentra cálculos puros.

## Persistência

`BudgetProvider` instancia `SupabaseRepository` e `BesteiraProvider` instancia `SupabaseFunRepository`. `LocalRepository` e `LocalFunRepository` implementam os mesmos contratos para eventual modo offline, mas trocar para eles exige alterar explicitamente o ponto de instanciação no provider.

A área Investimentos usa Supabase por `InvestmentRepository`, sem implementação local. Ajustes no valor atual decorrentes de aportes são feitos no banco por gatilho transacional.

## Convenções importantes

- `MonthKey` é `YYYY-MM`; no banco o mês é salvo como `YYYY-MM-01` em `reference_month`.
- Aliases TypeScript: `@/` aponta para `src/`.
- Valores monetários são `number` no app e `numeric(12,2)` no orçamento e `numeric(14,2)` em investimentos no banco.
- O cálculo de resumo é puro e está em `src/lib/budget.ts`.

Veja também [[04-Dados/Modelo-de-dados|Modelo de dados]] e [[03-Fluxos/Orcamento|Fluxo: Orçamento]].
