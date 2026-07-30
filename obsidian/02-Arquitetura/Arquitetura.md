---
tipo: arquitetura
atualizado: 2026-07-30
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
- Drawer: **Orçamento** (`(tabs)`) e **Gastos Pessoais** (`besteira`).
- `src/app/(tabs)/_layout.tsx`: adiciona `BudgetProvider` às abas Orçamento, Recorrentes e Metas.
- `src/app/besteira/_layout.tsx`: adiciona `BesteiraProvider` à carteira pessoal.
- `AuthProvider`: reutiliza sessão persistida ou chama `signInAnonymously()`; expõe erro e tentativa novamente.
- `BudgetProvider` e `BesteiraProvider`: concentram carregamento, estado da UI e tratamento de erro com `Alert`.

## Persistência

`BudgetProvider` instancia `SupabaseRepository` e `BesteiraProvider` instancia `SupabaseFunRepository`. `LocalRepository` e `LocalFunRepository` implementam os mesmos contratos para eventual modo offline, mas trocar para eles exige alterar explicitamente o ponto de instanciação no provider.

## Convenções importantes

- `MonthKey` é `YYYY-MM`; no banco o mês é salvo como `YYYY-MM-01` em `reference_month`.
- Aliases TypeScript: `@/` aponta para `src/`.
- Valores monetários são `number` no app e `numeric(12,2)` no banco.
- O cálculo de resumo é puro e está em `src/lib/budget.ts`.

Veja também [[04-Dados/Modelo-de-dados|Modelo de dados]] e [[03-Fluxos/Orcamento|Fluxo: Orçamento]].
