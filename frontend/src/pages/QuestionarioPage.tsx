import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PerguntaCard } from '../components/questionario/PerguntaCard';
import { ProgressoQuestionario } from '../components/questionario/ProgressoQuestionario';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { IconSparkle } from '../components/ui/icons';
import type { ResultadoTipoPele } from '../features/questionario/questionario.types';
import {
  useEstadoQuestionario,
  useFinalizar,
  useProximaPergunta,
  useRefazer,
  useResponder,
} from '../features/questionario/useQuestionario';

export function QuestionarioPage() {
  const estadoQuery = useEstadoQuestionario();
  const [iniciado, setIniciado] = useState(false);
  const [resultado, setResultado] = useState<ResultadoTipoPele | null>(null);

  const estado = estadoQuery.data;
  const emAndamento = (estado?.estado === 'EM_ANDAMENTO' || iniciado) && !resultado;
  const proximaQuery = useProximaPergunta(emAndamento);
  const responder = useResponder();
  const finalizar = useFinalizar();
  const refazer = useRefazer();

  function aoFinalizar() {
    finalizar.mutate(undefined, { onSuccess: (r) => setResultado(r) });
  }

  function aoRefazer() {
    refazer.mutate(undefined, {
      onSuccess: () => {
        setResultado(null);
        setIniciado(true);
      },
    });
  }

  // Resultado recém-calculado
  if (resultado) {
    return (
      <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
            <IconSparkle className="h-8 w-8" />
          </span>
          <p className="text-sm font-semibold text-white/80">Seu tipo de pele é</p>
          <p className="text-3xl font-extrabold capitalize">{resultado.tipoPeleNome}</p>
          <p className="text-sm text-white/85">
            Preparamos uma rotina de cuidados pensada para você.
          </p>
          <Link to="/rotina" className="mt-2 w-full">
            <Button variant="accent" fullWidth>
              Ver minha rotina
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (estadoQuery.isLoading) {
    return (
      <div className="flex justify-center py-12 text-brand-500">
        <Spinner />
      </div>
    );
  }

  if (estadoQuery.isError || !estado) {
    return (
      <Alert tipo="erro">Não foi possível carregar o questionário. Recarregue a página.</Alert>
    );
  }

  // Já concluído (revisita)
  if (estado.estado === 'CONCLUIDO') {
    return (
      <div>
        <PageHeader titulo="Questionário" voltarPara="/" />
        <Card>
          <h2 className="text-lg font-extrabold text-neutral-800">Questionário concluído</h2>
          <p className="mt-2 text-sm text-neutral-600">Você já descobriu seu tipo de pele.</p>
          <div className="mt-4 flex flex-col gap-2">
            <Link to="/rotina">
              <Button fullWidth>Ver minha rotina</Button>
            </Link>
            <Button variant="secondary" fullWidth loading={refazer.isPending} onClick={aoRefazer}>
              Refazer questionário
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Não iniciado → intro
  if (estado.estado === 'NAO_INICIADO' && !iniciado) {
    return (
      <div>
        <PageHeader titulo="Questionário" voltarPara="/" />
        <Card>
          <h2 className="text-lg font-extrabold text-neutral-800">Descubra seu tipo de pele</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Responda algumas perguntas rápidas — sem digitar nada, é só escolher. No fim, você
            recebe uma rotina personalizada.
          </p>
          <Button className="mt-4" fullWidth onClick={() => setIniciado(true)}>
            Começar
          </Button>
        </Card>
      </div>
    );
  }

  // Em andamento — carregando a próxima pergunta
  if (proximaQuery.isLoading) {
    return (
      <div className="flex justify-center py-12 text-brand-500">
        <Spinner />
      </div>
    );
  }

  const pergunta = proximaQuery.data;

  // Ainda há pergunta a responder
  if (pergunta) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader titulo="Questionário" voltarPara="/" />
        <ProgressoQuestionario
          respondidas={estado.perguntasRespondidas}
          total={estado.totalPerguntas}
        />
        {responder.isError && (
          <Alert tipo="erro">Não foi possível registrar a resposta. Tente de novo.</Alert>
        )}
        <PerguntaCard
          pergunta={pergunta}
          enviando={responder.isPending}
          aoResponder={(opcaoId) => responder.mutate({ perguntaId: pergunta.id, opcaoId })}
        />
      </div>
    );
  }

  // Sem próxima pergunta → tudo respondido → finalizar
  return (
    <Card>
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="text-4xl">🎉</span>
        <h2 className="text-lg font-extrabold text-neutral-800">Tudo respondido!</h2>
        <p className="text-sm text-neutral-600">Vamos calcular seu tipo de pele.</p>
        {finalizar.isError && (
          <Alert tipo="erro">Não foi possível finalizar. Tente novamente.</Alert>
        )}
        <Button className="mt-1 w-full" loading={finalizar.isPending} onClick={aoFinalizar}>
          Ver meu resultado
        </Button>
      </div>
    </Card>
  );
}
