import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useBiomedicaAuth } from '../../features/biomedica/biomedicaAuthContext';
import { Spinner } from '../ui/Spinner';

export function RequireBiomedica({ children }: { children: ReactNode }) {
  const { biomedica, carregando } = useBiomedicaAuth();

  if (carregando) {
    return (
      <div className="flex justify-center py-12 text-accent-500">
        <Spinner />
      </div>
    );
  }
  if (!biomedica) {
    return <Navigate to="/biomedica/login" replace />;
  }
  return <>{children}</>;
}
