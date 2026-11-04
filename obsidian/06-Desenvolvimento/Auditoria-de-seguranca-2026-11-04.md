---
tipo: auditoria
data: 2026-11-04
status: achados-abertos
---

# Auditoria de segurança — 2026-11-04

> Esta nota preserva a investigação inicial. Patches posteriores reduziram os avisos npm de 32 para 18 (nenhum crítico); detalhes e pendências em [[06-Desenvolvimento/Atualizacao-de-bibliotecas-2026-11-04]]. Contenção de acesso e retirada dos membros anteriores foram aplicadas pelo usuário, conforme [[05-Operacao/Restringir-acesso-a-casa]].

## Contexto e conclusão

Revisão solicitada para uso do app em um celular doméstico que também contém aplicativos bancários. Acesso físico por terceiros não é a preocupação principal.

O achado prioritário é a autorização no Supabase: as migrações colocam qualquer novo usuário na primeira casa existente. Com cadastro aberto, isso permite acesso remoto aos dados da casa. É um defeito da aplicação, independente de vulnerabilidades de bibliotecas. Confirmado no código; configuração e exploração no servidor de produção não foram verificadas.

Não foi identificado um caminho demonstrado para acessar os aplicativos bancários. O isolamento do Android separa os dados dos apps; comprometer o finance-app não concede automaticamente acesso aos bancos. Isso não certifica a segurança do aparelho nem elimina riscos de falhas do sistema, permissões especiais ou cadeia de fornecimento.

## Escopo e evidências

- Código em `8d559bc`, dependências do `package-lock.json`, migrações e configuração Android.
- `npm audit --json` consultado no registro npm; `npm ls` para rastrear dependências.
- APK release local inspecionado com `aapt` e assinatura validada com `apksigner`.
- Lockfile SHA-256: `977611a07efeaff518c08394c3cc6d3a21671d80ad42cf84ef88dfe9bc75d164`.
- APK SHA-256: `b25240c92cdef040f4fa3487867728b7f1101d2067ac4ef24b07bd0ff657a081`.
- Configuração local verificada sem registrar valores: URL HTTPS e chave pública do tipo publishable, sem chave administrativa nesse campo.
- Nenhum dispositivo apareceu em `adb devices`. O APK instalado, patch de segurança, root e permissões efetivamente concedidas não foram conferidos.
- Não houve cadastro de usuários de teste, acesso a registros financeiros ou alteração de produção. Não foram feitos testes de exploração no celular.
- npm audit não cobre integralmente bibliotecas Maven/Gradle, Hermes, código nativo, Android ou pacotes maliciosos sem aviso publicado. Não houve varredura completa dessas superfícies.

## 1. Prioridade urgente: novos usuários entram na casa existente

Evidências: `src/data/AuthProvider.tsx:46`, `supabase/migrations/0001_init.sql:81-109`, políticas a partir da linha 127; políticas de investimentos em `0009_investments.sql`.

O app usa `signInAnonymously()`. O trigger `handle_new_user()` escolhe a primeira casa e vincula o novo perfil a ela. As políticas RLS autorizam leitura e escrita pelo vínculo de casa. Um usuário anônimo do Supabase recebe o papel `authenticated`, inclusive para as políticas de investimentos.

Se o servidor segue essas migrações e permite novos cadastros, alguém que obtenha o endpoint e a chave pública do app pode criar uma sessão e ler, alterar ou apagar registros dessa casa. Não precisa do aparelho, senha bancária ou acesso físico. A chave pública no app é esperada; esconder ou trocar apenas essa chave não corrige a autorização. CAPTCHA reduz abuso automatizado, mas não decide quem pode entrar na casa.

Correção recomendada: preservar e identificar os usuários legítimos, impedir adesão automática à casa e usar associação autorizada por convite ou provisionamento administrativo. Considerar bloquear novos cadastros como contenção após preservar o acesso existente. Migrar a sessão anônima para uma identidade recuperável; não desinstalar/limpar dados como tentativa de correção. Revisar usuários e logs existentes, pois corrigir somente novos cadastros não remove associações indevidas anteriores.

