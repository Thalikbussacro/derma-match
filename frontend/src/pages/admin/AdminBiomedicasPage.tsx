import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { criarBiomedicaSchema, type CriarBiomedicaInput } from '@derma-match/shared';
import { Tabela, Td, Th } from '../../components/admin/Tabela';
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
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Nome" error={errors.nome?.message} {...register('nome')} />
            <Input
              label="Registro profissional"
              error={errors.registro?.message}
              {...register('registro')}
            />
            <Input
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Senha inicial"
              type="password"
              autoComplete="new-password"
              error={errors.senha?.message}
              {...register('senha')}
            />
          </div>
          <Button type="submit" className="self-start" loading={criar.isPending}>
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
        <Tabela
          cabecalho={
            <>
              <Th>Nome</Th>
              <Th>Registro</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th className="text-right">Ações</Th>
            </>
          }
        >
          {biomedicas.map((b) => (
            <tr key={b.id} className="hover:bg-neutral-50">
              <Td className="font-bold text-neutral-800">{b.nome}</Td>
              <Td className="text-neutral-500">{b.registro}</Td>
              <Td className="text-neutral-500">{b.email}</Td>
              <Td>
                <Badge tom={b.ativa ? 'brand' : 'neutral'}>{b.ativa ? 'ativa' : 'inativa'}</Badge>
              </Td>
              <Td className="text-right">
                <Button
                  variant="secondary"
                  loading={definirAtiva.isPending}
                  onClick={() => definirAtiva.mutate({ id: b.id, ativa: !b.ativa })}
                >
                  {b.ativa ? 'Desativar' : 'Ativar'}
                </Button>
              </Td>
            </tr>
          ))}
        </Tabela>
      )}
    </div>
  );
}
