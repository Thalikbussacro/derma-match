import { useAuth } from '../features/auth/authContext';
import { HomePage } from '../pages/HomePage';
import { LandingPage } from '../pages/LandingPage';
import { Spinner } from './ui/Spinner';

// Raiz pública: landing convidativa quando deslogada, dashboard quando logada.
export function Inicio() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="flex justify-center py-12 text-brand-500">
        <Spinner />
      </div>
    );
  }

  return usuario ? <HomePage /> : <LandingPage />;
}
