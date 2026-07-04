interface ProgressoQuestionarioProps {
  respondidas: number;
  total: number;
}

export function ProgressoQuestionario({ respondidas, total }: ProgressoQuestionarioProps) {
  const pct = total > 0 ? Math.min(100, Math.round((respondidas / total) * 100)) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs font-bold text-neutral-500">
        <span>
          {respondidas} de {total} respondidas
        </span>
        <span className="text-brand-600">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso do questionário"
        className="h-2.5 overflow-hidden rounded-full bg-neutral-200"
      >
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
