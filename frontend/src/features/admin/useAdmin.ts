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

const CHAVE_RASCUNHO = ['admin', 'rascunho'];

export function useRascunho() {
  return useQuery({ queryKey: CHAVE_RASCUNHO, queryFn: () => adminApi.rascunhoQuestionario() });
}

export function useInvalidarRascunho() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: CHAVE_RASCUNHO });
}

const CHAVE_TIPOS = ['admin', 'tipos-pele'];

export function useTiposPele() {
  return useQuery({ queryKey: CHAVE_TIPOS, queryFn: () => adminApi.tiposPele() });
}

export function useInvalidarTipos() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: CHAVE_TIPOS });
}

const CHAVE_PRODUTOS = ['admin', 'produtos'];

export function useProdutos() {
  return useQuery({ queryKey: CHAVE_PRODUTOS, queryFn: () => adminApi.produtos() });
}

export function useInvalidarProdutos() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: CHAVE_PRODUTOS });
}

const CHAVE_CONVERSAS = ['admin', 'conversas'];

export function useConversasAdmin() {
  return useQuery({ queryKey: CHAVE_CONVERSAS, queryFn: () => adminApi.conversas() });
}

export function useInvalidarConversas() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: CHAVE_CONVERSAS });
}
