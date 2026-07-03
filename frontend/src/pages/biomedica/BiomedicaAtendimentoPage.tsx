import { useEffect, useRef, useState, type FormEvent } from 'react';
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
import { formatarHora } from '../../lib/datas';

export function BiomedicaAtendimentoPage() {
  const { id } = useParams();
  const conversaId = Number(id);
  const [verContexto, setVerContexto] = useState(false);
  const mensagensQuery = useMensagensBiomedica(conversaId);
  const contextoQuery = useContextoClinico(conversaId, verContexto);
  const responder = useResponderBiomedica(conversaId);
  const [texto, setTexto] = useState('');
  const fimRef = useRef<HTMLDivElement>(null);

  const mensagens = mensagensQuery.data ?? [];

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens.length]);

  function enviarAgora() {
    const conteudo = texto.trim();
    if (!conteudo) {
      return;
    }
    responder.mutate(conteudo, { onSuccess: () => setTexto('') });
  }

  function aoEnviar(e: FormEvent) {
    e.preventDefault();
    enviarAgora();
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="sr-only">Atendimento</h1>
      <div className="flex items-center justify-between">
        <Link to="/biomedica" className="text-sm text-accent-600">
          ‹ Conversas
        </Link>
        <button
          type="button"
          onClick={() => setVerContexto((v) => !v)}
          aria-expanded={verContexto}
          aria-controls="painel-contexto"
          className="text-sm font-medium text-accent-600"
        >
          {verContexto ? 'Ocultar contexto' : 'Ver contexto clínico'}
        </button>
      </div>

      {verContexto && (
        <Card>
          <div id="painel-contexto">
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
          </div>
        </Card>
      )}

      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Mensagens da conversa"
        className="flex min-h-[45vh] flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-3"
      >
        {mensagensQuery.isLoading ? (
          <div className="flex flex-1 items-center justify-center text-accent-500">
            <Spinner />
          </div>
        ) : mensagensQuery.isError ? (
          <p className="m-auto text-sm text-red-600">Não foi possível carregar as mensagens.</p>
        ) : mensagens.length === 0 ? (
          <p className="m-auto text-sm text-neutral-500">Sem mensagens ainda.</p>
        ) : (
          mensagens.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.autorTipo === 'BIOMEDICA' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  m.autorTipo === 'BIOMEDICA'
                    ? 'bg-accent-600 text-white'
                    : 'bg-neutral-100 text-neutral-800'
                }`}
              >
                {m.conteudo && <p className="whitespace-pre-wrap">{m.conteudo}</p>}
                {m.anexos.map((a) => (
                  <div key={a.id} className="mt-1">
                    <FotoAnexo anexoId={a.id} instance={apiBiomedica} />
                  </div>
                ))}
                <span className="mt-0.5 block text-right text-[10px] opacity-70">
                  {formatarHora(m.criadoEm)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={fimRef} />
      </div>

      {responder.isError && <Alert tipo="erro">Não foi possível enviar. Tente novamente.</Alert>}
      <form onSubmit={aoEnviar} className="flex items-end gap-2">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              enviarAgora();
            }
          }}
          rows={1}
          aria-label="Responder à paciente"
          placeholder="Responder…"
          className="min-h-11 flex-1 resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30"
        />
        <Button type="submit" loading={responder.isPending} disabled={!texto.trim()}>
          Enviar
        </Button>
      </form>
    </div>
  );
}
