import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginSchema, type LoginForm } from '../features/auth/auth.schemas';
import { useAuth } from '../features/auth/authContext';
import { mensagemDeErro } from '../lib/erros';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { IconDroplet } from '../components/ui/icons';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [erroApi, setErroApi] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const aoEnviar = handleSubmit(async (data) => {
    setErroApi(null);
    try {
      await login(data.email, data.senha);
      const destino = (location.state as { from?: string } | null)?.from ?? '/';
      void navigate(destino, { replace: true });
    } catch (erro) {
      setErroApi(mensagemDeErro(erro, 'Não foi possível entrar. Verifique seus dados.'));
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 pt-2 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
          <IconDroplet className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-extrabold text-neutral-800">Bem-vinda de volta</h1>
        <p className="text-sm text-neutral-500">Entre para ver sua rotina de cuidados.</p>
      </div>

      <Card>
        <form onSubmit={(e) => void aoEnviar(e)} className="flex flex-col gap-4" noValidate>
          {erroApi && <Alert tipo="erro">{erroApi}</Alert>}
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            error={errors.senha?.message}
            {...register('senha')}
          />
          <Button type="submit" fullWidth loading={isSubmitting}>
            Entrar
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-2 text-center text-sm text-neutral-600">
        <Link to="/recuperar-senha" className="font-semibold text-brand-600 hover:underline">
          Esqueci minha senha
        </Link>
        <span>
          Não tem conta?{' '}
          <Link to="/cadastro" className="font-bold text-brand-600 hover:underline">
            Criar conta
          </Link>
        </span>
      </div>
    </div>
  );
}
