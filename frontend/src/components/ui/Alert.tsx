import type { ReactNode } from 'react';

type Tipo = 'erro' | 'sucesso' | 'info';

interface AlertProps {
  tipo?: Tipo;
  children: ReactNode;
}

const estilos: Record<Tipo, string> = {
  erro: 'bg-red-50 text-red-700 border-red-200',
  sucesso: 'bg-brand-50 text-brand-700 border-brand-200',
  info: 'bg-accent-50 text-accent-700 border-accent-200',
};

export function Alert({ tipo = 'info', children }: AlertProps) {
  return (
    <div
      role={tipo === 'erro' ? 'alert' : 'status'}
      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${estilos[tipo]}`}
    >
      {children}
    </div>
  );
}
