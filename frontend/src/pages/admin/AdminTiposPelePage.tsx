import { Fragment, useState } from 'react';
import type { TipoPeleAdmin } from '@derma-match/shared';
import { Tabela, Td, Th } from '../../components/admin/Tabela';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { adminApi } from '../../features/admin/admin.api';
import { useInvalidarTipos, useTiposPele } from '../../features/admin/useAdmin';
import { mensagemDeErro } from '../../lib/erros';

const inputBase =
  'rounded-lg border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200';
const acaoBtn = 'text-sm font-bold text-brand-600 transition-colors hover:text-brand-700';

type Executar = (fn: () => Promise<void>) => Promise<boolean>;

function TipoEditor({
  tipo,
  executar,
  aoFechar,
}: {
  tipo: TipoPeleAdmin;
  executar: Executar;
  aoFechar: () => void;
}) {
  const [nome, setNome] = useState(tipo.nome);
  const [descricao, setDescricao] = useState(tipo.descricao);
  const [ordem, setOrdem] = useState(String(tipo.ordem));

  async function salvar() {
    const ok = await executar(() =>
      adminApi.atualizarTipoPele(tipo.id, { nome, descricao, ordem: Number(ordem) }),
    );
    if (ok) {
      aoFechar();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          value={ordem}
          onChange={(e) => setOrdem(e.target.value)}
          className={`w-16 text-center ${inputBase}`}
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
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => void salvar()}>
          Salvar
        </Button>
        <Button variant="ghost" onClick={aoFechar}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

export function AdminTiposPelePage() {
  const { data: tipos, isLoading, isError } = useTiposPele();
  const invalidar = useInvalidarTipos();
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState<number | null>(null);
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

      <Tabela
        cabecalho={
          <>
            <Th className="w-20">Ordem</Th>
            <Th>Nome</Th>
            <Th>Descrição</Th>
            <Th className="text-right">Ações</Th>
          </>
        }
      >
        {tipos.map((t) => (
          <Fragment key={t.id}>
            <tr className="hover:bg-neutral-50">
              <Td className="text-center font-bold text-neutral-500">{t.ordem}</Td>
              <Td className="font-bold capitalize text-neutral-800">{t.nome}</Td>
              <Td className="max-w-md truncate text-neutral-500">{t.descricao}</Td>
              <Td className="text-right">
                <button
                  type="button"
                  className={acaoBtn}
                  onClick={() => setEditando(editando === t.id ? null : t.id)}
                >
                  {editando === t.id ? 'Fechar' : 'Editar'}
                </button>
              </Td>
            </tr>
            {editando === t.id && (
              <tr className="bg-neutral-50">
                <td colSpan={4} className="px-4 py-4">
                  <TipoEditor tipo={t} executar={executar} aoFechar={() => setEditando(null)} />
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </Tabela>
    </div>
  );
}
