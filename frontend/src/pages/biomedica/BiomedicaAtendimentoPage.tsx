import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FotoAnexo } from '../../components/chat/FotoAnexo';
import { Alert } from '../../components/ui/Alert';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { IconBack, IconSend } from '../../components/ui/icons';
import {
  useContextoClinico,
  useMensagensBiomedica,
  useResponderBiomedica,
} from '../../features/biomedica/useBiomedica';
import { apiBiomedica } from '../../lib/apiBiomedica';
import { formatarHora } from '../../lib/datas';

export function BiomedicaAtendimentoPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const conversaId = Number(id);
  const nomePaciente = (location.state as { nome?: string } | null)?.nome ?? 'Paciente';

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
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <button
          type="button"
          onClick={() => void navigate('/biomedica')}
          aria-label="Voltar às conversas"
          className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-700 transition-colors hover:bg-brand-100"
        >
          <IconBack className="h-5 w-5" />
        </button>
        <Avatar nome={nomePaciente} tom="accent" className="h-10 w-10 text-sm" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-extrabold text-neutral-800">{nomePaciente}</h1>
          <button
            type="button"
            onClick={() => setVerContexto((v) => !v)}
            aria-expanded={verContexto}
            aria-controls="painel-contexto"
            className="text-xs font-bold text-brand-600"
          >
            {verContexto ? 'Ocultar ficha clínica' : 'Ver ficha clínica'}
          </button>
        </div>
      </div>

      {verContexto && (
        <Card className="border-brand-100 bg-brand-50/60">
          <div id="painel-contexto">
            {contextoQuery.isLoading ? (
              <div className="flex justify-center text-brand-500">
                <Spinner />
              </div>
            ) : contextoQuery.data ? (
              <div className="flex flex-col gap-3 text-sm">
                <p>
                  <span className="text-neutral-500">Tipo de pele: </span>
                  <span className="font-bold capitalize text-neutral-800">
                    {contextoQuery.data.tipoPeleNome ?? 'não definido'}
                  </span>
                  {contextoQuery.data.tipoPeleNivel != null && (
                    <span className="text-neutral-500">
                      {' · '}nível {contextoQuery.data.tipoPeleNivel}/5
                    </span>
                  )}
                </p>
                <div className="flex flex-col gap-2">
                  {contextoQuery.data.respostas.map((r) => (
                    <div key={r.pergunta}>
                      <p className="text-xs font-semibold text-neutral-500">{r.pergunta}</p>
                      <p className="text-neutral-800">{r.resposta}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Alert tipo="erro">Não foi possível carregar a ficha.</Alert>
            )}
          </div>
        </Card>
      )}

      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Mensagens da conversa"
        className="flex min-h-[45vh] flex-col gap-2.5 rounded-2xl bg-white p-3 shadow-[0_2px_10px_rgba(20,67,60,0.05)]"
      >
        {mensagensQuery.isLoading ? (
          <div className="flex flex-1 items-center justify-center text-brand-500">
            <Spinner />
          </div>
        ) : mensagensQuery.isError ? (
          <p className="m-auto text-sm font-semibold text-red-600">
            Não foi possível carregar as mensagens.
          </p>
        ) : mensagens.length === 0 ? (
          <p className="m-auto text-sm text-neutral-500">Sem mensagens ainda.</p>
        ) : (
          mensagens.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.autorTipo === 'BIOMEDICA' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                  m.autorTipo === 'BIOMEDICA'
                    ? 'rounded-br-md bg-brand-600 text-white'
                    : 'rounded-bl-md border border-neutral-100 bg-neutral-50 text-neutral-800'
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
          className="min-h-12 flex-1 resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
        />
        <button
          type="submit"
          disabled={!texto.trim() || responder.isPending}
          aria-label="Enviar resposta"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:bg-brand-300"
        >
          {responder.isPending ? <Spinner size="sm" /> : <IconSend className="h-5 w-5" />}
        </button>
      </form>
    </div>
  );
}
