import { Link } from 'react-router-dom';

type Acesso = 'usuaria' | 'biomedica' | 'admin';

const ACESSOS: { key: Acesso; label: string; to: string }[] = [
  { key: 'usuaria', label: 'Entrar como usuária', to: '/login' },
  { key: 'biomedica', label: 'Acesso da biomédica', to: '/biomedica/login' },
  { key: 'admin', label: 'Acesso administrativo', to: '/admin/login' },
];

// Atalhos entre os três tipos de login e de volta para a página inicial.
export function OutrosAcessos({ atual }: { atual: Acesso }) {
  return (
    <div className="flex flex-col items-center gap-2 border-t border-neutral-100 pt-4 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
        Outro tipo de acesso
      </span>
      {ACESSOS.filter((a) => a.key !== atual).map((a) => (
        <Link
          key={a.key}
          to={a.to}
          className="font-semibold text-neutral-500 transition-colors hover:text-brand-600"
        >
          {a.label}
        </Link>
      ))}
      <Link to="/" className="text-neutral-400 transition-colors hover:text-brand-600">
        ← Página inicial
      </Link>
    </div>
  );
}
