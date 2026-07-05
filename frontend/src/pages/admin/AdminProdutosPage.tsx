import { Fragment, useState } from 'react';
import { ETAPAS, type Etapa, type ProdutoAdmin } from '@derma-match/shared';
import { Tabela, Td, Th } from '../../components/admin/Tabela';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { adminApi } from '../../features/admin/admin.api';
import { useInvalidarProdutos, useProdutos } from '../../features/admin/useAdmin';
import { mensagemDeErro } from '../../lib/erros';

const ETAPA_LABEL: Record<Etapa, string> = {
  LIMPEZA: 'Limpeza',
  TONIFICACAO: 'Tonificação',
  HIDRATACAO: 'Hidratação',
  PROTECAO_SOLAR: 'Proteção solar',
  TRATAMENTO: 'Tratamento',
};

const inputBase =
  'rounded-lg border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200';
const acaoBtn = 'text-sm font-bold text-brand-600 transition-colors hover:text-brand-700';

type Executar = (fn: () => Promise<void>) => Promise<boolean>;

function ProdutoEditor({
  produto,
  executar,
  aoFechar,
}: {
  produto: ProdutoAdmin;
  executar: Executar;
  aoFechar: () => void;
}) {
  const [nome, setNome] = useState(produto.nome);
  const [marca, setMarca] = useState(produto.marca ?? '');
  const [etapa, setEtapa] = useState<Etapa>(produto.etapa);
  const [descricao, setDescricao] = useState(produto.descricao);

  async function salvar() {
    const ok = await executar(() =>
      adminApi.atualizarProduto(produto.id, {
        nome,
        marca: marca.trim() || null,
        etapa,
        descricao,
      }),
    );
    if (ok) {
      aoFechar();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid gap-2 sm:grid-cols-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome"
          className={inputBase}
        />
        <input
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          placeholder="Marca"
          className={inputBase}
        />
        <select
          value={etapa}
          onChange={(e) => setEtapa(e.target.value as Etapa)}
          className={inputBase}
        >
          {ETAPAS.map((et) => (
            <option key={et} value={et}>
              {ETAPA_LABEL[et]}
            </option>
          ))}
        </select>
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

export function AdminProdutosPage() {
  const { data: produtos, isLoading, isError } = useProdutos();
  const invalidar = useInvalidarProdutos();
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [etapa, setEtapa] = useState<Etapa>('LIMPEZA');
  const [descricao, setDescricao] = useState('');

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
    if (nome.trim() && descricao.trim()) {
      if (
        await executar(() =>
          adminApi.criarProduto({
            nome: nome.trim(),
            marca: marca.trim() || null,
            etapa,
            descricao: descricao.trim(),
          }),
        )
      ) {
        setNome('');
        setMarca('');
        setDescricao('');
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
  if (isError || !produtos) {
    return <Alert tipo="erro">Não foi possível carregar os produtos.</Alert>;
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold text-neutral-800">Produtos</h1>
      {erro && <Alert tipo="erro">{erro}</Alert>}

      <Card>
        <h2 className="mb-3 font-extrabold text-neutral-800">Novo produto</h2>
        <div className="flex flex-col gap-2">
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome"
              className={inputBase}
            />
            <input
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Marca (opcional)"
              className={inputBase}
            />
            <select
              value={etapa}
              onChange={(e) => setEtapa(e.target.value as Etapa)}
              className={inputBase}
            >
              {ETAPAS.map((et) => (
                <option key={et} value={et}>
                  {ETAPA_LABEL[et]}
                </option>
              ))}
            </select>
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
            <Th>Nome</Th>
            <Th>Marca</Th>
            <Th>Etapa</Th>
            <Th>Status</Th>
            <Th className="text-right">Ações</Th>
          </>
        }
      >
        {produtos.map((p) => (
          <Fragment key={p.id}>
            <tr className="hover:bg-neutral-50">
              <Td className="font-bold text-neutral-800">{p.nome}</Td>
              <Td className="text-neutral-500">{p.marca ?? '—'}</Td>
              <Td className="text-neutral-500">{ETAPA_LABEL[p.etapa]}</Td>
              <Td>
                <Badge tom={p.ativo ? 'brand' : 'neutral'}>{p.ativo ? 'ativo' : 'inativo'}</Badge>
              </Td>
              <Td>
                <div className="flex justify-end gap-3 whitespace-nowrap">
                  <button
                    type="button"
                    className={acaoBtn}
                    onClick={() => setEditando(editando === p.id ? null : p.id)}
                  >
                    {editando === p.id ? 'Fechar' : 'Editar'}
                  </button>
                  <button
                    type="button"
                    className={acaoBtn}
                    onClick={() =>
                      void executar(() => adminApi.atualizarProduto(p.id, { ativo: !p.ativo }))
                    }
                  >
                    {p.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </Td>
            </tr>
            {editando === p.id && (
              <tr className="bg-neutral-50">
                <td colSpan={5} className="px-4 py-4">
                  <ProdutoEditor
                    produto={p}
                    executar={executar}
                    aoFechar={() => setEditando(null)}
                  />
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </Tabela>
    </div>
  );
}
