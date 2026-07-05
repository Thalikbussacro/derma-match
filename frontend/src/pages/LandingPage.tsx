import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { IconChat, IconClipboard, IconDroplet, IconSparkle } from '../components/ui/icons';

const DESTAQUES: { icone: ReactNode; titulo: string; texto: string }[] = [
  {
    icone: <IconSparkle className="h-5 w-5" />,
    titulo: 'Descubra seu tipo de pele',
    texto: 'Um questionário rápido revela seu tipo de pele e o nível dentro dele.',
  },
  {
    icone: <IconDroplet className="h-5 w-5" />,
    titulo: 'Rotina personalizada',
    texto: 'Receba os passos de cuidado pensados para a sua pele.',
  },
  {
    icone: <IconClipboard className="h-5 w-5" />,
    titulo: 'Acompanhe a evolução',
    texto: 'Registre no diário de pele e mantenha a sequência da sua rotina.',
  },
  {
    icone: <IconChat className="h-5 w-5" />,
    titulo: 'Fale com uma biomédica',
    texto: 'No Premium, tire dúvidas e receba uma rotina ajustada por especialista.',
  },
];

export function LandingPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col items-center gap-5 bg-gradient-to-br from-brand-600 to-brand-700 py-8 text-center text-white">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
          <IconDroplet className="h-8 w-8" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold">Sua rotina de skincare, do seu jeito</h1>
          <p className="mt-2 text-sm text-white/85">
            Descubra seu tipo de pele, receba uma rotina personalizada e acompanhe a evolução — com
            apoio de uma biomédica quando quiser.
          </p>
        </div>
        <div className="flex w-full flex-col items-center gap-3">
          <Link to="/cadastro" className="w-full">
            <Button variant="accent" fullWidth>
              Criar conta grátis
            </Button>
          </Link>
          <Link to="/login" className="text-sm font-bold text-white/90 hover:underline">
            Já tenho conta · Entrar
          </Link>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        {DESTAQUES.map((d) => (
          <Card key={d.titulo} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
              {d.icone}
            </span>
            <div>
              <p className="font-bold text-neutral-800">{d.titulo}</p>
              <p className="text-sm text-neutral-500">{d.texto}</p>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-center text-xs text-neutral-400">
        Projeto acadêmico — Derma Match. Sem cobrança real no Premium.
      </p>
    </div>
  );
}
