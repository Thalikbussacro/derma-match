import { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../features/admin/adminAuthContext';
import { IconLogout } from '../ui/icons';

export function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Admin · Derma Match';
  }, [location.pathname]);

  async function sair() {
    await logout();
    void navigate('/admin/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100">
      {/* Cabeçalho escuro — deixa claro que é a área administrativa (distinta de usuária e biomédica). */}
      <header className="bg-neutral-900 text-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
          <div className="leading-tight">
            <p className="text-sm font-extrabold">Painel do administrador</p>
            {admin && <p className="text-xs text-white/60">{admin.email}</p>}
          </div>
          {admin && (
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
        {admin && (
          <nav className="mx-auto flex max-w-3xl gap-1 px-3">
            {[
              { to: '/admin', label: 'Biomédicas', end: true },
              { to: '/admin/questionario', label: 'Questionário', end: false },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-t-lg px-3 py-2 text-sm font-bold transition-colors ${
                    isActive ? 'bg-neutral-100 text-neutral-900' : 'text-white/70 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
