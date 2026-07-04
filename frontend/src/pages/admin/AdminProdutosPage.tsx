import { useState } from 'react';
import { ETAPAS, type Etapa, type ProdutoAdmin } from '@derma-match/shared';
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

type Executar = (fn: () => Promise<void>) => Promise<boolean>;

function ProdutoEditor({ produto, executar }: { produto: ProdutoAdmin; executar: Executar }) {
  const [nome, setNome] = useState(produto.nome);
  const [marca, setMarca] = useState(produto.marca ?? '');
  const [etapa, setEtapa] = useState<Etapa>(produto.etapa);
  const [descricao, setDescricao] = useState(produto.descricao);
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={`flex-1 ${inputBase}`}
        />
        {!produto.ativo && <Badge tom="neutral">inativo</Badge>}
      </div>
      <div className="flex gap-2">
        <input
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          placeholder="Marca"
          className={`flex-1 ${inputBase}`}
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
        <Button
          variant="secondary"
          onClick={() =>
            void executar(() =>
              adminApi.atualizarProduto(produto.id, {
                nome,
                marca: marca.trim() || null,
                etapa,
                descricao,
              }),
            )
          }
        >
          Salvar
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            void executar(() => adminApi.atualizarProduto(produto.id, { ativo: !produto.ativo }))
          }
        >
          {produto.ativo ? 'Desativar' : 'Ativar'}
        </Button>
      </div>
    </Card>
  );
}

export function AdminProdutosPage() {
  const { data: produtos, isLoading, isError } = useProdutos();
  const invalidar = useInvalidarProdutos();
  const [erro, setErro] = useState<string | null>(null);
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
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome"
            className={inputBase}
          />
          <div className="flex gap-2">
            <input
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Marca (opcional)"
              className={`flex-1 ${inputBase}`}
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

      {produtos.map((p) => (
        <ProdutoEditor key={p.id} produto={p} executar={executar} />
      ))}
    </div>
  );
}
