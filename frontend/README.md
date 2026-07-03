# Derma Match — Frontend

Frontend do Derma Match (React + Vite + TypeScript + Tailwind). Consome a API REST do backend.

## Rodar localmente

1. Suba o **backend** na raiz do repositório (`pnpm dev`, porta 3000). Veja `../SETUP.md`.
2. Neste diretório (`frontend/`):

   ```bash
   pnpm install
   cp .env.example .env
   pnpm dev
   ```

3. Abra `http://localhost:5173`. Em dev, chamadas a `/api/*` são encaminhadas ao backend pelo proxy do Vite (same-site: cookies e CORS triviais).

## Scripts

| Script                   | O que faz                                 |
| ------------------------ | ----------------------------------------- |
| `pnpm dev`               | Servidor de desenvolvimento (Vite).       |
| `pnpm build`             | Type-check + build de produção (`dist/`). |
| `pnpm preview`           | Serve o build gerado.                     |
| `pnpm typecheck`         | Checagem de tipos.                        |
| `pnpm lint` / `lint:fix` | ESLint.                                   |
| `pnpm format`            | Prettier.                                 |

## Stack

React 19 · Vite · TypeScript strict · Tailwind CSS v4 · React Router 7 · TanStack Query 5 · axios · React Hook Form + Zod.

O planejamento por fases está em `../.claude/roadmap-frontend.md` e `../.claude/phases/phase-f*.md`.
