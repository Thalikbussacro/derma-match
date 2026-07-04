import type { AdesaoResponse } from '@derma-match/shared';
import { checkinRotinaRepository } from '../repositories/checkin-rotina.repository.js';

// Normaliza para meia-noite UTC (o campo `dia` é @db.Date).
function diaUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function calcular(usuarioId: number): Promise<AdesaoResponse> {
  const hoje = diaUTC(new Date());
  const desde = new Date(hoje);
  desde.setUTCDate(desde.getUTCDate() - 60);

  const checkins = await checkinRotinaRepository.listarDesde(usuarioId, desde);
  const dias = new Set(checkins.map((c) => diaUTC(c.dia).getTime()));

  // Streak: dias consecutivos até hoje. Se ainda não marcou hoje, conta a partir de ontem
  // (a sequência não zera antes do fim do dia).
  let streak = 0;
  const cursor = new Date(hoje);
  if (!dias.has(cursor.getTime())) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  while (dias.has(cursor.getTime())) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  // Últimos 7 dias, do mais antigo ao mais recente (hoje por último).
  const ultimos7: boolean[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(hoje);
    d.setUTCDate(d.getUTCDate() - i);
    ultimos7.push(dias.has(d.getTime()));
  }

  return { streak, checkinHoje: dias.has(hoje.getTime()), ultimos7 };
}

export const adesaoService = {
  async marcarHoje(usuarioId: number): Promise<AdesaoResponse> {
    await checkinRotinaRepository.marcar(usuarioId, diaUTC(new Date()));
    return calcular(usuarioId);
  },

  obter(usuarioId: number): Promise<AdesaoResponse> {
    return calcular(usuarioId);
  },
};
