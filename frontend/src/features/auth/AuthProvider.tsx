import { useEffect, useState, type ReactNode } from 'react';
import { authApi } from './auth.api';
import { AuthContext } from './authContext';
import type { Usuario } from './auth.schemas';
import { refreshSessao } from './session';
import { setAccessToken } from './tokenStore';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    // Ao montar, tenta reidratar a sessão pelo cookie httpOnly de refresh.
    refreshSessao()
      .then((sessao) => {
        if (ativo) setUsuario(sessao.usuario);
      })
      .catch(() => {
        // sem sessão válida — segue deslogado
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    // O interceptor emite este evento quando o refresh falha (sessão expirada).
    const aoDeslogar = () => setUsuario(null);
    window.addEventListener('auth:logout', aoDeslogar);
    return () => {
      ativo = false;
      window.removeEventListener('auth:logout', aoDeslogar);
    };
  }, []);

  async function login(email: string, senha: string): Promise<void> {
    const sessao = await authApi.login({ email, senha });
    setAccessToken(sessao.accessToken);
    setUsuario(sessao.usuario);
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUsuario(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ usuario, carregando, login, logout, definirUsuario: setUsuario }}
    >
      {children}
    </AuthContext.Provider>
  );
}
