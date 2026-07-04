import { Link } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { IconChat } from '../../components/ui/icons';
import { useConversasBiomedica } from '../../features/biomedica/useBiomedica';

export function BiomedicaDashboardPage() {
  const { data: conversas, isLoading, isError } = useConversasBiomedica();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 text-brand-500">
        <Spinner />
      </div>
    );
  }
  if (isError || !conversas) {
    return <Alert tipo="erro">Não foi possível carregar as conversas.</Alert>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800">Conversas</h1>
        <p className="text-sm text-neutral-500">Suas pacientes em atendimento</p>
      </div>

      {conversas.length === 0 ? (
        <EmptyState
          icone={<IconChat className="h-8 w-8" />}
          titulo="Nenhuma conversa ainda"
          descricao="Quando uma paciente iniciar uma conversa, ela aparece aqui."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {conversas.map((c) => (
            <Link key={c.id} to={`/biomedica/atendimento/${c.id}`} state={{ nome: c.usuarioNome }}>
              <Card
                className={`flex items-center gap-3 transition hover:shadow-md active:scale-[0.99] ${
                  c.naoRespondida ? 'ring-2 ring-accent-200' : ''
                }`}
              >
                <Avatar nome={c.usuarioNome} tom="accent" className="h-11 w-11 text-sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-bold text-neutral-800">{c.usuarioNome}</p>
                    {c.naoRespondida && <Badge tom="accent">responder</Badge>}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-neutral-500">
                    {c.ultimaMensagem || 'Sem mensagens'}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
