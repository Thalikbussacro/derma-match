// Access token do admin em memória (separado do da usuária e da biomédica).
let token: string | null = null;

export function getAdminToken(): string | null {
  return token;
}

export function setAdminToken(valor: string | null): void {
  token = valor;
}
