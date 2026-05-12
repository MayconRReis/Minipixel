export type EmotionType = 
  | 'curioso' 
  | 'feliz' 
  | 'triste' 
  | 'cansado' 
  | 'com fome' 
  | 'com sede' 
  | 'confuso' 
  | 'assustado' 
  | 'animado'
  | 'pensativo';

export interface MiniStatus {
  fome: number;
  sede: number;
  energia: number;
  felicidade: number;
  conhecimento: number;
}

export type MiniAction = 'conversar' | 'comer' | 'beber' | 'dormir' | 'brincar' | 'estudar' | 'perguntar' | 'pensar';

export interface MiniResponse {
  fala: string;
  acao: MiniAction;
  emotion: EmotionType;
  itemRelacionado: string | null;
  mudancaStatus: Partial<MiniStatus>;
  memoriaNova: {
    tipo: 'aprendizado' | 'preferencia' | 'evento' | 'relacao';
    conteudo: string;
    importancia: number;
  } | null;
}
