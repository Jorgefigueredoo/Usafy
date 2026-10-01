# Usafy — monorepo

This repository holds three independent projects. Before changing anything, identify which one the
task belongs to and work **inside that folder only**.

| Folder     | What it is                                  | Instructions                          |
| ---------- | ------------------------------------------- | ------------------------------------- |
| `mobile/`  | Expo / React Native app (Android, iOS)      | Follow [mobile/AGENTS.md](mobile/AGENTS.md) |
| `web/`     | PWA — React 18 + Vite + TypeScript          | See "Web" below                        |
| `backend/` | Spring Boot API (not implemented yet)       | See [backend/README.md](backend/README.md) |

## Rules for the whole repo

- There is no root `package.json` and no workspace setup. Run every install/build/lint command from
  inside the project folder (`cd mobile`, `cd web`, `cd backend`).
- Projects never import code from each other. `mobile/` (React 19, React Native) and `web/` (React 18,
  React DOM) cannot share components. Duplicating small utilities (formatting, risk labels) is expected.
- The API contract (`Route`, `RouteSegment`, `RiskFactor`, `RiskLevel`) is documented in
  `backend/README.md`. If you change it, update `mobile/src/types` and `web/src/types` in the same task.
- Each project has its own `.env` (git-ignored) and `.env.example`. Never commit tokens.

## Web

- Commands (from `web/`): `npm run dev`, `npm run typecheck`, `npm run lint`, `npm run build`.
  Run typecheck and lint before declaring a task done.
- Design tokens live in `web/src/theme/` and are exposed as CSS custom properties at startup. Pages and
  components use CSS Modules with `var(--...)` only — no hardcoded colors, spacing or font sizes.
- No `any`. External JSON is parsed as `unknown` and narrowed with type guards.
- Risk is mocked in `web/src/services/riskMock.ts` until the backend exists.
