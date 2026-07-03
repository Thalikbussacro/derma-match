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

export function useContextoClinico(conversaId: number) {
  return useQuery({
    queryKey: ['biomedica', 'contexto', conversaId],
    queryFn: () => biomedicaApi.contexto(conversaId),
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
