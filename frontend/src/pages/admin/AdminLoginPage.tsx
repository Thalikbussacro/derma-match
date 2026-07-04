import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate } from 'react-router-dom';
import { loginSchema, type LoginForm } from '../../features/auth/auth.schemas';
import { useAdminAuth } from '../../features/admin/adminAuthContext';
import { mensagemDeErro } from '../../lib/erros';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export function AdminLoginPage() {
  const { admin, carregando, login } = useAdminAuth();
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
      void navigate('/admin', { replace: true });
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível entrar. Verifique seus dados.'));
    }
  });

  if (!carregando && admin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 pt-4">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-neutral-800">Entrar</h1>
        <p className="text-sm text-neutral-500">Acesso restrito ao administrador.</p>
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
