---
tipo: operacao
atualizado: 2026-07-30
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

## Compatibilidade observada

O `package.json` está alinhado ao Expo SDK 56 (`expo ~56.0.12`, React Native `0.85.3`, React `19.2.3`). A [referência do Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/) informa Node mínimo 20.19.x.
