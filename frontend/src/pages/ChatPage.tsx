import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FotoAnexo } from '../components/chat/FotoAnexo';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../features/auth/authContext';
import { useConversa, useEnviarMensagem, useMensagens } from '../features/chat/useChat';

export function ChatPage() {
  const { usuario } = useAuth();
  const ehPremium = usuario?.plano === 'PREMIUM';

  const conversaQuery = useConversa(ehPremium);
  const mensagensQuery = useMensagens(ehPremium);
  const enviar = useEnviarMensagem();

  const [texto, setTexto] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  const mensagens = mensagensQuery.data ?? [];

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens.length]);

  if (!ehPremium) {
    return (
      <Card>
        <h1 className="text-xl font-bold text-neutral-800">Atendimento com biomédica</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Falar com uma biomédica é exclusivo do plano Premium.
        </p>
        <Link to="/premium">
          <Button className="mt-4" fullWidth>
            Conhecer o Premium
          </Button>
        </Link>
      </Card>
    );
  }

  const semConteudo = !texto.trim() && !foto;

  function enviarAgora() {
    if (semConteudo) {
      return;
    }
    enviar.mutate(
      { conteudo: texto.trim(), foto },
      {
        onSuccess: () => {
          setTexto('');
          setFoto(null);
        },
      },
    );
  }

  function aoEnviar(e: FormEvent) {
    e.preventDefault();
    enviarAgora();
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-xl font-bold text-neutral-800">
          {conversaQuery.data ? conversaQuery.data.biomedicaNome : 'Atendimento'}
        </h1>
        <p className="text-xs text-neutral-500">Biomédica · responde em breve</p>
      </div>

      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Mensagens da conversa"
        className="flex min-h-[50vh] flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-3"
      >
        {mensagensQuery.isLoading ? (
          <div className="flex flex-1 items-center justify-center text-brand-500">
            <Spinner />
          </div>
        ) : mensagensQuery.isError ? (
          <p className="m-auto text-sm text-red-600">
            Não foi possível carregar as mensagens. Tente recarregar.
          </p>
        ) : mensagens.length === 0 ? (
          <p className="m-auto text-sm text-neutral-500">Envie sua primeira mensagem.</p>
        ) : (
          mensagens.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.autorTipo === 'USUARIA' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  m.autorTipo === 'USUARIA'
                    ? 'bg-brand-600 text-white'
                    : 'bg-neutral-100 text-neutral-800'
                }`}
              >
                {m.conteudo && <p className="whitespace-pre-wrap">{m.conteudo}</p>}
                {m.anexos.map((a) => (
                  <div key={a.id} className="mt-1">
                    <FotoAnexo anexoId={a.id} />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={fimRef} />
      </div>

      {enviar.isError && <Alert tipo="erro">Não foi possível enviar. Tente novamente.</Alert>}

      <form onSubmit={aoEnviar} className="flex flex-col gap-2">
        {foto && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-brand-50 px-3 py-1 text-xs text-brand-700">
            <span className="min-w-0 truncate">📎 {foto.name}</span>
            <button
              type="button"
              onClick={() => setFoto(null)}
              aria-label="Remover foto"
              className="shrink-0 font-bold"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <label
            htmlFor="foto-chat"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-neutral-300 text-lg focus-within:ring-2 focus-within:ring-brand-300"
          >
            <span aria-hidden="true">📷</span>
            <input
              id="foto-chat"
              type="file"
              accept="image/*"
              aria-label="Anexar foto"
              className="sr-only"
              onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
            />
          </label>
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
            aria-label="Escreva uma mensagem"
            placeholder="Escreva uma mensagem…"
            className="min-h-11 flex-1 resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <Button type="submit" loading={enviar.isPending} disabled={semConteudo}>
            Enviar
          </Button>
        </div>
      </form>
    </div>
  );
}
