interface AvatarProps {
  nome: string;
  className?: string;
  tom?: 'brand' | 'accent';
}

// Círculo com as iniciais do nome.
export function Avatar({ nome, className = 'h-10 w-10 text-sm', tom = 'brand' }: AvatarProps) {
  const iniciais =
    nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() ?? '')
      .join('') || '?';
  const tons = {
    brand: 'bg-brand-200 text-brand-800',
    accent: 'bg-accent-200 text-accent-700',
  };
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full font-extrabold ${tons[tom]} ${className}`}
    >
      {iniciais}
    </span>
  );
}
