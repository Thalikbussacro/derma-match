import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CriarBiomedicaInput } from '@derma-match/shared';
import { adminApi } from './admin.api';

const CHAVE_BIOMEDICAS = ['admin', 'biomedicas'];

export function useBiomedicas() {
  return useQuery({ queryKey: CHAVE_BIOMEDICAS, queryFn: () => adminApi.biomedicas() });
}

export function useCriarBiomedica() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarBiomedicaInput) => adminApi.criarBiomedica(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: CHAVE_BIOMEDICAS });
    },
  });
}

export function useDefinirAtiva() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativa }: { id: number; ativa: boolean }) => adminApi.definirAtiva(id, ativa),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: CHAVE_BIOMEDICAS });
    },
  });
}
