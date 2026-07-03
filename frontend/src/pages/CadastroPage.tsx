import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { cadastroSchema, type CadastroForm } from '../features/auth/auth.schemas';
import { authApi } from '../features/auth/auth.api';
import { useAuth } from '../features/auth/authContext';
import { mensagemDeErro } from '../lib/erros';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export function CadastroPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [erroApi, setErroApi] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroForm>({ resolver: zodResolver(cadastroSchema) });

  const aoEnviar = handleSubmit(async (data) => {
    setErroApi(null);
    try {
      await authApi.cadastrar({
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        aceiteLgpd: data.aceiteLgpd,
      });
      await login(data.email, data.senha);
      void navigate('/', { replace: true });
    } catch (erro) {
      setErroApi(mensagemDeErro(erro, 'Não foi possível criar a conta.'));
    }
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Criar conta</h1>
        <p className="text-sm text-neutral-600">Descubra seu tipo de pele e sua rotina ideal.</p>
      </div>
      <Card>
        <form onSubmit={(e) => void aoEnviar(e)} className="flex flex-col gap-4" noValidate>
          {erroApi && <Alert tipo="erro">{erroApi}</Alert>}
          <Input
            label="Nome"
            autoComplete="name"
            error={errors.nome?.message}
            {...register('nome')}
          />
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
            autoComplete="new-password"
            error={errors.senha?.message}
            {...register('senha')}
          />
          <Input
            label="Confirmar senha"
            type="password"
            autoComplete="new-password"
            error={errors.confirmarSenha?.message}
            {...register('confirmarSenha')}
          />
          <div className="flex flex-col gap-1">
            <label className="flex items-start gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-brand-600"
                {...register('aceiteLgpd')}
              />
              <span>Li e aceito os termos de uso e a política de privacidade (LGPD).</span>
            </label>
            {errors.aceiteLgpd && (
              <span className="text-xs text-red-600">{errors.aceiteLgpd.message}</span>
            )}
          </div>
          <Button type="submit" fullWidth loading={isSubmitting}>
            Criar conta
          </Button>
        </form>
      </Card>
      <p className="text-center text-sm text-neutral-600">
        Já tem conta?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
