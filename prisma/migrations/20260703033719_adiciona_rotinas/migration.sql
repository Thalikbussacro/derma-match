-- CreateEnum
CREATE TYPE "EtapaRotina" AS ENUM ('LIMPEZA', 'TONIFICACAO', 'HIDRATACAO', 'PROTECAO_SOLAR', 'TRATAMENTO');

-- CreateTable
CREATE TABLE "rotinas" (
    "id" SERIAL NOT NULL,
    "tipo_pele_id" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "rotinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_rotina" (
    "id" SERIAL NOT NULL,
    "rotina_id" INTEGER NOT NULL,
    "etapa" "EtapaRotina" NOT NULL,
    "descricao" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "itens_rotina_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rotinas_tipo_pele_id_key" ON "rotinas"("tipo_pele_id");

-- CreateIndex
CREATE INDEX "itens_rotina_rotina_id_ordem_idx" ON "itens_rotina"("rotina_id", "ordem");

-- AddForeignKey
ALTER TABLE "rotinas" ADD CONSTRAINT "rotinas_tipo_pele_id_fkey" FOREIGN KEY ("tipo_pele_id") REFERENCES "tipos_pele"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_rotina" ADD CONSTRAINT "itens_rotina_rotina_id_fkey" FOREIGN KEY ("rotina_id") REFERENCES "rotinas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
