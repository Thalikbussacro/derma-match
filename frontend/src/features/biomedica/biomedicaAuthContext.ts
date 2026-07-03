import { createContext, useContext } from 'react';
import type { BiomedicaResponse } from '@derma-match/shared';

export interface BiomedicaAuthContextValue {
  biomedica: BiomedicaResponse | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const BiomedicaAuthContext = createContext<BiomedicaAuthContextValue | null>(null);

export function useBiomedicaAuth(): BiomedicaAuthContextValue {
  const ctx = useContext(BiomedicaAuthContext);
  if (!ctx) {
    throw new Error('useBiomedicaAuth precisa estar dentro de <BiomedicaAuthProvider>.');
  }
  return ctx;
}
