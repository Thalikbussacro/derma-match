import { useAuth } from '../features/auth/authContext';

export function HomePage() {
  const { usuario } = useAuth();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-neutral-800">Olá, {usuario?.nome}!</h1>
      <p className="text-neutral-600">Em breve, aqui ficam seu questionário e sua rotina.</p>
    </div>
  );
}
