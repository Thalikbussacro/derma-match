import { NavLink } from 'react-router-dom';
import { IconChat, IconClipboard, IconDroplet, IconHome, IconUser } from './icons';

const TABS = [
  { to: '/', label: 'Início', Icon: IconHome, end: true },
  { to: '/rotina', label: 'Rotina', Icon: IconDroplet, end: false },
  { to: '/diario', label: 'Diário', Icon: IconClipboard, end: false },
  { to: '/chat', label: 'Atendimento', Icon: IconChat, end: false },
  { to: '/conta', label: 'Conta', Icon: IconUser, end: false },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition-colors focus-visible:outline-none ${
                isActive ? 'text-brand-600' : 'text-neutral-400 hover:text-neutral-600'
              }`
            }
          >
            <Icon className="h-6 w-6" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
