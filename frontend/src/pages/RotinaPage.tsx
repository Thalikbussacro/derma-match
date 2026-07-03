import { Link } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { ETAPA_LABEL } from '../features/rotina/rotina.api';
import { useRotina } from '../features/rotina/useRotina';
import { codigoDeErro, mensagemDeErro } from '../lib/erros';

export function RotinaPage() {
  const { data: rotina, isLoading, isError, error } = useRotina();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 text-brand-500">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    if (codigoDeErro(error) === 'QUESTIONARIO_INCOMPLETO') {
      return (
        <Card>
          <h1 className="text-xl font-bold text-neutral-800">Complete o questionário</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Responda o questionário para descobrir seu tipo de pele e receber sua rotina.
          </p>
          <Link to="/questionario">
            <Button className="mt-4" fullWidth>
              Fazer o questionário
            </Button>
          </Link>
        </Card>
      );
    }
    return (
      <Alert tipo="erro">{mensagemDeErro(error, 'Não foi possível carregar sua rotina.')}</Alert>
    );
  }

  if (!rotina) {
    return null;
  }

  const itens = [...rotina.itens].sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-neutral-500">Sua rotina para pele</p>
        <h1 className="text-2xl font-bold capitalize text-brand-600">{rotina.tipoPele.nome}</h1>
        <p className="mt-1 text-sm text-neutral-600">{rotina.descricao}</p>
      </div>
      <ol className="flex flex-col gap-3">
        {itens.map((item, indice) => (
          <Card key={item.id} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {indice + 1}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                {ETAPA_LABEL[item.etapa]}
              </p>
              <p className="text-sm text-neutral-700">{item.descricao}</p>
            </div>
          </Card>
        ))}
      </ol>
    </div>
  );
}
