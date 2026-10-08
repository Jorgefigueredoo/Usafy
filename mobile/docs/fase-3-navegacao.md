# Fase 3 — Navegação no mobile (pendente)

Plano para levar ao `mobile/` a navegação que o `web/` já tem: GPS seguindo a rota, voz,
chegada com resumo, compartilhar trajeto e aviso de sem internet. As fases 1 (dados reais) e 2
(telas + Expo Router) já estão na `main`.

> Antes de usar qualquer API do Expo, confira a doc da versão do projeto (SDK 57):
> `https://docs.expo.dev/versions/v57.0.0/` — regra do [AGENTS.md](../AGENTS.md).

## Onde paramos

- No painel do mapa ([RouteOverviewSheet.tsx](../src/screens/Map/RouteOverviewSheet.tsx)) **não há
  botão "Iniciar navegação"**. O botão principal hoje é "Ver detalhes dos trechos" e deve virar
  secundário quando a navegação existir.
- O GPS já existe: [LocationProvider.tsx](../src/hooks/LocationProvider.tsx) acompanha a posição
  com `watchPositionAsync` (1 leitura/s) e expõe o mesmo contrato do web (`status`, `position`
  com `heading`/`speed`/`accuracy`/`timestamp`, `request`).
- `formatManeuverDistance` e `formatClock` já estão em [format.ts](../src/utils/format.ts).
- O tipo `Route` já traz `maneuvers` (contrato da API) e `getRoute()` (rota única, para o
  recálculo) já existe em [routeService.ts](../src/services/routeService.ts).

## O que portar do web

O repositório pede **duplicar** a lógica entre `web/` e `mobile/` (os projetos nunca se importam).
Lógica pura copia quase igual; o que é de navegador muda.

| Web (`web/src/…`) | Mobile (`mobile/src/…`) | Como |
| --- | --- | --- |
| `services/navigation.ts` (progresso: projeção na linha, trecho atual, próxima manobra, chegada) | `services/navigation.ts` | Copiar igual (lógica pura). Escrever teste. |
| `services/voice.ts` + `voice.test.ts` | `services/voice.ts` + teste | `speechSynthesis` → **`expo-speech`** (`Speech.speak(text, { language: 'pt-BR', rate })`, `Speech.stop()`). `spokenDistance`, `spokenDuration` e `lowerFirst` copiam igual, com os testes (trocar `vitest` por Jest: só remover o import). |
| `hooks/useVoiceGuidance.ts` | `hooks/useVoiceGuidance.ts` | Copiar a lógica (quando falar cada aviso). A preferência ligada/desligada usa `localStorage`, que já funciona no mobile. **Não** precisa do truque do iOS de falar no toque (é coisa do Safari). |
| `hooks/useNavigation.ts` | `hooks/useNavigation.ts` | Copiar. Trocar `navigator.vibrate` por **`Vibration.vibrate([...])`** do `react-native` (ou `expo-haptics`). Mantém recálculo (2 leituras fora da rota, intervalo de 15 s) e `trip` para o resumo. |
| `hooks/useWakeLock.ts` | — | Trocar por **`expo-keep-awake`** (`useKeepAwake()` só enquanto navega, ou `activateKeepAwakeAsync`/`deactivateKeepAwake`). |
| `pages/Map/NavigationBanner.tsx` | `screens/Map/NavigationBanner.tsx` | Reescrever em RN: ícone da manobra, distância, instrução, trecho atual com cor de risco, mensagem de erro. |
| `pages/Map/NavigationPanel.tsx` | `screens/Map/NavigationPanel.tsx` | Reescrever em RN: tempo restante, distância, horário de chegada, **compartilhar** e "Encerrar". |
| `pages/Map/ArrivalPanel.tsx` | `screens/Map/ArrivalPanel.tsx` | Reescrever em RN: selo, tempo real, distância, risco do caminho, aviso de trechos de risco alto, "Nova rota" e "Concluir". |
| `services/shareTrip.ts` | `services/shareTrip.ts` | `navigator.share` + área de transferência → **`Share.share({ message })`** do `react-native` (abre WhatsApp, SMS…). `tripMessage()` copia igual — vale um teste. |
| `hooks/useOnlineStatus.ts` + `components/layout/OfflineBanner.tsx` | idem | Eventos `online/offline` → **`@react-native-community/netinfo`** (`NetInfo.addEventListener`). Instalar com `npx expo install`. |
| `components/map/markers.ts` (seta de navegação + `animateMarker`) e o modo "seguir" de `pages/Map/RouteMap.tsx` | [RouteMap.tsx](../src/screens/Map/RouteMap.tsx) | Ver "Mapa durante a navegação" abaixo. |

