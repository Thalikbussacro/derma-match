-- AlterTable
ALTER TABLE "tipos_pele" ADD COLUMN     "ordem" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "tipo_pele_nivel" INTEGER;

-- Ordem inicial no espectro (do mais seco ao mais oleoso; sensível ao fim). Ajustável no admin.
UPDATE "tipos_pele" SET "ordem" = CASE "nome"
  WHEN 'seca' THEN 1
  WHEN 'normal' THEN 2
  WHEN 'mista' THEN 3
  WHEN 'oleosa' THEN 4
  WHEN 'sensivel' THEN 5
  ELSE 0 END;
