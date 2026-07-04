import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBack } from './icons';

interface PageHeaderProps {
  titulo: string;
  subtitulo?: string;
  // Rota (string) ou delta de histórico (ex.: -1). Omitido = sem botão voltar.
  voltarPara?: string | number;
  acao?: ReactNode;
}

export function PageHeader({ titulo, subtitulo, voltarPara, acao }: PageHeaderProps) {
  const navigate = useNavigate();

  function voltar() {
    if (typeof voltarPara === 'number') {
      void navigate(voltarPara);
    } else if (voltarPara) {
      void navigate(voltarPara);
    }
  }

  return (
    <div className="mb-5 flex items-center gap-2">
      {voltarPara !== undefined && (
        <button
          type="button"
          onClick={voltar}
          aria-label="Voltar"
          className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-700 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        >
          <IconBack className="h-5 w-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-extrabold text-neutral-800">{titulo}</h1>
        {subtitulo && <p className="truncate text-sm text-neutral-500">{subtitulo}</p>}
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </div>
  );
}
