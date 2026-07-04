import type { InputHTMLAttributes, Ref } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ label, error, id, name, ref, className = '', ...props }: InputProps) {
  const inputId = id ?? name;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-bold text-neutral-700">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={`min-h-12 rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-200 ${error ? 'border-red-400' : 'border-neutral-200'} ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </div>
  );
}
