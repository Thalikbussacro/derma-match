import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { IconDownload, IconLogout, IconShield } from '../components/ui/icons';
import { useAuth } from '../features/auth/authContext';
import {
  editarNomeSchema,
  trocarSenhaSchema,
  type EditarNomeForm,
  type TrocarSenhaForm,
} from '../features/conta/conta.schemas';
import { contaApi } from '../features/conta/conta.api';
import { useAtualizarConta, useExcluirConta, usePerfil } from '../features/conta/useConta';
import { premiumApi } from '../features/premium/premium.api';
import { mensagemDeErro } from '../lib/erros';

export function ContaPage() {
  const { definirUsuario, logout } = useAuth();
  const navigate = useNavigate();
  const perfilQuery = usePerfil();
  const atualizar = useAtualizarConta();
  const excluir = useExcluirConta();

  const [msgNome, setMsgNome] = useState<string | null>(null);
  const [erroNome, setErroNome] = useState<string | null>(null);
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);
  const [cancelandoPremium, setCancelandoPremium] = useState(false);
  const [confirmandoCancel, setConfirmandoCancel] = useState(false);
  const [erroCancel, setErroCancel] = useState<string | null>(null);
  const [baixando, setBaixando] = useState(false);

  const perfil = perfilQuery.data;

  const nomeForm = useForm<EditarNomeForm>({
    resolver: zodResolver(editarNomeSchema),
    values: { nome: perfil?.nome ?? '' },
  });
  const senhaForm = useForm<TrocarSenhaForm>({ resolver: zodResolver(trocarSenhaSchema) });

  const salvarNome = nomeForm.handleSubmit(async (data) => {
    setErroNome(null);
    setMsgNome(null);
    try {
      const atualizado = await atualizar.mutateAsync({ nome: data.nome });
      definirUsuario(atualizado);
      setMsgNome('Nome atualizado.');
    } catch (erro) {
      setErroNome(mensagemDeErro(erro));
    }
  });

  const salvarSenha = senhaForm.handleSubmit(async (data) => {
    setErroSenha(null);
    try {
      await atualizar.mutateAsync({ senhaAtual: data.senhaAtual, novaSenha: data.novaSenha });
      // O backend revoga os tokens ao trocar a senha: força novo login.
      await logout();
      void navigate('/login', { replace: true });
    } catch (erro) {
      setErroSenha(mensagemDeErro(erro, 'Não foi possível trocar a senha.'));
    }
  });

  async function confirmarExclusao() {
    setErroExclusao(null);
    try {
      await excluir.mutateAsync();
      await logout();
      void navigate('/login', { replace: true });
    } catch (erro) {
      setErroExclusao(mensagemDeErro(erro, 'Não foi possível excluir a conta.'));
    }
  }

  async function baixarDados() {
    setBaixando(true);
    try {
      const dados = await contaApi.exportarDados();
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meus-dados-derma-match.json';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBaixando(false);
    }
  }

  async function cancelarPremium() {
    setErroCancel(null);
    setCancelandoPremium(true);
    try {
      const atualizado = await premiumApi.cancelar();
      definirUsuario(atualizado);
      await perfilQuery.refetch();
      setConfirmandoCancel(false);
    } catch (erro) {
      setErroCancel(mensagemDeErro(erro, 'Não foi possível cancelar o Premium.'));
    } finally {
      setCancelandoPremium(false);
    }
  }

  async function sair() {
    await logout();
    void navigate('/login', { replace: true });
  }

  if (perfilQuery.isLoading) {
    return (
      <div className="flex justify-center py-12 text-brand-500">
        <Spinner />
      </div>
    );
  }

  if (perfilQuery.isError || !perfil) {
    return <Alert tipo="erro">Não foi possível carregar seus dados. Recarregue a página.</Alert>;
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold text-neutral-800">Minha conta</h1>

      <Card className="flex items-center gap-3.5">
        <Avatar nome={perfil.nome} className="h-14 w-14 text-lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-extrabold text-neutral-800">{perfil.nome}</p>
          <p className="truncate text-sm text-neutral-500">{perfil.email}</p>
          <div className="mt-1.5 flex gap-2">
            <Badge tom={perfil.plano === 'PREMIUM' ? 'accent' : 'neutral'}>{perfil.plano}</Badge>
            {perfil.tipoPelePredominanteId && <Badge>Pele definida</Badge>}
          </div>
        </div>
      </Card>

      {perfil.plano === 'PREMIUM' && (
        <Card>
          <h2 className="font-extrabold text-neutral-800">Plano Premium</h2>
          <p className="mt-1 text-sm text-neutral-600">Seu plano Premium está ativo.</p>
          {erroCancel && (
            <div className="mt-3">
              <Alert tipo="erro">{erroCancel}</Alert>
            </div>
          )}
          {confirmandoCancel ? (
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-sm font-semibold text-neutral-800">
                Cancelar o Premium? Você perde o acesso ao chat com a biomédica.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  fullWidth
                  loading={cancelandoPremium}
                  onClick={() => void cancelarPremium()}
                >
                  Sim, cancelar
                </Button>
                <Button variant="secondary" fullWidth onClick={() => setConfirmandoCancel(false)}>
                  Manter
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" className="mt-3" onClick={() => setConfirmandoCancel(true)}>
              Cancelar Premium
            </Button>
          )}
        </Card>
      )}

      <Card>
        <h2 className="mb-3 font-extrabold text-neutral-800">Editar nome</h2>
        <form onSubmit={(e) => void salvarNome(e)} className="flex flex-col gap-3" noValidate>
          {erroNome && <Alert tipo="erro">{erroNome}</Alert>}
          {msgNome && <Alert tipo="sucesso">{msgNome}</Alert>}
          <Input
            label="Nome"
            error={nomeForm.formState.errors.nome?.message}
            {...nomeForm.register('nome')}
          />
          <Button type="submit" loading={nomeForm.formState.isSubmitting}>
            Salvar nome
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 font-extrabold text-neutral-800">Trocar senha</h2>
        <form onSubmit={(e) => void salvarSenha(e)} className="flex flex-col gap-3" noValidate>
          {erroSenha && <Alert tipo="erro">{erroSenha}</Alert>}
          <Input
            label="Senha atual"
            type="password"
            autoComplete="current-password"
            error={senhaForm.formState.errors.senhaAtual?.message}
            {...senhaForm.register('senhaAtual')}
          />
          <Input
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            error={senhaForm.formState.errors.novaSenha?.message}
            {...senhaForm.register('novaSenha')}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            error={senhaForm.formState.errors.confirmarSenha?.message}
            {...senhaForm.register('confirmarSenha')}
          />
          <p className="text-xs text-neutral-500">
            Por segurança, você será deslogada após trocar a senha.
          </p>
          <Button type="submit" loading={senhaForm.formState.isSubmitting}>
            Trocar senha
          </Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <IconShield className="h-5 w-5 text-brand-600" />
          <h2 className="font-extrabold text-neutral-800">Privacidade e dados</h2>
        </div>
        <p className="mt-1 text-sm text-neutral-600">
          Baixe uma cópia dos seus dados ou consulte como tratamos suas informações.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Button variant="secondary" loading={baixando} onClick={() => void baixarDados()}>
            <IconDownload className="h-4 w-4" />
            Baixar meus dados
          </Button>
          <Link
            to="/privacidade"
            className="text-center text-sm font-semibold text-brand-600 hover:underline"
          >
            Política de privacidade
          </Link>
        </div>
      </Card>

      <Button variant="ghost" fullWidth onClick={() => void sair()}>
        <IconLogout className="h-4 w-4" />
        Sair da conta
      </Button>

      <Card className="border-red-200">
        <h2 className="font-extrabold text-red-700">Excluir conta</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Esta ação remove permanentemente sua conta e todas as suas respostas (LGPD). Não é
          possível desfazer.
        </p>
        {erroExclusao && (
          <div className="mt-3">
            <Alert tipo="erro">{erroExclusao}</Alert>
          </div>
        )}
        {confirmandoExclusao ? (
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-sm font-semibold text-neutral-800">
              Tem certeza? Isso é irreversível.
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                fullWidth
                loading={excluir.isPending}
                onClick={() => void confirmarExclusao()}
              >
                Sim, excluir
              </Button>
              <Button variant="secondary" fullWidth onClick={() => setConfirmandoExclusao(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="danger" className="mt-3" onClick={() => setConfirmandoExclusao(true)}>
            Excluir minha conta
          </Button>
        )}
      </Card>
    </div>
  );
}
