import { describe, expect, it } from 'vitest';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import { authService } from './auth.service.js';
import { rotinaService } from './rotina.service.js';

// tipos de pele no seed: oleosa=1, seca=2 (ordem de criação).
const OLEOSA = 1;
const SECA = 2;

async function criarUsuario(): Promise<number> {
  const usuario = await authService.cadastrar({
    nome: 'R',
    email: 'r@example.com',
    senha: 'senha12345',
    aceiteLgpd: true,
  });
  return usuario.id;
}

describe('rotinaService.buscarDoUsuario', () => {
  it('rejeita quando o usuário não completou o questionário', async () => {
    const id = await criarUsuario();
    await expect(rotinaService.buscarDoUsuario(id)).rejects.toThrow('Complete o questionário');
  });

  it('retorna a rotina do tipo de pele com itens ordenados', async () => {
    const id = await criarUsuario();
    await usuarioRepository.atualizarTipoPelePredominante(id, OLEOSA);

    const rotina = await rotinaService.buscarDoUsuario(id);
    expect(rotina.tipoPele.nome).toBe('oleosa');
    expect(rotina.itens.length).toBeGreaterThanOrEqual(3);

    const ordens = rotina.itens.map((i) => i.ordem);
    expect(ordens).toEqual([...ordens].sort((a, b) => a - b));
  });

  it('muda a rotina quando o tipo de pele muda (RF-ROT-005)', async () => {
    const id = await criarUsuario();
    await usuarioRepository.atualizarTipoPelePredominante(id, OLEOSA);
    const r1 = await rotinaService.buscarDoUsuario(id);

    await usuarioRepository.atualizarTipoPelePredominante(id, SECA);
    const r2 = await rotinaService.buscarDoUsuario(id);

    expect(r1.tipoPele.nome).toBe('oleosa');
    expect(r2.tipoPele.nome).toBe('seca');
    expect(r2.id).not.toBe(r1.id);
  });
});
