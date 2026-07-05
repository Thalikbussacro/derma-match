# Derma Match

Plataforma web de skincare personalizado. A usuária responde a um questionário adaptativo, o
sistema identifica o tipo de pele predominante e monta uma rotina de cuidados correspondente. No
plano pago, ela ainda fala direto com uma biomédica pelo chat.

Monorepo pnpm com três pacotes:

- [`backend/`](./backend) — API em Node, Express e TypeScript, com Postgres via Prisma.
- [`frontend/`](./frontend) — SPA em React, Vite e Tailwind.
- [`packages/shared/`](./packages/shared) — schemas Zod e tipos do contrato da API, compartilhados
  entre backend e frontend (`@derma-match/shared`).

Stack: Node 22, TypeScript strict, Express 5, Prisma 6 sobre PostgreSQL 16, Zod, JWT + bcrypt,
Vitest, React 19 e Tailwind CSS.

## O que já está pronto

O projeto cobre desde a jornada gratuita até a área clínica e o acompanhamento contínuo:

- **Grátis** — cadastro com consentimento LGPD, questionário adaptativo, cálculo do tipo de pele e
  rotina correspondente, com opção de refazer o questionário quando quiser.
- **Premium** — chat com biomédica (com envio de fotos), histórico de conversas e assinatura. A
  assinatura é simulada; a integração de pagamento real fica para produção.
- **Biomédica** — login e área próprios: fila de conversas, contexto clínico da paciente (respostas
  do questionário + tipo de pele) e edição da rotina personalizada.
- **Admin** — gestão de biomédicas, questionário editável e versionado, tipos de pele em espectro,
  catálogo de produtos e indicadores de uso.
- **Acompanhamento** — diário de pele, adesão à rotina, metas e conteúdo educativo.

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

Para conferir a API: `curl http://localhost:3000/api/health`. O frontend abre em
`http://localhost:5173` e, em dev, encaminha `/api/*` para o backend pelo proxy do Vite.

> O Postgres do container escuta em `localhost:5433` (para não brigar com um Postgres já instalado
> na 5432). Mais detalhes de banco em [`backend/SETUP.md`](./backend/SETUP.md).

Para repopular o banco sem recriar (o seed é idempotente):

```bash
pnpm --filter derma-match exec prisma db seed
```

## Contas de exemplo

O seed já cria dois logins prontos para testar as áreas restritas:

- **Biomédica** — `biomedica@dermamatch.com` / `biomedica123`, área em `/biomedica`.
- **Admin** — `admin@dermamatch.com` / `admin123`, área em `/admin`.

## Premium e área da biomédica

A usuária Premium conversa com a biomédica por um chat com polling, anexa fotos (retidas por 90
dias, conforme a LGPD) e acompanha o histórico. Assina e cancela tanto pelo painel Premium quanto
pela conta.

Do outro lado, a biomédica atende pela área em `/biomedica`: vê a lista de conversas, responde e
consulta o contexto clínico. É ela também quem monta a rotina personalizada de cada paciente (itens
por etapa + produtos do catálogo) — a usuária passa a ver essa rotina no lugar da base, com selo de
atualização.

Rotinas de limpeza, para agendar via cron em produção:

```bash
pnpm --filter derma-match cleanup:tokens    # refresh tokens expirados
pnpm --filter derma-match cleanup:anexos    # fotos fora do prazo de retenção
```

## Painel administrativo

O admin (`/admin`) configura a plataforma:

- **Biomédicas** — cadastro e ativação/desativação.
- **Questionário** — perguntas, opções e pesos por tipo de pele, com versionamento: edita um
  rascunho e publica, sem alterar resultados já calculados.
- **Tipos de pele** — nome, descrição e ordem no espectro (base do nível 1–5 que aparece no
  resultado).
- **Produtos** — catálogo, com sugestões amarradas às respostas do questionário.
- **Conversas** — reatribuição entre biomédicas (a atribuição inicial é automática, por menor carga).
- **Painel** — indicadores de usuárias, biomédicas, conversas e distribuição por tipo de pele.

## Scripts (raiz do workspace)

| Script              | O que faz                                         |
| ------------------- | ------------------------------------------------- |
| `pnpm dev:backend`  | Sobe a API com reload automático (tsx watch).     |
| `pnpm dev:frontend` | Sobe o frontend (Vite).                           |
| `pnpm build`        | Builda todos os pacotes (shared → backend/front). |
| `pnpm typecheck`    | Checagem de tipos em todos os pacotes.            |
| `pnpm lint`         | ESLint em todos os pacotes.                        |
| `pnpm test`         | Roda os testes de backend e frontend (Vitest).    |

Cada pacote tem seus próprios scripts — rode com `pnpm --filter <nome> <script>` ou entrando no
diretório. Os nomes são `derma-match` (backend), `derma-match-frontend` (frontend) e
`@derma-match/shared` (shared).

## Testes

- **Backend:** rode `pnpm --filter derma-match test:setup` uma vez e depois
  `pnpm --filter derma-match test`. Os testes usam um schema Postgres isolado; veja
  [`backend/SETUP.md`](./backend/SETUP.md).
- **Frontend:** `pnpm --filter derma-match-frontend test` — Vitest + Testing Library sobre jsdom.
- **Tudo de uma vez:** `pnpm test` na raiz (precisa do banco de teste do backend já preparado).
- **Testes manuais de rota:** ficam em `backend/.http/` (fora do versionamento) e usam a extensão
  REST Client do VS Code; `fluxo-completo.http` cobre a jornada ponta a ponta.

## Deploy

Dá pra subir tudo de graça no Render: um serviço só serve a API e o frontend juntos — na mesma
origem, então o cookie de sessão funciona sem dor de cabeça — com o Postgres ao lado. O `render.yaml`
na raiz já descreve esses recursos; no painel do Render é **New → Blueprint**, apontar para o
repositório e aplicar. Os segredos (JWT) e a `DATABASE_URL` o próprio Render preenche.

Dois avisos do plano grátis: o serviço **dorme depois de ~15 min** parado (a primeira visita seguinte
leva ~50s para acordar) e o **Postgres grátis do Render expira em 30 dias**. Para manter o banco no ar
por mais tempo, basta trocar a `DATABASE_URL` por um banco do Neon (grátis e sem expiração).

## Documentação interna

As decisões de arquitetura, as convenções de código, os requisitos e o planejamento por fases foram
mantidos em documentação de trabalho que não faz parte deste repositório — ficaram fora do controle
de versão de propósito. O que está aqui é o código e o necessário para rodar; o registro do "porquê"
de cada escolha vive separado.
