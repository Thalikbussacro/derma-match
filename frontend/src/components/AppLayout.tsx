import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';

const TITULOS: Record<string, string> = {
  '/': 'Início',
  '/login': 'Entrar',
  '/cadastro': 'Criar conta',
  '/recuperar-senha': 'Recuperar senha',
  '/redefinir-senha': 'Nova senha',
  '/questionario': 'Questionário',
  '/rotina': 'Minha rotina',
  '/premium': 'Premium',
  '/conta': 'Minha conta',
};

export function AppLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const nome = TITULOS[location.pathname];
    document.title = nome ? `${nome} · Derma Match` : 'Derma Match';
  }, [location.pathname]);

  async function aoSair() {
    await logout();
    void navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-brand-100 bg-white">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-brand-600">
            Derma Match
          </Link>
          {usuario && (
            <button
              type="button"
              onClick={() => void aoSair()}
              className="text-sm font-medium text-neutral-500 transition-colors hover:text-brand-600"
            >
              Sair
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-md px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
