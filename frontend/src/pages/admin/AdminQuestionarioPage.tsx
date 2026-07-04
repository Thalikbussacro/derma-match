import { useState } from 'react';
import type { RascunhoOpcao, RascunhoPergunta, RascunhoTipoPele } from '@derma-match/shared';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { adminApi } from '../../features/admin/admin.api';
import { useInvalidarRascunho, useRascunho } from '../../features/admin/useAdmin';
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
  executar,
}: {
  opcao: RascunhoOpcao;
  tipos: RascunhoTipoPele[];
  executar: Executar;
}) {
  const [texto, setTexto] = useState(opcao.texto);
  const pesoDe = (tipoId: number) => opcao.pesos.find((p) => p.tipoPeleId === tipoId)?.peso ?? 0;
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
    </div>
  );
}

function PerguntaEditor({
  pergunta,
  tipos,
  executar,
}: {
  pergunta: RascunhoPergunta;
  tipos: RascunhoTipoPele[];
  executar: Executar;
}) {
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
    <Card className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <span className="mt-2 text-xs font-bold text-neutral-400">#{pergunta.id}</span>
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
          <OpcaoEditor key={o.id} opcao={o} tipos={tipos} executar={executar} />
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
    </Card>
  );
}

export function AdminQuestionarioPage() {
  const { data: rascunho, isLoading, isError } = useRascunho();
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
        <PerguntaEditor key={p.id} pergunta={p} tipos={rascunho.tipos} executar={executar} />
      ))}
    </div>
  );
}
