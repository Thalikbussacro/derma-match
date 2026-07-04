import { useState } from 'react';
import type { TipoPeleAdmin } from '@derma-match/shared';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { adminApi } from '../../features/admin/admin.api';
import { useInvalidarTipos, useTiposPele } from '../../features/admin/useAdmin';
import { mensagemDeErro } from '../../lib/erros';

const inputBase =
  'rounded-lg border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200';

type Executar = (fn: () => Promise<void>) => Promise<boolean>;

function TipoEditor({ tipo, executar }: { tipo: TipoPeleAdmin; executar: Executar }) {
  const [nome, setNome] = useState(tipo.nome);
  const [descricao, setDescricao] = useState(tipo.descricao);
  const [ordem, setOrdem] = useState(String(tipo.ordem));
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-neutral-400">Ordem</span>
        <input
          type="number"
          min={0}
          value={ordem}
          onChange={(e) => setOrdem(e.target.value)}
          className={`w-14 text-center ${inputBase}`}
        />
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={`flex-1 capitalize ${inputBase}`}
        />
      </div>
      <textarea
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        rows={2}
        className={`resize-none ${inputBase}`}
      />
      <Button
        variant="secondary"
        className="self-start"
        onClick={() =>
          void executar(() =>
            adminApi.atualizarTipoPele(tipo.id, { nome, descricao, ordem: Number(ordem) }),
          )
        }
      >
        Salvar
      </Button>
    </Card>
  );
}

export function AdminTiposPelePage() {
  const { data: tipos, isLoading, isError } = useTiposPele();
  const invalidar = useInvalidarTipos();
  const [erro, setErro] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ordem, setOrdem] = useState('');

  const executar: Executar = async (fn) => {
    setErro(null);
    try {
      await fn();
      await invalidar();
      return true;
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível salvar.'));
      return false;
    }
  };

  async function adicionar() {
    const o = Number(ordem);
    if (nome.trim() && descricao.trim() && Number.isInteger(o) && o >= 0) {
      if (
        await executar(() =>
          adminApi.criarTipoPele({ nome: nome.trim(), descricao: descricao.trim(), ordem: o }),
        )
      ) {
        setNome('');
        setDescricao('');
        setOrdem('');
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 text-brand-500">
        <Spinner />
      </div>
    );
  }
  if (isError || !tipos) {
    return <Alert tipo="erro">Não foi possível carregar os tipos de pele.</Alert>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800">Tipos de pele</h1>
        <p className="text-sm text-neutral-500">
          A ordem define a posição no espectro (base do nível 1–5).
        </p>
      </div>
      {erro && <Alert tipo="erro">{erro}</Alert>}

      <Card>
        <h2 className="mb-3 font-extrabold text-neutral-800">Novo tipo</h2>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              placeholder="Ordem"
              className={`w-16 text-center ${inputBase}`}
            />
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome"
              className={`flex-1 ${inputBase}`}
            />
          </div>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={2}
            placeholder="Descrição"
            className={`resize-none ${inputBase}`}
          />
          <Button className="self-start" onClick={() => void adicionar()}>
            Adicionar
          </Button>
        </div>
      </Card>

      {tipos.map((t) => (
        <TipoEditor key={t.id} tipo={t} executar={executar} />
      ))}
    </div>
  );
}
