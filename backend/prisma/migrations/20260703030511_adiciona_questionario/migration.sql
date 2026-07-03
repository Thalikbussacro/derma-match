-- CreateTable
CREATE TABLE "perguntas" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "depende_de_opcao_id" INTEGER,

    CONSTRAINT "perguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opcoes_resposta" (
    "id" SERIAL NOT NULL,
    "pergunta_id" INTEGER NOT NULL,
    "texto" VARCHAR(200) NOT NULL,

    CONSTRAINT "opcoes_resposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesos_opcao_pele" (
    "opcao_id" INTEGER NOT NULL,
    "tipo_pele_id" INTEGER NOT NULL,
    "peso" INTEGER NOT NULL,

    CONSTRAINT "pesos_opcao_pele_pkey" PRIMARY KEY ("opcao_id","tipo_pele_id")
);

-- CreateTable
CREATE TABLE "respostas_usuario" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "pergunta_id" INTEGER NOT NULL,
    "opcao_id" INTEGER NOT NULL,
    "respondido_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respostas_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "perguntas_ordem_idx" ON "perguntas"("ordem");

-- CreateIndex
CREATE INDEX "respostas_usuario_usuario_id_idx" ON "respostas_usuario"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "respostas_usuario_usuario_id_pergunta_id_key" ON "respostas_usuario"("usuario_id", "pergunta_id");

-- AddForeignKey
ALTER TABLE "perguntas" ADD CONSTRAINT "perguntas_depende_de_opcao_id_fkey" FOREIGN KEY ("depende_de_opcao_id") REFERENCES "opcoes_resposta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opcoes_resposta" ADD CONSTRAINT "opcoes_resposta_pergunta_id_fkey" FOREIGN KEY ("pergunta_id") REFERENCES "perguntas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesos_opcao_pele" ADD CONSTRAINT "pesos_opcao_pele_opcao_id_fkey" FOREIGN KEY ("opcao_id") REFERENCES "opcoes_resposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesos_opcao_pele" ADD CONSTRAINT "pesos_opcao_pele_tipo_pele_id_fkey" FOREIGN KEY ("tipo_pele_id") REFERENCES "tipos_pele"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_usuario" ADD CONSTRAINT "respostas_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_usuario" ADD CONSTRAINT "respostas_usuario_pergunta_id_fkey" FOREIGN KEY ("pergunta_id") REFERENCES "perguntas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_usuario" ADD CONSTRAINT "respostas_usuario_opcao_id_fkey" FOREIGN KEY ("opcao_id") REFERENCES "opcoes_resposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
