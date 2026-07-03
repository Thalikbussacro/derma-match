import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../features/auth/authContext';

export function HomePage() {
  const { usuario } = useAuth();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-neutral-800">Olá, {usuario?.nome}!</h1>
      <p className="text-neutral-600">
        Descubra seu tipo de pele e receba uma rotina de cuidados personalizada.
      </p>
      <Link to="/questionario">
        <Button fullWidth>Fazer o questionário</Button>
      </Link>
    </div>
  );
}
