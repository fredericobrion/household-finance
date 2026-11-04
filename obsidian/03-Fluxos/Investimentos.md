---
tipo: fluxo
atualizado: 2026-11-04
---

# Fluxo: Investimentos

## Acesso e objetivos

Menu lateral → **Investimentos**. Três objetivos fixos e independentes: Liberdade financeira, Apartamento e Metas. Metas é um grupo único nesta versão. Os cards exibem quantidade de investimentos, total aportado e valor atual de cada objetivo. Abaixo deles, o **Resumo geral** soma os três objetivos: total aportado, valor atual e valorização (percentual calculado sobre o total aportado da carteira inteira). Não há seleção dinâmica de objetivo na página principal.

Tocar em um card abre uma página própria (`/investimentos/[objective]`) com o nome do objetivo, seu resumo, o botão de cadastro e a lista exclusiva de seus investimentos. O cadastro já recebe esse objetivo. Abrir um investimento mostra seus detalhes; voltar retorna à lista do objetivo. O botão voltar do Android segue a hierarquia: detalhes do investimento → lista do objetivo → visão geral de investimentos → navegação principal. Nos detalhes, o evento é tratado enquanto a tela está em foco para fechar a seleção local antes de navegar; na página do objetivo, retorna à visão geral mesmo se o acesso tiver sido por link direto. Formulários continuam fechando pelo próprio tratamento do modal. A visão geral recarrega ao voltar, refletindo novos aportes e avaliações. Objetivos inválidos na URL redirecionam para a visão geral.

Esta área não altera as metas percentuais do orçamento e não lança gastos ou rendas automaticamente. Segue o modelo de casa compartilhada do app: membros da mesma casa acessam os mesmos investimentos.

## Cadastro

- Nome obrigatório, até 100 caracteres.
- Categoria: renda fixa ou variável. Trocar a categoria redefine o tipo.
- Tipos de renda fixa: CDB, RDB, LCI, LCA, LC, Tesouro Direto, Debênture, CRI, CRA, Poupança e Outros.
- Tipos de renda variável: Ação, FII, ETF, BDR e Outros.
- Instituição obrigatória, selecionada diretamente da lista do catálogo do banco, sem campo de texto ou busca. A migração oferece a opção Outra, mas o catálogo remoto foi reduzido pelo usuário às instituições utilizadas. Ampliações do catálogo são feitas no banco; não existe cadastro de instituições pelo app nesta versão.
- Vencimento opcional, exclusivo de renda fixa. Vazio significa **Sem vencimento**, adequado a reservas de emergência. A data aparece nos cards e detalhes; o botão **Editar vencimento** permite informar, alterar ou remover a data em posições já existentes. Trocar a categoria no cadastro limpa a data. Datas passadas são permitidas para posições já vencidas.
- Investimento inicial opcional: vazio significa zero. Um valor positivo exige data (hoje por padrão) e gera o primeiro aporte, na mesma transação do cadastro. Sem valor inicial, nenhum aporte é criado.
- Para renda variável com valor positivo, quantidade positiva obrigatória, com até 8 casas decimais. Sem valor inicial, a quantidade deve ficar vazia.

## Filtros da listagem

Na página de cada objetivo, o título **Investimentos do objetivo** fica à esquerda e o botão **Filtros** à direita, centralizados verticalmente na mesma linha. O título pode quebrar linha em telas estreitas; o botão mantém seu espaço. A ação Limpar filtros aparece abaixo quando houver filtros ativos. **Filtros** abre um modal com:

- Categoria: Todas, Renda fixa ou Renda variável.
- Instituição: Todas ou uma instituição do catálogo do banco.
- Tipo: aparece somente com uma categoria selecionada e oferece os tipos correspondentes.
- Ano de vencimento: aparece somente para renda fixa; oferece Todos, Sem vencimento e os anos presentes nas posições daquele objetivo, em ordem crescente.

