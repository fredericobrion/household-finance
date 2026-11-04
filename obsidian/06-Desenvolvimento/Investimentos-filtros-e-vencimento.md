---
tipo: registro-de-mudanca
atualizado: 2026-11-04
---

# Registro de mudança — Vencimento e filtros de investimentos

## Contexto

Identificar aplicações de renda fixa com data de vencimento, preservando reservas sem data definida, e localizar posições por categoria, instituição, tipo e ano de vencimento.

## O que mudou

- Vencimento opcional no cadastro de renda fixa e nos cards/detalhes; posições existentes podem definir, alterar ou remover a data por **Editar vencimento**.
- Botão **Filtros** na listagem de cada objetivo, com seleção combinada de categoria, instituição, tipo e ano de vencimento.
- Tipo aparece apenas após escolher renda fixa/variável; ano aparece somente para renda fixa, com opção Sem vencimento.
- Contagem de filtros ativos e de resultados, aplicação/cancelamento e limpeza.

## Como funciona

Veja [[03-Fluxos/Investimentos]]. Filtros alteram somente a lista: o resumo mantém o total de todas as posições daquele objetivo. Trocar categoria limpa tipo e ano, mantendo instituição. Ao fechar o modal sem aplicar, o filtro anterior permanece. O vencimento não modifica aportes, quantidade, preço médio, valor atual ou data da avaliação.

## Impacto técnico

- Rotas/componentes: `InvestmentFormModal.tsx`, `InvestmentFiltersModal.tsx`, `InvestmentsScreen.tsx`.
- Repositório: leitura de `maturity_date`, envio do vencimento na criação e atualização independente restrita à renda fixa.
- Domínio: contratos em `src/types/investment.ts`, funções puras `filterInvestments` e `changeFilterCategory` em `src/lib/investments.ts`.
- Banco/migração: `0010_investment_maturity.sql`, nova coluna nullable e restrição de categoria, com sobrecarga transacional de `create_investment`.
- Variáveis/configuração/dependências: sem alterações.

## Casos de atenção

- Aplicar **somente `0010_investment_maturity.sql`**, depois da migração 0009 já existente, no SQL Editor do Supabase antes de usar a próxima versão. Aplicada pelo usuário no Supabase em 2026-11-04; coluna confirmada por consulta sem leitura de registros.
- A assinatura de criação anterior permanece funcional para o APK atualmente instalado. Posições existentes começam sem vencimento. O catálogo customizado de instituições não é alterado.
- Datas passadas são aceitas para registrar aplicações já vencidas; não há vencimento obrigatório ou limite ligado à data do aporte.
- Filtros são locais à página do objetivo e não são persistidos no banco.
- O usuário solicitou acumular mudanças e gerar/instalar versão no celular **somente quando pedir explicitamente**. Nenhum build ou instalação Android foi realizado nesta mudança.

## Verificação

- [x] Checagem TypeScript (`npx tsc --noEmit`).
- [x] Dez testes puros (`node tests/investments.test.cjs`): cálculos, combinação dos filtros, ausência de vencimento, resultados vazios, limpeza das dependências e filtros ocultos.
- [x] Migrações 0009 + 0010 em PostgreSQL isolado (`tests/investments-db.mjs`): assinatura antiga, vencimento opcional, edição/remoção, categoria, datas finitas e rollback da criação inválida, além das regras anteriores.
- [x] Notas relacionadas e [[06-Desenvolvimento/Historico-de-mudancas]] atualizados.
- [x] Migração 0010 aplicada pelo usuário no Supabase remoto e coluna confirmada.
- [x] Após pedido do usuário, APK release instalado no Galaxy A54 (SM-A546E), package `com.fredericobrion.financeapp`, versão 1.0.0; abertura da página do objetivo e do painel de filtros confirmada sem erros.
- [ ] Validação manual completa de cadastro/edição de vencimento pelo usuário.

## Preparação da versão — 2026-11-04

Após pedido explícito do usuário, gerado APK de produção com vencimentos, filtros e padronização dos botões. Checagem TypeScript e dez testes de domínio aprovados; `:app:assembleRelease` concluído com sucesso. APK em `android/app/build/outputs/apk/release/app-release.apk`.

A verificação inicial sem leitura de registros (`select=maturity_date&limit=0`) detectou a falta da coluna; o usuário executou a migração 0010 e a nova verificação retornou HTTP 200. Em seguida, APK instalado com `adb install -r`, preservando dados. Atualização confirmada por `dumpsys package`; página do objetivo carregou o resumo e o botão Filtros, e o painel de filtros abriu normalmente. Nenhum investimento foi alterado durante a verificação.

## Alinhamento do cabeçalho da lista — 2026-11-04

Título à esquerda e botão Filtros à direita, com `alignItems: center` e sem margem superior no botão. O título ocupa o espaço restante e pode quebrar linha; o botão não encolhe. Limpar filtros foi separado do cabeçalho para não deslocar o alinhamento quando houver filtros ativos. Verificação TypeScript; sem alteração de banco e sem novo build/instalação até pedido do usuário.

## Última versão do dia — 2026-11-04

Após pedido explícito, APK release regenerado e instalado no Galaxy A54 (SM-A546E), package `com.fredericobrion.financeapp`, preservando dados. `tsc`, build e instalação aprovados. Confirmado `assets/index.android.bundle` dentro do APK. App abriu diretamente no objetivo; o título da listagem e botão Filtros foram verificados à esquerda/direita com centros verticais alinhados. Não depende de cabo, computador ou Metro para executar; os dados continuam exigindo internet para Supabase.
