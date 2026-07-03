import { describe, expect, it } from 'vitest';
import { ForbiddenError } from '../errors/http-error.js';
import { assinaturaService } from './assinatura.service.js';
import { authService } from './auth.service.js';
import { conversaService } from './conversa.service.js';

async function criarUsuario(email: string): Promise<number> {
  const usuario = await authService.cadastrar({
    nome: 'Bia',
    email,
    senha: 'senha12345',
    aceiteLgpd: true,
  });
  return usuario.id;
}

describe('conversaService', () => {
  it('usuária FREE não consegue iniciar conversa', async () => {
    const id = await criarUsuario('free@example.com');
    await expect(conversaService.iniciar(id)).rejects.toThrow(ForbiddenError);
  });

  it('usuária PREMIUM inicia conversa e troca mensagens', async () => {
    const id = await criarUsuario('premium@example.com');
    await assinaturaService.assinar(id);

    const conversa = await conversaService.iniciar(id);
    expect(conversa.biomedicaNome).toBeTruthy();

    const mensagem = await conversaService.enviarMensagem(id, 'Minha pele está oleosa', undefined);
    expect(mensagem.autorTipo).toBe('USUARIA');
    expect(mensagem.conteudo).toBe('Minha pele está oleosa');

    const mensagens = await conversaService.listarMensagens(id);
    expect(mensagens).toHaveLength(1);
  });

  it('iniciar duas vezes reaproveita a mesma conversa', async () => {
    const id = await criarUsuario('reuso@example.com');
    await assinaturaService.assinar(id);
    const primeira = await conversaService.iniciar(id);
    const segunda = await conversaService.iniciar(id);
    expect(segunda.id).toBe(primeira.id);
  });
});
