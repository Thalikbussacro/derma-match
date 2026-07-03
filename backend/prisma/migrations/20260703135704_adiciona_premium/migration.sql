-- CreateEnum
CREATE TYPE "AutorMensagem" AS ENUM ('USUARIA', 'BIOMEDICA');

-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "biomedica_id" INTEGER,
ALTER COLUMN "usuario_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "biomedicas" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "registro" VARCHAR(40) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biomedicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "biomedica_id" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_atividade" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens" (
    "id" SERIAL NOT NULL,
    "conversa_id" INTEGER NOT NULL,
    "autor_tipo" "AutorMensagem" NOT NULL,
    "autor_id" INTEGER NOT NULL,
    "conteudo" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anexos" (
    "id" SERIAL NOT NULL,
    "mensagem_id" INTEGER NOT NULL,
    "tipo" VARCHAR(100) NOT NULL,
    "caminho" TEXT NOT NULL,
    "data_expiracao" TIMESTAMP(3) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anexos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "biomedicas_registro_key" ON "biomedicas"("registro");

-- CreateIndex
CREATE UNIQUE INDEX "biomedicas_email_key" ON "biomedicas"("email");

-- CreateIndex
CREATE INDEX "conversas_biomedica_id_ultima_atividade_idx" ON "conversas"("biomedica_id", "ultima_atividade");

-- CreateIndex
CREATE UNIQUE INDEX "conversas_usuario_id_biomedica_id_key" ON "conversas"("usuario_id", "biomedica_id");

-- CreateIndex
CREATE INDEX "mensagens_conversa_id_criado_em_idx" ON "mensagens"("conversa_id", "criado_em");

-- CreateIndex
CREATE INDEX "anexos_data_expiracao_idx" ON "anexos"("data_expiracao");

-- CreateIndex
CREATE INDEX "refresh_tokens_biomedica_id_revogado_em_idx" ON "refresh_tokens"("biomedica_id", "revogado_em");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_biomedica_id_fkey" FOREIGN KEY ("biomedica_id") REFERENCES "biomedicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_biomedica_id_fkey" FOREIGN KEY ("biomedica_id") REFERENCES "biomedicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_conversa_id_fkey" FOREIGN KEY ("conversa_id") REFERENCES "conversas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anexos" ADD CONSTRAINT "anexos_mensagem_id_fkey" FOREIGN KEY ("mensagem_id") REFERENCES "mensagens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Cada refresh token pertence a exatamente um dono (usuária XOR biomédica).
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_dono_xor"
  CHECK (("usuario_id" IS NOT NULL) <> ("biomedica_id" IS NOT NULL));
