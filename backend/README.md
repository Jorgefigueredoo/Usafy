# Usafy — Backend

API em **Spring Boot**, ainda não implementada. Esta pasta está reservada para ela.

Quando o projeto for gerado (ex.: pelo Spring Initializr), ele fica **dentro desta pasta**, com
`pom.xml` ou `build.gradle`, `src/main/java`, o próprio `.gitignore` e o próprio README de execução.

## Responsabilidades previstas

- Calcular o **risco real** de cada trecho a partir de criminalidade, iluminação pública e fluxo
  de pessoas. Hoje esse risco é mockado nos dois clientes.
- Expor uma API única consumida pelo `mobile/` e pelo `web/`.

### Decisões em aberto

- **Quem calcula a rota.** Hoje o `web/` chama o Mapbox (Geocoding + Directions) direto do navegador.
  O backend pode assumir essas chamadas (assim o token sai do cliente) ou receber a geometria pronta
  e só pontuar os trechos.
- **Unificar o tipo `Route`.** Hoje ele diverge entre os clientes (veja abaixo).

## Contrato proposto

`POST /api/v1/routes`

```json
{ "origin": "Boa Viagem", "destination": "Casa Amarela" }
```

Resposta `200` (`Route`):

```ts
type RiskLevel = 'low' | 'medium' | 'high';
type Coordinate = [longitude: number, latitude: number];

interface RiskFactor {
  type: 'crime' | 'lighting' | 'footTraffic';
  severity: RiskLevel;
  description: string;
}

interface RouteSegment {
  id: string;
  name: string;            // nome da via predominante no trecho
  riskLevel: RiskLevel;
  riskScore: number;       // 0 (seguro) a 100 (risco máximo)
  distanceMeters: number;
  coordinates: Coordinate[];
  factors: RiskFactor[];
}

interface Maneuver {
  instruction: string;     // em pt-BR, ex.: "Vire à direita para Rua X."
  direction: 'left' | 'right' | 'straight' | 'uturn' | 'arrive';
  distanceFromStartMeters: number; // onde a manobra acontece, desde o início da rota
}

interface Route {
  id: string;
  origin: string;
  destination: string;
  overallRisk: RiskLevel;
  overallScore: number;    // média dos trechos ponderada pela distância
  durationMinutes: number;
  distanceKm: number;
  geometry: Coordinate[];  // traçado completo; primeiro/último ponto = origem/destino
  segments: RouteSegment[];
  maneuvers: Maneuver[];   // instruções passo a passo do modo navegação (sem a partida)
}
```

O `web/` usa `maneuvers` no modo navegação (estilo Waze). Hoje ele monta essa lista a partir dos
`steps` da Mapbox Directions; o backend pode repassar os mesmos dados. Durante a navegação, o
cliente recalcula a rota sozinho quando o usuário sai dela, chamando de novo este endpoint com a
posição atual como origem — então ele precisa aceitar **coordenadas** além de texto (ex.:
`{ "origin": { "coordinate": [-34.89, -8.12] }, "destination": "Casa Amarela" }`).

Faixas de score usadas pelos clientes para derivar `riskLevel`: `0–33` low, `34–66` medium,
`67–100` high.

Erros: `404` quando a origem ou o destino não forem encontrados, ou quando não houver rota entre
eles. O corpo deve trazer uma mensagem pronta para exibir ao usuário.

### Divergência atual entre os clientes

| Campo                                       | `web/src/types` | `mobile/src/types` |
| ------------------------------------------- | --------------- | ------------------ |
| `geometry`                                  | sim             | não                |
| `originCoordinate` / `destinationCoordinate` | não             | sim                |

O contrato acima segue o `web/`, em que origem e destino são o primeiro e o último ponto de
`geometry`. Ao implementar o backend, alinhe o `mobile/` a ele.
