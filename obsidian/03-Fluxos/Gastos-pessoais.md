---
tipo: fluxo
area: gastos-pessoais
atualizado: 2026-07-30
---

# Fluxo: Gastos pessoais

Cada pessoa possui uma carteira independente, com lançamentos de `saldo` (crédito) e `gasto` (débito).

## Cálculo de saldo

```text
saldo final = saldo acumulado até o mês anterior
            + saldos lançados no mês
            - gastos lançados no mês
```

`balanceBefore` é calculado no repositório por meio de todos os lançamentos da pessoa anteriores ao `reference_month` visualizado. Por isso o saldo é carregado de um mês para o outro, sem gerar registros de transferência.

## Pessoas e lançamentos

- A primeira pessoa adicionada é selecionada automaticamente.
- Trocar pessoa ou mês recarrega lançamentos e saldo anterior.
- Remover uma pessoa remove seus lançamentos por cascata no banco.
- Gastos podem ser parcelados; as parcelas são criadas em meses consecutivos e têm o mesmo `groupId`.
- Excluir qualquer parcela remove a compra parcelada inteira. Saldos não são parceláveis.
