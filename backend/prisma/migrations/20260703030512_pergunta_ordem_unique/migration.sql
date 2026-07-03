-- DropIndex
DROP INDEX "perguntas_ordem_idx";

-- CreateIndex
CREATE UNIQUE INDEX "perguntas_ordem_key" ON "perguntas"("ordem");
