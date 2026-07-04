import { useState } from 'react';
import { Alert } from '../../components/ui/Alert';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { IconChat } from '../../components/ui/icons';
import { adminApi } from '../../features/admin/admin.api';
import {
  useBiomedicas,
  useConversasAdmin,
  useInvalidarConversas,
} from '../../features/admin/useAdmin';
import { mensagemDeErro } from '../../lib/erros';

export function AdminConversasPage() {
  const { data: conversas, isLoading, isError } = useConversasAdmin();
  const { data: biomedicas } = useBiomedicas();
  const invalidar = useInvalidarConversas();
  const [erro, setErro] = useState<string | null>(null);

  const ativas = (biomedicas ?? []).filter((b) => b.ativa);

  async function reatribuir(id: number, biomedicaId: number) {
    setErro(null);
    try {
      await adminApi.reatribuirConversa(id, biomedicaId);
      await invalidar();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível reatribuir.'));
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 text-brand-500">
        <Spinner />
      </div>
    );
  }
  if (isError || !conversas) {
    return <Alert tipo="erro">Não foi possível carregar as conversas.</Alert>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800">Conversas</h1>
        <p className="text-sm text-neutral-500">Cada conversa é atendida por uma biomédica.</p>
      </div>
      {erro && <Alert tipo="erro">{erro}</Alert>}

      {conversas.length === 0 ? (
        <EmptyState
          icone={<IconChat className="h-8 w-8" />}
          titulo="Nenhuma conversa ainda"
          descricao="As conversas aparecem aqui quando as pacientes começam a falar com a biomédica."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {conversas.map((c) => (
            <Card key={c.id} className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-bold text-neutral-800">{c.usuarioNome}</p>
                <p className="text-sm text-neutral-500">{c.mensagens} mensagem(ns)</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-neutral-500">Biomédica</span>
                <select
                  value={c.biomedicaId}
                  onChange={(e) => void reatribuir(c.id, Number(e.target.value))}
                  className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                >
                  {ativas.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nome}
                    </option>
                  ))}
                  {!ativas.some((b) => b.id === c.biomedicaId) && (
                    <option value={c.biomedicaId}>{c.biomedicaNome} (inativa)</option>
                  )}
                </select>
              </label>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
