import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../features/auth/authContext';
import { useEstadoQuestionario } from '../features/questionario/useQuestionario';

function AcaoCard({
  to,
  emoji,
  titulo,
  descricao,
}: {
  to: string;
  emoji: string;
  titulo: string;
  descricao: string;
}) {
  return (
    <Link to={to}>
      <Card className="flex items-center gap-3 transition-shadow hover:shadow-md">
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1">
          <p className="font-semibold text-neutral-800">{titulo}</p>
          <p className="text-sm text-neutral-500">{descricao}</p>
        </div>
        <span className="text-xl text-neutral-300">›</span>
      </Card>
    </Link>
  );
}

export function HomePage() {
  const { usuario } = useAuth();
  const { data: estado, isLoading } = useEstadoQuestionario();
  const concluido = estado?.estado === 'CONCLUIDO';

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-neutral-800">Olá, {usuario?.nome}!</h1>
      {isLoading ? (
        <div className="flex justify-center py-8 text-brand-500">
          <Spinner />
        </div>
      ) : concluido ? (
        <div className="flex flex-col gap-3">
          <AcaoCard
            to="/rotina"
            emoji="🧴"
            titulo="Minha rotina"
            descricao="Os passos de cuidado para a sua pele"
          />
          <AcaoCard
            to="/premium"
            emoji="💬"
            titulo="Chamar biomédica"
            descricao="Atendimento personalizado (Premium)"
          />
          <AcaoCard
            to="/questionario"
            emoji="🔄"
            titulo="Refazer questionário"
            descricao="Atualize seu tipo de pele"
          />
          <AcaoCard
            to="/conta"
            emoji="⚙️"
            titulo="Minha conta"
            descricao="Seus dados e preferências"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Card>
            <p className="text-sm text-neutral-600">
              Vamos descobrir seu tipo de pele? Responda o questionário e receba uma rotina
              personalizada.
            </p>
            <Link to="/questionario">
              <Button className="mt-3" fullWidth>
                Fazer o questionário
              </Button>
            </Link>
          </Card>
          <AcaoCard
            to="/conta"
            emoji="⚙️"
            titulo="Minha conta"
            descricao="Seus dados e preferências"
          />
        </div>
      )}
    </div>
  );
}
