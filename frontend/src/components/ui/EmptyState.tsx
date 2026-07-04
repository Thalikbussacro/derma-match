import type { ReactNode } from 'react';

interface EmptyStateProps {
  icone?: ReactNode;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}

export function EmptyState({ icone, titulo, descricao, acao }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      {icone && (
        <div className="mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          {icone}
        </div>
      )}
      <p className="text-base font-bold text-neutral-800">{titulo}</p>
      {descricao && <p className="max-w-xs text-sm text-neutral-500">{descricao}</p>}
      {acao && <div className="mt-3 w-full max-w-xs">{acao}</div>}
    </div>
  );
}
