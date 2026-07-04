import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useBiomedicaAuth } from '../../features/biomedica/biomedicaAuthContext';
import { IconLogout, IconShield } from '../ui/icons';

export function BiomedicaLayout() {
  const { biomedica, logout } = useBiomedicaAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const nome = location.pathname.includes('/atendimento')
      ? 'Atendimento'
      : location.pathname.endsWith('/login')
        ? 'Entrar'
        : 'Conversas';
    document.title = `${nome} · Biomédica · Derma Match`;
  }, [location.pathname]);

  async function sair() {
    await logout();
    void navigate('/biomedica/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {/* Cabeçalho clínico distinto (verde escuro) — deixa claro que é a área da biomédica. */}
      <header className="bg-brand-700 text-white shadow-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <IconShield className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-extrabold">Painel da biomédica</p>
              {biomedica && <p className="text-xs text-white/70">{biomedica.nome}</p>}
            </div>
          </div>
          {biomedica && (
            <button
              type="button"
              onClick={() => void sair()}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold text-white/90 transition-colors hover:bg-white/10"
            >
              <IconLogout className="h-4 w-4" />
              Sair
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