Os critérios são combinados. Trocar categoria limpa tipo e ano, preservando a instituição. Aplicar atualiza a listagem; Cancelar ou voltar do modal descarta edições não aplicadas. Limpar filtros no modal prepara a seleção vazia, aplicada ao confirmar; Limpar filtros na página remove todos imediatamente.

A página mostra quantos filtros estão ativos e quantos investimentos correspondem. Quando não há resultados, informa que nenhum investimento corresponde aos critérios, mantendo a possibilidade de limpar os filtros. **O resumo do objetivo e o resumo geral não são filtrados.** A seleção fica no estado local da página, sem persistência no banco.

## Aportes e detalhes

Abrir um investimento mostra seu resumo e o histórico por data decrescente. Os botões Adicionar aporte, Atualizar valor atual, Editar vencimento (renda fixa) e Excluir investimento ocupam toda a largura, em coluna, com altura mínima de 52 e espaçamento uniforme. A área reservada à borda é igual em todos, incluindo a ação de exclusão. **Adicionar aporte** solicita valor positivo e data até hoje; renda variável exige quantidade. O preço por unidade é calculado como valor/quantidade e não é salvo.

Os aportes podem ser editados ou excluídos (exclusão pede confirmação). Corrigir data não altera os valores. Corrigir valor ajusta o valor atual pela diferença; corrigir quantidade recalcula quantidade e preço médio. Excluir subtrai o valor do aporte do valor atual, limitado a zero.

## Exclusão de investimento

Nos detalhes, **Excluir investimento** abre confirmação explícita com o nome da posição e avisa que todos os aportes serão removidos permanentemente. Cancelar não altera os dados. Confirmar exclui a posição e seus aportes em cascata, pela mesma transação do banco, e retorna à lista do objetivo, atualizando seus totais. O resumo geral recarrega ao receber foco. Falhas exibem mensagem e preservam a posição; requisições duplicadas são bloqueadas durante a exclusão.

## Cálculos

- Total aportado = soma dos valores do histórico, incluindo o aporte inicial.
- Quantidade total = soma das quantidades do histórico.
- Preço médio de compra = total aportado / quantidade total (somente renda variável).
- Valor atual começa em zero e recebe o aporte inicial e cada aporte posterior.
- Valorização em reais = valor atual − total aportado.
- Valorização percentual = valorização / total aportado × 100. Sem aportes, o percentual aparece como `—`.
- Sem quantidade, preço médio aparece como `—`.

Exemplo: compra de 100 ações por R$ 2.000, avaliação manual em R$ 2.500 → preço médio R$ 20, valorização R$ 500 / 25%. Comprar mais 50 por R$ 1.500 resulta em 150 ações, custo de R$ 3.500, preço médio R$ 23,33 e valor atual de R$ 4.000.

## Avaliação manual

**Atualizar valor atual** aceita valor não negativo, inclusive zero. Essa ação registra a data da avaliação manual e preserva aportes, quantidades e custo médio. Novos aportes são somados ao último valor atual. A tela informa quando não há avaliação manual ou mostra a data da última avaliação; aportes posteriores não mudam essa data.

O indicador de valorização é uma diferença simples de valores, sem cálculo de retorno anualizado. Não há cotações automáticas, vendas, resgates, dividendos, taxas separadas ou histórico de avaliações nesta versão.

## Erros e segurança

Falhas de carregamento mostram mensagem e opção para tentar novamente; é possível puxar a tela para atualizar. Falhas ao salvar preservam o formulário e seus dados. Se a escrita concluir mas a recarga falhar, o formulário fecha e a tela pede nova carga, evitando reaplicar o mesmo aporte. O envio é bloqueado enquanto estiver em andamento.

Banco: RLS por casa e chave estrangeira composta impedem associar aportes a posições de outra casa. Um gatilho ajusta o valor atual na mesma transação do aporte. A criação do investimento e de seu aporte inicial usa uma função transacional.

Veja [[04-Dados/Modelo-de-dados]] e [[06-Desenvolvimento/Investimentos]].
