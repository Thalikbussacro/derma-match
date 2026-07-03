import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';
import { Spinner } from './ui/Spinner';

export function RedirectIfAuth({ children }: { children: ReactNode }) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="flex justify-center py-12 text-brand-500">
        <Spinner />
      </div>
    );
  }

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
