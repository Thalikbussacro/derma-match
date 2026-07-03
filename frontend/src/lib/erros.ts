import { AxiosError } from 'axios';

// Extrai uma mensagem amigável em português a partir de um erro de rede/API.
export function mensagemDeErro(
  erro: unknown,
  padrao = 'Algo deu errado. Tente novamente.',
): string {
  if (erro instanceof AxiosError) {
    if (!erro.response) {
      return 'Sem conexão com o servidor. Tente novamente.';
    }
    const data = erro.response.data as { mensagem?: string } | undefined;
    if (data?.mensagem) {
      return data.mensagem;
    }
  }
  return padrao;
}
