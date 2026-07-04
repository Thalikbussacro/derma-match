import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { criarBiomedicaSchema, type CriarBiomedicaInput } from '@derma-match/shared';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { useBiomedicas, useCriarBiomedica, useDefinirAtiva } from '../../features/admin/useAdmin';
import { mensagemDeErro } from '../../lib/erros';

export function AdminBiomedicasPage() {
  const { data: biomedicas, isLoading, isError } = useBiomedicas();
  const criar = useCriarBiomedica();
  const definirAtiva = useDefinirAtiva();
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CriarBiomedicaInput>({ resolver: zodResolver(criarBiomedicaSchema) });

  const aoCriar = handleSubmit(async (data) => {
    setErro(null);
    setMsg(null);
    try {
      await criar.mutateAsync(data);
      setMsg('Biomédica cadastrada.');
      reset();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível cadastrar a biomédica.'));
    }
  });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold text-neutral-800">Biomédicas</h1>

      <Card>
        <h2 className="mb-3 font-extrabold text-neutral-800">Cadastrar biomédica</h2>
        <form onSubmit={(e) => void aoCriar(e)} className="flex flex-col gap-3" noValidate>
          {erro && <Alert tipo="erro">{erro}</Alert>}
          {msg && <Alert tipo="sucesso">{msg}</Alert>}
          <Input label="Nome" error={errors.nome?.message} {...register('nome')} />
          <Input
            label="Registro profissional"
            error={errors.registro?.message}
            {...register('registro')}
          />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input
            label="Senha inicial"
            type="password"
            autoComplete="new-password"
            error={errors.senha?.message}
            {...register('senha')}
          />
          <Button type="submit" loading={criar.isPending}>
            Cadastrar
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-8 text-brand-500">
          <Spinner />
        </div>
      ) : isError || !biomedicas ? (
        <Alert tipo="erro">Não foi possível carregar as biomédicas.</Alert>
      ) : (
        <div className="flex flex-col gap-2.5">
          {biomedicas.map((b) => (
            <Card key={b.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-bold text-neutral-800">{b.nome}</p>
                <p className="truncate text-sm text-neutral-500">
                  {b.registro} · {b.email}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge tom={b.ativa ? 'brand' : 'neutral'}>{b.ativa ? 'ativa' : 'inativa'}</Badge>
                <Button
                  variant="secondary"
                  loading={definirAtiva.isPending}
                  onClick={() => definirAtiva.mutate({ id: b.id, ativa: !b.ativa })}
                >
                  {b.ativa ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
