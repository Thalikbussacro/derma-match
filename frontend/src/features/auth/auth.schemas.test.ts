import { cadastroSchema, loginSchema } from './auth.schemas';

describe('cadastroSchema', () => {
  const base = {
    nome: 'Maria',
    email: 'maria@example.com',
    senha: 'senha12345',
    confirmarSenha: 'senha12345',
    aceiteLgpd: true,
  };

  it('aceita dados válidos', () => {
    expect(cadastroSchema.safeParse(base).success).toBe(true);
  });

  it('rejeita quando as senhas não conferem', () => {
    expect(cadastroSchema.safeParse({ ...base, confirmarSenha: 'outra' }).success).toBe(false);
  });

  it('rejeita quando o LGPD não é aceito', () => {
    expect(cadastroSchema.safeParse({ ...base, aceiteLgpd: false }).success).toBe(false);
  });

  it('rejeita senha curta', () => {
    expect(cadastroSchema.safeParse({ ...base, senha: '123', confirmarSenha: '123' }).success).toBe(
      false,
    );
  });
});

describe('loginSchema', () => {
  it('aceita email e senha válidos', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', senha: 'x' }).success).toBe(true);
  });

  it('rejeita email inválido', () => {
    expect(loginSchema.safeParse({ email: 'invalido', senha: 'x' }).success).toBe(false);
  });
});
