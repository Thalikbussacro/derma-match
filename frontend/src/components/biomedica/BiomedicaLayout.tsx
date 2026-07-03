import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useBiomedicaAuth } from '../../features/biomedica/biomedicaAuthContext';

export function BiomedicaLayout() {
  const { biomedica, logout } = useBiomedicaAuth();
  const navigate = useNavigate();

  async function sair() {
    await logout();
    void navigate('/biomedica/login', { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link to="/biomedica" className="text-lg font-bold text-accent-600">
            Derma Match · Biomédica
          </Link>
          {biomedica && (
            <button
              type="button"
              onClick={() => void sair()}
              className="text-sm font-medium text-neutral-500 transition-colors hover:text-accent-600"
            >
              Sair
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
