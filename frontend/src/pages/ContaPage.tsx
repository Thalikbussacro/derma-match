import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../features/auth/authContext';
import {
  editarNomeSchema,
  trocarSenhaSchema,
  type EditarNomeForm,
  type TrocarSenhaForm,
} from '../features/conta/conta.schemas';
import { useAtualizarConta, useExcluirConta, usePerfil } from '../features/conta/useConta';
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
      <h1 className="text-2xl font-bold text-neutral-800">Minha conta</h1>

      <Card className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-500">Nome</span>
          <span className="font-medium text-neutral-800">{perfil.nome}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Email</span>
          <span className="font-medium text-neutral-800">{perfil.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Plano</span>
          <span className="font-medium text-neutral-800">{perfil.plano}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Tipo de pele</span>
          <span className="font-medium text-neutral-800">
            {perfil.tipoPelePredominanteId ? 'Definido' : 'Não definido'}
          </span>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-neutral-800">Editar nome</h2>
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
        <h2 className="mb-3 font-semibold text-neutral-800">Trocar senha</h2>
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

      <Card className="border-red-200">
        <h2 className="font-semibold text-red-700">Excluir conta</h2>
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
            <p className="text-sm font-medium text-neutral-800">
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
