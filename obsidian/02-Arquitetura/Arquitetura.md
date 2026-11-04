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

- `src/app/minha-conta.tsx`: consulta `useAuth()` para exibir somente UUID e tipo da conta atual, acessível pelo drawer. Não modifica autenticação nem dados remotos.

- `src/app/_layout.tsx`: envolve a aplicação com `GestureHandlerRootView`, `SafeAreaProvider` e `AuthProvider`; só libera o drawer após obter sessão.
- Drawer: **Orçamento** (`(tabs)`), **Gastos Pessoais** (`besteira`) e **Investimentos** (`investimentos`).
- `src/app/(tabs)/_layout.tsx`: adiciona `BudgetProvider` às abas Orçamento, Recorrentes e Metas.
- `src/app/besteira/_layout.tsx`: adiciona `BesteiraProvider` à carteira pessoal.
- `AuthProvider`: reutiliza sessão persistida; sem sessão, `SignInScreen` oferece email/senha. Não cria novos usuários anônimos. Expõe erro de leitura da sessão e tentativa novamente.
- `BudgetProvider` e `BesteiraProvider`: concentram carregamento, estado da UI e tratamento de erro com `Alert`.
- `src/app/investimentos/_layout.tsx`: stack interno para visão geral (`index.tsx`) e páginas de objetivo (`[objective].tsx`). A rota dinâmica valida os três identificadores permitidos.
- `src/components/InvestmentsScreen.tsx`: tela compartilhada com objetivo opcional; sem objetivo mostra os três cards e resumo consolidado, com objetivo mostra seus detalhes, cadastro e investimentos. Estado da carteira e seleção do investimento são locais; carrega ao receber foco e registra `BackHandler` apenas durante o foco para respeitar os níveis de navegação. `InvestmentFormModal` reúne os formulários de cadastro, aporte e avaliação, mantendo erros no formulário.
- `InvestmentFiltersModal`: rascunho de filtros com aplicação/cancelamento e campos dependentes. `filterInvestments` faz a filtragem local; os resumos continuam usando a carteira completa do objetivo.
- `InvestmentRepository`: acesso dedicado às tabelas de investimentos e à função de criação transacional. `src/lib/investments.ts` concentra cálculos puros.

## Persistência

`BudgetProvider` instancia `SupabaseRepository` e `BesteiraProvider` instancia `SupabaseFunRepository`. `LocalRepository` e `LocalFunRepository` implementam os mesmos contratos para eventual modo offline, mas trocar para eles exige alterar explicitamente o ponto de instanciação no provider.

A área Investimentos usa Supabase por `InvestmentRepository`, sem implementação local. Ajustes no valor atual decorrentes de aportes são feitos no banco por gatilho transacional.

A migração 0011, aplicada pelo usuário em 2026-11-04 com funcionamento do app confirmado, separa autenticação de associação à casa: novos usuários autenticados não recebem profile automaticamente. Só membros previamente provisionados acessam os dados financeiros. O app oferece definição de senha em Minha conta e entrada por email/senha sem sessão; reset de senha esquecida e tela específica para usuário sem casa continuam pendentes. Aplicação e limites em [[05-Operacao/Restringir-acesso-a-casa]].

## Convenções importantes

- Base de dependências: Expo 56.0.24, React Native 0.85.3 e React 19.2.3. Patches de segurança e pendências transitivas em [[06-Desenvolvimento/Atualizacao-de-bibliotecas-2026-11-04]]; 18 pacotes npm ainda têm avisos conhecidos.

- `MonthKey` é `YYYY-MM`; no banco o mês é salvo como `YYYY-MM-01` em `reference_month`.
- Aliases TypeScript: `@/` aponta para `src/`.
- Valores monetários são `number` no app e `numeric(12,2)` no orçamento e `numeric(14,2)` em investimentos no banco.
- O cálculo de resumo é puro e está em `src/lib/budget.ts`.

Veja também [[04-Dados/Modelo-de-dados|Modelo de dados]] e [[03-Fluxos/Orcamento|Fluxo: Orçamento]].
