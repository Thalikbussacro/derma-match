import { createContext, useContext } from 'react';
import type { Usuario } from './auth.schemas';

export interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  definirUsuario: (usuario: Usuario) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  }
  return ctx;
}
