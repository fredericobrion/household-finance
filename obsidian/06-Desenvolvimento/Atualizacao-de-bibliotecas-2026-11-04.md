---
tipo: manutencao
data: 2026-11-04
status: correcoes-parciais
---

# Atualização de bibliotecas — 2026-11-04

## Contexto

Continuação da [[06-Desenvolvimento/Auditoria-de-seguranca-2026-11-04]], após contenção dos acessos no Supabase. Objetivo desta etapa: aplicar patches permitidos pelas dependências atuais, avaliar compatibilidade e identificar os avisos que exigem migração maior.

## O que mudou

`npm audit fix --ignore-scripts` atualizou o lockfile dentro das faixas declaradas, sem `--force`. Depois, `expo install --fix` alinhou quatro módulos ao Expo instalado. Nenhum override forçado ou pacote novo de produto foi adicionado. Scripts de instalação de dependências não foram executados. Pacotes extraneous locais não declarados foram removidos pelo npm.

| Componente | Antes | Depois |
| --- | --- | --- |
| Expo | 56.0.12 | 56.0.24 |
| Expo Router | 56.2.11 | 56.2.22 |
| shell-quote | 1.9.0 | 1.12.0 |
| nanoid | 3.3.15 | 3.3.20 |
| node-forge | 1.4.0 | 1.4.3 |
| xmldom | 0.8.13 / 0.9.10 | 0.8.15 / 0.9.12 |
| postcss | 8.5.16 | 8.5.32 |
| js-yaml | 4.3.0 | 4.3.2 |
| @expo/ui | 56.0.18 | 56.0.26 |
| expo-image | 56.0.11 | 56.0.13 |
| expo-web-browser | 56.0.5 | 56.0.6 |
| react-native-screens | 4.25.2 | 4.26.2 |

Também atualizados componentes transitivos de navegação, build e configuração. React 19.2.3, React Native 0.85.3 e SDK major 56 foram mantidos. Mudanças funcionais de autenticação já existentes no checkout não fazem parte desta atualização de bibliotecas.

## Medição dos avisos npm

| Severidade | Antes | Depois |
| --- | --- | --- |
| Crítica | 1 | 0 |
| Alta | 16 | 6 |
| Moderada | 13 | 10 |
| Baixa | 2 | 2 |
| Total de pacotes afetados | 32 | 18 |

Eliminados os avisos dos pacotes: `@react-navigation/core`, `@xmldom/xmldom`, `baseline-browser-mapping`, `brace-expansion`, `browserslist`, `compression`, `js-yaml`, `nanoid`, `node-forge`, `postcss`, `shell-quote`, `source-map-js`, `uuid` e `xcode`.

Contagem por pacote inclui propagação transitiva, não mede caminhos de exploração nem equivale a 18 vulnerabilidades independentes. A fonte é o registro npm consultado em 2026-11-04. Evidência final: `Atualizacao-de-bibliotecas-2026-11-04-npm.json`; o JSON da auditoria original foi preservado.

## Pendências e exposição

Os 18 pacotes restantes derivam de seis dependências com avisos diretos:

| Raiz do aviso | Cadeia e avaliação |
| --- | --- |
| `decode-uri-component@0.2.2` | Expo Router → query-string. Entradas percent-encoded malformadas podem travar o processamento. Correção publicada em 0.5.1, cujo pacote usa ESM; a cadeia atual usa query-string 7/CommonJS. Não foi forçado override incompatível. O parser principal do fork Expo inspecionado usa searchParams; exploração por deep link neste app não foi demonstrada. Atualização da cadeia de navegação segue prioritária. |
| `image-size@1.2.1` | Metro via ferramentas do React Native. Imagem malformada pode travar o processamento de assets no build. A linha 1.x termina em 1.2.1 nos metadados consultados; migrar Metro/React Native ou tratar mudança da API em conjunto, sem substituir major às cegas. Não há evidência de exposição dessa biblioteca Node a imagens remotas no APK. |
| `zod@3.25.76` | CLI Expo: consumo excessivo de memória ao validar coleções hostis. Correção apontada pelo audit está na linha 4; substituir major pode quebrar a CLI. |
| `glob@13.0.6` | Ferramentas Expo/configuração: cancelamento por timeout pode não interromper travessia de arquivos. |
| `minimatch@10.2.6` | Ferramentas glob/fingerprint: amplificação de padrões pode causar indisponibilidade. Correção exige linha 11 segundo o audit. |
| `deepmerge@4.3.1` | Configuração Expo: prototype poisoning do objeto retornado com entradas hostis, severidade baixa. |

Pacotes de propagação: `@expo/cli`, `@expo/config`, `@expo/config-plugins`, `@expo/fingerprint`, `@expo/inline-modules`, `@expo/local-build-cache-provider`, `@expo/metro-config`, `@expo/prebuild-config`, `expo`, `expo-router`, `expo-splash-screen` e `query-string`.

O resolvedor do npm sugere Expo 58/Router 58 para parte das pendências. Isso não é comprovação de compatibilidade com o aplicativo. Próxima etapa recomendada: migrar SDK de forma incremental 56 → 57 → 58, alinhando React/React Native/módulos, regenerando código nativo a partir das configurações preservadas e validando cada etapa. Verificar audit novamente após a migração; não prometer zero alertas antes da medição. Não executar `npm audit fix --force` para realizar essa migração.

## Verificação e limites

- TypeScript e suítes de investimentos e acesso à conta passaram após alinhamento.
- `expo install --check` online confirmou versões alinhadas.
- Build Android release passou (`assembleRelease`, 7m48s). APK instalado por USB no Galaxy A54 (SM-A546E), pacote `com.fredericobrion.financeapp`, preservando dados. Abertura de Minha conta, mesma identidade e sessão permanente verificadas após atualização.
- Árvore `npm ls --all` sem conflitos ou dependências inválidas.
- APK SHA-256: `9d9bbe2ff4c3d53218a894dcc39a08bd220a7988650b3cb7aadfb81112ad044c`.
- Mudanças estão em `package.json` e `package-lock.json`; sem alteração de schema, política de acesso ou credenciais.
- npm audit não cobre integralmente Maven/Gradle, bibliotecas nativas, Hermes ou Android; essa etapa não certifica essas superfícies.

## Referências

- [Expo: atualização incremental de SDK](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/).
- [shell-quote: alerta crítico corrigido](https://github.com/advisories/GHSA-pqg4-j6r4-53mv).
- [decode-uri-component: correção e impacto de disponibilidade](https://github.com/advisories/GHSA-qr28-fpjm-wq7f).
- [image-size](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq), [Zod](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), [minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249), [deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4).
