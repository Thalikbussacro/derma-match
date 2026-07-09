import { describe, expect, it } from 'vitest';
import { questionarioAdminService } from './questionario-admin.service.js';

describe('questionarioAdminService.removerPergunta', () => {
  it('renumera as perguntas restantes em 1..N (sem buracos)', async () => {
    const antes = await questionarioAdminService.obterRascunho();
    expect(antes.perguntas.length).toBeGreaterThanOrEqual(3);

    // Remove uma pergunta do meio para forçar buraco na ordem.
    const meio = antes.perguntas[Math.floor(antes.perguntas.length / 2)];
    if (!meio) throw new Error('pergunta do meio não encontrada');
    await questionarioAdminService.removerPergunta(meio.id);

    const depois = await questionarioAdminService.obterRascunho();
    expect(depois.perguntas.length).toBe(antes.perguntas.length - 1);

    const ordens = depois.perguntas.map((p) => p.ordem);
    expect(ordens).toEqual(Array.from({ length: ordens.length }, (_, i) => i + 1));
  });
});
