import { useState } from 'react';
import type {
  ProdutoAdmin,
  RascunhoOpcao,
  RascunhoPergunta,
  RascunhoTipoPele,
} from '@derma-match/shared';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { IconChevron } from '../../components/ui/icons';
import { adminApi } from '../../features/admin/admin.api';
import { useInvalidarRascunho, useProdutos, useRascunho } from '../../features/admin/useAdmin';
import { mensagemDeErro } from '../../lib/erros';

// Executa uma ação, revalida o rascunho e devolve true em sucesso.
type Executar = (fn: () => Promise<void>) => Promise<boolean>;

const inputBase =
  'rounded-lg border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200';

function PesoInput({
  opcaoId,
  tipo,
  valor,
  executar,
}: {
  opcaoId: number;
  tipo: RascunhoTipoPele;
  valor: number;
  executar: Executar;
}) {
  const [peso, setPeso] = useState(String(valor));
  return (
    <label className="flex items-center gap-1 text-xs">
      <span className="w-16 truncate capitalize text-neutral-500">{tipo.nome}</span>
      <input
        type="number"
        min={0}
        max={20}
        value={peso}
        onChange={(e) => setPeso(e.target.value)}
        onBlur={() => {
          const n = Number(peso);
          if (Number.isInteger(n) && n >= 0 && n !== valor) {
            void executar(() => adminApi.definirPeso({ opcaoId, tipoPeleId: tipo.id, peso: n }));
          }
        }}
        className={`w-12 text-center ${inputBase}`}
      />
    </label>
  );
}

