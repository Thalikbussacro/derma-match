import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Usuario } from '../auth/auth.schemas';
import { contaApi } from './conta.api';

export function usePerfil() {
  return useQuery({ queryKey: ['conta', 'perfil'], queryFn: () => contaApi.obterPerfil() });
}

export function useAtualizarConta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { nome?: string; senhaAtual?: string; novaSenha?: string }) =>
      contaApi.atualizar(input),
    onSuccess: (usuario: Usuario) => {
      qc.setQueryData(['conta', 'perfil'], usuario);
    },
  });
}

export function useExcluirConta() {
  return useMutation({ mutationFn: () => contaApi.excluir() });
}
