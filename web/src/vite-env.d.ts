/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Token público do Mapbox (pk.*). Definido em `.env` — veja `.env.example`. */
  readonly VITE_MAPBOX_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
