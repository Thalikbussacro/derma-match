-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "meta_pele" TEXT;

-- CreateTable
CREATE TABLE "registros_diario" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "condicao" INTEGER NOT NULL,
    "tags" TEXT[],
    "nota" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_diario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkins_rotina" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "dia" DATE NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkins_rotina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dicas" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(160) NOT NULL,
    "conteudo" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dicas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registros_diario_usuario_id_criado_em_idx" ON "registros_diario"("usuario_id", "criado_em");

-- CreateIndex
CREATE UNIQUE INDEX "checkins_rotina_usuario_id_dia_key" ON "checkins_rotina"("usuario_id", "dia");

-- AddForeignKey
ALTER TABLE "registros_diario" ADD CONSTRAINT "registros_diario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkins_rotina" ADD CONSTRAINT "checkins_rotina_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
