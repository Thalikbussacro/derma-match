import type { PainelUpgradeResponse } from '@derma-match/shared';
import { api } from '../../lib/api';

export type { PainelUpgradeResponse as PainelUpgrade };

export const premiumApi = {
  async obterPainel(): Promise<PainelUpgradeResponse> {
    const res = await api.get<PainelUpgradeResponse>('/premium/painel-upgrade');
    return res.data;
  },
};
