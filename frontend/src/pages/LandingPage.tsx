import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { IconChat, IconClipboard, IconDroplet, IconSparkle } from '../components/ui/icons';

const DESTAQUES: { icone: ReactNode; titulo: string; texto: string }[] = [
  {
    icone: <IconSparkle className="h-6 w-6" />,
    titulo: 'Descubra seu tipo de pele',
    texto: 'Um questionário rápido revela seu tipo de pele e onde você está no espectro.',
  },
  {
    icone: <IconDroplet className="h-6 w-6" />,
    titulo: 'Rotina personalizada',
    texto: 'Receba os passos de cuidado pensados para a sua pele, com produtos indicados.',
  },
  {
    icone: <IconClipboard className="h-6 w-6" />,
    titulo: 'Acompanhe a evolução',
    texto: 'Registre no diário de pele e mantenha a sequência da sua rotina dia após dia.',
  },
  {
    icone: <IconChat className="h-6 w-6" />,
    titulo: 'Apoio de uma biomédica',
    texto: 'No Premium, converse e receba uma rotina ajustada por uma especialista.',
  },
];

export function LandingPage() {
  useEffect(() => {
    document.title = 'Derma Match — Skincare personalizado';
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-800">
      <header className="sticky top-0 z-10 border-b border-neutral-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-brand-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <IconDroplet className="h-5 w-5" />
            </span>
            Derma Match
          </Link>
          <nav className="flex items-center gap-3 text-sm font-semibold sm:gap-5">
            <Link
              to="/biomedica/login"
              className="hidden text-neutral-500 transition-colors hover:text-brand-600 sm:block"
            >
              Biomédica
            </Link>
            <Link
              to="/admin/login"
              className="hidden text-neutral-500 transition-colors hover:text-brand-600 sm:block"
            >
              Admin
            </Link>
            <Link to="/login" className="text-neutral-600 transition-colors hover:text-brand-600">
              Entrar
            </Link>
            <Link to="/cadastro">
              <Button>Criar conta</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center sm:px-8 md:py-28 lg:text-left">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
              Skincare personalizado
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">
              Sua rotina de skincare, do seu jeito
            </h1>
            <p className="mt-5 text-lg text-white/85 md:text-xl">
              Descubra seu tipo de pele, receba uma rotina feita para você e acompanhe a evolução —
              com apoio de uma biomédica quando quiser.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link to="/cadastro" className="w-full sm:w-auto">
                <Button variant="accent" fullWidth className="sm:w-auto sm:px-8">
                  Começar grátis
                </Button>
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 text-sm font-bold text-white transition hover:bg-white/20 sm:w-auto"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-neutral-800 md:text-3xl">
            Como o Derma Match ajuda
          </h2>
          <p className="mt-2 text-neutral-500">Do primeiro contato ao acompanhamento contínuo.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DESTAQUES.map((d) => (
            <div
              key={d.titulo}
              className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                {d.icone}
              </span>
              <h3 className="mt-4 font-extrabold text-neutral-800">{d.titulo}</h3>
              <p className="mt-1.5 text-sm text-neutral-500">{d.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-50">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
          <h2 className="text-2xl font-extrabold text-neutral-800 md:text-3xl">
            Pronta para cuidar da sua pele?
          </h2>
          <p className="mt-2 text-neutral-500">
            Crie sua conta grátis e receba sua primeira rotina em minutos.
          </p>
          <Link to="/cadastro" className="mt-6 inline-block">
            <Button variant="accent" className="sm:px-8">
              Criar minha conta
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-neutral-400 sm:flex-row sm:px-8">
          <span className="font-semibold text-neutral-500">Derma Match</span>
          <div className="flex items-center gap-4">
            <Link
              to="/biomedica/login"
              className="transition-colors hover:text-brand-600 sm:hidden"
            >
              Biomédica
            </Link>
            <Link to="/admin/login" className="transition-colors hover:text-brand-600 sm:hidden">
              Admin
            </Link>
            <Link to="/privacidade" className="transition-colors hover:text-brand-600">
              Privacidade
            </Link>
          </div>
        </div>
        <p className="pb-6 text-center text-xs text-neutral-300">
          Projeto acadêmico — sem cobrança real no Premium.
        </p>
      </footer>
    </div>
  );
}
