import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  type Etapa,
  ETAPAS,
  type ItemRotinaEdicao,
  type RotinaEdicaoResponse,
} from '@derma-match/shared';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { IconBack } from '../../components/ui/icons';
import { biomedicaApi } from '../../features/biomedica/biomedica.api';
import { useRotinaEdicao } from '../../features/biomedica/useBiomedica';
import { formatarData } from '../../lib/datas';
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

function RotinaEditor({
  dados,
  conversaId,
  aoSalvar,
}: {
  dados: RotinaEdicaoResponse;
  conversaId: number;
  aoSalvar: () => Promise<unknown>;
}) {
  const navigate = useNavigate();
  const [itens, setItens] = useState<ItemRotinaEdicao[]>(dados.itens);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function atualizar(indice: number, campo: keyof ItemRotinaEdicao, valor: string | number | null) {
    setItens((prev) => prev.map((it, i) => (i === indice ? { ...it, [campo]: valor } : it)));
  }

  async function salvar() {
    setErro(null);
    setMsg(null);
    setSalvando(true);
    try {
      const itensOrdenados = itens
        .filter((it) => it.descricao.trim())
        .map((it, i) => ({ ...it, ordem: i + 1 }));
      await biomedicaApi.salvarRotina(conversaId, { itens: itensOrdenados });
      setMsg('Rotina salva. A paciente já vê a versão nova.');
      await aoSalvar();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível salvar a rotina.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <button
          type="button"
          onClick={() => void navigate(`/biomedica/atendimento/${conversaId}`)}
          aria-label="Voltar ao atendimento"
          className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-700 transition-colors hover:bg-brand-100"
        >
          <IconBack className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-extrabold text-neutral-800">
            Rotina de {dados.usuarioNome}
          </h1>
          <p className="text-xs text-neutral-500">
            {dados.atualizadoEm
              ? `Personalizada · atualizada em ${formatarData(dados.atualizadoEm)}`
              : 'Sugestão a partir do tipo de pele'}
          </p>
        </div>
      </div>

      {dados.produtosSugeridos.length > 0 && (
        <Alert tipo="info">
          Sugeridos pelas respostas: {dados.produtosSugeridos.map((p) => p.nome).join(', ')}.
        </Alert>
      )}
      {erro && <Alert tipo="erro">{erro}</Alert>}
      {msg && <Alert tipo="sucesso">{msg}</Alert>}

      {itens.map((it, i) => (
        <Card key={i} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <select
              value={it.etapa}
              onChange={(e) => atualizar(i, 'etapa', e.target.value)}
              className={inputBase}
            >
              {ETAPAS.map((et) => (
                <option key={et} value={et}>
                  {ETAPA_LABEL[et]}
                </option>
              ))}
            </select>
            <select
              value={it.produtoId ?? ''}
              onChange={(e) =>
                atualizar(i, 'produtoId', e.target.value ? Number(e.target.value) : null)
              }
              className={`flex-1 ${inputBase}`}
            >
              <option value="">Sem produto específico</option>
              {dados.catalogo.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
          <input
            value={it.descricao}
            onChange={(e) => atualizar(i, 'descricao', e.target.value)}
            placeholder="Instrução (ex.: aplicar de manhã e à noite)"
            className={inputBase}
          />
          <Button
            variant="ghost"
            className="self-start"
            onClick={() => setItens((prev) => prev.filter((_, idx) => idx !== i))}
          >
            Remover passo
          </Button>
        </Card>
      ))}

      <Button
        variant="secondary"
        onClick={() =>
          setItens((prev) => [
            ...prev,
            { etapa: 'LIMPEZA', descricao: '', ordem: prev.length + 1, produtoId: null },
          ])
        }
      >
        Adicionar passo
      </Button>

      <Button loading={salvando} onClick={() => void salvar()}>
        Salvar rotina
      </Button>
    </div>
  );
}

export function BiomedicaRotinaPage() {
  const { id } = useParams();
  const conversaId = Number(id);
  const { data, isLoading, isError, refetch } = useRotinaEdicao(conversaId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 text-brand-500">
        <Spinner />
      </div>
    );
  }
  if (isError || !data) {
    return <Alert tipo="erro">Não foi possível carregar a rotina.</Alert>;
  }

  return <RotinaEditor dados={data} conversaId={conversaId} aoSalvar={refetch} />;
}
