-- CreateTable
CREATE TABLE "tipos_pele" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(40) NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "tipos_pele_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipos_pele_nome_key" ON "tipos_pele"("nome");
