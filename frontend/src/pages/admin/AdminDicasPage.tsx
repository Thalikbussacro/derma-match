import { Fragment, useState } from 'react';
import type { DicaAdmin } from '@derma-match/shared';
import { Tabela, Td, Th } from '../../components/admin/Tabela';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { adminApi } from '../../features/admin/admin.api';
import { useDicasAdmin, useInvalidarDicas } from '../../features/admin/useAdmin';
import { mensagemDeErro } from '../../lib/erros';

const inputBase =
  'rounded-lg border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200';
const acaoBtn = 'text-sm font-bold text-brand-600 transition-colors hover:text-brand-700';

type Executar = (fn: () => Promise<void>) => Promise<boolean>;

function DicaEditor({
  dica,
  executar,
  aoFechar,
}: {
  dica: DicaAdmin;
  executar: Executar;
  aoFechar: () => void;
}) {
  const [titulo, setTitulo] = useState(dica.titulo);
  const [conteudo, setConteudo] = useState(dica.conteudo);

  async function salvar() {
    const ok = await executar(() => adminApi.atualizarDica(dica.id, { titulo, conteudo }));
    if (ok) {
      aoFechar();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputBase} />
      <textarea
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        rows={3}
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

export function AdminDicasPage() {
  const { data: dicas, isLoading, isError } = useDicasAdmin();
  const invalidar = useInvalidarDicas();
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState<number | null>(null);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');

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
    if (titulo.trim() && conteudo.trim()) {
      if (
        await executar(() =>
          adminApi.criarDica({ titulo: titulo.trim(), conteudo: conteudo.trim() }),
        )
      ) {
        setTitulo('');
        setConteudo('');
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
  if (isError || !dicas) {
    return <Alert tipo="erro">Não foi possível carregar as dicas.</Alert>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800">Dicas</h1>
        <p className="text-sm text-neutral-500">As dicas ativas aparecem no início das usuárias.</p>
      </div>
      {erro && <Alert tipo="erro">{erro}</Alert>}

      <Card>
        <h2 className="mb-3 font-extrabold text-neutral-800">Nova dica</h2>
        <div className="flex flex-col gap-2">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título"
            className={inputBase}
          />
          <textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows={3}
            placeholder="Conteúdo"
            className={`resize-none ${inputBase}`}
          />
          <Button className="self-start" onClick={() => void adicionar()}>
            Publicar
          </Button>
        </div>
      </Card>

      <Tabela
        cabecalho={
          <>
            <Th>Título</Th>
            <Th>Status</Th>
            <Th className="text-right">Ações</Th>
          </>
        }
      >
        {dicas.map((d) => (
          <Fragment key={d.id}>
            <tr className="hover:bg-neutral-50">
              <Td className="font-bold text-neutral-800">{d.titulo}</Td>
              <Td>
                <Badge tom={d.ativa ? 'brand' : 'neutral'}>{d.ativa ? 'ativa' : 'inativa'}</Badge>
              </Td>
              <Td>
                <div className="flex justify-end gap-3 whitespace-nowrap">
                  <button
                    type="button"
                    className={acaoBtn}
                    onClick={() => setEditando(editando === d.id ? null : d.id)}
                  >
                    {editando === d.id ? 'Fechar' : 'Editar'}
                  </button>
                  <button
                    type="button"
                    className={acaoBtn}
                    onClick={() =>
                      void executar(() => adminApi.atualizarDica(d.id, { ativa: !d.ativa }))
                    }
                  >
                    {d.ativa ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </Td>
            </tr>
            {editando === d.id && (
              <tr className="bg-neutral-50">
                <td colSpan={3} className="px-4 py-4">
                  <DicaEditor dica={d} executar={executar} aoFechar={() => setEditando(null)} />
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </Tabela>
    </div>
  );
}
