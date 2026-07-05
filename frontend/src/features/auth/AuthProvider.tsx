import { useEffect, useState, type ReactNode } from 'react';
import { CHAVE_SESSAO, limparSessao, marcarSessao, temSessao } from '../../lib/sessionHint';
import { authApi } from './auth.api';
import { AuthContext } from './authContext';
import type { Usuario } from './auth.schemas';
import { refreshSessao } from './session';
import { setAccessToken } from './tokenStore';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  // Só há o que carregar se há indício de login — senão já começa deslogado (evita o
  // 401 REFRESH_AUSENTE em páginas públicas ou nas áreas de outro papel).
  const [carregando, setCarregando] = useState(() => temSessao(CHAVE_SESSAO.usuaria));

  useEffect(() => {
    let ativo = true;

    if (temSessao(CHAVE_SESSAO.usuaria)) {
      refreshSessao()
        .then((sessao) => {
          if (ativo) setUsuario(sessao.usuario);
        })
        .catch(() => {
          limparSessao(CHAVE_SESSAO.usuaria);
        })
        .finally(() => {
          if (ativo) setCarregando(false);
        });
    }

    // O interceptor emite este evento quando o refresh falha (sessão expirada).
    const aoDeslogar = () => {
      limparSessao(CHAVE_SESSAO.usuaria);
      setUsuario(null);
    };
    window.addEventListener('auth:logout', aoDeslogar);
    return () => {
      ativo = false;
      window.removeEventListener('auth:logout', aoDeslogar);
    };
  }, []);

  async function login(email: string, senha: string): Promise<void> {
    const sessao = await authApi.login({ email, senha });
    setAccessToken(sessao.accessToken);
    marcarSessao(CHAVE_SESSAO.usuaria);
    setUsuario(sessao.usuario);
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      limparSessao(CHAVE_SESSAO.usuaria);
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