Instalação (dentro de `mobile/`), sempre pelo Expo para pegar versões do SDK 57:

```sh
npx expo install expo-speech expo-keep-awake @react-native-community/netinfo
```

Se o `npx expo install` reclamar de `ERESOLVE`, veja as notas de dependências no
[AGENTS.md](../AGENTS.md) (o `react-dom` precisa ficar igual ao `react`). Instale como
`dependencies`: no Git Bash, o `--dev` não chega ao npm.

## Mapa durante a navegação

No [RouteMap.tsx](../src/screens/Map/RouteMap.tsx), quando houver `navigation`:

- **Câmera seguindo** o usuário: `Camera.setCamera({ centerCoordinate, heading: bearing,
  pitch: 55, zoomLevel: 17, padding: { paddingTop: altura * 0.45 }, animationDuration: 900,
  animationMode: 'linearTo' })` a cada leitura (os valores são os do web: `FOLLOW_*`).
  O `BrandMap` já avisa gestos do usuário em `onUserGesture` → pausar o "seguir" e mostrar
  "Recentralizar".
- **Seta de navegação** no lugar do ponto azul: `Mapbox.MarkerView` girando com o `bearing`
  (ou `Mapbox.LocationPuck`, se preferir o nativo).
- **Trecho percorrido apagado**: um `ShapeSource` com `progress.traveledLine` e uma `LineLayer`
  cinza por cima da rota (no web: `route-traveled`, opacidade 0,55).
- **Esconder** alternativas, etiquetas de tempo e faixa de risco; o painel vira
  `NavigationPanel`/`ArrivalPanel`.
- **Botões** de voz e "Recentralizar" ficam **acima** do logo e do "i" do Mapbox: os termos de uso
  exigem os dois visíveis (no web isso já deu problema duas vezes).

## Ordem sugerida

1. `services/navigation.ts` + teste (progresso a partir de posições ao longo de uma rota fixa).
2. `useNavigation` + `useKeepAwake` + vibração; botão **"Iniciar navegação"** no painel.
3. Mapa seguindo + seta + trecho percorrido + `NavigationBanner`/`NavigationPanel`.
4. `voice.ts` + `useVoiceGuidance` + botão de voz.
5. `ArrivalPanel` (resumo de chegada).
6. Compartilhar trajeto.
7. Aviso de sem internet em todas as telas (`OfflineBanner` no `src/app/_layout.tsx`).

## Como validar

- `npm run typecheck`, `npx expo lint`, `npm test`, `npx expo-doctor` e
  `npx expo export --platform android` (confere que o Metro empacota tudo).
- **Refazer o app de desenvolvimento** depois de instalar módulos nativos
  (`npx expo run:android` ou `eas build --profile development`).
- Simular trajeto sem sair de casa: no emulador Android, *Extended controls → Location → Routes*
  aceita um GPX; no aparelho, apps de "localização fictícia" nas opções de desenvolvedor.
- Referência do web (Chrome DevTools com GPS falso andando de Boa Viagem ao RioMar, rota mais
  segura de 17 min): a voz disse, nesta ordem,
  "Navegação iniciada. Chegada em 17 minutos." → "Vire à direita para Rua Francisco da Cunha." →
  "Em 300 metros, vire à esquerda para Avenida Boa Viagem." → "Vire à esquerda para Avenida Boa
  Viagem." → "Atenção: trecho de risco alto à frente. Avenida Boa Viagem." → … →
  "Você chegou ao destino." Cada curva tem um aviso antecipado (até 400 m) e um na hora (80 m).

## Armadilhas já conhecidas

- Arquivos do mobile têm quebra de linha CRLF: scripts de busca e troca podem não casar o texto.
- Lint do React (`react-hooks`): não ler `useRef(...).current` durante a renderização (use
  `useState(() => new Animated.Value(0))`) e não chamar `setState` direto dentro de `useEffect`.
- `StyleSheet.absoluteFillObject` não existe no RN 0.86: use posições explícitas.
- Expressões do `@rnmapbox/maps` precisam de `as const` para o TypeScript aceitar.
- O app só é testado visualmente no aparelho: nesta máquina não há SDK Android nem emulador.
- Os commits deste projeto são feitos **um arquivo por commit**, em português, na `main`.
