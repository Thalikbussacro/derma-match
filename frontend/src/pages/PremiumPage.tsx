import { Alert } from '../components/ui/Alert';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { usePainelUpgrade } from '../features/premium/usePremium';

export function PremiumPage() {
  const { data, isLoading, isError } = usePainelUpgrade();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 text-brand-500">
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return <Alert tipo="erro">Não foi possível carregar o painel. Tente novamente.</Alert>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">{data.titulo}</h1>
        <p className="mt-1 text-sm text-neutral-600">{data.descricao}</p>
      </div>
      <Card>
        <ul className="flex flex-col gap-3">
          {data.beneficios.map((beneficio) => (
            <li key={beneficio} className="flex items-start gap-2 text-sm text-neutral-700">
              <span className="font-bold text-accent-500">✓</span>
              <span>{beneficio}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Alert tipo="info">{data.aviso}</Alert>
    </div>
  );
}
