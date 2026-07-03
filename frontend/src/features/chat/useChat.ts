import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from './chat.api';

const CHAVE_CONVERSA = ['chat', 'conversa'];
const CHAVE_MENSAGENS = ['chat', 'mensagens'];

export function useConversa(habilitado: boolean) {
  return useQuery({
    queryKey: CHAVE_CONVERSA,
    queryFn: () => chatApi.obterConversa(),
    enabled: habilitado,
  });
}

export function useMensagens(habilitado: boolean) {
  return useQuery({
    queryKey: CHAVE_MENSAGENS,
    queryFn: () => chatApi.listarMensagens(),
    enabled: habilitado,
    refetchInterval: 5000, // polling do chat
  });
}

export function useEnviarMensagem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conteudo, foto }: { conteudo: string; foto: File | null }) =>
      chatApi.enviar(conteudo, foto),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: CHAVE_MENSAGENS }),
        qc.invalidateQueries({ queryKey: CHAVE_CONVERSA }),
      ]);
    },
  });
}
