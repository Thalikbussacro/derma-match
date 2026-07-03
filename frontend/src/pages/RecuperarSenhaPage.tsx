import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { recuperarSenhaSchema, type RecuperarSenhaForm } from '../features/auth/auth.schemas';
import { authApi } from '../features/auth/auth.api';
import { mensagemDeErro } from '../lib/erros';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export function RecuperarSenhaPage() {
  const [enviado, setEnviado] = useState(false);
  const [erroApi, setErroApi] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarSenhaForm>({ resolver: zodResolver(recuperarSenhaSchema) });

  const aoEnviar = handleSubmit(async (data) => {
    setErroApi(null);
    try {
      await authApi.recuperarSenha(data.email);
      setEnviado(true);
    } catch (erro) {
      setErroApi(mensagemDeErro(erro));
    }
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Recuperar senha</h1>
        <p className="text-sm text-neutral-600">Enviaremos um link para redefinir sua senha.</p>
      </div>
      <Card>
        {enviado ? (
          <Alert tipo="sucesso">
            Se houver uma conta com esse email, enviamos um link para redefinir a senha. Confira sua
            caixa de entrada.
          </Alert>
        ) : (
          <form onSubmit={(e) => void aoEnviar(e)} className="flex flex-col gap-4" noValidate>
            {erroApi && <Alert tipo="erro">{erroApi}</Alert>}
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Button type="submit" fullWidth loading={isSubmitting}>
              Enviar link
            </Button>
          </form>
        )}
      </Card>
      <p className="text-center text-sm text-neutral-600">
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
