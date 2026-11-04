---
tipo: historico
atualizado: 2026-11-04
---

# Histórico de mudanças

## 2026-11-04 — Patches de segurança das bibliotecas

- Atualizadas dependências permitidas pelo projeto e alinhados módulos ao Expo 56.0.24, sem migração major ou overrides forçados.
- Audit npm passou de 32 para 18 pacotes afetados; alerta crítico eliminado. Permanecem 6 altos, 10 moderados e 2 baixos, incluindo propagação transitiva.
- TypeScript, testes de investimentos/acesso, árvore npm, verificação online de compatibilidade Expo e build Android release passaram. APK instalado por USB no Galaxy A54 preservando dados; abertura de Minha conta e mesma sessão permanente verificadas.
- Detalhes e pendências em [[06-Desenvolvimento/Atualizacao-de-bibliotecas-2026-11-04]].

## 2026-11-04 — Retirada de acessos anteriores

- Usuário confirmou uso exclusivo no celular atual. Preparado script administrativo para retirar quatro vínculos anteriores preservando a identidade validada, usuários Auth e dados financeiros.
- PostgreSQL isolado validou proteções de contagem e preservação do proprietário/outras casas. Aplicado pelo usuário em produção: quatro vínculos removidos e funcionamento do app confirmado. Usuários Auth preservados. Procedimento em [[05-Operacao/Restringir-acesso-a-casa]].

## 2026-11-04 — Definição de senha e entrada

- Minha conta permite definir senha com confirmação; após salvar, valida login, UUID e casa com cliente efêmero sem substituir a sessão principal.
- Sem sessão salva, app oferece email/senha em vez de criar usuário anônimo. Erros e estado de carregamento tratados; sessão existente preservada.
- TypeScript, testes de validação/identidade/erros e build release passaram. Atualização instalada no Galaxy A54 (SM-A546E), pacote `com.fredericobrion.financeapp`, preservando dados. Interface confirmou Minha conta, mesma identidade permanente e formulário Definir senha. Usuário definiu a senha no aparelho e confirmou a mensagem de sucesso: login com email/senha, mesma identidade e acesso à casa validados pelo cliente efêmero. Revisão dos demais membros ainda pendente. Sem dependências ou migrações novas.
- Reset de senha esquecida e revisão de membros anteriores continuam pendentes. Fluxo em [[03-Fluxos/Minha-conta]].

## 2026-11-04 — Solicitação de vínculo de email

- Minha conta permite solicitar email de confirmação preservando o UUID da sessão anônima e consultar confirmação no servidor. Conflitos não trocam nem mesclam contas.
- Sem alteração de banco, dependências ou inclusão de email real no código/documentação. TypeScript e build release passaram; atualização instalada no Galaxy A54 preservando dados. Vínculo solicitado pelo app com o email autorizado. Interface passou a exibir Permanente, com o mesmo identificador.
- Usuário confirmou pelo SQL Editor o email correto, `is_anonymous=false` e `email_confirmed_at` preenchido, sem receber link. Configuração de confirmação automática não inspecionada. Login recuperável ainda pendente. Detalhes em [[03-Fluxos/Minha-conta]].

## 2026-11-04 — Identificação da sessão no celular

- Adicionada tela Minha conta ao menu lateral, com identificador selecionável e tipo da conta. Não exibe tokens e preserva a sessão existente.
- Sem alteração de dependências ou banco; fluxo em [[03-Fluxos/Minha-conta]].
- TypeScript e build release passaram. Atualização instalada por USB no Galaxy A54 (SM-A546E), pacote `com.fredericobrion.financeapp`, preservando dados. Tela Minha conta aberta; usuário confirmou conta anônima e identificador correspondente à lista administrativa, sem registrar o identificador real no vault.

## 2026-11-04 — Contenção de associação automática à casa

- Preparada migração 0011: novo cadastro não recebe casa/profile; clientes não podem criar/excluir perfis ou alterar campos de autorização. Membros existentes preservados, sujeitos a revisão.
- Testes PostgreSQL isolados passaram para acesso existente, rejeição de não membros, privilégios por coluna e reaplicação.
- **Aplicada pelo usuário no Supabase**, com confirmação de que o app continua funcionando. Conferência dos privilégios em produção e revisão dos membros ainda pendentes; sem alteração do APK ou implementação de recuperação. Procedimento em [[05-Operacao/Restringir-acesso-a-casa]].

## 2026-11-04 — Auditoria de segurança

- Revisadas dependências npm, autorização nas migrações, armazenamento de sessão e APK release local.
- Registrados 32 pacotes afetados por avisos conhecidos e falhas de associação/autorização de usuários no código do Supabase; produção não foi validada.
- Documentadas prioridades, evidências e limites em [[06-Desenvolvimento/Auditoria-de-seguranca-2026-11-04]]. Sem alteração funcional, de banco ou instalação.

## 2026-11-04 — Busca por nome e aporte por preço médio

- Adicionada busca por nome abaixo do cabeçalho da listagem, combinada com os filtros existentes.
- Incluído seletor Valor total/Preço médio nos aportes de renda variável; preço por unidade e quantidade geram o mesmo total persistido de antes.
- Sem mudança de banco; TypeScript e 13 testes de domínio aprovados. Após solicitação explícita, build release instalado no Galaxy A54 com dados preservados; abertura e busca visível confirmadas.
- Detalhes: [[03-Fluxos/Investimentos]] e [[06-Desenvolvimento/Investimentos]].

