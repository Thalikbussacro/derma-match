import bcrypt from 'bcrypt';
import type { Usuario } from '@prisma/client';
import { NotFoundError, UnauthorizedError } from '../errors/http-error.js';
import { removerPastaUsuario } from '../lib/uploads.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import type { UsuarioResponse } from '../schemas/auth.schema.js';
import type { AtualizarContaInput } from '../schemas/conta.schema.js';

const CUSTO_BCRYPT = 10;

function paraResponse(usuario: Usuario): UsuarioResponse {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    plano: usuario.plano,
    tipoPelePredominanteId: usuario.tipoPelePredominanteId,
  };
}

export const contaService = {
  async buscarPerfil(usuarioId: number): Promise<UsuarioResponse> {
    const usuario = await usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new NotFoundError('Usuário');
    }
    return paraResponse(usuario);
  },

  async atualizar(usuarioId: number, input: AtualizarContaInput): Promise<UsuarioResponse> {
    const usuario = await usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new NotFoundError('Usuário');
    }

    const dados: { nome?: string; senhaHash?: string } = {};
    let senhaMudou = false;

    if (input.nome !== undefined) {
      dados.nome = input.nome;
    }

    if (input.senhaAtual !== undefined && input.novaSenha !== undefined) {
      const confere = await bcrypt.compare(input.senhaAtual, usuario.senhaHash);
      if (!confere) {
        throw new UnauthorizedError('Senha atual incorreta.', 'SENHA_ATUAL_INCORRETA');
      }
      dados.senhaHash = await bcrypt.hash(input.novaSenha, CUSTO_BCRYPT);
      senhaMudou = true;
    }

    const atualizado = await usuarioRepository.atualizar(usuarioId, dados);

    if (senhaMudou) {
      // Troca de senha força re-login: revoga todos os refresh tokens do usuário.
      await refreshTokenRepository.revogarTodosDoUsuario(usuarioId);
    }

    return paraResponse(atualizado);
  },

  async excluir(usuarioId: number): Promise<void> {
    // Hard delete: o banco faz cascade em refresh tokens, respostas, conversas, mensagens e anexos
    // (onDelete: Cascade). (RNF-LGPD-002)
    await usuarioRepository.remover(usuarioId);
    // As fotos da usuária no disco não saem por cascade — removidas explicitamente (LGPD).
    await removerPastaUsuario(usuarioId);
  },
};
