// Marca leve (não sensível) de que existe uma sessão para um papel. Serve só para evitar
// tentar o refresh no boot quando claramente não há login — o que geraria 401 REFRESH_AUSENTE
// no console em toda página pública (landing, login, área de outro papel). O cookie de refresh
// (httpOnly) continua sendo a fonte da verdade; isto é apenas uma dica.

export const CHAVE_SESSAO = {
  usuaria: 'dm.sessao.usuaria',
  biomedica: 'dm.sessao.biomedica',
  admin: 'dm.sessao.admin',
} as const;

export function marcarSessao(chave: string): void {
  try {
    localStorage.setItem(chave, '1');
  } catch {
    // localStorage indisponível — segue sem a dica.
  }
}

export function limparSessao(chave: string): void {
  try {
    localStorage.removeItem(chave);
  } catch {
    // ignora
  }
}

export function temSessao(chave: string): boolean {
  try {
    return localStorage.getItem(chave) === '1';
  } catch {
    return false;
  }
}
