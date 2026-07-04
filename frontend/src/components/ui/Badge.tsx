import type { ReactNode } from 'react';

type Tom = 'brand' | 'accent' | 'neutral';

const tons: Record<Tom, string> = {
  brand: 'bg-brand-100 text-brand-700',
  accent: 'bg-accent-100 text-accent-700',
  neutral: 'bg-neutral-100 text-neutral-600',
};

export function Badge({ children, tom = 'brand' }: { children: ReactNode; tom?: Tom }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${tons[tom]}`}
    >
      {children}
    </span>
  );
}