function OpcaoEditor({
  opcao,
  tipos,
  produtos,
  executar,
}: {
  opcao: RascunhoOpcao;
  tipos: RascunhoTipoPele[];
  produtos: ProdutoAdmin[];
  executar: Executar;
}) {
  const [texto, setTexto] = useState(opcao.texto);
  const pesoDe = (tipoId: number) => opcao.pesos.find((p) => p.tipoPeleId === tipoId)?.peso ?? 0;
  const sugerido = (produtoId: number) => opcao.produtosSugeridos.includes(produtoId);

  function toggleProduto(produtoId: number) {
    void executar(() =>
      sugerido(produtoId)
        ? adminApi.desassociarProduto({ opcaoId: opcao.id, produtoId })
        : adminApi.associarProduto({ opcaoId: opcao.id, produtoId }),
    );
  }

  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
      <div className="flex items-center gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className={`flex-1 ${inputBase}`}
        />
        <Button
          variant="secondary"
          onClick={() => void executar(() => adminApi.atualizarOpcao(opcao.id, texto))}
        >
          Salvar
        </Button>
        <Button
          variant="ghost"
          onClick={() => void executar(() => adminApi.removerOpcao(opcao.id))}
        >
          Remover
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        <span className="text-xs font-bold text-neutral-400">Pesos:</span>
        {tipos.map((t) => (
          <PesoInput
            key={t.id}
            opcaoId={opcao.id}
            tipo={t}
            valor={pesoDe(t.id)}
            executar={executar}
          />
        ))}
      </div>
      {produtos.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          <span className="text-xs font-bold text-neutral-400">Produtos sugeridos:</span>
          {produtos.map((p) => (
            <label key={p.id} className="flex items-center gap-1 text-xs text-neutral-600">
              <input
                type="checkbox"
                checked={sugerido(p.id)}
                onChange={() => toggleProduto(p.id)}
                className="h-3.5 w-3.5 accent-brand-600"
              />
              {p.nome}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function PerguntaEditor({
  pergunta,
  tipos,
  produtos,
  executar,
}: {
  pergunta: RascunhoPergunta;
  tipos: RascunhoTipoPele[];
  produtos: ProdutoAdmin[];
  executar: Executar;
}) {
  const [aberta, setAberta] = useState(false);
  const [texto, setTexto] = useState(pergunta.texto);
  const [ordem, setOrdem] = useState(String(pergunta.ordem));
  const [novaOpcao, setNovaOpcao] = useState('');

  async function adicionarOpcao() {
    const t = novaOpcao.trim();
    if (t && (await executar(() => adminApi.criarOpcao({ perguntaId: pergunta.id, texto: t })))) {
      setNovaOpcao('');
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setAberta((v) => !v)}
        aria-expanded={aberta}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700">
          {pergunta.ordem}
        </span>
        <span className="min-w-0 flex-1 truncate font-bold text-neutral-800">{pergunta.texto}</span>
        <span className="hidden shrink-0 text-xs text-neutral-400 sm:block">
          {pergunta.opcoes.length} {pergunta.opcoes.length === 1 ? 'opção' : 'opções'}
        </span>
        <IconChevron
          className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
            aberta ? 'rotate-180' : ''
          }`}
        />
      </button>

      {aberta && (
        <div className="flex flex-col gap-3 border-t border-neutral-100 px-4 pb-4 pt-3">
          <div className="flex items-start gap-2">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={2}
              className={`flex-1 resize-none ${inputBase}`}
            />
            <input
              type="number"
              min={1}
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              title="Ordem"
              className={`w-14 text-center ${inputBase}`}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                void executar(() =>
                  adminApi.atualizarPergunta(pergunta.id, { texto, ordem: Number(ordem) }),
                )
              }
            >
              Salvar pergunta
            </Button>
            <Button
              variant="ghost"
              onClick={() => void executar(() => adminApi.removerPergunta(pergunta.id))}
            >
              Remover pergunta
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {pergunta.opcoes.map((o) => (
              <OpcaoEditor
                key={o.id}
                opcao={o}
                tipos={tipos}
                produtos={produtos}
                executar={executar}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={novaOpcao}
              onChange={(e) => setNovaOpcao(e.target.value)}
              placeholder="Nova opção…"
              className={`flex-1 ${inputBase}`}
            />
            <Button onClick={() => void adicionarOpcao()}>Adicionar opção</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminQuestionarioPage() {
  const { data: rascunho, isLoading, isError } = useRascunho();
  const { data: produtos } = useProdutos();
  const invalidar = useInvalidarRascunho();
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmarPublicar, setConfirmarPublicar] = useState(false);
  const [novoTexto, setNovoTexto] = useState('');
  const [novaOrdem, setNovaOrdem] = useState('');

  const executar: Executar = async (fn) => {
    setErro(null);
    setSalvando(true);
    try {
      await fn();
      await invalidar();
      return true;
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível salvar.'));
      return false;
    } finally {
      setSalvando(false);
    }
  };

  async function adicionarPergunta() {
    const ordem = Number(novaOrdem);
    if (novoTexto.trim() && Number.isInteger(ordem) && ordem > 0) {
      if (await executar(() => adminApi.criarPergunta({ texto: novoTexto.trim(), ordem }))) {
        setNovoTexto('');
        setNovaOrdem('');
      }
    }
  }

  async function publicar() {
    if (await executar(() => adminApi.publicarQuestionario())) {
      setConfirmarPublicar(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 text-brand-500">
        <Spinner />
      </div>
    );
  }
  if (isError || !rascunho) {
    return <Alert tipo="erro">Não foi possível carregar o questionário.</Alert>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-800">Questionário</h1>
          <p className="text-sm text-neutral-500">Rascunho v{rascunho.numero}</p>
        </div>
        {confirmarPublicar ? (
          <div className="flex gap-2">
            <Button variant="accent" loading={salvando} onClick={() => void publicar()}>
              Confirmar
            </Button>
            <Button variant="secondary" onClick={() => setConfirmarPublicar(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <Button variant="accent" onClick={() => setConfirmarPublicar(true)}>
            Publicar
          </Button>
        )}
      </div>

      {erro && <Alert tipo="erro">{erro}</Alert>}
      <Alert tipo="info">
        As edições ficam neste rascunho. Publicar passa a valer para novas respostas; resultados já
        calculados não mudam.
      </Alert>

      <Card>
        <h2 className="mb-3 font-extrabold text-neutral-800">Nova pergunta</h2>
        <div className="flex gap-2">
          <textarea
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            rows={2}
            placeholder="Texto da pergunta"
            className={`flex-1 resize-none ${inputBase}`}
          />
          <input
            type="number"
            min={1}
            value={novaOrdem}
            onChange={(e) => setNovaOrdem(e.target.value)}
            placeholder="Ordem"
            className={`w-16 text-center ${inputBase}`}
          />
          <Button onClick={() => void adicionarPergunta()}>Adicionar</Button>
        </div>
      </Card>

      {rascunho.perguntas.map((p) => (
        <PerguntaEditor
          key={p.id}
          pergunta={p}
          tipos={rascunho.tipos}
          produtos={produtos ?? []}
          executar={executar}
        />
      ))}
    </div>
  );
}
