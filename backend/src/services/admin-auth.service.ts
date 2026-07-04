import { createHash } from 'node:crypto';
import bcrypt from 'bcrypt';
import type { Admin } from '@prisma/client';
import type { AdminResponse, LoginInput } from '@derma-match/shared';
import { UnauthorizedError } from '../errors/http-error.js';
import { adminRepository } from '../repositories/admin.repository.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { tokenService } from './token.service.js';

const CUSTO_BCRYPT = 10;
const HASH_DUMMY = bcrypt.hashSync('timing-attack-mitigation-dummy-adm', CUSTO_BCRYPT);

export interface AdminLoginResultado {
  admin: AdminResponse;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiraEm: Date;
}

function paraResponse(a: Admin): AdminResponse {
  return { id: a.id, nome: a.nome, email: a.email };
}

function hashSha256(valor: string): string {
  return createHash('sha256').update(valor).digest('hex');
}

async function emitirTokens(admin: Admin): Promise<AdminLoginResultado> {
  const accessToken = tokenService.gerarAccessToken(admin.id, 'ADMIN');
  const refreshToken = tokenService.gerarRefreshToken(admin.id, 'ADMIN');
  const payload = tokenService.verificarRefreshToken(refreshToken);
  const expiraEm = new Date(payload.exp * 1000);

  await refreshTokenRepository.criar({
    adminId: admin.id,
    tokenHash: hashSha256(payload.jti),
    expiraEm,
  });

  return {
    admin: paraResponse(admin),
    accessToken,
    refreshToken,
    refreshTokenExpiraEm: expiraEm,
  };
}

export const adminAuthService = {
  async login(input: LoginInput): Promise<AdminLoginResultado> {
    const admin = await adminRepository.buscarPorEmail(input.email);
    if (!admin) {
      await bcrypt.compare(input.senha, HASH_DUMMY);
      throw new UnauthorizedError('Credenciais inválidas.');
    }
    if (!admin.ativa) {
      await bcrypt.compare(input.senha, admin.senhaHash);
      throw new UnauthorizedError('Credenciais inválidas.');
    }
    const confere = await bcrypt.compare(input.senha, admin.senhaHash);
    if (!confere) {
      throw new UnauthorizedError('Credenciais inválidas.');
    }
    return emitirTokens(admin);
  },

  async refresh(refreshToken: string): Promise<AdminLoginResultado> {
    let payload;
    try {
      payload = tokenService.verificarRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Refresh token inválido.', 'REFRESH_INVALIDO');
    }

    const registro = await refreshTokenRepository.buscarPorHash(hashSha256(payload.jti));
    if (!registro || registro.adminId === null) {
      throw new UnauthorizedError('Refresh token inválido ou revogado.', 'REFRESH_INVALIDO');
    }
    if (registro.revogadoEm !== null) {
      await refreshTokenRepository.revogarTodosDoAdmin(registro.adminId);
      throw new UnauthorizedError('Refresh token inválido ou revogado.', 'REFRESH_INVALIDO');
    }
    if (registro.expiraEm.getTime() < Date.now()) {
      throw new UnauthorizedError('Refresh token inválido ou revogado.', 'REFRESH_INVALIDO');
    }

    const admin = await adminRepository.buscarPorId(payload.sub);
    if (!admin || !admin.ativa) {
      throw new UnauthorizedError('Refresh token inválido ou revogado.', 'REFRESH_INVALIDO');
    }

    await refreshTokenRepository.revogar(registro.id);
    return emitirTokens(admin);
  },

  async logout(refreshToken: string): Promise<void> {
    let payload;
    try {
      payload = tokenService.verificarRefreshToken(refreshToken);
    } catch {
      return;
    }
    const registro = await refreshTokenRepository.buscarPorHash(hashSha256(payload.jti));
    if (registro && registro.revogadoEm === null) {
      await refreshTokenRepository.revogar(registro.id);
    }
  },
};
