# Setup local

Passos para subir o backend do Derma Match na máquina.

## 1. Dependências

```bash
pnpm install
```

## 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Ajuste os valores se necessário. Os defaults já batem com o `docker-compose.yml`.

## 3. Banco de dados (Postgres via Docker)

```bash
docker compose up -d
```

Sobe um Postgres 16 em `localhost:5433` com os dados persistidos no volume `derma_match_pgdata`.

> A porta de host padrão é **5433** (e não 5432) para não conflitar com outro Postgres
> que já esteja rodando na máquina. Para trocar, defina `POSTGRES_HOST_PORT` no `.env`
> e ajuste a porta no `DATABASE_URL`.

Para conferir se está no ar:

```bash
docker compose exec postgres pg_isready -U derma -d derma_match
```

Para derrubar (mantendo os dados):

```bash
docker compose down
```

Para derrubar e apagar os dados:

```bash
docker compose down -v
```
