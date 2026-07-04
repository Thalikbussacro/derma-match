import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { IconShield } from '../../components/ui/icons';
import { loginSchema, type LoginForm } from '../../features/auth/auth.schemas';
import { useBiomedicaAuth } from '../../features/biomedica/biomedicaAuthContext';
import { mensagemDeErro } from '../../lib/erros';

export function BiomedicaLoginPage() {
  const { biomedica, carregando, login } = useBiomedicaAuth();
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const aoEnviar = handleSubmit(async (data) => {
    setErro(null);
    try {
      await login(data.email, data.senha);
      void navigate('/biomedica', { replace: true });
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível entrar. Verifique seus dados.'));
    }
  });

  if (!carregando && biomedica) {
    return <Navigate to="/biomedica" replace />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 pt-2 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
          <IconShield className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-extrabold text-neutral-800">Área da biomédica</h1>
        <p className="text-sm text-neutral-500">Entre para atender suas pacientes.</p>
      </div>

      <Card>
        <form onSubmit={(e) => void aoEnviar(e)} className="flex flex-col gap-4" noValidate>
          {erro && <Alert tipo="erro">{erro}</Alert>}
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
    </div>
  );
}
