import bcrypt from 'bcrypt';
import type { Usuario } from '@prisma/client';
import { NotFoundError, UnauthorizedError } from '../errors/http-error.js';
import { removerPastaUsuario } from '../lib/uploads.js';
import { conversaRepository } from '../repositories/conversa.repository.js';
import { mensagemRepository } from '../repositories/mensagem.repository.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { respostaUsuarioRepository } from '../repositories/resposta-usuario.repository.js';
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

  // Exportação dos dados da própria usuária em JSON (portabilidade — Art. 18 V da LGPD).
  async exportarDados(usuarioId: number): Promise<unknown> {
    const usuario = await usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new NotFoundError('Usuário');
    }
    const respostas = await respostaUsuarioRepository.listarComContexto(usuarioId);
    const conversa = await conversaRepository.buscarDoUsuario(usuarioId);
    const mensagens = conversa ? await mensagemRepository.listarPorConversa(conversa.id) : [];

    return {
      exportadoEm: new Date().toISOString(),
      perfil: {
        nome: usuario.nome,
        email: usuario.email,
        plano: usuario.plano,
        tipoPelePredominanteId: usuario.tipoPelePredominanteId,
        criadoEm: usuario.criadoEm.toISOString(),
        consentimentoLgpdEm: usuario.consentimentoLgpdEm.toISOString(),
        consentimentoVersao: usuario.consentimentoVersao,
        consentimentoDadosSensiveisEm: usuario.consentimentoDadosSensiveisEm?.toISOString() ?? null,
      },
      questionario: respostas.map((r) => ({ pergunta: r.pergunta.texto, resposta: r.opcao.texto })),
      conversa: conversa
        ? {
            iniciadaEm: conversa.criadoEm.toISOString(),
            mensagens: mensagens.map((m) => ({
              autor: m.autorTipo,
              conteudo: m.conteudo,
              criadoEm: m.criadoEm.toISOString(),
              anexos: m.anexos.map((a) => ({
                tipo: a.tipo,
                expiraEm: a.dataExpiracao.toISOString(),
              })),
            })),
          }
        : null,
    };
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
    // Remove as fotos do disco ANTES do delete no banco: se a remoção do disco falhar, o cascade
    // ainda não rodou, então nada fica órfão e a operação pode ser repetida (LGPD).
    await removerPastaUsuario(usuarioId);
    // Hard delete: o banco faz cascade em refresh tokens, respostas, conversas, mensagens e anexos
    // (onDelete: Cascade). (RNF-LGPD-002)
    await usuarioRepository.remover(usuarioId);
  },
};
