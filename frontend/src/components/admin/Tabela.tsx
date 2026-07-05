import type { ReactNode } from 'react';

// Tabela padrão do painel admin: rola na horizontal em telas estreitas.
export function Tabela({ cabecalho, children }: { cabecalho: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-bold uppercase tracking-wide text-neutral-500">
          <tr>{cabecalho}</tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <th className={`px-4 py-3 ${className}`}>{children}</th>;
}

export function Td({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
