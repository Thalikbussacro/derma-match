import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { biomedicaApi } from './biomedica.api';

export function useConversasBiomedica() {
  return useQuery({
    queryKey: ['biomedica', 'conversas'],
    queryFn: () => biomedicaApi.conversas(),
    refetchInterval: 8000,
  });
}

export function useMensagensBiomedica(conversaId: number) {
  return useQuery({
    queryKey: ['biomedica', 'mensagens', conversaId],
    queryFn: () => biomedicaApi.mensagens(conversaId),
    refetchInterval: 5000,
  });
}

export function useContextoClinico(conversaId: number, habilitado: boolean) {
  return useQuery({
    queryKey: ['biomedica', 'contexto', conversaId],
    queryFn: () => biomedicaApi.contexto(conversaId),
    // Só busca as respostas (PII) quando o painel de contexto é aberto (minimização).
    enabled: habilitado,
  });
}

export function useResponderBiomedica(conversaId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conteudo: string) => biomedicaApi.responder(conversaId, conteudo),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['biomedica', 'mensagens', conversaId] }),
        qc.invalidateQueries({ queryKey: ['biomedica', 'conversas'] }),
      ]);
    },
  });
}

export function useRotinaEdicao(conversaId: number) {
  return useQuery({
    queryKey: ['biomedica', 'rotina', conversaId],
    queryFn: () => biomedicaApi.rotina(conversaId),
  });
}

export function useDiarioPaciente(conversaId: number, habilitado: boolean) {
  return useQuery({
    queryKey: ['biomedica', 'diario', conversaId],
    queryFn: () => biomedicaApi.diario(conversaId),
    enabled: habilitado,
  });
}
