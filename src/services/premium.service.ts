import type { PainelUpgradeResponse } from '../schemas/premium.schema.js';

// Conteúdo estático do painel de upgrade Premium (sem banco). O Premium em si é a Fase 5.
const PAINEL_UPGRADE: PainelUpgradeResponse = {
  titulo: 'Plano Premium',
  descricao:
    'Acesso direto a uma biomédica pelo chat, com envio de fotos da sua pele para análise personalizada.',
  beneficios: [
    'Chat com biomédica especializada',
    'Envio de fotos para análise da sua pele',
    'Histórico de conversas sempre à mão',
  ],
  aviso: 'Em breve. Fique de olho nas novidades.',
};

function obterPainelUpgrade(): PainelUpgradeResponse {
  return PAINEL_UPGRADE;
}

export const premiumService = {
  obterPainelUpgrade,
};
