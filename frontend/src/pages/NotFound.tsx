import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <h1 className="text-2xl font-bold text-neutral-800">Página não encontrada</h1>
      <p className="text-neutral-600">O endereço que você tentou acessar não existe.</p>
      <Link to="/">
        <Button variant="secondary">Voltar ao início</Button>
      </Link>
    </div>
  );
}
