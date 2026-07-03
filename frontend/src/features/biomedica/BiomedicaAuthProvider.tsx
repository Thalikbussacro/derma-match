import { useEffect, useState, type ReactNode } from 'react';
import type { BiomedicaResponse } from '@derma-match/shared';
import { biomedicaApi } from './biomedica.api';
import { BiomedicaAuthContext } from './biomedicaAuthContext';
import { refreshBiomedica } from './biomedica-session';
import { setBiomedicaToken } from './biomedicaToken';

export function BiomedicaAuthProvider({ children }: { children: ReactNode }) {
  const [biomedica, setBiomedica] = useState<BiomedicaResponse | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    refreshBiomedica()
      .then((sessao) => {
        if (ativo) setBiomedica(sessao.biomedica);
      })
      .catch(() => undefined)
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    const aoDeslogar = () => setBiomedica(null);
    window.addEventListener('biomedica:logout', aoDeslogar);
    return () => {
      ativo = false;
      window.removeEventListener('biomedica:logout', aoDeslogar);
    };
  }, []);

  async function login(email: string, senha: string): Promise<void> {
    const sessao = await biomedicaApi.login(email, senha);
    setBiomedicaToken(sessao.accessToken);
    setBiomedica(sessao.biomedica);
  }

  async function logout(): Promise<void> {
    try {
      await biomedicaApi.logout();
    } finally {
      setBiomedicaToken(null);
      setBiomedica(null);
    }
  }

  return (
    <BiomedicaAuthContext.Provider value={{ biomedica, carregando, login, logout }}>
      {children}
    </BiomedicaAuthContext.Provider>
  );
}
