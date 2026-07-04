-- CreateEnum
CREATE TYPE "StatusQuestionario" AS ENUM ('RASCUNHO', 'PUBLICADO', 'ARQUIVADO');

-- CreateTable
CREATE TABLE "questionario_versoes" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "status" "StatusQuestionario" NOT NULL DEFAULT 'RASCUNHO',
    "publicado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questionario_versoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "questionario_versoes_numero_key" ON "questionario_versoes"("numero");

-- Versão 1 (publicada) — recebe o conteúdo atual do questionário (do seed).
INSERT INTO "questionario_versoes" ("numero", "status", "publicado_em", "criado_em")
VALUES (1, 'PUBLICADO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- perguntas.questionario_versao_id: adiciona nullable, backfill para a versão 1, depois NOT NULL.
ALTER TABLE "perguntas" ADD COLUMN "questionario_versao_id" INTEGER;
UPDATE "perguntas"
SET "questionario_versao_id" = (SELECT "id" FROM "questionario_versoes" WHERE "numero" = 1);
ALTER TABLE "perguntas" ALTER COLUMN "questionario_versao_id" SET NOT NULL;

-- usuarios.questionario_versao_id: versão do resultado atual (backfill só para quem já concluiu).
ALTER TABLE "usuarios" ADD COLUMN "questionario_versao_id" INTEGER;
UPDATE "usuarios"
SET "questionario_versao_id" = (SELECT "id" FROM "questionario_versoes" WHERE "numero" = 1)
WHERE "tipo_pele_predominante_id" IS NOT NULL;

-- Troca do unique de perguntas: ordem -> (versão, ordem).
DROP INDEX "perguntas_ordem_key";
CREATE UNIQUE INDEX "perguntas_questionario_versao_id_ordem_key" ON "perguntas"("questionario_versao_id", "ordem");

-- Foreign keys
ALTER TABLE "perguntas" ADD CONSTRAINT "perguntas_questionario_versao_id_fkey" FOREIGN KEY ("questionario_versao_id") REFERENCES "questionario_versoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_questionario_versao_id_fkey" FOREIGN KEY ("questionario_versao_id") REFERENCES "questionario_versoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
