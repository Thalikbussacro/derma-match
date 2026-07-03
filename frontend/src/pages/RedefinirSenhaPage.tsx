import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { redefinirSenhaSchema, type RedefinirSenhaForm } from '../features/auth/auth.schemas';
import { authApi } from '../features/auth/auth.api';
import { mensagemDeErro } from '../lib/erros';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export function RedefinirSenhaPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [concluido, setConcluido] = useState(false);
  const [erroApi, setErroApi] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RedefinirSenhaForm>({ resolver: zodResolver(redefinirSenhaSchema) });

  const aoEnviar = handleSubmit(async (data) => {
    setErroApi(null);
    try {
      await authApi.redefinirSenha(token, data.novaSenha);
      setConcluido(true);
    } catch (erro) {
      setErroApi(
        mensagemDeErro(erro, 'Não foi possível redefinir a senha. O link pode ter expirado.'),
      );
    }
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Nova senha</h1>
        <p className="text-sm text-neutral-600">Escolha uma nova senha para sua conta.</p>
      </div>
      <Card>
        {!token ? (
          <Alert tipo="erro">Link inválido. Solicite a recuperação de senha novamente.</Alert>
        ) : concluido ? (
          <div className="flex flex-col gap-3">
            <Alert tipo="sucesso">Senha redefinida com sucesso!</Alert>
            <Link to="/login">
              <Button variant="secondary" fullWidth>
                Ir para o login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={(e) => void aoEnviar(e)} className="flex flex-col gap-4" noValidate>
            {erroApi && <Alert tipo="erro">{erroApi}</Alert>}
            <Input
              label="Nova senha"
              type="password"
              autoComplete="new-password"
              error={errors.novaSenha?.message}
              {...register('novaSenha')}
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              autoComplete="new-password"
              error={errors.confirmarSenha?.message}
              {...register('confirmarSenha')}
            />
            <Button type="submit" fullWidth loading={isSubmitting}>
              Redefinir senha
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
