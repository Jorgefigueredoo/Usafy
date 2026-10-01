# Usafy

Rotas urbanas que priorizam **segurança** em vez de velocidade. Cada trecho do caminho recebe um nível
de risco calculado a partir de criminalidade, iluminação pública e fluxo de pessoas.
Público inicial: entregadores de moto no Recife.

## Estrutura do repositório

O repositório é um monorepo com três projetos **independentes**. Cada um tem as próprias dependências,
configurações, `.env` e comandos. Nada é compartilhado por import entre eles.

```
Usafy/
├── mobile/    App nativo (Expo + React Native) — Android e iOS
├── web/       PWA (React 18 + Vite + TypeScript) — roda no navegador do celular
├── backend/   API (Spring Boot) — ainda não implementado
├── README.md
└── LICENSE
```

| Pasta      | Stack                                   | Status                                       |
| ---------- | --------------------------------------- | -------------------------------------------- |
| `mobile/`  | Expo SDK 57, React Native, `@rnmapbox/maps` | Em desenvolvimento — rota e risco mockados |
| `web/`     | React 18, Vite, Mapbox GL JS, PWA       | Rotas reais via Mapbox, risco mockado        |
| `backend/` | Spring Boot                             | Planejado — veja [backend/README.md](backend/README.md) |

## Como rodar

Sempre entre na pasta do projeto antes de instalar ou rodar qualquer coisa. **Não existe
`package.json` na raiz**: não rode `npm install` aqui.

### Mobile

```bash
cd mobile
cp .env.example .env        # preencha EXPO_PUBLIC_MAPBOX_TOKEN
npm install
npx expo start
```

O `@rnmapbox/maps` tem código nativo, então o app precisa de um development build
(`npx expo run:android` ou `eas build --profile development`); não roda no Expo Go.

### Web

```bash
cd web
cp .env.example .env        # preencha VITE_MAPBOX_TOKEN
npm install
npm run dev
```

Build de produção com service worker: `npm run build && npm run preview`.

### Backend

Ainda não existe. Quando for criado, os comandos ficam documentados em [backend/README.md](backend/README.md).

## Variáveis de ambiente

Cada projeto tem o próprio `.env` (ignorado pelo git) e um `.env.example` versionado:

| Projeto   | Arquivo          | Variável                   |
| --------- | ---------------- | -------------------------- |
| `mobile/` | `mobile/.env`    | `EXPO_PUBLIC_MAPBOX_TOKEN` |
| `web/`    | `web/.env`       | `VITE_MAPBOX_TOKEN`        |

## Contrato entre clientes e backend

Mobile e web vão consumir a mesma API. O contrato proposto (tipos `Route`, `RouteSegment`,
`RiskFactor`) está em [backend/README.md](backend/README.md). Mudanças nele precisam ser
refletidas em `mobile/src/types` e `web/src/types`.
