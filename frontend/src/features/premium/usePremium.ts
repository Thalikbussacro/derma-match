import { useQuery } from '@tanstack/react-query';
import { premiumApi } from './premium.api';

export function usePainelUpgrade() {
  return useQuery({ queryKey: ['premium', 'painel'], queryFn: () => premiumApi.obterPainel() });
}
