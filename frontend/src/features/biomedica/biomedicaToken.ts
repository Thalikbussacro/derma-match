// Access token da biomédica em memória (separado do da usuária).
let token: string | null = null;

export function getBiomedicaToken(): string | null {
  return token;
}

export function setBiomedicaToken(valor: string | null): void {
  token = valor;
}
