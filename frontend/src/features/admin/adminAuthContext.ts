import { createContext, useContext } from 'react';
import type { AdminResponse } from '@derma-match/shared';

export interface AdminAuthContextValue {
  admin: AdminResponse | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth precisa estar dentro de <AdminAuthProvider>.');
  }
  return ctx;
}
