---
tipo: registro-de-mudanca
atualizado: 2026-11-04
---

# Registro de mudança — Investimentos por objetivo

## Contexto

Acompanhar investimentos em Liberdade financeira, Apartamento e Metas, preservando o histórico de aportes e permitindo informar manualmente quanto cada posição vale.

## O que mudou

- Nova área no drawer, com totais por objetivo, cadastro, detalhes e histórico de aportes.
- Categorias e tipos dependentes, seleção de instituição e quantidade para renda variável.
- Aportes com data, edição e exclusão; preço por unidade e preço médio calculados.
- Avaliação manual independente do custo, com data da última avaliação e valorização simples.

## Como funciona

Regras e exemplos: [[03-Fluxos/Investimentos]]. Metas permanece um único grupo; não existem subobjetivos nesta versão. Os dados seguem o household compartilhado existente. A funcionalidade não movimenta o orçamento mensal.

## Impacto técnico

- Rotas/componentes: stack em `src/app/investimentos/_layout.tsx`, visão geral `index.tsx`, objetivo `[objective].tsx`, tela compartilhada `InvestmentsScreen.tsx`, `InvestmentFormModal.tsx` e registro no drawer raiz.
- Estado/repositório: estado local da área, atualização ao receber foco e `InvestmentRepository` específico para Supabase. Não há fallback local ativo.
- Domínio: `src/types/investment.ts`; cálculos puros em `src/lib/investments.ts`.
- Banco/migração: `0009_investments.sql`, catálogo de instituições, posições, aportes, RLS, gatilho de ajuste e função atômica de cadastro.
- Variáveis/configuração: nenhuma nova variável ou dependência do app.

## Casos de atenção

- Migração validada em PostgreSQL isolado e executada pelo usuário no Supabase, com redução do catálogo inicial de instituições. Leitura de posições, aportes e catálogo confirmada no aparelho. Não repetir a migração após aplicada.
- Avaliações não têm histórico: somente o valor atual e a data da última avaliação são mantidos.
- Exclusão/edição de aporte ajustam o saldo pelo delta, limitado a zero; o usuário pode reavaliar a posição depois.
- Catálogo de instituições é global e somente leitura para clientes autenticados; manutenção administrativa pelo banco.
- Preservada a alteração preexistente em `obsidian/.obsidian/workspace.json`.

## Verificação

- [x] `npx tsc --noEmit`.
- [x] `node tests/investments.test.cjs`: cinco testes dos cálculos, custo médio, avaliação independente, zero, centavos e quantidades fracionárias.
- [x] `npx expo export --platform android --output-dir /tmp/finance-investments-export`.
- [x] Migração executada em PostgreSQL isolado (PGlite), com testes de cadastro atômico, avaliação, aporte, edição, exclusão, validações e isolamento entre casas.
- [x] Migração aplicada pelo usuário no Supabase remoto; leitura das tabelas confirmada no aparelho.
- [x] APK release gerado com `NODE_ENV=production ./gradlew :app:assembleRelease --no-daemon --console=plain` e instalado com `adb install -r`, preservando dados.
- [x] Abertura verificada no Samsung Galaxy A54 (SM-A546E), package `com.fredericobrion.financeapp`, versão 1.0.0, em 2026-11-04. Tela de investimentos e formulário abriram; catálogo customizado carregou sem erros. Formulário fechado sem gravar dados fictícios.
- [ ] Validação manual completa de cadastro, aportes e avaliação com o usuário no celular.
- [x] Notas relacionadas atualizadas.
- [x] Entrada adicionada a [[06-Desenvolvimento/Historico-de-mudancas]].

### Reexecutar a validação SQL isolada

A dependência de teste fica fora do projeto e não modifica o banco remoto:

```sh
npm install --prefix /tmp/finance-investments-validation --no-save --package-lock=false @electric-sql/pglite
PGLITE_MODULE=/tmp/finance-investments-validation/node_modules/@electric-sql/pglite/dist/index.js node tests/investments-db.mjs
```

