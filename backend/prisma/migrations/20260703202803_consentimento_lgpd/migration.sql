-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "consentimento_dados_sensiveis_em" TIMESTAMP(3),
ADD COLUMN     "consentimento_versao" VARCHAR(20) NOT NULL DEFAULT '1.0';
