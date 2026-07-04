# Derma Match

Plataforma web de skincare personalizado. A partir de um questionário adaptativo, o sistema
identifica o tipo de pele predominante da usuária e entrega uma rotina de cuidados correspondente.

Monorepo **pnpm** com três pacotes:

- [`backend/`](./backend) — API (Node + Express + TypeScript, Postgres via Prisma).
- [`frontend/`](./frontend) — SPA (React + Vite + Tailwind).
- [`packages/shared/`](./packages/shared) — schemas Zod e tipos do contrato da API, compartilhados
  entre backend e frontend (`@derma-match/shared`).

**Stack:** Node 22 · TypeScript strict · Express 5 · Prisma 6 / PostgreSQL 16 · Zod · JWT + bcrypt · Vitest · React 19 · Tailwind CSS.

**Estado:** MVP + Premium + plataforma clínica configurável concluídos — backend (Fases 0–4), frontend (F0–F4), Premium (P1–P8) e plataforma configurável (Fase 6: painel de admin, questionário versionado, espectro de tipos de pele, catálogo de produtos, atribuição de conversas e rotina personalizada por paciente).

## Pré-requisitos

- Node.js 22+
- pnpm 10+
- Docker (para subir o Postgres local)

## Subindo localmente

```bash
# 1. Dependências de todo o workspace (também builda o pacote shared)
pnpm install

# 2. Variáveis de ambiente do backend
cp backend/.env.example backend/.env

# 3. Banco de dados (Postgres 16 em container)
docker compose up -d

# 4. Migrations + geração do client + seed inicial
pnpm --filter derma-match exec prisma migrate dev

# 5. Backend (API em :3000) e frontend (:5173) — em terminais separados
pnpm dev:backend
pnpm dev:frontend
```

Confira a API com `curl http://localhost:3000/api/health`. O frontend abre em
`http://localhost:5173` e, em dev, encaminha `/api/*` para o backend pelo proxy do Vite.

> O Postgres do container escuta em `localhost:5433` por padrão (para não conflitar com um
> Postgres já instalado na 5432). Detalhes de banco e outras opções em
> [`backend/SETUP.md`](./backend/SETUP.md).

Para popular o banco novamente sem recriar (o seed é idempotente):

```bash
pnpm --filter derma-match exec prisma db seed
```

## Plano Premium

A experiência Premium está implementada — assinatura **mockada** (sem cobrança real; a integração de pagamento fica para produção):

- **Usuária Premium** conversa com uma biomédica (chat com polling), anexa fotos (retenção LGPD de 90 dias) e vê o histórico. Assina/cancela pelo painel Premium e pela conta.
- **Biomédica** tem área própria em `/biomedica` (login separado): lista de conversas, atendimento e contexto clínico (respostas do questionário + tipo de pele).

Biomédica de exemplo (do seed): **`biomedica@dermamatch.com`** / **`biomedica123`**.

Limpeza (agendar via cron em produção): `pnpm --filter derma-match cleanup:tokens` (refresh tokens) e `cleanup:anexos` (fotos vencidas).

## Administração e configuração (Fase 6)

Um terceiro papel — **admin** — com login e área próprios em `/admin`. Admin de exemplo (do seed): **`admin@dermamatch.com`** / **`admin123`**.

O admin gerencia:

- **Biomédicas** — cadastro, ativação/desativação.
- **Questionário** — perguntas, opções e pesos por tipo de pele, com **versionamento** (edita um rascunho e publica; resultados já calculados não mudam).
- **Tipos de pele** — nome, descrição e **ordem no espectro** (base do nível 1–5 calculado no resultado).
- **Produtos** — catálogo, com sugestões amarradas às respostas do questionário.
- **Conversas** — reatribuição entre biomédicas (cada conversa tem uma biomédica; atribuição automática por menor carga).
- **Painel** — indicadores (usuárias, biomédicas, conversas, distribuição por tipo de pele).

A **biomédica** passa a editar a **rotina personalizada** de cada paciente (itens por etapa + produtos do catálogo); a usuária vê a rotina personalizada no lugar da base, com selo de atualização. Decisões em `.claude/decisions/0016-plataforma-clinica-configuravel.md`.

## Scripts (raiz do workspace)

| Script              | O que faz                                        |
| ------------------- | ------------------------------------------------ |
| `pnpm dev:backend`  | Sobe a API com reload automático (tsx watch).    |
| `pnpm dev:frontend` | Sobe o frontend (Vite).                          |
| `pnpm build`        | Builda todos os pacotes (shared → backend/front).|
| `pnpm typecheck`    | Checagem de tipos em todos os pacotes.           |
| `pnpm lint`         | ESLint em todos os pacotes.                       |
| `pnpm test`         | Roda os testes de backend e frontend (Vitest).   |

Cada pacote também tem seus próprios scripts — rode com `pnpm --filter <nome> <script>` (ou entrando
no diretório). Nomes: backend = `derma-match`, frontend = `derma-match-frontend`, shared =
`@derma-match/shared`.

## Testes

- **Backend:** `pnpm --filter derma-match test:setup` (uma vez) e depois
  `pnpm --filter derma-match test` — usam um schema Postgres isolado. Detalhes em
  [`backend/SETUP.md`](./backend/SETUP.md).
- **Frontend:** `pnpm --filter derma-match-frontend test` — Vitest + Testing Library (jsdom).
- **Todos de uma vez:** `pnpm test` na raiz (requer o banco de teste do backend já preparado).
- **Manuais de rota:** ficam em `backend/.http/` (não versionada) e usam a extensão **REST Client**
  do VS Code. `fluxo-completo.http` cobre a jornada ponta a ponta.

## Documentação do projeto

A documentação viva (produto, arquitetura, requisitos, convenções, fases e decisões) fica em
[`.claude/`](./.claude). É a fonte de verdade sobre escopo, padrões e o porquê das escolhas.
