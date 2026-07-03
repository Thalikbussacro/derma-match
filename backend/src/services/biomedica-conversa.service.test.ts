import { describe, expect, it } from 'vitest';
import { NotFoundError } from '../errors/http-error.js';
import { biomedicaRepository } from '../repositories/biomedica.repository.js';
import { assinaturaService } from './assinatura.service.js';
import { authService } from './auth.service.js';
import { biomedicaConversaService } from './biomedica-conversa.service.js';
import { conversaService } from './conversa.service.js';

async function criarPremiumComMensagem(email: string): Promise<void> {
  const usuario = await authService.cadastrar({
    nome: 'Paciente',
    email,
    senha: 'senha12345',
    aceiteLgpd: true,
  });
  await assinaturaService.assinar(usuario.id);
  await conversaService.enviarMensagem(usuario.id, 'Minha pele está oleosa', undefined);
}

async function idBiomedica(): Promise<number> {
  const biomedica = await biomedicaRepository.buscarAtiva();
  if (!biomedica) {
    throw new Error('biomédica do seed ausente');
  }
  return biomedica.id;
}

async function primeiraConversaId(bioId: number): Promise<number> {
  const conversas = await biomedicaConversaService.listar(bioId);
  const primeira = conversas[0];
  if (!primeira) {
    throw new Error('sem conversa');
  }
  return primeira.id;
}

describe('biomedicaConversaService', () => {
  it('lista as conversas com "não respondida" em destaque', async () => {
    await criarPremiumComMensagem('p1@example.com');
    const bioId = await idBiomedica();
    const conversas = await biomedicaConversaService.listar(bioId);
    expect(conversas).toHaveLength(1);
    expect(conversas[0]?.naoRespondida).toBe(true);
  });

  it('responder aparece no histórico', async () => {
    await criarPremiumComMensagem('p2@example.com');
    const bioId = await idBiomedica();
    const conversaId = await primeiraConversaId(bioId);
    const resposta = await biomedicaConversaService.responder(bioId, conversaId, 'Use gel de limpeza');
    expect(resposta.autorTipo).toBe('BIOMEDICA');
    const mensagens = await biomedicaConversaService.listarMensagens(bioId, conversaId);
    expect(mensagens).toHaveLength(2);
  });

  it('contexto traz o nome da usuária', async () => {
    await criarPremiumComMensagem('p3@example.com');
    const bioId = await idBiomedica();
    const conversaId = await primeiraConversaId(bioId);
    const contexto = await biomedicaConversaService.contexto(bioId, conversaId);
    expect(contexto.usuarioNome).toBeTruthy();
  });

  it('conversa alheia/inexistente é tratada como não encontrada', async () => {
    const bioId = await idBiomedica();
    await expect(biomedicaConversaService.listarMensagens(bioId, 999999)).rejects.toThrow(
      NotFoundError,
    );
    await expect(biomedicaConversaService.contexto(bioId, 999999)).rejects.toThrow(NotFoundError);
    await expect(biomedicaConversaService.responder(bioId, 999999, 'x')).rejects.toThrow(
      NotFoundError,
    );
  });
});
