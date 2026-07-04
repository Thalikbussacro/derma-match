import { Alert } from '../../components/ui/Alert';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { useDashboard } from '../../features/admin/useAdmin';

function Metric({ label, valor }: { label: string; valor: number }) {
  return (
    <Card className="text-center">
      <p className="text-3xl font-extrabold text-brand-600">{valor}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </Card>
  );
}

export function AdminDashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 text-brand-500">
        <Spinner />
      </div>
    );
  }
  if (isError || !data) {
    return <Alert tipo="erro">Não foi possível carregar o painel.</Alert>;
  }

  const maxTipo = Math.max(1, ...data.distribuicaoTipoPele.map((d) => d.total));

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold text-neutral-800">Painel</h1>

      <div className="grid grid-cols-2 gap-3">
        <Metric label="Usuárias Free" valor={data.usuariasFree} />
        <Metric label="Usuárias Premium" valor={data.usuariasPremium} />
        <Metric label="Biomédicas ativas" valor={data.biomedicasAtivas} />
        <Metric label="Conversas" valor={data.conversas} />
      </div>

      <Card>
        <h2 className="font-extrabold text-neutral-800">Distribuição por tipo de pele</h2>
        <div className="mt-3 flex flex-col gap-2">
          {data.distribuicaoTipoPele.map((d) => (
            <div key={d.nome} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-sm capitalize text-neutral-600">{d.nome}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${(d.total / maxTipo) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-sm font-bold text-neutral-700">{d.total}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
