import { AxiosError, type AxiosResponse } from 'axios';
import { codigoDeErro, mensagemDeErro } from './erros';

function erroComResposta(data: unknown, status = 400): AxiosError {
  const response = {
    data,
    status,
    statusText: '',
    headers: {},
    config: { headers: {} },
  } as unknown as AxiosResponse;
  return new AxiosError('falhou', 'ERR_BAD_RESPONSE', undefined, undefined, response);
}

describe('mensagemDeErro', () => {
  it('usa a mensagem do backend quando presente', () => {
    const erro = erroComResposta({ mensagem: 'Email já cadastrado.' }, 409);
    expect(mensagemDeErro(erro)).toBe('Email já cadastrado.');
  });

  it('avisa sobre falta de conexão quando não há resposta', () => {
    const erro = new AxiosError('network', 'ERR_NETWORK');
    expect(mensagemDeErro(erro)).toBe('Sem conexão com o servidor. Tente novamente.');
  });

  it('cai no texto padrão para erro genérico', () => {
    expect(mensagemDeErro(new Error('x'), 'padrão')).toBe('padrão');
  });
});

describe('codigoDeErro', () => {
  it('extrai o código do backend', () => {
    const erro = erroComResposta({ codigo: 'QUESTIONARIO_INCOMPLETO' });
    expect(codigoDeErro(erro)).toBe('QUESTIONARIO_INCOMPLETO');
  });

  it('retorna undefined para erro não-axios', () => {
    expect(codigoDeErro(new Error('x'))).toBeUndefined();
  });
});
