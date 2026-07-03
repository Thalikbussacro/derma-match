import type { Usuario } from '@prisma/client';
import type { UsuarioResponse } from '@derma-match/shared';
import { ConflictError, NotFoundError } from '../errors/http-error.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';

// Assinatura mockada (ADR-0011): muda o plano sem cobrança. Pagamento real fica para produção.

function paraResponse(usuario: Usuario): UsuarioResponse {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    plano: usuario.plano,
    tipoPelePredominanteId: usuario.tipoPelePredominanteId,
  };
}

export const assinaturaService = {
  async assinar(usuarioId: number): Promise<UsuarioResponse> {
    const usuario = await usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new NotFoundError('Usuário');
    }
    if (usuario.plano === 'PREMIUM') {
      throw new ConflictError('Você já tem o plano Premium.');
    }
    // Registra o consentimento específico para dados sensíveis de saúde (ADR-0013).
    const atualizado = await usuarioRepository.atualizar(usuarioId, {
      plano: 'PREMIUM',
      consentimentoDadosSensiveisEm: new Date(),
    });
    return paraResponse(atualizado);
  },

  async cancelar(usuarioId: number): Promise<UsuarioResponse> {
    const usuario = await usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new NotFoundError('Usuário');
    }
    if (usuario.plano === 'FREE') {
      throw new ConflictError('Você não tem uma assinatura Premium ativa.');
    }
    const atualizado = await usuarioRepository.atualizar(usuarioId, { plano: 'FREE' });
    return paraResponse(atualizado);
  },
};
