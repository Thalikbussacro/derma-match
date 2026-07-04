-- CreateTable
CREATE TABLE "produtos" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "marca" VARCHAR(80),
    "etapa" "EtapaRotina" NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opcao_produto_sugerido" (
    "opcao_id" INTEGER NOT NULL,
    "produto_id" INTEGER NOT NULL,

    CONSTRAINT "opcao_produto_sugerido_pkey" PRIMARY KEY ("opcao_id","produto_id")
);

-- AddForeignKey
ALTER TABLE "opcao_produto_sugerido" ADD CONSTRAINT "opcao_produto_sugerido_opcao_id_fkey" FOREIGN KEY ("opcao_id") REFERENCES "opcoes_resposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opcao_produto_sugerido" ADD CONSTRAINT "opcao_produto_sugerido_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
