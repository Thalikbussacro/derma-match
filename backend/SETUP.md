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

## 4. Rodar a aplicação

```bash
pnpm dev
```

Sobe o servidor em `http://localhost:3000` (porta configurável via `PORT` no `.env`).

## Testar endpoints (.http)

Os testes manuais de endpoint ficam na pasta `.http/` (não versionada). O cliente esperado é a
extensão **REST Client** do VS Code: abra um arquivo `.http`, clique em _Send Request_ acima da
requisição e veja a resposta. Exemplo pronto: `.http/health.http`.

## Testes automatizados

Os testes usam um schema Postgres separado (`test`) no mesmo banco, isolado do schema de
desenvolvimento (`public`).

1. Crie o `.env.test` (não versionado):

   ```
   NODE_ENV=test
   DATABASE_URL="postgresql://derma:derma@localhost:5433/derma_match?schema=test"
   ```

2. Prepare o banco de teste (aplica migrations e seed no schema `test`):

   ```bash
   pnpm test:setup
   ```

3. Rode os testes:

   ```bash
   pnpm test
   ```
