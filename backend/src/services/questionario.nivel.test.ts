import { describe, expect, it } from 'vitest';
import { calcularNivel } from './questionario.service.js';

// Espectro: seca(1) → normal(2) → mista(3) → oleosa(4).
const tipos = [
  { id: 1, ordem: 1 },
  { id: 2, ordem: 2 },
  { id: 3, ordem: 3 },
  { id: 4, ordem: 4 },
];

describe('calcularNivel', () => {
  it('sem inclinação (vizinhos iguais) → nível 3', () => {
    const soma = new Map([
      [2, 10],
      [1, 5],
      [3, 5],
    ]);
    expect(calcularNivel({ id: 2, ordem: 2 }, tipos, soma)).toBe(3);
  });

  it('inclina para o tipo anterior → nível 1', () => {
    const soma = new Map([
      [3, 10],
      [2, 10],
      [4, 0],
    ]);
    expect(calcularNivel({ id: 3, ordem: 3 }, tipos, soma)).toBe(1);
  });

  it('inclina para o próximo tipo → nível 5', () => {
    const soma = new Map([
      [2, 10],
      [1, 0],
      [3, 10],
    ]);
    expect(calcularNivel({ id: 2, ordem: 2 }, tipos, soma)).toBe(5);
  });

  it('extremo do espectro (sem anterior) não vai abaixo de 3', () => {
    const soma = new Map([
      [1, 10],
      [2, 5],
    ]);
    expect(calcularNivel({ id: 1, ordem: 1 }, tipos, soma)).toBe(4);
    // Sem próximo com pontos: fica no centro.
    expect(calcularNivel({ id: 1, ordem: 1 }, tipos, new Map([[1, 10]]))).toBe(3);
  });
});
