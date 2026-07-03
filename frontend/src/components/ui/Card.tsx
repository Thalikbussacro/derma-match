import type { HTMLAttributes } from 'react';

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
