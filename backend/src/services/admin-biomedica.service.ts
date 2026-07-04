import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import type { Biomedica } from '@prisma/client';
import type { BiomedicaAdmin, CriarBiomedicaInput } from '@derma-match/shared';
import { ConflictError, NotFoundError } from '../errors/http-error.js';
import { biomedicaRepository } from '../repositories/biomedica.repository.js';

const CUSTO_BCRYPT = 10;

function paraResponse(b: Biomedica): BiomedicaAdmin {
  return { id: b.id, nome: b.nome, registro: b.registro, email: b.email, ativa: b.ativa };
}

export const adminBiomedicaService = {
  async listar(): Promise<BiomedicaAdmin[]> {
    const biomedicas = await biomedicaRepository.listar();
    return biomedicas.map(paraResponse);
  },

  async criar(input: CriarBiomedicaInput): Promise<BiomedicaAdmin> {
    const senhaHash = await bcrypt.hash(input.senha, CUSTO_BCRYPT);
    try {
      const criada = await biomedicaRepository.criar({
        nome: input.nome,
        registro: input.registro,
        email: input.email,
        senhaHash,
      });
      return paraResponse(criada);
    } catch (err) {
      // Email ou registro já existem (unique no banco).
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictError('Email ou registro profissional já cadastrado.');
      }
      throw err;
    }
  },

  async definirAtiva(id: number, ativa: boolean): Promise<BiomedicaAdmin> {
    const biomedica = await biomedicaRepository.buscarPorId(id);
    if (!biomedica) {
      throw new NotFoundError('Biomédica');
    }
    const atualizada = await biomedicaRepository.atualizarAtiva(id, ativa);
    return paraResponse(atualizada);
  },
};
