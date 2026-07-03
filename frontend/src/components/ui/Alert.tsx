import type { ReactNode } from 'react';

type Tipo = 'erro' | 'sucesso' | 'info';

interface AlertProps {
  tipo?: Tipo;
  children: ReactNode;
}

const estilos: Record<Tipo, string> = {
  erro: 'bg-red-50 text-red-700 border-red-200',
  sucesso: 'bg-green-50 text-green-700 border-green-200',
  info: 'bg-brand-50 text-brand-700 border-brand-200',
};

export function Alert({ tipo = 'info', children }: AlertProps) {
  return (
    <div
      role={tipo === 'erro' ? 'alert' : 'status'}
      className={`rounded-lg border px-3 py-2 text-sm ${estilos[tipo]}`}
    >
      {children}
    </div>
  );
}
