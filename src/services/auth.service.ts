import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import type { Usuario } from '@prisma/client';
import { env } from '../config/env.js';
import { ConflictError, UnauthorizedError } from '../errors/http-error.js';
import { logger } from '../lib/logger.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { tokenRecuperacaoSenhaRepository } from '../repositories/token-recuperacao-senha.repository.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import type { CadastroInput, LoginInput, UsuarioResponse } from '../schemas/auth.schema.js';
import { emailService } from './email.service.js';
import { tokenService } from './token.service.js';

const CUSTO_BCRYPT = 10;
const MAX_TENTATIVAS_LOGIN = 5;
const BLOQUEIO_LOGIN_MS = 15 * 60 * 1000;
const RECUPERACAO_SENHA_MS = 60 * 60 * 1000;

export interface LoginResultado {
  usuario: UsuarioResponse;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiraEm: Date;
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

// Gera o par de tokens e persiste só o hash do jti do refresh. Nunca grava o token cru.
async function emitirTokens(usuario: Usuario): Promise<LoginResultado> {
  const accessToken = tokenService.gerarAccessToken(usuario.id, usuario.plano);
  const refreshToken = tokenService.gerarRefreshToken(usuario.id);
  const payload = tokenService.verificarRefreshToken(refreshToken);
  const expiraEm = new Date(payload.exp * 1000);

  await refreshTokenRepository.criar({
    usuarioId: usuario.id,
    tokenHash: hashSha256(payload.jti),
    expiraEm,
  });

  return {
    usuario: paraResponse(usuario),
    accessToken,
    refreshToken,
    refreshTokenExpiraEm: expiraEm,
  };
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

    if (usuario.bloqueadoAte && usuario.bloqueadoAte.getTime() > Date.now()) {
      throw new UnauthorizedError(
        'Conta temporariamente bloqueada por tentativas de login. Tente novamente mais tarde.',
        'CONTA_BLOQUEADA',
      );
    }

    const senhaConfere = await bcrypt.compare(input.senha, usuario.senhaHash);
    if (!senhaConfere) {
      const atualizado = await usuarioRepository.incrementarTentativasFalhas(usuario.id);
      if (atualizado.tentativasLoginFalhas >= MAX_TENTATIVAS_LOGIN) {
        await usuarioRepository.bloquear(usuario.id, new Date(Date.now() + BLOQUEIO_LOGIN_MS));
      }
      throw new UnauthorizedError('Credenciais inválidas.');
    }

    // Sucesso: zera contador e desbloqueia.
    await usuarioRepository.limparTentativas(usuario.id);
    return emitirTokens(usuario);
  },

  async refresh(refreshToken: string): Promise<LoginResultado> {
    let payload;
    try {
      payload = tokenService.verificarRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Refresh token inválido.', 'REFRESH_INVALIDO');
    }

    const registro = await refreshTokenRepository.buscarPorHash(hashSha256(payload.jti));
    if (!registro || registro.revogadoEm !== null || registro.expiraEm.getTime() < Date.now()) {
      throw new UnauthorizedError('Refresh token inválido ou revogado.', 'REFRESH_INVALIDO');
    }

    const usuario = await usuarioRepository.buscarPorId(payload.sub);
    if (!usuario) {
      throw new UnauthorizedError('Refresh token inválido ou revogado.', 'REFRESH_INVALIDO');
    }

    // Rotação: revoga o refresh usado antes de emitir um novo par.
    await refreshTokenRepository.revogar(registro.id);
    return emitirTokens(usuario);
  },

  async logout(refreshToken: string): Promise<void> {
    let payload;
    try {
      payload = tokenService.verificarRefreshToken(refreshToken);
    } catch {
      // Token inválido: logout é idempotente, sucesso silencioso.
      return;
    }

    const registro = await refreshTokenRepository.buscarPorHash(hashSha256(payload.jti));
    if (registro && registro.revogadoEm === null) {
      await refreshTokenRepository.revogar(registro.id);
    }
  },

  async solicitarRecuperacaoSenha(email: string): Promise<void> {
    const usuario = await usuarioRepository.buscarPorEmail(email);
    // Não revela se o email existe (RF-AUTH-009): retorna sucesso de qualquer forma.
    if (!usuario) {
      return;
    }

    // Uma nova solicitação invalida as anteriores.
    await tokenRecuperacaoSenhaRepository.invalidarTodosDoUsuario(usuario.id);

    const tokenCru = randomBytes(32).toString('hex');
    await tokenRecuperacaoSenhaRepository.criar({
      usuarioId: usuario.id,
      tokenHash: hashSha256(tokenCru),
      expiraEm: new Date(Date.now() + RECUPERACAO_SENHA_MS),
    });

    const link = `${env.APP_URL}/redefinir-senha?token=${tokenCru}`;
    try {
      await emailService.enviarEmailRecuperacaoSenha(usuario.email, link);
    } catch (err) {
      // Falha de SMTP nunca vaza para a resposta HTTP (RNF-SEC): loga e segue.
      logger.error({ err }, 'falha ao enviar email de recuperação de senha');
    }
  },

  async redefinirSenha(tokenCru: string, novaSenha: string): Promise<void> {
    const registro = await tokenRecuperacaoSenhaRepository.buscarPorHash(hashSha256(tokenCru));
    if (!registro || registro.usadoEm !== null || registro.expiraEm.getTime() < Date.now()) {
      throw new UnauthorizedError(
        'Token de recuperação inválido ou expirado.',
        'TOKEN_RECUPERACAO_INVALIDO',
      );
    }

    await tokenRecuperacaoSenhaRepository.marcarUsado(registro.id);
    const senhaHash = await bcrypt.hash(novaSenha, CUSTO_BCRYPT);
    await usuarioRepository.atualizar(registro.usuarioId, { senhaHash });
    // Troca de senha força re-login: revoga todos os refresh tokens do usuário.
    await refreshTokenRepository.revogarTodosDoUsuario(registro.usuarioId);
  },
};
