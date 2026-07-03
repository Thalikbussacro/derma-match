import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FotoAnexo } from '../../components/chat/FotoAnexo';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import {
  useContextoClinico,
  useMensagensBiomedica,
  useResponderBiomedica,
} from '../../features/biomedica/useBiomedica';
import { apiBiomedica } from '../../lib/apiBiomedica';

export function BiomedicaAtendimentoPage() {
  const { id } = useParams();
  const conversaId = Number(id);
  const mensagensQuery = useMensagensBiomedica(conversaId);
  const contextoQuery = useContextoClinico(conversaId);
  const responder = useResponderBiomedica(conversaId);
  const [texto, setTexto] = useState('');
  const [verContexto, setVerContexto] = useState(false);

  const mensagens = mensagensQuery.data ?? [];

  function aoEnviar(e: FormEvent) {
    e.preventDefault();
    const conteudo = texto.trim();
    if (!conteudo) {
      return;
    }
    responder.mutate(conteudo, { onSuccess: () => setTexto('') });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link to="/biomedica" className="text-sm text-accent-600">
          ‹ Conversas
        </Link>
        <button
          type="button"
          onClick={() => setVerContexto((v) => !v)}
          className="text-sm font-medium text-accent-600"
        >
          {verContexto ? 'Ocultar contexto' : 'Ver contexto clínico'}
        </button>
      </div>

      {verContexto && (
        <Card>
          {contextoQuery.isLoading ? (
            <div className="flex justify-center text-accent-500">
              <Spinner />
            </div>
          ) : contextoQuery.data ? (
            <div className="flex flex-col gap-2 text-sm">
              <p className="font-semibold text-neutral-800">{contextoQuery.data.usuarioNome}</p>
              <p>
                Tipo de pele:{' '}
                <span className="font-medium capitalize">
                  {contextoQuery.data.tipoPeleNome ?? 'não definido'}
                </span>
              </p>
              <div className="mt-1 flex flex-col gap-2">
                {contextoQuery.data.respostas.map((r) => (
                  <div key={r.pergunta}>
                    <p className="text-neutral-500">{r.pergunta}</p>
                    <p className="text-neutral-800">{r.resposta}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Alert tipo="erro">Não foi possível carregar o contexto.</Alert>
          )}
        </Card>
      )}

      <div className="flex min-h-[45vh] flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-3">
        {mensagensQuery.isLoading ? (
          <div className="flex flex-1 items-center justify-center text-accent-500">
            <Spinner />
          </div>
        ) : mensagens.length === 0 ? (
          <p className="m-auto text-sm text-neutral-400">Sem mensagens ainda.</p>
        ) : (
          mensagens.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.autorTipo === 'BIOMEDICA' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  m.autorTipo === 'BIOMEDICA'
                    ? 'bg-accent-500 text-white'
                    : 'bg-neutral-100 text-neutral-800'
                }`}
              >
                {m.conteudo && <p className="whitespace-pre-wrap">{m.conteudo}</p>}
                {m.anexos.map((a) => (
                  <div key={a.id} className="mt-1">
                    <FotoAnexo anexoId={a.id} instance={apiBiomedica} />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {responder.isError && <Alert tipo="erro">Não foi possível enviar. Tente novamente.</Alert>}
      <form onSubmit={aoEnviar} className="flex items-end gap-2">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={1}
          placeholder="Responder…"
          className="min-h-11 flex-1 resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30"
        />
        <Button type="submit" loading={responder.isPending}>
          Enviar
        </Button>
      </form>
    </div>
  );
}
