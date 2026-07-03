interface ProgressoQuestionarioProps {
  respondidas: number;
  total: number;
}

export function ProgressoQuestionario({ respondidas, total }: ProgressoQuestionarioProps) {
  const pct = total > 0 ? Math.min(100, Math.round((respondidas / total) * 100)) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-neutral-500">
        <span>
          {respondidas} de {total} respondidas
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
