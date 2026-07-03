import { Link } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { useConversasBiomedica } from '../../features/biomedica/useBiomedica';

export function BiomedicaDashboardPage() {
  const { data: conversas, isLoading, isError } = useConversasBiomedica();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 text-accent-500">
        <Spinner />
      </div>
    );
  }
  if (isError || !conversas) {
    return <Alert tipo="erro">Não foi possível carregar as conversas.</Alert>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-neutral-800">Conversas</h1>
      {conversas.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma conversa ainda.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {conversas.map((c) => (
            <Link key={c.id} to={`/biomedica/atendimento/${c.id}`}>
              <Card
                className={`transition-shadow hover:shadow-md ${
                  c.naoRespondida ? 'border-accent-500' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-neutral-800">{c.usuarioNome}</p>
                  {c.naoRespondida && (
                    <span className="shrink-0 rounded-full bg-accent-600 px-2 py-0.5 text-xs font-medium text-white">
                      responder
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-neutral-500">
                  {c.ultimaMensagem || 'Sem mensagens'}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
