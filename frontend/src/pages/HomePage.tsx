import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { IconBack, IconChat, IconDroplet, IconSparkle } from '../components/ui/icons';
import { useAuth } from '../features/auth/authContext';
import { useDicas } from '../features/acompanhamento/useAcompanhamento';
import { useEstadoQuestionario } from '../features/questionario/useQuestionario';

function AcaoCard({
  to,
  icone,
  tom,
  titulo,
  descricao,
}: {
  to: string;
  icone: ReactNode;
  tom: string;
  titulo: string;
  descricao: string;
}) {
  return (
    <Link to={to} className="block">
      <Card className="flex items-center gap-3.5 transition hover:shadow-md active:scale-[0.99]">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tom}`}>
          {icone}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-neutral-800">{titulo}</p>
          <p className="text-sm text-neutral-500">{descricao}</p>
        </div>
        <IconBack className="h-5 w-5 shrink-0 rotate-180 text-neutral-300" />
      </Card>
    </Link>
  );
}

export function HomePage() {
  const { usuario } = useAuth();
  const { data: estado, isLoading } = useEstadoQuestionario();
  const { data: dicas } = useDicas();
  const concluido = estado?.estado === 'CONCLUIDO';
  const ehPremium = usuario?.plano === 'PREMIUM';
  const primeiroNome = usuario?.nome.split(' ')[0] ?? '';

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-semibold text-brand-600">Olá, {primeiroNome}! 👋</p>
        <h1 className="text-2xl font-extrabold text-neutral-800">
          {concluido ? 'Bem-vinda de volta' : 'Vamos cuidar da sua pele'}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10 text-brand-500">
          <Spinner />
        </div>
      ) : concluido ? (
        <div className="flex flex-col gap-3">
          <AcaoCard
            to="/rotina"
            tom="bg-brand-100 text-brand-600"
            icone={<IconDroplet className="h-6 w-6" />}
            titulo="Minha rotina"
            descricao="Os passos de cuidado para a sua pele"
          />
          <AcaoCard
            to={ehPremium ? '/chat' : '/premium'}
            tom="bg-accent-100 text-accent-600"
            icone={<IconChat className="h-6 w-6" />}
            titulo="Falar com a biomédica"
            descricao={
              ehPremium ? 'Tire suas dúvidas no chat' : 'Atendimento personalizado (Premium)'
            }
          />
          <AcaoCard
            to="/questionario"
            tom="bg-neutral-100 text-neutral-500"
            icone={<IconSparkle className="h-6 w-6" />}
            titulo="Refazer questionário"
            descricao="Atualize seu tipo de pele"
          />
        </div>
      ) : (
        <Card className="flex flex-col gap-4 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <IconSparkle className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold">Descubra seu tipo de pele</h2>
            <p className="mt-1 text-sm text-white/85">
              Responda algumas perguntas e receba uma rotina de cuidados feita para você.
            </p>
          </div>
          <Link to="/questionario">
            <Button variant="accent" fullWidth>
              Começar o questionário
            </Button>
          </Link>
        </Card>
      )}

      {dicas && dicas.length > 0 && (
        <div>
          <h2 className="mb-2 px-1 text-sm font-extrabold uppercase tracking-wide text-neutral-500">
            Dicas de skincare
          </h2>
          <div className="flex flex-col gap-2">
            {dicas.slice(0, 3).map((d) => (
              <Card key={d.id}>
                <p className="font-bold text-neutral-800">💡 {d.titulo}</p>
                <p className="mt-1 text-sm text-neutral-600">{d.conteudo}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
