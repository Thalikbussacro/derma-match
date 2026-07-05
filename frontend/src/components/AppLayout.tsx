import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';
import { BottomNav } from './ui/BottomNav';
import { IconDroplet } from './ui/icons';

const TITULOS: Record<string, string> = {
  '/': 'Início',
  '/login': 'Entrar',
  '/cadastro': 'Criar conta',
  '/recuperar-senha': 'Recuperar senha',
  '/redefinir-senha': 'Nova senha',
  '/questionario': 'Questionário',
  '/rotina': 'Minha rotina',
  '/premium': 'Premium',
  '/chat': 'Atendimento',
  '/conta': 'Minha conta',
  '/privacidade': 'Privacidade',
};

export function AppLayout() {
  const { usuario } = useAuth();
  const location = useLocation();
  const logado = Boolean(usuario);

  useEffect(() => {
    const nome = TITULOS[location.pathname];
    document.title = nome ? `${nome} · Derma Match` : 'Derma Match';
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-neutral-100 bg-[#f3f7f4]/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-brand-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
              <IconDroplet className="h-4 w-4" />
            </span>
            Derma Match
          </Link>
          {!logado && (
            <nav className="flex items-center gap-3 text-sm font-semibold text-neutral-500">
              <Link to="/biomedica/login" className="transition-colors hover:text-brand-600">
                Biomédica
              </Link>
              <Link to="/admin/login" className="transition-colors hover:text-brand-600">
                Admin
              </Link>
            </nav>
          )}
        </div>
      </header>

      <main className={`mx-auto w-full max-w-md flex-1 px-4 py-6 ${logado ? 'pb-28' : ''}`}>
        <Outlet />
      </main>

      {logado && <BottomNav />}
    </div>
  );
}
