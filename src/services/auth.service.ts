import { createHash } from 'node:crypto';
import bcrypt from 'bcrypt';
import type { Usuario } from '@prisma/client';
import { ConflictError, UnauthorizedError } from '../errors/http-error.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import type { CadastroInput, LoginInput, UsuarioResponse } from '../schemas/auth.schema.js';
import { tokenService } from './token.service.js';

const CUSTO_BCRYPT = 10;

export interface LoginResultado {
  usuario: UsuarioResponse;
  accessToken: string;
  refreshToken: string;
}

function paraResponse(usuario: Usuario): UsuarioResponse {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    plano: usuario.plano,
    tipoPelePredominanteId: usuario.tipoPelePredominanteId,
  };
}

function hashSha256(valor: string): string {
  return createHash('sha256').update(valor).digest('hex');
}

export const authService = {
  async cadastrar(input: CadastroInput): Promise<UsuarioResponse> {
    const existente = await usuarioRepository.buscarPorEmail(input.email);
    if (existente) {
      throw new ConflictError('Email já cadastrado.');
    }

    const senhaHash = await bcrypt.hash(input.senha, CUSTO_BCRYPT);
    const usuario = await usuarioRepository.criar({
      nome: input.nome,
      email: input.email,
      senhaHash,
      consentimentoLgpdEm: new Date(),
    });

    return paraResponse(usuario);
  },

  async login(input: LoginInput): Promise<LoginResultado> {
    const usuario = await usuarioRepository.buscarPorEmail(input.email);
    // Mensagem genérica para email inexistente e senha errada (RF-AUTH-006).
    if (!usuario) {
      throw new UnauthorizedError('Credenciais inválidas.');
    }

    const senhaConfere = await bcrypt.compare(input.senha, usuario.senhaHash);
    if (!senhaConfere) {
      throw new UnauthorizedError('Credenciais inválidas.');
    }

    const accessToken = tokenService.gerarAccessToken(usuario.id, usuario.plano);
    const refreshToken = tokenService.gerarRefreshToken(usuario.id);
    const payloadRefresh = tokenService.verificarRefreshToken(refreshToken);

    // Guarda só o hash do jti; o token cru nunca toca o banco.
    await refreshTokenRepository.criar({
      usuarioId: usuario.id,
      tokenHash: hashSha256(payloadRefresh.jti),
      expiraEm: new Date(payloadRefresh.exp * 1000),
    });

    return { usuario: paraResponse(usuario), accessToken, refreshToken };
  },
};
