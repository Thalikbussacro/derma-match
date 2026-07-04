-- CreateTable
CREATE TABLE "rotinas_personalizadas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "biomedica_id" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rotinas_personalizadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_rotina_personalizada" (
    "id" SERIAL NOT NULL,
    "rotina_personalizada_id" INTEGER NOT NULL,
    "etapa" "EtapaRotina" NOT NULL,
    "descricao" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "produto_id" INTEGER,

    CONSTRAINT "itens_rotina_personalizada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rotina_alteracoes" (
    "id" SERIAL NOT NULL,
    "rotina_personalizada_id" INTEGER NOT NULL,
    "biomedica_id" INTEGER NOT NULL,
    "resumo" TEXT NOT NULL,
    "alterado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rotina_alteracoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rotinas_personalizadas_usuario_id_key" ON "rotinas_personalizadas"("usuario_id");

-- CreateIndex
CREATE INDEX "itens_rotina_personalizada_rotina_personalizada_id_ordem_idx" ON "itens_rotina_personalizada"("rotina_personalizada_id", "ordem");

-- CreateIndex
CREATE INDEX "rotina_alteracoes_rotina_personalizada_id_alterado_em_idx" ON "rotina_alteracoes"("rotina_personalizada_id", "alterado_em");

-- AddForeignKey
ALTER TABLE "rotinas_personalizadas" ADD CONSTRAINT "rotinas_personalizadas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotinas_personalizadas" ADD CONSTRAINT "rotinas_personalizadas_biomedica_id_fkey" FOREIGN KEY ("biomedica_id") REFERENCES "biomedicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_rotina_personalizada" ADD CONSTRAINT "itens_rotina_personalizada_rotina_personalizada_id_fkey" FOREIGN KEY ("rotina_personalizada_id") REFERENCES "rotinas_personalizadas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_rotina_personalizada" ADD CONSTRAINT "itens_rotina_personalizada_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotina_alteracoes" ADD CONSTRAINT "rotina_alteracoes_rotina_personalizada_id_fkey" FOREIGN KEY ("rotina_personalizada_id") REFERENCES "rotinas_personalizadas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotina_alteracoes" ADD CONSTRAINT "rotina_alteracoes_biomedica_id_fkey" FOREIGN KEY ("biomedica_id") REFERENCES "biomedicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
