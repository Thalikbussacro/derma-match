import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
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
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">{data.titulo}</h1>
        <p className="mt-1 text-sm text-neutral-600">{data.descricao}</p>
      </div>
      <Card>
        <ul className="flex flex-col gap-3">
          {data.beneficios.map((beneficio) => (
            <li key={beneficio} className="flex items-start gap-2 text-sm text-neutral-700">
              <span className="font-bold text-accent-500">✓</span>
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
          <Alert tipo="info">{data.aviso}</Alert>
          {erro && <Alert tipo="erro">{erro}</Alert>}
          <Button fullWidth loading={assinando} onClick={() => void assinar()}>
            Assinar Premium
          </Button>
          <p className="text-center text-xs text-neutral-400">
            Simulação — sem cobrança real (projeto acadêmico).
          </p>
        </>
      )}
    </div>
  );
}
