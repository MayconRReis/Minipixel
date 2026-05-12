export type MemoryCategory = 'aprendizado' | 'preferencia' | 'evento' | 'relacao';

export interface MiniMemory {
  id: string;
  tipo: MemoryCategory;
  conteudo: string;
  importancia: number;
  timestamp: number;
}