Referências: [usuários anônimos](https://supabase.com/docs/guides/auth/auth-anonymous) e [chaves públicas](https://supabase.com/docs/guides/getting-started/api-keys).

## 2. Prioridade alta: usuário pode alterar o vínculo de seu perfil

`profiles_update` em `0001_init.sql:133-134` restringe a linha por `id = auth.uid()`, mas não torna `household_id` imutável. Não há restrição de atualização por coluna nas migrações revisadas. Se o papel possui UPDATE nessa coluna, um usuário pode alterar seu próprio vínculo para outra casa cujo UUID conheça; a política continua satisfeita porque seu `id` não muda.

No modelo atual de casa única, o primeiro achado já concede acesso. Ao corrigir o cadastro ou introduzir mais casas, esta falha também precisa ser corrigida: revogar atualização de campos de autorização e permitir apenas os campos de perfil necessários, ou controlar a associação por uma operação privilegiada validada. Grants reais de produção não foram inspecionados.

## 3. Dependências com avisos conhecidos

O npm informou **32 pacotes afetados: 1 crítico, 16 altos, 13 moderados e 2 baixos**. São contagens por pacote, incluindo propagação de avisos de dependências transitivas; não representam 32 ataques independentes nem 32 falhas exploráveis no APK. Ferramentas do Expo entram como dependências de produção no npm; `--omit=dev` não separa adequadamente ferramentas de build e execução no celular.

| Pacote instalado | Avaliação de exposição e encaminhamento |
| --- | --- |
| `shell-quote@1.9.0` | Crítico: injeção de comandos sob condições específicas de composição de tokens e execução em shell. Vem de React Native → react-devtools-core; a inicialização dos DevTools está protegida por `__DEV__`. Não foi demonstrado caminho no APK release. Atualizar para uma resolução compatível com a correção 1.11.0 ou posterior. |
| `decode-uri-component@0.2.2`, via `query-string@7.1.3` | Avisos de negação de serviço por entrada malformada. A versão 0.5.1 corrige o aviso mais recente; 0.5.0 ainda é afetada. Existe na árvore de Expo Router/React Navigation. O app expõe `financeapp://`, mas o parser principal do fork Expo inspecionado usa `searchParams`, enquanto outros parsers presentes usam query-string. Exploração por link no app atual não foi demonstrada. Atualizar a cadeia de navegação e verificar rotas. Os avisos não descrevem roubo de dados nem execução de código. |
| `nanoid@3.3.15` | Alto: loops com tamanhos zero/negativos em funções específicas. Chamadas de navegação inspecionadas usam `nanoid()` sem tamanho controlado externamente. Não confirmado como explorável neste app. Correção da linha 3.x: 3.3.18. |
| `node-forge@1.4.0` | Vários avisos de criptografia, validação e indisponibilidade; encontrado na CLI/certificados do Expo. Não é evidência de quebra do HTTPS usado pelo Supabase no Android. Atualizar a cadeia de ferramentas. |
| `@xmldom/xmldom@0.8.13` e `0.9.10` | Avisos de injeção XML e consumo excessivo de recursos; cadeia de plist/configuração de build. Nenhum fluxo de importação de XML externo identificado no app. |
| `image-size`, `postcss`, `js-yaml`, `browserslist`, `glob`, `minimatch`, `brace-expansion` e demais pacotes do inventário | Majoritariamente processamento de arquivos/configuração e ferramentas. Entrada maliciosa na máquina de desenvolvimento continua relevante, mas não equivale a ataque remoto ao celular parado no cofre. |

Avisos consultados: [shell-quote](https://github.com/advisories/GHSA-pqg4-j6r4-53mv), [decode-uri-component: primeiro aviso](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr), [decode-uri-component: correção adicional](https://github.com/advisories/GHSA-qr28-fpjm-wq7f), [nanoid](https://github.com/advisories/GHSA-2v37-7h3g-55p8). Inventário completo e referências dos demais avisos no arquivo adjacente `Auditoria-de-seguranca-2026-11-04-npm.json`.

O audit sugere inclusive migração major para Expo 58 e Router 58. Isso é uma indicação do resolvedor, não um plano de atualização já validado. Atualizar o conjunto compatível Expo/React Native/React e dependências transitivas, repetir audit, compilar release e validar fluxos. Não executar `npm audit fix --force` indiscriminadamente. Nenhuma atualização foi aplicada nesta investigação.

## 4. Configuração do APK

- **Sessão em AsyncStorage e backup habilitado:** `src/lib/supabase.ts:16-19` persiste a sessão e o token de renovação em armazenamento sem criptografia própria. O APK tem `allowBackup=true`, sem regras explícitas de exclusão no manifest revisado. Isso amplia a superfície para backup/restauração e eventual extração do sandbox. Não significa que outros apps possam ler esses arquivos nem que o backup trafegue em texto aberto. Migrar tokens para armazenamento protegido pelo Android Keystore, com migração da sessão existente, e excluir credenciais do backup. Referências: [React Native Security](https://reactnative.dev/docs/security), [Android Auto Backup](https://developer.android.com/identity/data/autobackup).
- **Sobreposição desnecessária:** APK declara `SYSTEM_ALERT_WINDOW`, sem funcionalidade correspondente encontrada no código do produto. Declaração não equivale a concessão: normalmente exige autorização especial. Remover via configuração persistente do Expo e conferir o manifest final. Para um celular com apps bancários, evitar uma capacidade desnecessária de desenhar sobre outras telas.
- **Armazenamento legado:** READ/WRITE_EXTERNAL_STORAGE presentes, limitados ao Android API 32. Revisar e bloquear se não houver função que os use. Não equivalem a acesso às pastas privadas dos bancos.
- **Release assinado com chave de debug:** confirmado pelo Gradle e certificado do APK. Não confundir com app depurável: o manifest release não habilita `debuggable`. Adotar chave privada de distribuição e planejar a transição: trocar assinatura impede atualização normal sobre a instalação anterior e pode exigir reinstalação. Preservar sessão e acesso antes disso. Assinatura debug não permite por si só uma atualização remota silenciosa.
- **Pontos favoráveis:** não há permissões de SMS, contatos, câmera ou microfone no APK inspecionado, nem serviço de acessibilidade ou leitor de notificações; providers do app não são exportados. Expo Updates está desabilitado. Release não declara liberação de HTTP claro e tem targetSdk 36; a liberação de cleartext encontrada é do manifest de debug. O cliente local está configurado para HTTPS.

## Ordem recomendada

1. Confirmar e corrigir autorização no Supabase e revisar associações de usuários existentes.
2. Atualizar dependências com compatibilidade, priorizando componentes de execução e ferramentas com avisos críticos.
3. Proteger sessão, restringir backups e retirar permissões excedentes.
4. Planejar assinatura de distribuição sem perder o acesso anônimo atual.
5. Conferir aparelho real: Android e patch, ausência de root, permissões especiais e correspondência do APK instalado. Manter sistema e apps bancários atualizados.

O cofre protege contra acesso físico; não protege o banco remoto enquanto este aceita requisições pela internet. Desinstalar o app não corrige as políticas do Supabase. Não há evidência nesta revisão de invasão já ocorrida ou de movimentação de contas bancárias.

Fonte para isolamento entre apps: [Android Application Sandbox](https://source.android.com/docs/security/app-sandbox).

## O que mudou e verificação

Somente documentação e evidência da auditoria foram adicionadas. Nenhuma biblioteca, configuração funcional, schema, dado remoto ou instalação foi alterada. Compilação e testes funcionais não foram executados porque não houve mudança de implementação. Pendências de produção e de componentes nativos estão explicitadas acima.

Relacionado: [[02-Arquitetura/Arquitetura]], [[04-Dados/Modelo-de-dados]], [[06-Desenvolvimento/Historico-de-mudancas]].
