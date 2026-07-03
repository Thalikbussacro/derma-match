-- CreateEnum
CREATE TYPE "Plano" AS ENUM ('FREE', 'PREMIUM');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "plano" "Plano" NOT NULL DEFAULT 'FREE',
    "tipo_pele_predominante_id" INTEGER,
    "consentimento_lgpd_em" TIMESTAMP(3) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_tipo_pele_predominante_id_fkey" FOREIGN KEY ("tipo_pele_predominante_id") REFERENCES "tipos_pele"("id") ON DELETE SET NULL ON UPDATE CASCADE;
