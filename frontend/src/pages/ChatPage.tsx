import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FotoAnexo } from '../components/chat/FotoAnexo';
import { Alert } from '../components/ui/Alert';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { IconBack, IconCamera, IconClose, IconLock, IconSend } from '../components/ui/icons';
import { useAuth } from '../features/auth/authContext';
import { useConversa, useEnviarMensagem, useMensagens } from '../features/chat/useChat';
import { formatarHora } from '../lib/datas';

export function ChatPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
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
      <EmptyState
        icone={<IconLock className="h-8 w-8" />}
        titulo="Atendimento com biomédica"
        descricao="Converse com uma biomédica, envie fotos e tire suas dúvidas. Disponível no plano Premium."
        acao={
          <Link to="/premium">
            <Button fullWidth>Conhecer o Premium</Button>
          </Link>
        }
      />
    );
  }

  const biomedicaNome = conversaQuery.data?.biomedicaNome ?? 'Atendimento';
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
      <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
        <button
          type="button"
          onClick={() => void navigate('/')}
          aria-label="Voltar"
          className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-700 transition-colors hover:bg-brand-100"
        >
          <IconBack className="h-5 w-5" />
        </button>
        <Avatar nome={biomedicaNome} tom="accent" className="h-10 w-10 text-sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-extrabold text-neutral-800">{biomedicaNome}</p>
          <p className="text-xs text-neutral-500">Biomédica · responde em breve</p>
        </div>
      </div>

      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Mensagens da conversa"
        className="flex min-h-[55vh] flex-col gap-2.5 rounded-2xl bg-white p-3 shadow-[0_2px_10px_rgba(20,67,60,0.05)]"
      >
        {mensagensQuery.isLoading ? (
          <div className="flex flex-1 items-center justify-center text-brand-500">
            <Spinner />
          </div>
        ) : mensagensQuery.isError ? (
          <p className="m-auto text-sm font-semibold text-red-600">
            Não foi possível carregar as mensagens. Tente recarregar.
          </p>
        ) : mensagens.length === 0 ? (
          <p className="m-auto max-w-[220px] text-center text-sm text-neutral-500">
            Envie sua primeira mensagem para começar a conversa. 💬
          </p>
        ) : (
          mensagens.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.autorTipo === 'USUARIA' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                  m.autorTipo === 'USUARIA'
                    ? 'rounded-br-md bg-brand-600 text-white'
                    : 'rounded-bl-md border border-neutral-100 bg-neutral-50 text-neutral-800'
                }`}
              >
                {m.conteudo && <p className="whitespace-pre-wrap">{m.conteudo}</p>}
                {m.anexos.map((a) => (
                  <div key={a.id} className="mt-1">
                    <FotoAnexo anexoId={a.id} />
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

      {enviar.isError && <Alert tipo="erro">Não foi possível enviar. Tente novamente.</Alert>}

      <form onSubmit={aoEnviar} className="flex flex-col gap-2">
        {foto && (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
            <span className="min-w-0 truncate">📎 {foto.name}</span>
            <button
              type="button"
              onClick={() => setFoto(null)}
              aria-label="Remover foto"
              className="shrink-0"
            >
              <IconClose className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <label
            htmlFor="foto-chat"
            className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 focus-within:ring-2 focus-within:ring-brand-300"
          >
            <IconCamera className="h-5 w-5" />
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
            className="min-h-12 flex-1 resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          />
          <button
            type="submit"
            disabled={semConteudo || enviar.isPending}
            aria-label="Enviar mensagem"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:bg-brand-300"
          >
            {enviar.isPending ? <Spinner size="sm" /> : <IconSend className="h-5 w-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}
