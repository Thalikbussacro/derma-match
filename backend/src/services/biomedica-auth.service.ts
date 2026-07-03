import { createHash } from 'node:crypto';
import bcrypt from 'bcrypt';
import type { Biomedica } from '@prisma/client';
import type { BiomedicaResponse, LoginInput } from '@derma-match/shared';
import { UnauthorizedError } from '../errors/http-error.js';
import { biomedicaRepository } from '../repositories/biomedica.repository.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { tokenService } from './token.service.js';

const CUSTO_BCRYPT = 10;
const HASH_DUMMY = bcrypt.hashSync('timing-attack-mitigation-dummy-bio', CUSTO_BCRYPT);

export interface BiomedicaLoginResultado {
  biomedica: BiomedicaResponse;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiraEm: Date;
}

function paraResponse(b: Biomedica): BiomedicaResponse {
  return { id: b.id, nome: b.nome, registro: b.registro, email: b.email };
}

function hashSha256(valor: string): string {
  return createHash('sha256').update(valor).digest('hex');
}

async function emitirTokens(biomedica: Biomedica): Promise<BiomedicaLoginResultado> {
  const accessToken = tokenService.gerarAccessToken(biomedica.id, 'BIOMEDICA');
  const refreshToken = tokenService.gerarRefreshToken(biomedica.id, 'BIOMEDICA');
  const payload = tokenService.verificarRefreshToken(refreshToken);
  const expiraEm = new Date(payload.exp * 1000);

  await refreshTokenRepository.criar({
    biomedicaId: biomedica.id,
    tokenHash: hashSha256(payload.jti),
    expiraEm,
  });

  return {
    biomedica: paraResponse(biomedica),
    accessToken,
    refreshToken,
    refreshTokenExpiraEm: expiraEm,
  };
}

export const biomedicaAuthService = {
  async login(input: LoginInput): Promise<BiomedicaLoginResultado> {
    const biomedica = await biomedicaRepository.buscarPorEmail(input.email);
    if (!biomedica) {
      await bcrypt.compare(input.senha, HASH_DUMMY);
      throw new UnauthorizedError('Credenciais inválidas.');
    }
    if (!biomedica.ativa) {
      await bcrypt.compare(input.senha, biomedica.senhaHash);
      throw new UnauthorizedError('Credenciais inválidas.');
    }
    const confere = await bcrypt.compare(input.senha, biomedica.senhaHash);
    if (!confere) {
      throw new UnauthorizedError('Credenciais inválidas.');
    }
    return emitirTokens(biomedica);
  },

  async refresh(refreshToken: string): Promise<BiomedicaLoginResultado> {
    let payload;
    try {
      payload = tokenService.verificarRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Refresh token inválido.', 'REFRESH_INVALIDO');
    }

    const registro = await refreshTokenRepository.buscarPorHash(hashSha256(payload.jti));
    if (!registro || registro.biomedicaId === null) {
      throw new UnauthorizedError('Refresh token inválido ou revogado.', 'REFRESH_INVALIDO');
    }
    if (registro.revogadoEm !== null) {
      await refreshTokenRepository.revogarTodosDaBiomedica(registro.biomedicaId);
      throw new UnauthorizedError('Refresh token inválido ou revogado.', 'REFRESH_INVALIDO');
    }
    if (registro.expiraEm.getTime() < Date.now()) {
      throw new UnauthorizedError('Refresh token inválido ou revogado.', 'REFRESH_INVALIDO');
    }

    const biomedica = await biomedicaRepository.buscarPorId(payload.sub);
    if (!biomedica || !biomedica.ativa) {
      throw new UnauthorizedError('Refresh token inválido ou revogado.', 'REFRESH_INVALIDO');
    }

    await refreshTokenRepository.revogar(registro.id);
    return emitirTokens(biomedica);
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
