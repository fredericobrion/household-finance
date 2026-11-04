---
tipo: operacao
atualizado: 2026-11-04
---

# Como rodar

## Pré-requisitos

- Node.js **20.19.x ou superior**, compatível com Expo SDK 56.
- Dependências npm.
- Um projeto Supabase configurado com as migrações de `supabase/migrations/` aplicadas.

## Variáveis de ambiente

Crie `.env` na raiz (o arquivo é ignorado pelo Git):

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
```

Não registre chaves ou valores reais no vault nem no repositório.

## Comandos

```bash
npm install
npm run start      # inicia o Expo
npm run android    # build/execução Android nativa
npm run ios        # build/execução iOS nativa (macOS)
npm run web        # inicia a versão web
npm run lint       # lint do Expo
```

No `expo start`, escolha Expo Go, emulador ou development build conforme o ambiente. Sem as variáveis do Supabase ou sem conectividade, a tela inicial exibirá falha de conexão e opção para tentar novamente.

## Android de produção, sem cabo ou Metro

A versão release inclui `assets/index.android.bundle` no APK e roda sem computador ou cabo após a instalação. O cabo é usado para instalar/atualizar por USB; a conexão com a internet continua necessária para autenticação e dados do Supabase. As migrações exigidas pelo novo código devem ser aplicadas antes de instalar a atualização.

Na raiz do projeto:

```sh
(cd android && NODE_ENV=production ./gradlew :app:assembleRelease --no-daemon --console=plain)
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

Confirmar exatamente um aparelho autorizado em `adb devices -l` antes de instalar. `install -r` atualiza preservando dados; nunca desinstalar automaticamente se houver conflito de assinatura. O package é `com.fredericobrion.financeapp`. Verificar abertura após a instalação e registrar o resultado no histórico. Novos builds/instalações são feitos somente quando o usuário pedir explicitamente.

## Compatibilidade observada

O `package.json` está alinhado ao Expo SDK 56 (`expo ~56.0.12`, React Native `0.85.3`, React `19.2.3`). A [referência do Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/) informa Node mínimo 20.19.x.
