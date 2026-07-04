import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { IconChat } from '../components/ui/icons';
import { useAuth } from '../features/auth/authContext';
import { premiumApi } from '../features/premium/premium.api';
import { usePainelUpgrade } from '../features/premium/usePremium';
import { mensagemDeErro } from '../lib/erros';

export function PremiumPage() {
  const { usuario, definirUsuario } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePainelUpgrade();
  const [assinando, setAssinando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [consentiu, setConsentiu] = useState(false);

  const ehPremium = usuario?.plano === 'PREMIUM';

  async function assinar() {
    setErro(null);
    setAssinando(true);
    try {
      const atualizado = await premiumApi.assinar();
      definirUsuario(atualizado);
      void navigate('/chat');
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível assinar.'));
    } finally {
      setAssinando(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 text-brand-500">
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return <Alert tipo="erro">Não foi possível carregar o painel. Tente novamente.</Alert>;
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader titulo="Premium" voltarPara="/" />

      <Card className="bg-gradient-to-br from-accent-500 to-accent-600 text-white">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
          <IconChat className="h-6 w-6" />
        </span>
        <h2 className="mt-3 text-xl font-extrabold">{data.titulo}</h2>
        <p className="mt-1 text-sm text-white/85">{data.descricao}</p>
      </Card>

      <Card>
        <ul className="flex flex-col gap-3">
          {data.beneficios.map((beneficio) => (
            <li key={beneficio} className="flex items-start gap-2.5 text-sm text-neutral-700">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600"
                aria-hidden="true"
              >
                ✓
              </span>
              <span>{beneficio}</span>
            </li>
          ))}
        </ul>
      </Card>

      {ehPremium ? (
        <>
          <Alert tipo="sucesso">Você já é Premium! 🎉</Alert>
          <Link to="/chat">
            <Button fullWidth>Falar com a biomédica</Button>
          </Link>
        </>
      ) : (
        <>
          {erro && <Alert tipo="erro">{erro}</Alert>}
          <label className="flex items-start gap-2.5 rounded-xl bg-brand-50 p-3.5 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={consentiu}
              onChange={(e) => setConsentiu(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand-600"
            />
            <span>
              Consinto com o tratamento das minhas fotos e respostas (dados de saúde) para análise
              dermatológica pela biomédica, conforme a{' '}
              <Link
                to="/privacidade"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-brand-600 underline"
              >
                política de privacidade
              </Link>
              .
            </span>
          </label>
          <Button
            variant="accent"
            fullWidth
            loading={assinando}
            disabled={!consentiu}
            onClick={() => void assinar()}
          >
            Assinar Premium
          </Button>
          <p className="text-center text-xs text-neutral-500">
            {data.aviso} — sem cobrança real (projeto acadêmico).
          </p>
        </>
      )}
    </div>
  );
}
