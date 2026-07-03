export type EstadoNome = 'NAO_INICIADO' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export interface EstadoQuestionario {
  estado: EstadoNome;
  perguntasRespondidas: number;
  totalPerguntas: number;
  tipoPeleId: number | null;
}

export interface OpcaoPergunta {
  id: number;
  texto: string;
}

export interface Pergunta {
  id: number;
  texto: string;
  ordem: number;
  opcoes: OpcaoPergunta[];
}

export interface ResultadoTipoPele {
  tipoPeleId: number;
  tipoPeleNome: string;
}
