# Derma Match

Plataforma web de skincare personalizado. A partir de um questionário adaptativo, o sistema
identifica o tipo de pele predominante da usuária e entrega uma rotina de cuidados correspondente.
Este repositório contém o **backend** (Node + Express + TypeScript, Postgres via Prisma).

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

| Script           | O que faz                                          |
| ---------------- | -------------------------------------------------- |
| `pnpm dev`       | Sobe o servidor com reload automático (tsx watch). |
| `pnpm build`     | Compila `src/` para `dist/`.                       |
| `pnpm start`     | Roda a versão compilada (`dist/index.js`).         |
| `pnpm typecheck` | Checagem de tipos sem emitir arquivos.             |
| `pnpm lint`      | ESLint em todo o projeto.                          |
| `pnpm lint:fix`  | ESLint corrigindo o que der.                       |
| `pnpm format`    | Formata o código com Prettier.                     |

## Testando endpoints

Os testes manuais de rota ficam em `.http/` (não versionada) e usam a extensão **REST Client**
do VS Code. Veja `SETUP.md`.

## Documentação do projeto

A documentação viva (produto, arquitetura, requisitos, convenções, fases e decisões) fica em
[`.claude/`](./.claude). É a fonte de verdade sobre escopo, padrões e o porquê das escolhas.
