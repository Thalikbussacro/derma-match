# Derma Match

Plataforma web de skincare personalizado. A partir de um questionário adaptativo, o sistema
identifica o tipo de pele predominante da usuária e entrega uma rotina de cuidados correspondente.
Este repositório contém o **backend** (Node + Express + TypeScript, Postgres via Prisma) na raiz e o
**frontend** (React + Vite + Tailwind) em [`frontend/`](./frontend).

**Stack:** Node 22 · TypeScript strict · Express 5 · Prisma 6 / PostgreSQL 16 · Zod · JWT + bcrypt · Vitest · React 19 · Tailwind CSS.

**Estado:** MVP concluído — backend (Fases 0–4) e frontend (Fases F0–F4). Plano Premium adiado (Fase 5).

## Pré-requisitos

- Node.js 22+
- pnpm 10+
- Docker (para subir o Postgres local)

## Subindo localmente

```bash
# 1. Dependências
pnpm install

# 2. Variáveis de ambiente
cp .env.example .env

# 3. Banco de dados (Postgres 16 em container)
docker compose up -d

# 4. Migrations + geração do client + seed inicial
pnpm prisma migrate dev

# 5. Servidor de desenvolvimento
pnpm dev
```

Ao final, a API sobe em `http://localhost:3000`. Confira com:

```bash
curl http://localhost:3000/api/health
```

> O Postgres do container escuta em `localhost:5433` por padrão (para não conflitar com um
> Postgres já instalado na 5432). Detalhes de banco e outras opções em [`SETUP.md`](./SETUP.md).

Para popular o banco novamente sem recriar (o seed é idempotente):

```bash
pnpm prisma db seed
```

## Scripts

| Script            | O que faz                                          |
| ----------------- | -------------------------------------------------- |
| `pnpm dev`        | Sobe o servidor com reload automático (tsx watch). |
| `pnpm build`      | Compila `src/` para `dist/`.                       |
| `pnpm start`      | Roda a versão compilada (`dist/index.js`).         |
| `pnpm typecheck`  | Checagem de tipos sem emitir arquivos.             |
| `pnpm lint`       | ESLint em todo o projeto.                          |
| `pnpm lint:fix`   | ESLint corrigindo o que der.                       |
| `pnpm format`     | Formata o código com Prettier.                     |
| `pnpm test`       | Roda a suíte de testes (Vitest).                   |
| `pnpm test:setup` | Prepara o banco de teste (migrations + seed).      |

## Testes

- **Automatizados:** `pnpm test:setup` (uma vez) e depois `pnpm test` — usam um schema Postgres
  isolado. Detalhes em [`SETUP.md`](./SETUP.md).
- **Manuais de rota:** ficam em `.http/` (não versionada) e usam a extensão **REST Client** do VS
  Code. `.http/fluxo-completo.http` cobre a jornada ponta a ponta.

## Frontend

O frontend (React + Vite + TypeScript + Tailwind) fica em [`frontend/`](./frontend) e consome esta
API. Com o backend rodando, suba-o com:

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm dev
```

Abre em `http://localhost:5173` e, em dev, encaminha `/api/*` para o backend pelo proxy do Vite.
Detalhes em [`frontend/README.md`](./frontend/README.md).

## Documentação do projeto

A documentação viva (produto, arquitetura, requisitos, convenções, fases e decisões) fica em
[`.claude/`](./.claude). É a fonte de verdade sobre escopo, padrões e o porquê das escolhas.
