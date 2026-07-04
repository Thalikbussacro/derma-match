import { Card } from '../ui/Card';
import type { Pergunta } from '../../features/questionario/questionario.types';

interface PerguntaCardProps {
  pergunta: Pergunta;
  enviando: boolean;
  aoResponder: (opcaoId: number) => void;
}

export function PerguntaCard({ pergunta, enviando, aoResponder }: PerguntaCardProps) {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-extrabold text-neutral-800">{pergunta.texto}</h2>
      <div className="flex flex-col gap-2.5">
        {pergunta.opcoes.map((opcao) => (
          <button
            key={opcao.id}
            type="button"
            disabled={enviando}
            onClick={() => aoResponder(opcao.id)}
            className="min-h-12 rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-left text-sm font-semibold text-neutral-700 transition-all hover:border-brand-400 hover:bg-brand-50 active:scale-[0.99] disabled:opacity-50"
          >
            {opcao.texto}
          </button>
        ))}
      </div>
    </Card>
  );
}
