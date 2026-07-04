import { describe, expect, it } from 'vitest';
import { NotFoundError } from '../errors/http-error.js';
import { biomedicaRepository } from '../repositories/biomedica.repository.js';
import { assinaturaService } from './assinatura.service.js';
import { authService } from './auth.service.js';
import { biomedicaConversaService } from './biomedica-conversa.service.js';
import { biomedicaRotinaService } from './biomedica-rotina.service.js';
import { conversaService } from './conversa.service.js';

async function idBiomedica(): Promise<number> {
  const biomedica = await biomedicaRepository.buscarAtiva();
  if (!biomedica) {
    throw new Error('biomédica do seed ausente');
  }
  return biomedica.id;
}

async function criarPremiumComConversa(email: string): Promise<void> {
  const usuario = await authService.cadastrar({
    nome: 'Paciente',
    email,
    senha: 'senha12345',
    aceiteLgpd: true,
  });
  await assinaturaService.assinar(usuario.id);
  await conversaService.enviarMensagem(usuario.id, 'oi', undefined);
}

async function primeiraConversa(bioId: number): Promise<number> {
  const conversas = await biomedicaConversaService.listar(bioId);
  const primeira = conversas[0];
  if (!primeira) {
    throw new Error('sem conversa');
  }
  return primeira.id;
}

describe('biomedicaRotinaService', () => {
  it('obtém template e salva a rotina personalizada da paciente', async () => {
    await criarPremiumComConversa('rot1@example.com');
    const bioId = await idBiomedica();
    const conversaId = await primeiraConversa(bioId);

    const antes = await biomedicaRotinaService.obterParaEdicao(bioId, conversaId);
    expect(antes.existe).toBe(false);

    await biomedicaRotinaService.salvar(bioId, conversaId, {
      itens: [{ etapa: 'LIMPEZA', descricao: 'lavar o rosto', ordem: 1, produtoId: null }],
    });

    const depois = await biomedicaRotinaService.obterParaEdicao(bioId, conversaId);
    expect(depois.existe).toBe(true);
    expect(depois.itens).toHaveLength(1);
  });

  it('conversa alheia/inexistente é negada', async () => {
    const bioId = await idBiomedica();
    await expect(biomedicaRotinaService.obterParaEdicao(bioId, 999999)).rejects.toThrow(
      NotFoundError,
    );
    await expect(biomedicaRotinaService.salvar(bioId, 999999, { itens: [] })).rejects.toThrow(
      NotFoundError,
    );
  });
});
