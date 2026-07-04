import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CriarRegistroDiarioInput } from '@derma-match/shared';
import { acompanhamentoApi } from './acompanhamento.api';

export function useDiario() {
  return useQuery({ queryKey: ['diario'], queryFn: () => acompanhamentoApi.listarDiario() });
}

export function useCriarRegistro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarRegistroDiarioInput) => acompanhamentoApi.criarRegistro(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['diario'] });
    },
  });
}

export function useRemoverRegistro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => acompanhamentoApi.removerRegistro(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['diario'] });
    },
  });
}

export function useAdesao() {
  return useQuery({ queryKey: ['adesao'], queryFn: () => acompanhamentoApi.adesao() });
}

export function useCheckin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => acompanhamentoApi.checkin(),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['adesao'] });
    },
  });
}

export function useDicas() {
  return useQuery({ queryKey: ['dicas'], queryFn: () => acompanhamentoApi.dicas() });
}