## 2026-11-04 — Publicação da branch de investimentos

- Criada `codex/investimentos-por-objetivo` a partir da main remota atualizada e registrado o commit da funcionalidade.
- Corrigido o remoto local deste checkout de HTTPS para o alias SSH pessoal, sem alterar a configuração de trabalho.
- Autenticação pessoal e push confirmados. Orientações em [[05-Operacao/Como-rodar]].

## 2026-11-04 — Alinhamento do botão de filtros

- Título da listagem à esquerda e botão Filtros à direita, com centros alinhados verticalmente.
- Limpar filtros aparece abaixo, preservando o alinhamento do cabeçalho.
- TypeScript verificado; após pedido explícito, última versão release do dia instalada no Galaxy A54 com abertura e alinhamento confirmados. Detalhes: [[06-Desenvolvimento/Investimentos-filtros-e-vencimento]].

## 2026-11-04 — Botões dos detalhes de investimentos

- Padronizados largura, altura mínima e espaçamento das ações do investimento, incluindo edição de vencimento.
- Verificação TypeScript; sem build ou instalação no celular.
- Detalhes: [[06-Desenvolvimento/Investimentos]].

## 2026-11-04 — Vencimento opcional e filtros de investimentos

- Adicionado vencimento opcional à renda fixa, com edição/remoção em posições existentes.
- Incluídos filtros combinados por categoria, instituição, tipo dependente da categoria e ano de vencimento exclusivo da renda fixa, incluindo Sem vencimento.
- Criada migração 0010, aplicada pelo usuário. Após pedido explícito, versão release instalada no Galaxy A54 com abertura e painel de filtros verificados.
- Detalhes: [[06-Desenvolvimento/Investimentos-filtros-e-vencimento|registro]] e [[03-Fluxos/Investimentos|fluxo]].

## 2026-11-04 — Exclusão de investimento e voltar do Android

- Adicionada exclusão de investimento com confirmação, incluindo seus aportes em cascata.
- Corrigido voltar do celular: detalhes → objetivo → visão geral, sem pular para Orçamento.
- Sem nova migração. Detalhes: [[03-Fluxos/Investimentos]] e [[06-Desenvolvimento/Investimentos]].

## 2026-11-04 — Seleção direta de instituição

- Removido o campo de busca de instituição no cadastro de investimentos; somente a lista permanece.
- Sem alteração de banco ou catálogo. Detalhes: [[03-Fluxos/Investimentos]].

## 2026-11-04 — Resumo geral e páginas de objetivos

- Resumo da página principal passou a consolidar os três objetivos.
- Cada objetivo abre uma página própria com resumo, cadastro e listagem de seus investimentos.
- Alteração de navegação e apresentação, sem migração de banco.
- Detalhes: [[03-Fluxos/Investimentos|fluxo]] e [[06-Desenvolvimento/Investimentos|registro de mudança]].

## 2026-11-04 — Investimentos por objetivo

- Criada a área Investimentos para Liberdade financeira, Apartamento e Metas.
- Adicionados cadastro com instituição e tipo, aportes datados, quantidades, preço médio e avaliação manual do valor atual.
- Incluída migração `0009_investments.sql` com RLS e operações transacionais; aplicada pelo usuário com catálogo de instituições reduzido.
- Instalada a versão de produção no Galaxy A54, preservando os dados; abertura e carga da área de investimentos verificadas.
- Detalhes: [[03-Fluxos/Investimentos|fluxo]] e [[06-Desenvolvimento/Investimentos|registro de mudança]].

## 2026-09-02 — Ajustes no resumo e lançamentos

- Exibida a data de inclusão de rendas e gastos com trabalho.
- Reordenados os indicadores do resumo para ganhos líquidos, gastos e saldo restante.
- Ajustado o espaçamento antes do filtro de categorias.
- Detalhes: [[06-Desenvolvimento/Ajustes-resumo-e-lancamentos|registro de mudança]].

## 2026-09-02 — Categoria Apartamento

- Adicionada a categoria Apartamento, inicialmente com meta de 0%.
- Criadas migrações para incluir a categoria e sua meta nas casas existentes.
- Detalhes: [[06-Desenvolvimento/Categoria-apartamento|registro de mudança]].

## 2026-08-03 — Gastos com trabalho

- Adicionada a dedução mensal de custos profissionais da renda disponível do orçamento.
- Criada a migração da tabela `work_expenses` com RLS.
- Ajustado o rodapé do resumo para rolar horizontalmente e não quebrar valores grandes.
- Detalhes: [[03-Fluxos/Gastos-com-trabalho|fluxo]] e [[06-Desenvolvimento/Gastos-com-trabalho|registro de mudança]].

## 2026-07-30 — Vault inicial

- Criada a base de documentação Obsidian do projeto.
- Registradas arquitetura, fluxos de orçamento e carteiras pessoais, dados Supabase, execução e convenções de manutenção.

> Para mudanças futuras, copie [[Templates/Registro-de-mudanca|o template]], documente a decisão e adicione aqui um resumo com links para as notas atualizadas.
