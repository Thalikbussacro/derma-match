import { useState } from 'react';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { IconDroplet } from '../components/ui/icons';
import {
  useCriarRegistro,
  useDiario,
  useRemoverRegistro,
} from '../features/acompanhamento/useAcompanhamento';
import { formatarData } from '../lib/datas';
import { mensagemDeErro } from '../lib/erros';

const FACES = ['', '😣', '😕', '😐', '🙂', '😃'];
const CONDICAO_LABEL = ['', 'Bem ruim', 'Ruim', 'Neutra', 'Boa', 'Ótima'];

export function DiarioPage() {
  const { data: registros, isLoading, isError } = useDiario();
  const criar = useCriarRegistro();
  const remover = useRemoverRegistro();
  const [condicao, setCondicao] = useState(3);
  const [tags, setTags] = useState('');
  const [nota, setNota] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    setErro(null);
    const tagsArr = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8);
    try {
      await criar.mutateAsync({ condicao, tags: tagsArr, nota: nota.trim() || null });
      setTags('');
      setNota('');
      setCondicao(3);
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível registrar.'));
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        titulo="Diário de pele"
        subtitulo="Acompanhe como sua pele evolui"
        voltarPara="/"
      />

      <Card className="flex flex-col gap-3">
        <h2 className="font-extrabold text-neutral-800">Como está sua pele hoje?</h2>
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCondicao(n)}
              aria-label={CONDICAO_LABEL[n]}
              aria-pressed={condicao === n}
              className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition ${
                condicao === n ? 'bg-brand-100 ring-2 ring-brand-400' : 'bg-neutral-50'
              }`}
            >
              {FACES[n]}
            </button>
          ))}
        </div>
        <p className="text-center text-sm font-semibold text-neutral-500">
          {CONDICAO_LABEL[condicao]}
        </p>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags, separadas por vírgula (ex.: oleosa, irritada)"
          className="min-h-11 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
        />
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          rows={2}
          placeholder="Notas do dia (opcional)"
          className="resize-none rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
        />
        {erro && <Alert tipo="erro">{erro}</Alert>}
        <Button onClick={() => void salvar()} loading={criar.isPending}>
          Registrar
        </Button>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-8 text-brand-500">
          <Spinner />
        </div>
      ) : isError || !registros ? (
        <Alert tipo="erro">Não foi possível carregar o diário.</Alert>
      ) : registros.length === 0 ? (
        <EmptyState
          icone={<IconDroplet className="h-8 w-8" />}
          titulo="Seu diário está vazio"
          descricao="Registre como sua pele está para acompanhar a evolução ao longo do tempo."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {registros.map((r) => (
            <Card key={r.id} className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">
                {FACES[r.condicao]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-neutral-400">{formatarData(r.criadoEm)}</p>
                {r.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {r.tags.map((t) => (
                      <Badge key={t} tom="neutral">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
                {r.nota && <p className="mt-1 text-sm text-neutral-700">{r.nota}</p>}
              </div>
              <button
                type="button"
                onClick={() => remover.mutate(r.id)}
                aria-label="Remover registro"
                className="shrink-0 text-xs font-bold text-neutral-400 hover:text-red-600"
              >
                Remover
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
