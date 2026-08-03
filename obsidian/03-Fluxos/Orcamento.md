---
tipo: fluxo
area: orçamento
atualizado: 2026-08-03
---

# Fluxo: Orçamento

## Carregamento mensal

Ao abrir ou trocar o mês, `BudgetProvider` busca em paralelo metas, sugestões, recorrentes, rendas, gastos com trabalho e gastos domésticos. A tela calcula o resumo com `computeSummary(goals, incomes, expenses, workExpenses)`.

`totalIncome` é a soma das rendas do mês; os gastos com trabalho são abatidos desse valor para formar a renda disponível. `totalSpent` é a soma somente dos gastos domésticos. Para cada categoria, o limite esperado é `renda disponível × meta / 100`; a porcentagem usada é `gasto / limite`.

## Lançamentos

- **Renda:** pertence ao mês visualizado, pode ser excluída e não é editável pela interface atual.
- **Gasto com trabalho:** pertence ao mês visualizado, tem descrição e valor, não se vincula a uma renda específica e pode ser excluído. Não integra nenhuma categoria doméstica nem o gráfico de gastos; reduz a renda disponível antes da distribuição das metas.
- **Gasto:** tem categoria, descrição, valor e data. O mês de referência é derivado dos sete primeiros caracteres da data (`YYYY-MM`).
- **Sugestões:** descrições de gastos existentes são deduplicadas sem diferenciar maiúsculas/minúsculas; ao escolher uma, a categoria correspondente é preenchida.
- **Agrupamento visual:** gastos com a mesma descrição no mesmo filtro aparecem juntos na lista. Isso é apenas apresentação, não vínculo de banco.

## Parcelamento de gastos

Na criação, o valor é dividido em `n` parcelas mensais. As parcelas recebem o mesmo `groupId`, seguem para os meses seguintes e preservam o dia de compra quando possível; em meses menores, usam o último dia. O último valor absorve qualquer diferença de arredondamento.

Editar altera somente o lançamento selecionado. Excluir qualquer parcela de um grupo exclui todas as parcelas com o mesmo `groupId`.

## Recorrentes

Um recorrente possui descrição, categoria e valor-base opcional. Selecioná-lo no Orçamento abre o formulário de gasto com categoria, descrição e possivelmente valor preenchidos. A confirmação cria um gasto comum; o modelo permanece inalterado.
