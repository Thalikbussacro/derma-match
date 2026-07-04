import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

export function NotFound() {
  return (
    <EmptyState
      icone={<span className="text-3xl">🧭</span>}
      titulo="Página não encontrada"
      descricao="O endereço que você tentou acessar não existe."
      acao={
        <Link to="/">
          <Button fullWidth>Voltar ao início</Button>
        </Link>
      }
    />
  );
}
