import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { questionarioApi } from './questionario.api';

const CHAVE_ESTADO = ['questionario', 'estado'];
const CHAVE_PROXIMA = ['questionario', 'proxima'];

export function useEstadoQuestionario() {
  return useQuery({ queryKey: CHAVE_ESTADO, queryFn: () => questionarioApi.obterEstado() });
}

export function useProximaPergunta(habilitado: boolean) {
  return useQuery({
    queryKey: CHAVE_PROXIMA,
    queryFn: () => questionarioApi.obterProxima(),
    enabled: habilitado,
  });
}

export function useResponder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ perguntaId, opcaoId }: { perguntaId: number; opcaoId: number }) =>
      questionarioApi.responder(perguntaId, opcaoId),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: CHAVE_PROXIMA }),
        qc.invalidateQueries({ queryKey: CHAVE_ESTADO }),
      ]);
    },
  });
}

export function useFinalizar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => questionarioApi.finalizar(),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: CHAVE_ESTADO });
    },
  });
}

export function useRefazer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => questionarioApi.refazer(),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: CHAVE_ESTADO }),
        qc.invalidateQueries({ queryKey: CHAVE_PROXIMA }),
      ]);
    },
  });
}
