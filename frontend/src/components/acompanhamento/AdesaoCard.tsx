import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAdesao, useCheckin } from '../../features/acompanhamento/useAcompanhamento';

export function AdesaoCard() {
  const { data } = useAdesao();
  const checkin = useCheckin();

  if (!data) {
    return null;
  }

  return (
    <Card className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm text-neutral-500">Sequência</p>
        <p className="text-2xl font-extrabold text-brand-600">
          🔥 {data.streak} {data.streak === 1 ? 'dia' : 'dias'}
        </p>
        <div className="mt-1 flex gap-1" aria-hidden="true">
          {data.ultimos7.map((feito, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full ${feito ? 'bg-brand-500' : 'bg-neutral-200'}`}
            />
          ))}
        </div>
      </div>
      <Button
        variant={data.checkinHoje ? 'secondary' : 'primary'}
        loading={checkin.isPending}
        disabled={data.checkinHoje}
        onClick={() => checkin.mutate()}
      >
        {data.checkinHoje ? 'Feito hoje ✓' : 'Fiz hoje'}
      </Button>
    </Card>
  );
}
