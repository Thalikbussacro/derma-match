import { useEffect, useState, type ReactNode } from 'react';
import type { BiomedicaResponse } from '@derma-match/shared';
import { CHAVE_SESSAO, limparSessao, marcarSessao, temSessao } from '../../lib/sessionHint';
import { biomedicaApi } from './biomedica.api';
import { BiomedicaAuthContext } from './biomedicaAuthContext';
import { refreshBiomedica } from './biomedica-session';
import { setBiomedicaToken } from './biomedicaToken';

export function BiomedicaAuthProvider({ children }: { children: ReactNode }) {
  const [biomedica, setBiomedica] = useState<BiomedicaResponse | null>(null);
  const [carregando, setCarregando] = useState(() => temSessao(CHAVE_SESSAO.biomedica));

  useEffect(() => {
    let ativo = true;
    if (temSessao(CHAVE_SESSAO.biomedica)) {
      refreshBiomedica()
        .then((sessao) => {
          if (ativo) setBiomedica(sessao.biomedica);
        })
        .catch(() => {
          limparSessao(CHAVE_SESSAO.biomedica);
        })
        .finally(() => {
          if (ativo) setCarregando(false);
        });
    }

    const aoDeslogar = () => {
      limparSessao(CHAVE_SESSAO.biomedica);
      setBiomedica(null);
    };
    window.addEventListener('biomedica:logout', aoDeslogar);
    return () => {
      ativo = false;
      window.removeEventListener('biomedica:logout', aoDeslogar);
    };
  }, []);

  async function login(email: string, senha: string): Promise<void> {
    const sessao = await biomedicaApi.login(email, senha);
    setBiomedicaToken(sessao.accessToken);
    marcarSessao(CHAVE_SESSAO.biomedica);
    setBiomedica(sessao.biomedica);
  }

  async function logout(): Promise<void> {
    try {
      await biomedicaApi.logout();
    } finally {
      setBiomedicaToken(null);
      limparSessao(CHAVE_SESSAO.biomedica);
      setBiomedica(null);
    }
  }

  return (
    <BiomedicaAuthContext.Provider value={{ biomedica, carregando, login, logout }}>
      {children}
    </BiomedicaAuthContext.Provider>
  );
}
