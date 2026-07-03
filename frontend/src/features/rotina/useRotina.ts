import { useQuery } from '@tanstack/react-query';
import { rotinaApi } from './rotina.api';

export function useRotina() {
  return useQuery({
    queryKey: ['rotina'],
    queryFn: () => rotinaApi.obter(),
    // Questionário incompleto retorna 400 — não adianta repetir.
    retry: false,
  });
}
