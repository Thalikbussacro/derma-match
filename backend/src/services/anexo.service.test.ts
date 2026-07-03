import { describe, expect, it } from 'vitest';
import { ForbiddenError, NotFoundError } from '../errors/http-error.js';
import { anexoRepository } from '../repositories/anexo.repository.js';
import { biomedicaRepository } from '../repositories/biomedica.repository.js';
import { conversaRepository } from '../repositories/conversa.repository.js';
import { mensagemRepository } from '../repositories/mensagem.repository.js';
import { anexoService } from './anexo.service.js';
import { assinaturaService } from './assinatura.service.js';
import { authService } from './auth.service.js';
import { conversaService } from './conversa.service.js';

async function criarPremium(email: string): Promise<number> {
  const usuario = await authService.cadastrar({
    nome: 'Paciente',
    email,
    senha: 'senha12345',
    aceiteLgpd: true,
  });
  await assinaturaService.assinar(usuario.id);
  return usuario.id;
}

async function criarAnexoDaUsuaria(usuarioId: number): Promise<number> {
  await conversaService.iniciar(usuarioId);
  const conversa = await conversaRepository.buscarDoUsuario(usuarioId);
  if (!conversa) {
    throw new Error('conversa não criada');
  }
  const mensagem = await mensagemRepository.criar({
    conversaId: conversa.id,
    autorTipo: 'USUARIA',
    autorId: usuarioId,
    conteudo: 'foto',
  });
  const anexo = await anexoRepository.criar({
    mensagemId: mensagem.id,
    tipo: 'image/png',
    caminho: `${usuarioId}/teste.png`,
    dataExpiracao: new Date(Date.now() + 1_000_000),
  });
  return anexo.id;
}

async function idBiomedica(): Promise<number> {
  const biomedica = await biomedicaRepository.buscarAtiva();
  if (!biomedica) {
    throw new Error('biomédica do seed ausente');
  }
  return biomedica.id;
}

describe('anexoService.localizarParaDownload', () => {
  it('a dona da conversa acessa o anexo', async () => {
    const dona = await criarPremium('dona@example.com');
    const anexoId = await criarAnexoDaUsuaria(dona);
    const resultado = await anexoService.localizarParaDownload(anexoId, {
      tipoUsuario: 'USUARIA',
      id: dona,
    });
    expect(resultado.tipo).toBe('image/png');
  });

  it('outra usuária NÃO acessa o anexo alheio', async () => {
    const dona = await criarPremium('dona2@example.com');
    const anexoId = await criarAnexoDaUsuaria(dona);
    const outra = await criarPremium('outra@example.com');
    await expect(
      anexoService.localizarParaDownload(anexoId, { tipoUsuario: 'USUARIA', id: outra }),
    ).rejects.toThrow(ForbiddenError);
  });

  it('a biomédica da conversa acessa; outro id de biomédica não', async () => {
    const dona = await criarPremium('dona3@example.com');
    const anexoId = await criarAnexoDaUsuaria(dona);
    const bioId = await idBiomedica();

    const resultado = await anexoService.localizarParaDownload(anexoId, {
      tipoUsuario: 'BIOMEDICA',
      id: bioId,
    });
    expect(resultado.tipo).toBe('image/png');

    await expect(
      anexoService.localizarParaDownload(anexoId, { tipoUsuario: 'BIOMEDICA', id: bioId + 999 }),
    ).rejects.toThrow(ForbiddenError);
  });

  it('anexo inexistente lança NotFound', async () => {
    await expect(
      anexoService.localizarParaDownload(999999, { tipoUsuario: 'USUARIA', id: 1 }),
    ).rejects.toThrow(NotFoundError);
  });
});
