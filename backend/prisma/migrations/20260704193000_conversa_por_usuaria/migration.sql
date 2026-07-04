-- Uma conversa ativa por usuária (antes: uma por par usuária+biomédica).
DROP INDEX "conversas_usuario_id_biomedica_id_key";

CREATE UNIQUE INDEX "conversas_usuario_id_key" ON "conversas"("usuario_id");
