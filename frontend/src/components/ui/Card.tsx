import type { HTMLAttributes } from 'react';

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-neutral-100 bg-white p-5 shadow-[0_2px_10px_rgba(20,67,60,0.05)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
