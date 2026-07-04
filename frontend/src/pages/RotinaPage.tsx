import { Link } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { IconClipboard, IconDroplet } from '../components/ui/icons';
import { ETAPA_LABEL } from '../features/rotina/rotina.api';
import { useRotina } from '../features/rotina/useRotina';
import { formatarData } from '../lib/datas';
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
        <EmptyState
          icone={<IconClipboard className="h-8 w-8" />}
          titulo="Complete o questionário"
          descricao="Responda o questionário para descobrir seu tipo de pele e receber sua rotina."
          acao={
            <Link to="/questionario">
              <Button fullWidth>Fazer o questionário</Button>
            </Link>
          }
        />
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
    <div className="flex flex-col gap-5">
      <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <IconDroplet className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white/80">Sua pele</p>
            <p className="text-2xl font-extrabold capitalize">{rotina.tipoPele.nome}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-white/85">{rotina.descricao}</p>
        {rotina.personalizadaEm && (
          <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
            ✨ Atualizada pela sua biomédica em {formatarData(rotina.personalizadaEm)}
          </p>
        )}
      </Card>

      <div>
        <h2 className="mb-3 px-1 text-sm font-extrabold uppercase tracking-wide text-neutral-500">
          Passo a passo
        </h2>
        <ol className="flex flex-col gap-3">
          {itens.map((item, indice) => (
            <Card key={item.id} className="flex items-start gap-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-extrabold text-brand-700">
                {indice + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-accent-600">
                  {ETAPA_LABEL[item.etapa]}
                </p>
                <p className="mt-0.5 text-sm text-neutral-700">{item.descricao}</p>
              </div>
            </Card>
          ))}
        </ol>
      </div>
    </div>
  );
}
