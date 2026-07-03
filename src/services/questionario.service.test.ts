import { describe, expect, it } from 'vitest';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import { authService } from './auth.service.js';
import { questionarioService } from './questionario.service.js';

async function criarUsuario(): Promise<number> {
  const usuario = await authService.cadastrar({
    nome: 'Q',
    email: 'q@example.com',
    senha: 'senha12345',
    aceiteLgpd: true,
  });
  return usuario.id;
}

describe('questionarioService.obterEstado', () => {
  it('estado inicial é NAO_INICIADO', async () => {
    const id = await criarUsuario();
    const estado = await questionarioService.obterEstado(id);
    expect(estado.estado).toBe('NAO_INICIADO');
    expect(estado.perguntasRespondidas).toBe(0);
    expect(estado.totalPerguntas).toBeGreaterThan(0);
  });

  it('estado após 1 resposta é EM_ANDAMENTO', async () => {
    const id = await criarUsuario();
    const proxima = await questionarioService.obterProximaPergunta(id);
    expect(proxima).not.toBeNull();
    await questionarioService.responder(id, {
      perguntaId: proxima!.id,
      opcaoId: proxima!.opcoes[0]!.id,
    });
    const estado = await questionarioService.obterEstado(id);
    expect(estado.estado).toBe('EM_ANDAMENTO');
    expect(estado.perguntasRespondidas).toBe(1);
  });
});

describe('questionarioService.obterProximaPergunta', () => {
  it('respeita a ordem das perguntas', async () => {
    const id = await criarUsuario();
    const p1 = await questionarioService.obterProximaPergunta(id);
    expect(p1?.ordem).toBe(1);
    await questionarioService.responder(id, { perguntaId: p1!.id, opcaoId: p1!.opcoes[0]!.id });
    const p2 = await questionarioService.obterProximaPergunta(id);
    expect(p2?.ordem).toBe(2);
  });

  it('pula perguntas cuja dependência não foi satisfeita', async () => {
    const id = await criarUsuario();
    // Responde escolhendo sempre a última opção (não dispara as condicionais do seed).
    let apresentadas = 0;
    let proxima = await questionarioService.obterProximaPergunta(id);
    while (proxima !== null) {
      apresentadas++;
      const ultima = proxima.opcoes[proxima.opcoes.length - 1]!;
      await questionarioService.responder(id, { perguntaId: proxima.id, opcaoId: ultima.id });
      proxima = await questionarioService.obterProximaPergunta(id);
    }
    const { totalPerguntas } = await questionarioService.obterEstado(id);
    // Como as condicionais não foram disparadas, foram apresentadas menos que o total.
    expect(apresentadas).toBeLessThan(totalPerguntas);
  });
});

describe('questionarioService.responder', () => {
  it('rejeita resposta fora de ordem', async () => {
    const id = await criarUsuario();
    const p1 = await questionarioService.obterProximaPergunta(id);
    await questionarioService.responder(id, { perguntaId: p1!.id, opcaoId: p1!.opcoes[0]!.id });
    // p1 já respondida: responder de novo não é a próxima esperada
    await expect(
      questionarioService.responder(id, { perguntaId: p1!.id, opcaoId: p1!.opcoes[0]!.id }),
    ).rejects.toThrow('próxima pergunta');
  });

  it('rejeita opção que não pertence à pergunta informada', async () => {
    const id = await criarUsuario();
    const p1 = await questionarioService.obterProximaPergunta(id);
    await expect(
      questionarioService.responder(id, { perguntaId: 999999, opcaoId: p1!.opcoes[0]!.id }),
    ).rejects.toThrow('não pertence');
  });
});

describe('questionarioService.refazer', () => {
  it('apaga as respostas e zera o tipo de pele em uma transação', async () => {
    const id = await criarUsuario();
    const p1 = await questionarioService.obterProximaPergunta(id);
    await questionarioService.responder(id, { perguntaId: p1!.id, opcaoId: p1!.opcoes[0]!.id });
    await usuarioRepository.atualizarTipoPelePredominante(id, 1);

    await questionarioService.refazer(id);

    const estado = await questionarioService.obterEstado(id);
    expect(estado.perguntasRespondidas).toBe(0);
    expect(estado.tipoPeleId).toBeNull();
    expect(estado.estado).toBe('NAO_INICIADO');
  });
});
