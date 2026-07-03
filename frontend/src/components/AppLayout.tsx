import { Link, Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-brand-100 bg-white">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-brand-600">
            Derma Match
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
