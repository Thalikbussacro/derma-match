-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "admin_id" INTEGER;

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX "refresh_tokens_admin_id_revogado_em_idx" ON "refresh_tokens"("admin_id", "revogado_em");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Dono do refresh token: exatamente um entre usuária, biomédica e admin.
ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "refresh_tokens_dono_xor";
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_dono_xor" CHECK (
  (("usuario_id" IS NOT NULL)::int + ("biomedica_id" IS NOT NULL)::int + ("admin_id" IS NOT NULL)::int) = 1
);
