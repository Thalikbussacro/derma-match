// Formata um ISO string para hora local curta (ex.: "14:32").
export function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Formata um ISO string para data local curta (ex.: "04/07/2026").
export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}
