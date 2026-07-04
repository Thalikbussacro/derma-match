import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../features/admin/adminAuthContext';
import { Spinner } from '../ui/Spinner';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { admin, carregando } = useAdminAuth();

  if (carregando) {
    return (
      <div className="flex justify-center py-12 text-brand-500">
        <Spinner />
      </div>
    );
  }
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