## Ajuste de navegação — 2026-11-04

Após o primeiro cadastro validado pelo usuário, o resumo principal passou a consolidar os três objetivos. Os cards agora navegam para páginas próprias com resumo e listagem filtrada; o cadastro é feito dentro do objetivo. O voltar retorna ao nível anterior e as telas recarregam ao receber foco. Não há alteração de esquema ou dependência.

Validação: checagem TypeScript, cinco testes dos cálculos e build Android release aprovados. Atualização instalada no Galaxy A54 preservando os dados. Confirmados no aparelho: resumo geral abaixo dos três objetivos, abertura de Liberdade financeira em página própria com resumo/cadastro/listagem e retorno à visão geral pelo voltar do Android. Nenhum dado fictício foi inserido durante a verificação.

## Seleção direta de instituição — 2026-11-04

Removidos campo de busca, estado e filtragem de instituições em `InvestmentFormModal.tsx`. O cadastro exibe apenas a lista fornecida pelo banco, com seleção obrigatória. Sem mudança de esquema, catálogo ou dependências. TypeScript e build Android release aprovados; atualização instalada no Galaxy A54 preservando os dados. Verificados no aparelho: abertura do cadastro, ausência do campo de busca e presença da lista de instituições.

## Exclusão de posição e voltar do Android — 2026-11-04

Adicionado `InvestmentRepository.deleteInvestment()` e botão destrutivo nos detalhes, com confirmação de exclusão permanente da posição e de todos os aportes. O cascade já existe em `0009_investments.sql`, sem nova migração. Após sucesso, a posição sai do estado local e a tela retorna à lista do objetivo antes da recarga; erros de escrita preservam os dados e avisam o usuário.

O voltar físico antes não reconhecia a seleção local do investimento e podia sair da área. `BackHandler`, registrado somente durante o foco da tela, fecha primeiro os detalhes, depois retorna do objetivo à visão geral com `router.dismissTo`. Os botões visuais usam a mesma lógica. Modais mantêm seu próprio `onRequestClose`.

Validações aprovadas: TypeScript, teste PostgreSQL isolado incluindo exclusão da posição com cascade de aportes e build Android release. Atualização instalada no Galaxy A54, versão 1.0.0, package `com.fredericobrion.financeapp`. No aparelho: confirmação com aviso de exclusão permanente de aportes, cancelamento preservando a posição, voltar dos detalhes à lista do objetivo e segundo voltar à visão geral. Nenhum investimento do usuário foi excluído.

## Vencimento e filtros — 2026-11-04

Adicionados vencimento opcional de renda fixa e filtros na listagem por objetivo. Detalhes técnicos, migração pendente e verificações em [[06-Desenvolvimento/Investimentos-filtros-e-vencimento]]. Build e instalação no celular somente mediante pedido explícito do usuário.

## Tamanho dos botões dos detalhes — 2026-11-04

Padronizados Adicionar aporte, Atualizar valor atual, Editar vencimento e Excluir investimento em `InvestmentsScreen.tsx`: coluna com largura total, altura mínima de 52, mesma borda e espaçamento. A altura mínima permite acomodar fontes ampliadas, sem cortar texto. Mantidas cores de ação principal e exclusão. Sem mudança de banco ou dependências. Verificação: TypeScript; build e instalação aguardam pedido explícito do usuário.

## Versão com vencimentos, filtros e botões — 2026-11-04

Após pedido explícito do usuário, gerado e instalado APK release no Galaxy A54 com os ajustes acumulados. Migração 0010 aplicada pelo usuário e confirmada antes da instalação. Tipos, dez testes de domínio e build aprovados; abertura da página do objetivo e painel de filtros verificadas no aparelho. Dados preservados. Para detalhes, veja [[06-Desenvolvimento/Investimentos-filtros-e-vencimento]].
