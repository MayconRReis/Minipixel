export interface Status {
  fome: number;
  sede: number;
  energia: number;
  felicidade: number;
  conhecimento: number;
}

export type ActionType = 'conversar' | 'comer' | 'beber' | 'dormir' | 'brincar' | 'estudar' | 'perguntar';

export interface AIResponse {
  fala: string;
  acao: ActionType;
  itemRelacionado: string | null;
  mudancaStatus: Partial<Status>;
  memoriaNova: string | null;
}

export interface Memory {
  id: string;
  content: string;
  timestamp: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
