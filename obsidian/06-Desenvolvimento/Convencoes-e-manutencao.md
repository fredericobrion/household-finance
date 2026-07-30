---
tipo: desenvolvimento
atualizado: 2026-07-30
---

# Convenções e manutenção

## Antes de implementar

1. Leia as notas de fluxo e dados afetadas.
2. Para mudanças Expo, consulte a [documentação exata do Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/).
3. Preserve a separação: tela → provider → contrato → repositório.
4. Em mudanças persistentes, crie uma migração nova; não edite uma já aplicada em produção.

## Ao concluir uma implementação

1. Atualize a nota de fluxo, arquitetura ou dados pertinente.
2. Registre a mudança relevante em [[Historico-de-mudancas]].
3. Caso seja uma funcionalidade nova, crie uma nota em `03-Fluxos` a partir do [[Templates/Registro-de-mudanca|template]].
4. Rode uma verificação proporcional, ao menos `npm run lint` quando aplicável.

## Pontos de atenção

- Parcelas têm efeito em vários meses e exclusão por grupo; teste criação, visualização e remoção.
- A edição de uma parcela é individual, embora a exclusão seja do grupo inteiro.
- O repositório local não está ativo; mudanças feitas nele não aparecem no app até que o provider seja alterado.
- `EXPO_PUBLIC_*` é embutido no cliente: apenas valores públicos próprios para o app devem usar esse prefixo.
