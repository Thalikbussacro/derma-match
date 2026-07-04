import type { ReactNode } from 'react';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1">
      <h2 className="text-base font-extrabold text-neutral-800">{titulo}</h2>
      <div className="text-sm leading-relaxed text-neutral-600">{children}</div>
    </section>
  );
}

export function PrivacidadePage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader titulo="Privacidade" subtitulo="Como tratamos seus dados" voltarPara={-1} />

      <Card className="flex flex-col gap-5">
        <Secao titulo="Controlador">
          O Derma Match é o controlador dos dados tratados nesta plataforma. Para exercer seus
          direitos, use os canais da conta ou o contato informado abaixo.
        </Secao>

        <Secao titulo="Dados que coletamos">
          Nome e email (cadastro); respostas do questionário de pele; tipo de pele calculado. No
          plano Premium: mensagens do chat e fotos da sua pele enviadas para análise.
        </Secao>

        <Secao titulo="Finalidade e base legal">
          Usamos seus dados para identificar seu tipo de pele, gerar sua rotina e, no Premium,
          permitir o atendimento por uma biomédica. A base legal é o seu{' '}
          <strong>consentimento</strong>, coletado no cadastro e, para dados de saúde, de forma
          específica ao assinar o Premium.
        </Secao>

        <Secao titulo="Dados sensíveis (saúde)">
          Fotos da pele e respostas de cunho clínico são <strong>dados sensíveis</strong>. Só são
          tratados mediante consentimento específico e destacado, dado ao assinar o Premium, com a
          finalidade de análise dermatológica pela biomédica responsável.
        </Secao>

        <Secao titulo="Retenção">
          Mantemos seus dados enquanto a conta existir. <strong>Fotos expiram 90 dias</strong> após
          o envio e são removidas. Ao excluir a conta, todos os seus dados (perfil, respostas,
          conversas, mensagens e fotos) são apagados.
        </Secao>

        <Secao titulo="Acesso da biomédica">
          A biomédica em atendimento vê o mínimo necessário: seu nome, respostas do questionário e
          tipo de pele. Ela não vê seu email nem dados de assinatura, e só acessa conversas ativas
          com ela.
        </Secao>

        <Secao titulo="Compartilhamento">
          Não vendemos nem compartilhamos seus dados com terceiros para fins de marketing.
        </Secao>

        <Secao titulo="Seus direitos">
          Você pode acessar, corrigir e excluir seus dados, e baixar uma cópia deles (portabilidade)
          na página <strong>Minha conta</strong>. A exclusão da conta é definitiva.
        </Secao>

        <Secao titulo="Segurança">
          Senhas são armazenadas com hash. O acesso é autenticado e as fotos são servidas apenas às
          pessoas autorizadas. (Em ambiente acadêmico, as fotos ficam em disco local sem
          criptografia em repouso — em produção usaríamos armazenamento cifrado.)
        </Secao>
      </Card>
    </div>
  );
}
