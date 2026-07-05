import { useEffect, useState, type ReactNode } from 'react';
import type { AdminResponse } from '@derma-match/shared';
import { CHAVE_SESSAO, limparSessao, marcarSessao, temSessao } from '../../lib/sessionHint';
import { adminApi } from './admin.api';
import { AdminAuthContext } from './adminAuthContext';
import { refreshAdmin } from './admin-session';
import { setAdminToken } from './adminToken';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminResponse | null>(null);
  const [carregando, setCarregando] = useState(() => temSessao(CHAVE_SESSAO.admin));

  useEffect(() => {
    let ativo = true;
    if (temSessao(CHAVE_SESSAO.admin)) {
      refreshAdmin()
        .then((sessao) => {
          if (ativo) setAdmin(sessao.admin);
        })
        .catch(() => {
          limparSessao(CHAVE_SESSAO.admin);
        })
        .finally(() => {
          if (ativo) setCarregando(false);
        });
    }

    const aoDeslogar = () => {
      limparSessao(CHAVE_SESSAO.admin);
      setAdmin(null);
    };
    window.addEventListener('admin:logout', aoDeslogar);
    return () => {
      ativo = false;
      window.removeEventListener('admin:logout', aoDeslogar);
    };
  }, []);

  async function login(email: string, senha: string): Promise<void> {
    const sessao = await adminApi.login(email, senha);
    setAdminToken(sessao.accessToken);
    marcarSessao(CHAVE_SESSAO.admin);
    setAdmin(sessao.admin);
  }

  async function logout(): Promise<void> {
    try {
      await adminApi.logout();
    } finally {
      setAdminToken(null);
      limparSessao(CHAVE_SESSAO.admin);
      setAdmin(null);
    }
  }

  return (
    <AdminAuthContext.Provider value={{ admin, carregando, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
